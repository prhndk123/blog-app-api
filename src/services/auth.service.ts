
import jwt from "jsonwebtoken";
import { User } from "../generated/prisma/client.js";
import { comparePassword, hashPassword } from "../lib/argon.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";


export const registerService = async(
    body: Pick<User, "name" | "email" | "password">
) => {

    //1. cek dulu emailnya udah kepake apa belum
    const  user = await prisma.user.findUnique({
        where: {
            email: body.email
        }
    });

    //2. kalo udah kepake throw error
    if (user) {
        throw new ApiError("Email already exist", 400);
    }

    //3. kalo belum, create data yser baru berdasarkan request body
    const hashedPassword = await hashPassword(body.password);
    
    //4. kalo belum, create data yser baru berdasarkan request body
    await prisma.user.create({
        data:{
            name: body.name,
            email: body.email,
            password: hashedPassword
        }
    });

    //5. return message register success
    return { message: "Register success"};
};

export const loginService = async(
    body: Pick<User, "email" | "password">
) => {
    // 1.cek emailny ada di db atau enggak
    const user = await prisma.user.findUnique({
        where: {
            email: body.email
        }
    });
    // 2.kalo enggak ada, throw error
    if (!user) {
        throw new ApiError("Invalid credentials", 400);
    }
    // 3.cek passwordnya benar atau tidak
    const isPassMatch = await comparePassword(
        user.password,
        body.password
    );
    // 4.kalo enggak benar, throw error
    if (!isPassMatch) {
        throw new ApiError("Invalid credentials", 400);
    }
    // 5.generate jwt token ->jsonwebtoken
    const payload = {
        id: user.id,
        role: user.role,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!,{expiresIn: "2h"});
    // 6.retiurn user data + token
    const { password, ...userWithoutPassword } = user; // remove property password
    return {
        ...userWithoutPassword,
         accessToken };
};