import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserManagementService } from './user-management.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class UserManagementController {
  constructor(private readonly userService: UserManagementService) {}

  @Post('register/client')
  @ApiOperation({ summary: 'Register a new Client' })
  registerClient(@Body() dto: CreateUserDto) {
    return this.userService.registerClient(dto);
  }

  @Post('register/trainer')
  @ApiOperation({ summary: 'Register a new Trainer' })
  registerTrainer(@Body() dto: CreateTrainerDto) {
    return this.userService.registerTrainer(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }
}