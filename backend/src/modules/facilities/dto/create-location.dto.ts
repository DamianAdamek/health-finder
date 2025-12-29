import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  buildingNumber: string;

  @IsOptional()
  @IsString()
  apartmentNumber?: string;
}
