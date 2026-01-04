import { IsNumber, Min, Max, IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOpinionDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot be more than 5' })
  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  rating: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Great trainer!' })
  comment?: string;

  @Type(() => Number)
  @IsInt()
  @ApiProperty({ example: 1 })
  clientId: number;

  @Type(() => Number)
  @IsInt()
  @ApiProperty({ example: 2 })
  trainerId: number;
}
