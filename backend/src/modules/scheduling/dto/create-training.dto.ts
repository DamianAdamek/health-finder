import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsEnum, IsArray, IsInt } from 'class-validator';
import { TrainingStatus, TrainingType } from '../../../common/enums';

@ApiSchema({ description: 'DTO do tworzenia nowego treningu' })
export class CreateTrainingDto {

    @ApiProperty({ example: 1, description: 'ID sali' })
    @IsNumber()
    @IsPositive()
    roomId: number;

    @ApiProperty({ example: 150, description: 'Cena treningu' })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ example: 1, description: 'ID trenera' })
    @IsNumber()
    @IsPositive()
    trainerId: number;

    @ApiProperty({ enum: TrainingStatus, example: TrainingStatus.PLANNED, description: 'Status treningu' })
    @IsEnum(TrainingStatus)
    status: TrainingStatus;

    @ApiProperty({ enum: TrainingType, example: TrainingType.FUNCTIONAL, description: 'Typ treningu' })
    @IsEnum(TrainingType)
    type: TrainingType;

    @ApiProperty({ example: [1, 2, 3], description: 'IDs przypisanych klientów' })
    @IsArray()
    @IsInt({ each: true })
    clientIds: number[];
}
