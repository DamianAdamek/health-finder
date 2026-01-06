import { CreateUserDto } from './create-user.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional } from 'class-validator';

@ApiSchema({ description: 'DTO for creating a gym administrator' })
export class CreateGymAdminDto extends CreateUserDto {
	@ApiProperty({
		description: 'List of existing gyms that the admin will manage',
		type: Number,
		isArray: true,
		required: false,
	})
	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	gymIds?: number[];
}
