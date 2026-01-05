import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { TrainingStatus, TrainingType } from '../../../common/enums';

@ApiSchema({ description: 'DTO for updating training' })
export class UpdateTrainingDto {
    @ApiProperty({ example: 1, description: 'ID room for the training', required: false })
    roomId?: number;

    @ApiProperty({ example: 150, description: 'Price of the training', required: false })
    price?: number;

    @ApiProperty({ example: 1, description: 'ID trainer for the training', required: false })
    trainerId?: number;

    @ApiProperty({ enum: TrainingStatus, example: TrainingStatus.PLANNED, description: 'Status of the training', required: false })
    status?: TrainingStatus;

    @ApiProperty({ enum: TrainingType, example: TrainingType.FUNCTIONAL, description: 'Type of the training', required: false })
    type?: TrainingType;

    @ApiProperty({ example: [1, 2, 3], description: 'IDs of clients attending the training', required: false })
    clientIds?: number[];
}
