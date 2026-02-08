import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// DTO ===> data transfer object
export class GoogleDTO {
    @IsNotEmpty()
    @IsString()
    accessToken!: string;
    
}