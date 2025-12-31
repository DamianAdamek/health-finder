import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Facilities')
@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  // Gym endpoints
  @Post('gyms')
  createGym(@Body() createGymDto: CreateGymDto) {
    return this.facilitiesService.createGym(createGymDto);
  }

  @Get('gyms')
  findAllGyms() {
    return this.facilitiesService.findAllGyms();
  }

  @Get('gyms/:id')
  findGym(@Param('id') id: string) {
    return this.facilitiesService.findGym(+id);
  }

  @Patch('gyms/:id')
  updateGym(@Param('id') id: string, @Body() updateGymDto: UpdateGymDto) {
    return this.facilitiesService.updateGym(+id, updateGymDto);
  }

  @Delete('gyms/:id')
  removeGym(@Param('id') id: string) {
    return this.facilitiesService.removeGym(+id);
  }

  // Location endpoints
  @Post('locations')
  createLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.facilitiesService.createLocation(createLocationDto);
  }

  @Get('locations')
  findAllLocations() {
    return this.facilitiesService.findAllLocations();
  }

  @Get('locations/:id')
  findLocation(@Param('id') id: string) {
    return this.facilitiesService.findLocation(+id);
  }

  @Patch('locations/:id')
  updateLocation(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.facilitiesService.updateLocation(+id, updateLocationDto);
  }

  @Delete('locations/:id')
  removeLocation(@Param('id') id: string) {
    return this.facilitiesService.removeLocation(+id);
  }

  // Room endpoints
  @Post('rooms')
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.facilitiesService.createRoom(createRoomDto);
  }

  @Get('rooms')
  findAllRooms() {
    return this.facilitiesService.findAllRooms();
  }

  @Get('rooms/:id')
  findRoom(@Param('id') id: string) {
    return this.facilitiesService.findRoom(+id);
  }

  @Patch('rooms/:id')
  updateRoom(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.facilitiesService.updateRoom(+id, updateRoomDto);
  }

  @Delete('rooms/:id')
  removeRoom(@Param('id') id: string) {
    return this.facilitiesService.removeRoom(+id);
  }
}
