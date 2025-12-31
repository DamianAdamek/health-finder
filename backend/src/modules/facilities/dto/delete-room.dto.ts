import { IsInt, Min } from 'class-validator';

export class DeleteRoomDto {
  @IsInt()
  @Min(1)
  id: number;
}
