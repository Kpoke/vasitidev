import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class VarietyDto {
  @IsNotEmpty()
  @IsString()
  size: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
