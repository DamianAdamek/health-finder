import { IsNumber, Min, Max, IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOpinionDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot be more than 5' })
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @Type(() => Number)
  @IsInt()
  clientId: number;

  @Type(() => Number)
  @IsInt()
  trainerId: number;
}
