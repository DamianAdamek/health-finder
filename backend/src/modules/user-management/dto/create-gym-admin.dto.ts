import { CreateUserDto } from './create-user.dto';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: 'DTO do tworzenia administratora siłowni' })
export class CreateGymAdminDto extends CreateUserDto {}
