import { IsInt, Min } from 'class-validator';

export class DeleteLocationDto {
  @IsInt()
  @Min(1)
  id: number;
}
