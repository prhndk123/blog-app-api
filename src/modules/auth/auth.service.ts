import axios from "axios";
import { PrismaClient, User } from "../../generated/prisma/client.js";
import { comparePassword, hashPassword } from "../../lib/argon.js";
import { ApiError } from "../../utils/api-error.js";
import jwt from "jsonwebtoken";
import { UserInfo } from "../../types/google.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { GoogleDto } from "./dto/google.dto.js";
import { MailService } from "../mail/mail.service.js";

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService,
  ) {}

  register = async (body: RegisterDto) => {
    //1. Cek avaibilitas email
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    //2. Kalau sudah dipakai throw error
    if (user) {
      throw new ApiError("Email Already Exist", 400);
    }
    //3. Kalo belum, Hash Password dari body.password
    const hashedPassword = await hashPassword(body.password);

    //4. Create user baru berdasarkan body dan hashed password
    await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });

    //5. Send email
    await this.mailService.sendEmail(
      body.email,
      `Welcome, ${body.name}`,
      "welcome",
      { name: body.name },
    );

    //6. Returm Message Register Success
    return { message: "Register Success" };
  };

  login = async (body: LoginDto) => {
    //1. Cek Emailnya ada ga
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    //2. Kalo ga ada, throw error
    if (!user) {
      throw new ApiError("Invalid Credential", 400);
    }
    //3. Cek Passwordnya ada ga
    const isPassMatch = await comparePassword(body.password, user.password);
    //4. Kalo ga ada, throw error
    if (!isPassMatch) {
      throw new ApiError("Invalid Credential", 400);
    }
    //5. Generate Token dengan jwt->jsonwebtoken
    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });
    //6. Return data usernya
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, accessToken };
  };

  google = async (body: GoogleDto) => {
    const { data } = await axios.get<UserInfo>(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    );

    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    // helper
    const signToken = (user: { id: number; role: string }) =>
      jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
        expiresIn: "2h",
      });

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
          provider: "GOOGLE",
        },
      });

      return {
        ...sanitizeUser(newUser),
        accessToken: signToken(newUser),
      };
    }

    // user ada tapi bukan google
    if (user.provider !== "GOOGLE") {
      throw new ApiError("Account already registered without google", 400);
    }

    // user google existing
    return {
      ...sanitizeUser(user),
      accessToken: signToken(user),
    };
  };
}
