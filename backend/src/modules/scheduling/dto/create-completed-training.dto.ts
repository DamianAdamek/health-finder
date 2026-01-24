import { IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Client } from '../../user-management/entities/client.entity';

export class CreateCompletedTrainingDto {
    @Type(() => Number)
    @IsInt()
    @ApiProperty({ example: 1, description: 'ID of the training to archive' })
    trainingId: number;

    @IsDateString()
    @ApiProperty({ example: '2026-01-24', description: 'Date when the training was completed' })
    trainingDate: string;

    @ApiProperty({ description: 'All clients currently assigned to the training' })
    clients?: Client[];
}
