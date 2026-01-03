import { CreateUserDto } from './create-user.dto';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: 'DTO do tworzenia klienta' })
export class CreateClientDto extends CreateUserDto {
  // Client nie ma dodatkowych pól, więc tylko rozszerza CreateUserDto
}
