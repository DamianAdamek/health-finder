import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Gym } from './entities/gym.entity';
import { Location } from './entities/location.entity';
import { Room } from './entities/room.entity';
import { JwtAuthGuard } from '../user-management/guards/jwt-auth.guard';
import { RolesGuard } from '../user-management/guards/roles.guard';
import { Roles } from '../user-management/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { GymOwnershipGuard } from './guards/gym-ownership.guard';
import { RoomOwnershipGuard } from './guards/room-ownership.guard';

@ApiTags('Facilities')
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // Gym endpoints
  @Post('gyms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a gym - GymAdmin or Admin only' })
  @ApiCreatedResponse({ description: 'Gym created', type: Gym })
  createGym(@Body() createGymDto: CreateGymDto) {
    return this.facilitiesService.createGym(createGymDto);
  }

  @Get('gyms')
  @ApiOperation({ summary: 'Get all gyms - Public' })
  @ApiOkResponse({ description: 'List of gyms', type: Gym, isArray: true })
  findAllGyms() {
    return this.facilitiesService.findAllGyms();
  }

  @Get('gyms/:id')
  @ApiOperation({ summary: 'Get a gym by id - Public' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Gym found', type: Gym })
  findGym(@Param('id') id: string) {
    return this.facilitiesService.findGym(+id);
  }

  @Patch('gyms/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, GymOwnershipGuard)
  @Roles(UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a gym - GymAdmin (own gym) or Admin' })
  @ApiOkResponse({ description: 'Gym updated', type: Gym })
  updateGym(@Param('id') id: string, @Body() updateGymDto: UpdateGymDto) {
    return this.facilitiesService.updateGym(+id, updateGymDto);
  }

  @Delete('gyms/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard, GymOwnershipGuard)
  @Roles(UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a gym - GymAdmin (own gym) or Admin' })
  @ApiResponse({ status: 204, description: 'Gym removed' })
  removeGym(@Param('id') id: string) {
    return this.facilitiesService.removeGym(+id);
  }

  // Location endpoints
  @Post('locations')
  @ApiOperation({ summary: 'Create a location' })
  @ApiCreatedResponse({ description: 'Location created', type: Location })
  createLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.facilitiesService.createLocation(createLocationDto);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get all locations' })
  @ApiOkResponse({ description: 'List of locations', type: Location, isArray: true })
  findAllLocations() {
    return this.facilitiesService.findAllLocations();
  }

  @Get('locations/:id')
  @ApiOperation({ summary: 'Get location by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Location found', type: Location })
  findLocation(@Param('id') id: string) {
    return this.facilitiesService.findLocation(+id);
  }

  @Patch('locations/:id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiOkResponse({ description: 'Location updated', type: Location })
  updateLocation(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.facilitiesService.updateLocation(+id, updateLocationDto);
  }

  @Delete('locations/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a location' })
  @ApiResponse({ status: 204, description: 'Location removed' })
  removeLocation(@Param('id') id: string) {
    return this.facilitiesService.removeLocation(+id);
  }

  // Room endpoints
  @Post('rooms')
  @UseGuards(JwtAuthGuard, RolesGuard, RoomOwnershipGuard)
  @Roles(UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a room - GymAdmin or Admin only' })
  @ApiCreatedResponse({ description: 'Room created', type: Room })
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.facilitiesService.createRoom(createRoomDto);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get all rooms - Public' })
  @ApiOkResponse({ description: 'List of rooms', type: Room, isArray: true })
  findAllRooms() {
    return this.facilitiesService.findAllRooms();
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Get room by id - Public' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Room found', type: Room })
  findRoom(@Param('id') id: string) {
    return this.facilitiesService.findRoom(+id);
  }

  @Patch('rooms/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, RoomOwnershipGuard)
  @Roles(UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a room - GymAdmin (own gym) or Admin' })
  @ApiOkResponse({ description: 'Room updated', type: Room })
  updateRoom(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.facilitiesService.updateRoom(+id, updateRoomDto);
  }

  @Delete('rooms/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard, RoomOwnershipGuard)
  @Roles(UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a room - GymAdmin (own gym) or Admin' })
  @ApiResponse({ status: 204, description: 'Room removed' })
  removeRoom(@Param('id') id: string) {
    return this.facilitiesService.removeRoom(+id);
  }
}
