import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsEnum, IsArray, IsInt } from 'class-validator';
import { TrainingStatus, TrainingType } from '../../../common/enums';

@ApiSchema({ description: 'DTO for creating a new training session' })
export class CreateTrainingDto {
    @ApiProperty({ example: 1, description: 'ID room where the training will take place' })
    @IsNumber()
    @IsPositive()
    roomId: number;

    @ApiProperty({ example: 150, description: 'Price of the training session' })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ example: 1, description: 'ID of the trainer conducting the training' })
    @IsNumber()
    @IsPositive()
    trainerId: number;

    @ApiProperty({ enum: TrainingStatus, example: TrainingStatus.PLANNED, description: 'Status of the training session' })
    @IsEnum(TrainingStatus)
    status: TrainingStatus;

    @ApiProperty({ enum: TrainingType, example: TrainingType.FUNCTIONAL, description: 'Type of the training session' })
    @IsEnum(TrainingType)
    type: TrainingType;

    @ApiProperty({ example: [1, 2, 3], description: 'IDs of clients participating in the training session' })
    @IsArray()
    @IsInt({ each: true })
    clientIds: number[];
}
