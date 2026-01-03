import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { TrainingStatus, TrainingType } from '../../../common/enums';

@ApiSchema({ description: 'DTO do aktualizacji treningu' })
export class UpdateTrainingDto {
    @ApiProperty({ example: 1, description: 'ID sali', required: false })
    roomId?: number;

    @ApiProperty({ example: 150, description: 'Cena treningu', required: false })
    price?: number;

    @ApiProperty({ example: 1, description: 'ID trenera', required: false })
    trainerId?: number;

    @ApiProperty({ enum: TrainingStatus, example: TrainingStatus.PLANNED, description: 'Status treningu', required: false })
    status?: TrainingStatus;

    @ApiProperty({ enum: TrainingType, example: TrainingType.FUNCTIONAL, description: 'Typ treningu', required: false })
    type?: TrainingType;

    @ApiProperty({ example: [1, 2, 3], description: 'IDs klientów do przypisania', required: false })
    clientIds?: number[];
}
