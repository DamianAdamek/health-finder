import { PartialType } from '@nestjs/mapped-types';
import { CreateOpinionDto } from './create-opinion.dto';

export class UpdateOpinionDto extends PartialType(CreateOpinionDto) {}
