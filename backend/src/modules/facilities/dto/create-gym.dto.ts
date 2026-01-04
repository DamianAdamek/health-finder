import { IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLocationDto } from './create-location.dto';
import { CreateRoomDto } from './create-room.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGymDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'FitCenter' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: '24/7 open gym' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'No smoking, No outside food' })
  rules?: string;

  @ValidateNested()
  @Type(() => CreateLocationDto)
  @ApiProperty({ type: () => CreateLocationDto })
  location: CreateLocationDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomDto)
  @ArrayMinSize(0)
  @ApiProperty({ required: false, type: () => CreateRoomDto, isArray: true })
  rooms?: CreateRoomDto[];
}
