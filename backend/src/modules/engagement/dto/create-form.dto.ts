import { IsEnum, IsArray, ArrayNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityLevel, TrainingType } from '../../../common/enums';

export class CreateFormDto {
  @IsEnum(ActivityLevel, { message: 'Invalid activity level' })
  activityLevel: ActivityLevel;

  @IsArray({message: 'Training types must be an array'})
  @ArrayNotEmpty({message: 'Training types cannot be empty'})
  @IsEnum(TrainingType, { each: true })
  trainingTypes: TrainingType[];

  @IsString()
  trainingGoal: string;

  @IsOptional()
  @IsString()
  healthProfile?: string;

  @Type(() => Number)
  @IsInt()
  clientId: number;
}
