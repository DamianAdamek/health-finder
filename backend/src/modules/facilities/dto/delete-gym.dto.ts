import { IsInt, Min } from 'class-validator';

export class DeleteGymDto {
  @IsInt()
  @Min(1)
  id: number;
}
