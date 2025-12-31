import { IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLocationDto } from './create-location.dto';
import { CreateRoomDto } from './create-room.dto';

export class CreateGymDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  rules?: string;

  @ValidateNested()
  @Type(() => CreateLocationDto)
  location: CreateLocationDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomDto)
  @ArrayMinSize(0)
  rooms?: CreateRoomDto[];
}
