import { UpdateUserDto } from './update-user.dto';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: 'DTO do aktualizacji klienta' })
export class UpdateClientDto extends UpdateUserDto {
  // Client nie ma dodatkowych pól poza User, więc tylko rozszerza UpdateUserDto
}
