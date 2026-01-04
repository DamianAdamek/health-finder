import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteGymDto {
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  id: number;
}
