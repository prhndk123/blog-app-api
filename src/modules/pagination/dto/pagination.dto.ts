import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class PaginationQueryParams {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  take: number = 5;

  @IsString()
  @IsOptional()
  sortBy: string = "createdAt";

  @IsString()
  @IsOptional()
  sortOrder: string = "desc";
}
