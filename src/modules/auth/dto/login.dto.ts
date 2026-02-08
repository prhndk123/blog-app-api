import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// DTO ===> data transfer object
export class LoginDTO {
    @IsNotEmpty()
    @IsEmail()
    email!: string;
    
    @IsNotEmpty()
    @IsString()
    password!: string;
}