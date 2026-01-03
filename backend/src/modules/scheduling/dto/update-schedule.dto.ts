import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: 'DTO do aktualizacji harmonogramu' })
export class UpdateScheduleDto {
    @ApiProperty({ example: [1, 2, 3], description: 'IDs okien do przypisania', required: false })
    windowIds?: number[];

    @ApiProperty({ example: [1, 2], description: 'IDs trenigów do przypisania', required: false })
    trainingIds?: number[];
}
