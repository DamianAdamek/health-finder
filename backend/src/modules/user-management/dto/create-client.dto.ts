import { CreateUserDto } from './create-user.dto';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: 'DTO do tworzenia klienta' })
export class CreateClientDto extends CreateUserDto {
  // Klient nie ma dodatkowych pól, tylko rozszerza CreateUserDto
}
