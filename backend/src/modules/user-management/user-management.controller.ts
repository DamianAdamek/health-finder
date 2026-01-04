import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserManagementService } from './user-management.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { User } from './entities/user.entity';
import { Client } from './entities/client.entity';
import { Trainer } from './entities/trainer.entity';

@ApiTags('User Management')
@Controller('user-management')
export class UserManagementController {
  constructor(private readonly userService: UserManagementService) {}

  // ===================== AUTH =====================

  @Post('auth/register/client')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new Client' })
  @ApiResponse({ status: 201, description: 'Client registered', type: Client })
  async registerClient(@Body() dto: CreateUserDto): Promise<Client> {
    return this.userService.registerClient(dto);
  }

  @Post('auth/register/trainer')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new Trainer' })
  @ApiResponse({ status: 201, description: 'Trainer registered', type: Trainer })
  async registerTrainer(@Body() dto: CreateTrainerDto): Promise<Trainer> {
    return this.userService.registerTrainer(dto);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  // ===================== USERS (Base Entities) =====================

  @Get('users')
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  async findAllUsers(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  @ApiResponse({ status: 200, description: 'Current user', type: User })
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get one User by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  async findOneUser(@Param('id') id: string): Promise<User> {
    return this.userService.findOneUser(+id);
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update User basic info (email, name, password)' })
  @ApiResponse({ status: 200, description: 'User updated', type: User })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<User> {
    return this.userService.updateUser(+id, dto);
  }

  @Delete('users/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete User (Cascades to Trainer/Client profile) - Admin only' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  async removeUser(@Param('id') id: string): Promise<void> {
    await this.userService.removeUser(+id);
  }

  // ===================== TRAINERS (Profiles) =====================

  @Get('trainers')
  @ApiResponse({ status: 200, description: 'List of trainers', type: [Trainer] })
  async findAllTrainers(): Promise<Trainer[]> {
    return this.userService.findAllTrainers();
  }

  @Get('trainers/:id')
  @ApiOperation({ summary: 'Get Trainer Profile by ID - Public' })
  @ApiResponse({ status: 200, description: 'Trainer found', type: Trainer })
  async findOneTrainer(@Param('id') id: string): Promise<Trainer> {
    return this.userService.findOneTrainer(+id);
  }

  @Patch('trainers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Trainer Profile (spec, description) - Trainer or Admin' })
  @ApiResponse({ status: 200, description: 'Trainer updated', type: Trainer })
  async updateTrainer(@Param('id') id: string, @Body() dto: UpdateTrainerDto): Promise<Trainer> {
    return this.userService.updateTrainer(+id, dto);
  }

  @Delete('trainers/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete ONLY Trainer Profile (User remains) - Admin only' })
  @ApiResponse({ status: 204, description: 'Trainer profile deleted' })
  async removeTrainer(@Param('id') id: string): Promise<void> {
    await this.userService.removeTrainerProfile(+id);
  }

  // ===================== CLIENTS (Profiles) =====================

  @Get('clients')
  @ApiResponse({ status: 200, description: 'List of clients', type: [Client] })
  async findAllClients(): Promise<Client[]> {
    return this.userService.findAllClients();
  }

  @Get('clients/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Client Profile by ID' })
  @ApiResponse({ status: 200, description: 'Client found', type: Client })
  async findOneClient(@Param('id') id: string): Promise<Client> {
    return this.userService.findOneClient(+id);
  }

  @Patch('clients/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Client Profile (goal)' })
  @ApiResponse({ status: 200, description: 'Client updated', type: Client })
  async updateClient(@Param('id') id: string, @Body() dto: UpdateClientDto): Promise<Client> {
    return this.userService.updateClient(+id, dto);
  }

  @Delete('clients/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete ONLY Client Profile (User remains) - Admin only' })
  @ApiResponse({ status: 204, description: 'Client profile deleted' })
  async removeClient(@Param('id') id: string): Promise<void> {
    await this.userService.removeClientProfile(+id);
  }
}