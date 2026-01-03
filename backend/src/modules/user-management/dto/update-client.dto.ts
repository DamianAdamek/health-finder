import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientDto {
  @ApiProperty({ example: 'Schudnąć 10kg do wakacji', required: false })
  trainingGoal?: string;
}