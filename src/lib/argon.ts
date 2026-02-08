import { hash, verify } from "argon2";

export const hashPassword = async (password: string) => {
    return await hash(password);
};

export const comparePassword = async (
    hashedPassword: string,
    plainPassword: string
) => {
    return await verify(hashedPassword, plainPassword);
};
