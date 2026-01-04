import { CreateUserDto } from './create-user.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TrainingType } from '../../../common/enums';

@ApiSchema({ description: 'DTO do tworzenia trenera' })
export class CreateTrainerDto extends CreateUserDto {
  @ApiProperty({ enum: TrainingType, example: TrainingType.BODYBUILDING, required: false })
  @IsOptional()
  @IsEnum(TrainingType)
  specialization?: TrainingType;

  @ApiProperty({ example: 'Certified personal trainer with 5 years exp.', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}