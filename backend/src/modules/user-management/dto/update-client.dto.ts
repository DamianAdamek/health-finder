import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import { IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @ApiProperty({ description: 'ID of the form to associate with this client', required: false })
  @IsOptional()
  @IsInt()
  formId?: number;
}
