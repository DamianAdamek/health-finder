import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserManagementService } from './user-management.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('User Management')
@Controller('user-management')
export class UserManagementController {
  constructor(private readonly userService: UserManagementService) {}

  // ===================== AUTH =====================

  @Post('auth/register/client')
  @ApiOperation({ summary: 'Register a new Client' })
  registerClient(@Body() dto: CreateUserDto) {
    return this.userService.registerClient(dto);
  }

  @Post('auth/register/trainer')
  @ApiOperation({ summary: 'Register a new Trainer' })
  registerTrainer(@Body() dto: CreateTrainerDto) {
    return this.userService.registerTrainer(dto);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'User Login' })
  login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  // ===================== USERS (Base Entities) =====================

  @Get('users')
  @ApiOperation({ summary: 'Get all Users (with profiles)' })
  findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get one User by ID' })
  findOneUser(@Param('id') id: string) {
    return this.userService.findOneUser(+id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update User basic info (email, name, password)' })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(+id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete User (Cascades to Trainer/Client profile)' })
  removeUser(@Param('id') id: string) {
    return this.userService.removeUser(+id);
  }

  // ===================== TRAINERS (Profiles) =====================

  @Get('trainers')
  @ApiOperation({ summary: 'Get all Trainers' })
  findAllTrainers() {
    return this.userService.findAllTrainers();
  }

  @Get('trainers/:id')
  @ApiOperation({ summary: 'Get Trainer Profile by ID' })
  findOneTrainer(@Param('id') id: string) {
    return this.userService.findOneTrainer(+id);
  }

  @Patch('trainers/:id')
  @ApiOperation({ summary: 'Update Trainer Profile (spec, description)' })
  updateTrainer(@Param('id') id: string, @Body() dto: UpdateTrainerDto) {
    return this.userService.updateTrainer(+id, dto);
  }

  @Delete('trainers/:id')
  @ApiOperation({ summary: 'Delete ONLY Trainer Profile (User remains)' })
  removeTrainer(@Param('id') id: string) {
    return this.userService.removeTrainerProfile(+id);
  }

  // ===================== CLIENTS (Profiles) =====================

  @Get('clients')
  @ApiOperation({ summary: 'Get all Clients' })
  findAllClients() {
    return this.userService.findAllClients();
  }

  @Get('clients/:id')
  @ApiOperation({ summary: 'Get Client Profile by ID' })
  findOneClient(@Param('id') id: string) {
    return this.userService.findOneClient(+id);
  }

  @Patch('clients/:id')
  @ApiOperation({ summary: 'Update Client Profile (goal)' })
  updateClient(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.userService.updateClient(+id, dto);
  }

  @Delete('clients/:id')
  @ApiOperation({ summary: 'Delete ONLY Client Profile (User remains)' })
  removeClient(@Param('id') id: string) {
    return this.userService.removeClientProfile(+id);
  }
}