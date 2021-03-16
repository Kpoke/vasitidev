import { IsNotEmpty, IsString, IsArray, ValidateNested } from "class-validator";
import { VarietyDto } from "./variety.dto";

export class ProductCreateDto {
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @IsNotEmpty()
  @IsString()
  product_description: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  product_varieties: VarietyDto[];
}
