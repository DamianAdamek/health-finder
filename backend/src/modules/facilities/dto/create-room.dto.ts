import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Yoga Room' })
  name: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be at least 1' })
  @ApiProperty({ example: 30, required: false })
  capacity?: number;
  
  @Type(() => Number)
  @IsInt({ message: 'Gym ID must be an integer' })
  @Min(1, { message: 'Gym ID must be at least 1' })
  @ApiProperty({ example: 1 })
  gymId: number;
}
