import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { TrainingStatus, TrainingType } from '../../../common/enums';

@ApiSchema({ description: 'DTO treningu' })
export class TrainingDto {
    @ApiProperty({ example: 1, description: 'ID treningu' })
    trainingId: number;

    @ApiProperty({ example: 1, description: 'ID sali' })
    roomId: number;

    @ApiProperty({ example: 150, description: 'Cena treningu' })
    price: number;

    @ApiProperty({ example: 1, description: 'ID trenera' })
    trainerId: number;

    @ApiProperty({ enum: TrainingStatus, example: TrainingStatus.PLANNED, description: 'Status treningu' })
    status: TrainingStatus;

    @ApiProperty({ enum: TrainingType, example: TrainingType.FUNCTIONAL, description: 'Typ treningu' })
    type: TrainingType;

    @ApiProperty({ example: [1, 2, 3], description: 'IDs przypisanych klientów' })
    clientIds: number[];
}
