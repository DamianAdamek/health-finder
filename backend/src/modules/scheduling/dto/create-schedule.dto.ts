import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

@ApiSchema({ description: 'DTO do tworzenia nowego harmonogramu' })
export class CreateScheduleDto {
}
