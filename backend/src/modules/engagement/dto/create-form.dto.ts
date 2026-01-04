import { IsEnum, IsArray, ArrayNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityLevel, TrainingType } from '../../../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormDto {
  @IsEnum(ActivityLevel, { message: 'Invalid activity level' })
  @ApiProperty({ enum: ActivityLevel, example: ActivityLevel.MEDIUM })
  activityLevel: ActivityLevel;

  @IsArray({message: 'Training types must be an array'})
  @ArrayNotEmpty({message: 'Training types cannot be empty'})
  @IsEnum(TrainingType, { each: true })
  @ApiProperty({ enum: TrainingType, isArray: true, example: [TrainingType.CARDIO, TrainingType.BODYBUILDING]  })
  trainingTypes: TrainingType[];

  @IsString()
  @ApiProperty({ example: 'Lose weight / build muscle' })
  trainingGoal: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'No major health issues' })
  healthProfile?: string;

  @Type(() => Number)
  @IsInt()
  @ApiProperty({ example: 1 })
  clientId: number;
}
