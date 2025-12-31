import { IsInt, Min } from 'class-validator';

export class DeleteFormDto {
  @IsInt()
  @Min(1)
  id: number;
}
