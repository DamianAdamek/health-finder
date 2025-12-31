import { IsInt, Min } from 'class-validator';

export class DeleteOpinionDto {
  @IsInt()
  @Min(1)
  id: number;
}
