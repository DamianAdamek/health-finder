import { PartialType } from '@nestjs/mapped-types';
import { CreateGymDto } from './create-gym.dto';
import { IsOptional, IsArray, IsNumber, IsPositive } from 'class-validator';

export class UpdateGymDto extends PartialType(CreateGymDto) {
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @IsPositive({ each: true })
    trainers?: number[];
}
