import { IsNotEmpty, IsString } from "class-validator";

// DTO ===> data transfer object
export class ResetPasswordDTO {
  @IsNotEmpty()
  @IsString()
  password!: string;
}
