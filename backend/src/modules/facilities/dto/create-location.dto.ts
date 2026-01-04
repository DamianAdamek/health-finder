import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Warsaw' })
  city: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '00-001' })
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Main St' })
  street: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '12A' })
  buildingNumber: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: '3' })
  apartmentNumber?: string;
}
