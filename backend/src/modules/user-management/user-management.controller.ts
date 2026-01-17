import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserManagementService } from './user-management.service';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { CreateGymAdminDto } from './dto/create-gym-admin.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateGymAdminDto } from './dto/update-gym-admin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { User } from './entities/user.entity';
import { Client } from './entities/client.entity';
import { Trainer } from './entities/trainer.entity';
import { GymAdmin } from './entities/gym-admin.entity';

@ApiTags('User Management')
@Controller('user-management')
export class UserManagementController {
  constructor(private readonly userService: UserManagementService) {}

  // ===================== AUTH =====================

  @Post('auth/register/client')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new Client' })
  @ApiResponse({ status: 201, description: 'Client registered', type: Client })
  async registerClient(@Body() dto: CreateClientDto): Promise<Client> {
    return this.userService.registerClient(dto);
  }

  @Post('auth/register/trainer')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new Trainer' })
  @ApiResponse({ status: 201, description: 'Trainer registered', type: Trainer })
  async registerTrainer(@Body() dto: CreateTrainerDto): Promise<Trainer> {
    return this.userService.registerTrainer(dto);
  }

  @Post('auth/register/gym-admin')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new Gym Admin - Admin only' })
  @ApiResponse({ status: 201, description: 'Gym Admin registered', type: GymAdmin })
  async registerGymAdmin(@Body() dto: CreateGymAdminDto): Promise<GymAdmin> {
    return this.userService.registerGymAdmin(dto);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }

  // ===================== USERS (Base Entities) =====================

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users - Admin only' })
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

  @Patch('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: User })
  async updateMyProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto): Promise<User> {
    return this.userService.updateUser(user.id, dto);
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get one User by ID - Admin only' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  async findOneUser(@Param('id') id: string): Promise<User> {
    return this.userService.findOneUser(+id);
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update User basic info (email, name, password) - Admin only' })
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
  @ApiOperation({ summary: 'Get all trainers - Public' })
  @ApiResponse({ status: 200, description: 'List of trainers', type: [Trainer] })
  async findAllTrainers(): Promise<Trainer[]> {
    return this.userService.findAllTrainers();
  }

  @Get('trainers/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own trainer profile' })
  @ApiResponse({ status: 200, description: 'Trainer profile', type: Trainer })
  async getMyTrainerProfile(@CurrentUser() user: User): Promise<Trainer> {
    if (!user.trainer) {
      throw new NotFoundException('Trainer profile not found');
    }
    return this.userService.findOneTrainer(user.trainer.trainerId);
  }

  @Get('trainers/:id')
  @ApiOperation({ summary: 'Get Trainer Profile by ID - Public' })
  @ApiResponse({ status: 200, description: 'Trainer found', type: Trainer })
  async findOneTrainer(@Param('id') id: string): Promise<Trainer> {
    return this.userService.findOneTrainer(+id);
  }

  @Patch('trainers/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own trainer profile' })
  @ApiResponse({ status: 200, description: 'Trainer updated', type: Trainer })
  async updateMyTrainerProfile(@CurrentUser() user: User, @Body() dto: UpdateTrainerDto): Promise<Trainer> {
    if (!user.trainer) {
      throw new NotFoundException('Trainer profile not found');
    }
    return this.userService.updateTrainer(user.trainer.trainerId, dto);
  }

  @Patch('trainers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Trainer Profile (spec, description) - Admin only' })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all clients - Admin only' })
  @ApiResponse({ status: 200, description: 'List of clients', type: [Client] })
  async findAllClients(): Promise<Client[]> {
    return this.userService.findAllClients();
  }

  @Get('clients/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own client profile' })
  @ApiResponse({ status: 200, description: 'Client profile', type: Client })
  async getMyClientProfile(@CurrentUser() user: User): Promise<Client> {
    if (!user.client) {
      throw new NotFoundException('Client profile not found');
    }
    return this.userService.findOneClient(user.client.clientId);
  }

  @Get('clients/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Client Profile by ID - Admin only' })
  @ApiResponse({ status: 200, description: 'Client found', type: Client })
  async findOneClient(@Param('id') id: string): Promise<Client> {
    return this.userService.findOneClient(+id);
  }

  @Patch('clients/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own client profile' })
  @ApiResponse({ status: 200, description: 'Client updated', type: Client })
  async updateMyClientProfile(@CurrentUser() user: User, @Body() dto: UpdateClientDto): Promise<Client> {
    if (!user.client) {
      throw new NotFoundException('Client profile not found');
    }
    return this.userService.updateClient(user.client.clientId, dto);
  }

  @Patch('clients/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Client Profile - Admin only' })
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

  // ===================== GYM ADMINS (Profiles) =====================

  @Get('gym-admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all gym admins - Admin only' })
  @ApiResponse({ status: 200, description: 'List of gym admins', type: [GymAdmin] })
  async findAllGymAdmins(): Promise<GymAdmin[]> {
    return this.userService.findAllGymAdmins();
  }

  @Get('gym-admins/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own gym admin profile' })
  @ApiResponse({ status: 200, description: 'Gym admin profile', type: GymAdmin })
  async getMyGymAdminProfile(@CurrentUser() user: User): Promise<GymAdmin> {
    if (!user.gymAdmin) {
      throw new NotFoundException('Gym admin profile not found');
    }
    return this.userService.findOneGymAdmin(user.gymAdmin.gymAdminId);
  }

  @Get('gym-admins/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Gym Admin Profile by ID - Admin only' })
  @ApiResponse({ status: 200, description: 'Gym admin found', type: GymAdmin })
  async findOneGymAdmin(@Param('id') id: string): Promise<GymAdmin> {
    return this.userService.findOneGymAdmin(+id);
  }

  @Patch('gym-admins/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own gym admin profile' })
  @ApiResponse({ status: 200, description: 'Gym admin updated', type: GymAdmin })
  async updateMyGymAdminProfile(@CurrentUser() user: User, @Body() dto: UpdateGymAdminDto): Promise<GymAdmin> {
    if (!user.gymAdmin) {
      throw new NotFoundException('Gym admin profile not found');
    }
    return this.userService.updateGymAdmin(user.gymAdmin.gymAdminId, dto);
  }

  @Patch('gym-admins/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Gym Admin Profile - Admin only' })
  @ApiResponse({ status: 200, description: 'Gym admin updated', type: GymAdmin })
  async updateGymAdmin(@Param('id') id: string, @Body() dto: UpdateGymAdminDto): Promise<GymAdmin> {
    return this.userService.updateGymAdmin(+id, dto);
  }

  @Delete('gym-admins/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete ONLY Gym Admin Profile (User remains) - Admin only' })
  @ApiResponse({ status: 204, description: 'Gym admin profile deleted' })
  async removeGymAdmin(@Param('id') id: string): Promise<void> {
    await this.userService.removeGymAdminProfile(+id);
  }
}