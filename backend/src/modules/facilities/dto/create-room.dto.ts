import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsInt({ message: 'Capacity must be an integer' })
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity: number;
  
  @Type(() => Number)
  @IsInt({ message: 'Gym ID must be an integer' })
  @Min(1, { message: 'Gym ID must be at least 1' })
  gymId: number;
}
