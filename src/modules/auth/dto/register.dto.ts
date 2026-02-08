import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// DTO ===> data transfer object
export class RegisterDTO {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsEmail()
    email!: string;
    
    @IsNotEmpty()
    @IsString()
    password!: string;
}