import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Gym } from './entities/gym.entity';
import { Location } from './entities/location.entity';
import { Room } from './entities/room.entity';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Gym)
    private gymRepository: Repository<Gym>,

    @InjectRepository(Location)
    private locationRepository: Repository<Location>,

    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private dataSource: DataSource,
  ) {}

  // Gym methods
  async createGym(createGymDto: CreateGymDto): Promise<Gym> {
    const gym = this.gymRepository.create(createGymDto);
    return this.gymRepository.save(gym);
  }

  async findAllGyms(): Promise<Gym[]> {
    return this.gymRepository.find({ relations: ['location', 'rooms'] });
  }

  async findGym(id: number): Promise<Gym> {
    const gym = await this.gymRepository.findOne({
      where: { gymId: id },
      relations: ['location', 'rooms'],
    });

    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }

    return gym;
  }

  async updateGym(id: number, updateGymDto: UpdateGymDto): Promise<Gym> {
    const gym = await this.findGym(id);
    Object.assign(gym, updateGymDto);

    return this.gymRepository.save(gym);
  }

  async removeGym(id: number): Promise<void> {
    const gym = await this.findGym(id);

    // Use a transaction to ensure both gym and its location are removed atomically.
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(Gym, { gymId: id });

      if (gym.locationId) {
        await manager.delete(Location, { locationId: gym.locationId });
      }
    });
  }

  // Location methods
  async createLocation(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create(createLocationDto);

    return this.locationRepository.save(location);
  }

  async findAllLocations(): Promise<Location[]> {
    return this.locationRepository.find();
  }

  async findLocation(id: number): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { locationId: id },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async updateLocation(id: number, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findLocation(id);
    Object.assign(location, updateLocationDto);

    return this.locationRepository.save(location);
  }

  async removeLocation(id: number): Promise<void> {
    const location = await this.findLocation(id);
    await this.locationRepository.remove(location);
  }

  // Room methods
  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(createRoomDto);
    return this.roomRepository.save(room);
  }

  async findAllRooms(): Promise<Room[]> {
    return this.roomRepository.find({ relations: ['gym'] });
  }

  async findRoom(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { roomId: id },
      relations: ['gym'],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async updateRoom(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findRoom(id);
    Object.assign(room, updateRoomDto);

    return this.roomRepository.save(room);
  }

  async removeRoom(id: number): Promise<void> {
    const room = await this.findRoom(id);
    await this.roomRepository.remove(room);
  }
}
