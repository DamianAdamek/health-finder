import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { TrainingType } from '../../../common/enums';

export class CreateTrainerDto extends CreateUserDto {
  @ApiProperty({ enum: TrainingType, example: TrainingType.BODYBUILDING })
  specialization: TrainingType;

  @ApiProperty({ example: 'Certified personal trainer with 5 years exp.' })
  description: string;
}