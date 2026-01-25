import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Gym } from './entities/gym.entity';
import { Location } from './entities/location.entity';
import { Room } from './entities/room.entity';
import { Schedule } from '../scheduling/entities/schedule.entity';
import { Trainer } from '../user-management/entities/trainer.entity';
import { GymAdmin } from '../user-management/entities/gym-admin.entity';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Gym)
    private gymRepository: Repository<Gym>,

    @InjectRepository(Location)
    private locationRepository: Repository<Location>,

    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<any>,

    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,

    @InjectRepository(GymAdmin)
    private gymAdminRepository: Repository<GymAdmin>,

    private dataSource: DataSource,
  ) {}

  // Gym methods
  async createGym(createGymDto: CreateGymDto, user?: any): Promise<Gym> {
    const schedule = this.scheduleRepository.create();
    await this.scheduleRepository.save(schedule);

    const gym = this.gymRepository.create({ ...createGymDto, schedule });
    const savedGym = await this.gymRepository.save(gym);

    // If the user is a GYM_ADMIN, automatically assign this gym to them
    if (user && user.role === UserRole.GYM_ADMIN) {
      const gymAdmin = await this.gymAdminRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['gyms'],
      });

      if (gymAdmin) {
        if (!gymAdmin.gyms) {
          gymAdmin.gyms = [];
        }
        gymAdmin.gyms.push(savedGym);
        await this.gymAdminRepository.save(gymAdmin);
      }
    }

    return savedGym;
  }

  async findAllGyms(): Promise<Gym[]> {
    return this.gymRepository.find({ relations: ['location', 'rooms', 'trainers', 'trainers.user'] });
  }

  async findGym(id: number): Promise<Gym> {
    const gym = await this.gymRepository.findOne({
      where: { gymId: id },
      relations: ['location', 'rooms', 'trainers', 'trainers.user'],
    });

    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }

    return gym;
  }

  async updateGym(id: number, updateGymDto: UpdateGymDto): Promise<Gym> {
    const gym = await this.findGym(id);
    
    // Handle trainers separately if provided
    if (updateGymDto.trainers !== undefined) {
      const trainerIds = updateGymDto.trainers;
      if (trainerIds.length > 0) {
        const trainers = await this.trainerRepository.find({
          where: { trainerId: In(trainerIds) },
        });
        gym.trainers = trainers;
      } else {
        gym.trainers = [];
      }
      // Remove trainers from the DTO so Object.assign doesn't overwrite
      const { trainers, ...restDto } = updateGymDto;
      Object.assign(gym, restDto);
    } else {
      Object.assign(gym, updateGymDto);
    }

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
    const gymExists = await this.gymRepository.exists({ where: { gymId: createRoomDto.gymId } });
    if (!gymExists) throw new NotFoundException(`Gym with ID ${createRoomDto.gymId} does not exist`);

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
