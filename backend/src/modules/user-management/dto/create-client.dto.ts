import { CreateUserDto } from './create-user.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

@ApiSchema({ description: 'DTO do tworzenia klienta' })
export class CreateClientDto extends CreateUserDto {
  @ApiProperty({ example: 'Warsaw', description: 'Miasto' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: '00-001', description: 'Kod pocztowy' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  zipCode: string;

  @ApiProperty({ example: 'Main St', description: 'Ulica' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  street: string;

  @ApiProperty({ example: '12A', description: 'Numer budynku' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  buildingNumber: string;

  @ApiProperty({ example: '3', description: 'Numer mieszkania', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  apartmentNumber?: string;
}
