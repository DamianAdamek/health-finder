import { PartialType } from '@nestjs/mapped-types';
import { CreateUserManagementDto } from './create-user-management.dto';

export class UpdateUserManagementDto extends PartialType(CreateUserManagementDto) {}
