import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

@ApiSchema({ description: 'DTO for updating schedule' })
export class UpdateScheduleDto {
    @ApiProperty({ example: [1, 2, 3], description: 'IDs of availability windows (optional)' , required: false})
    @IsOptional()
    @IsNumber({}, { each: true })
    windowIds?: number[];
}
