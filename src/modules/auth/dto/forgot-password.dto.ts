import { IsEmail, IsNotEmpty } from "class-validator";

// DTO ===> data transfer object
export class ForgotPasswordDTO {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
