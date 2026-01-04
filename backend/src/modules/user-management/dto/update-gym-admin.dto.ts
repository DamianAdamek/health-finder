import { UpdateUserDto } from './update-user.dto';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: 'DTO do aktualizacji administratora siłowni' })
export class UpdateGymAdminDto extends UpdateUserDto {}
