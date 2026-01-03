import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { TrainingType } from '../../../common/enums';

@ApiSchema({ description: 'DTO do tworzenia nowego treningu' })
export class CreateTrainingDto {
    @ApiProperty({ example: 1, description: 'ID sali' })
    roomId: number;

    @ApiProperty({ example: 150, description: 'Cena treningu' })
    price: number;

    @ApiProperty({ example: 1, description: 'ID trenera' })
    trainerId: number;

    @ApiProperty({ enum: TrainingType, example: TrainingType.FUNCTIONAL, description: 'Typ treningu' })
    type: TrainingType;

    @ApiProperty({ example: [1, 2, 3], description: 'IDs klientów do przypisania', required: false })
    clientIds?: number[];
}
