import axios from "axios";
import jwt from "jsonwebtoken";
import { PrismaClient, User, Provider } from "../../generated/prisma/client.js";
import { comparePassword, hashPassword } from "../../lib/argon.js";
import { UserInfo } from "../../types/google.js";
import { ApiError } from "../../utils/api-error.js";
import { RegisterDTO } from "./dto/register.dto.js";
import { LoginDTO } from "./dto/login.dto.js";
import { GoogleDTO } from "./dto/google.dto.js";
import { MailService } from "../mail/mail.service.js";

export class AuthService {
  constructor(private prisma: PrismaClient, private mailService: MailService) { }

  register = async (body: RegisterDTO) => {
    //1. cek dulu emailnya udah kepake apa belum
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    //2. kalo udah kepake throw error
    if (user) {
      throw new ApiError("Email already exist", 400);
    }

    //3. kalo belum, create data yser baru berdasarkan request body
    const hashedPassword = await hashPassword(body.password);

    //4. kalo belum, create data yser baru berdasarkan request body
    await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });

    // 5. send email
    this.mailService.sendEmail(body.email, `welcome, ${body.name}`, "welcome", { name: body.name });

    //6. return message register success
    return { message: "Register success" };
  };
  login = async (body: LoginDTO) => {
    // 1.cek emailny ada di db atau enggak
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    // 2.kalo enggak ada, throw error
    if (!user) {
      throw new ApiError("Invalid credentials", 400);
    }
    // 3.cek passwordnya benar atau tidak
    const isPassMatch = await comparePassword(user.password, body.password);
    // 4.kalo enggak benar, throw error
    if (!isPassMatch) {
      throw new ApiError("Invalid credentials", 400);
    }
    // 5.generate jwt token ->jsonwebtoken
    const payload = {
      id: user.id,
      role: user.role,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });
    // 6.retiurn user data + token
    const { password, ...userWithoutPassword } = user; // remove property password
    return {
      ...userWithoutPassword,
      accessToken,
    };
  };

  google = async (body: GoogleDTO) => {
    const { data } = await axios.get<UserInfo>(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      }
    );

    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    // helper
    const signToken = (user: { id: number; role: string }) =>
      jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "2h" }
      );

    const sanitizeUser = <T extends { password?: string }>(user: T) => {
      const { password, ...rest } = user;
      return rest;
    };

    // user belum ada → create
    if (!user) {
      const newUser = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: "",
          Provider: Provider.GOOGLE,
        },
      });

      return {
        ...sanitizeUser(newUser),
        accessToken: signToken(newUser),
      };
    }

    // user ada tapi bukan google
    if (user.Provider !== Provider.GOOGLE) {
      throw new ApiError("Account already registered without google", 400);
    }

    // user google existing
    return {
      ...sanitizeUser(user),
      accessToken: signToken(user),
    };
  };
}
