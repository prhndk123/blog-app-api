import { IsNotEmpty, IsString } from "class-validator";

// DTO ===> data transfer object
export class CreateBlogDTO {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsNotEmpty()
  @IsString()
  category!: string;
}
