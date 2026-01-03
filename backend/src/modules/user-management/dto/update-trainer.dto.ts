import { ApiProperty } from '@nestjs/swagger';
import { TrainingType } from '../../../common/enums';
import { UpdateUserDto } from './update-user.dto';

export class UpdateTrainerDto extends UpdateUserDto {
  @ApiProperty({ enum: TrainingType, required: false })
  specialization?: TrainingType;

  @ApiProperty({ example: 'Zaktualizowany opis...', required: false })
  description?: string;

  @ApiProperty({ example: 4.8, required: false })
  rating?: number;
}