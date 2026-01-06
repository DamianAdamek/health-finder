import { UpdateUserDto } from './update-user.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional } from 'class-validator';

@ApiSchema({ description: 'DTO for updating a gym administrator' })
export class UpdateGymAdminDto extends UpdateUserDto {
	@ApiProperty({
		description: 'Updated list of gyms assigned to the admin',
		type: Number,
		isArray: true,
		required: false,
	})
	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	gymIds?: number[];
}
