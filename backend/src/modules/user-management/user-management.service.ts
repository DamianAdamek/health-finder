import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { Trainer } from './entities/trainer.entity';
import { Client } from './entities/client.entity';
import { GymAdmin } from './entities/gym-admin.entity';
import { Gym } from '../facilities/entities/gym.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { CreateGymAdminDto } from './dto/create-gym-admin.dto';
import { Schedule } from 'src/modules/scheduling/entities/schedule.entity';
import { Location } from 'src/modules/facilities/entities/location.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateGymAdminDto } from './dto/update-gym-admin.dto';
import { UserRole } from '../../common/enums';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>,
    @InjectRepository(Client) private clientRepository: Repository<Client>,
    @InjectRepository(GymAdmin) private gymAdminRepository: Repository<GymAdmin>,
    @InjectRepository(Gym) private gymRepository: Repository<Gym>,
    @InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>,    
    @InjectRepository(Location) private locationRepository: Repository<Location>,    
    private jwtService: JwtService,
  ) {}

  // =================================================================
  // AUTH (Register / Login) - To już miałeś
  // =================================================================

  async registerClient(dto: CreateClientDto) {
    await this.checkEmail(dto.email);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      contactNumber: dto.contactNumber,
      role: UserRole.CLIENT,
    });
    const savedUser = await this.userRepository.save(newUser);
    const schedule = this.scheduleRepository.create();
    await this.scheduleRepository.save(schedule);

    // create Location from provided fields
    const locationEntity = this.locationRepository.create({
      city: dto.city,
      zipCode: dto.zipCode,
      street: dto.street,
      buildingNumber: dto.buildingNumber,
      apartmentNumber: dto.apartmentNumber,
    });
    const savedLocation = await this.locationRepository.save(locationEntity);

    const newClient = this.clientRepository.create({ user: savedUser, schedule, location: savedLocation });
    return this.clientRepository.save(newClient);
  }

  async registerTrainer(dto: CreateTrainerDto) {
    await this.checkEmail(dto.email);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      contactNumber: dto.contactNumber,
      role: UserRole.TRAINER,
    });
    const savedUser = await this.userRepository.save(newUser);
    const schedule = this.scheduleRepository.create();
    await this.scheduleRepository.save(schedule);

    const newTrainer = this.trainerRepository.create({
      description: dto.description,
      specialization: dto.specialization,
      user: savedUser,
      schedule,
    });
    return this.trainerRepository.save(newTrainer);
  }

  async registerGymAdmin(dto: CreateGymAdminDto) {
    const { gymIds, ...rest } = dto;
    await this.checkEmail(rest.email);
    const hashedPassword = await bcrypt.hash(rest.password, 10);

    const newUser = this.userRepository.create({
      firstName: rest.firstName,
      lastName: rest.lastName,
      email: rest.email,
      password: hashedPassword,
      contactNumber: rest.contactNumber,
      role: UserRole.GYM_ADMIN,
    });
    const savedUser = await this.userRepository.save(newUser);
    const newGymAdmin = this.gymAdminRepository.create({ user: savedUser });

    if (gymIds && gymIds.length > 0) {
      const gyms = await this.gymRepository.find({ where: { gymId: In(gymIds) } });
      newGymAdmin.gyms = gyms;
    }

    await this.gymAdminRepository.save(newGymAdmin);
    return this.findOneGymAdmin(newGymAdmin.gymAdminId);
  }

  async login(dto: LoginDto) {
    if (!dto?.email || !dto?.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // <-- potrzebne, gdy password ma select: false w encji
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  // =================================================================
  // USERS CRUD (Zarządzanie kontami)
  // =================================================================

  findAllUsers() {
    return this.userRepository.find({
      relations: ['trainer', 'client'], // Pobieramy też profil
    });
  }

  async findOneUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['trainer', 'client'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.findOneUser(id); // Check existence

    // Jeśli aktualizujemy hasło, trzeba je zahashować
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    await this.userRepository.save(user);
    return this.findOneUser(id);
  }

  async removeUser(id: number) {
    const user = await this.findOneUser(id);
    // Dzięki Cascade: true w encjach, usunięcie Usera usunie też Trenera/Klienta
    return this.userRepository.remove(user);
  }

  // =================================================================
  // TRAINERS CRUD (Zarządzanie profilami trenerów)
  // =================================================================

  findAllTrainers() {
    return this.trainerRepository.find({
      relations: ['user'], // Chcemy widzieć imię i nazwisko trenera
    });
  }

  async findOneTrainer(id: number) {
    const trainer = await this.trainerRepository.findOne({
      where: { trainerId: id },
      relations: ['user'],
    });
    if (!trainer) throw new NotFoundException(`Trainer with ID ${id} not found`);
    return trainer;
  }

  async updateTrainer(id: number, dto: UpdateTrainerDto) {
    const trainer = await this.findOneTrainer(id);
    
    // Aktualizuj dane User jeśli są podane
    const { firstName, lastName, email, password, contactNumber, ...trainerData } = dto;
    if (firstName || lastName || email || password || contactNumber) {
      const userDto: UpdateUserDto = { firstName, lastName, email, password, contactNumber };
      await this.updateUser(trainer.user.id, userDto);
    }
    
    // Aktualizuj dane Trainer (specialization, description, rating)
    if (Object.keys(trainerData).length > 0) {
      Object.assign(trainer, trainerData);
      await this.trainerRepository.save(trainer);
    }
    
    return this.findOneTrainer(id);
  }

  // Usunięcie profilu trenera (ale pozostawienie Usera) jest rzadkie.
  // Zazwyczaj usuwamy całego Usera. Ale dodajmy to dla kompletności.
  async removeTrainerProfile(id: number) {
    const trainer = await this.findOneTrainer(id);
    return this.trainerRepository.remove(trainer);
  }

  // =================================================================
  // CLIENTS CRUD (Zarządzanie profilami klientów)
  // =================================================================

  findAllClients() {
    return this.clientRepository.find({
      relations: ['user', 'location', 'schedule'],
    });
  }

  async findOneClient(id: number) {
    const client = await this.clientRepository.findOne({
      where: { clientId: id },
      relations: ['user', 'location', 'schedule'],
    });
    if (!client) throw new NotFoundException(`Client with ID ${id} not found`);
    return client;
  }

  async updateClient(id: number, dto: UpdateClientDto) {
    const client = await this.findOneClient(id);
    
    // Update User fields if provided
    const { firstName, lastName, email, password, contactNumber, city, zipCode, street, buildingNumber, apartmentNumber } = dto;
    if (firstName || lastName || email || password || contactNumber) {
      const userDto: UpdateUserDto = { firstName, lastName, email, password, contactNumber };
      await this.updateUser(client.user.id, userDto);
    }
    
    // Update or create location if any location field provided
    const locationData = {
      city,
      zipCode,
      street,
      buildingNumber,
      apartmentNumber,
    };

    const hasAnyLocationField = Object.values(locationData).some(
      (value) => value !== undefined,
    );

    if (hasAnyLocationField) {
      if (client.location) {
        Object.assign(client.location, locationData);
        await this.locationRepository.save(client.location);
      } else {
        const newLocation = this.locationRepository.create(locationData);
        client.location = await this.locationRepository.save(newLocation);
        await this.clientRepository.save(client);
      }
    }
    
    return this.findOneClient(id);
  }

  async removeClientProfile(id: number) {
    const client = await this.findOneClient(id);
    return this.clientRepository.remove(client);
  }

  // =================================================================
  // GYM ADMINS CRUD (Zarządzanie profilami administratorów siłowni)
  // =================================================================

  findAllGymAdmins() {
    return this.gymAdminRepository.find({
      relations: ['user', 'gyms'],
    });
  }

  async findOneGymAdmin(id: number) {
    const gymAdmin = await this.gymAdminRepository.findOne({
      where: { gymAdminId: id },
      relations: ['user', 'gyms'],
    });
    if (!gymAdmin) throw new NotFoundException(`Gym Admin with ID ${id} not found`);
    return gymAdmin;
  }

  async updateGymAdmin(id: number, dto: UpdateGymAdminDto) {
    const gymAdmin = await this.findOneGymAdmin(id);
    
    const { firstName, lastName, email, password, contactNumber, gymIds, ...adminData } = dto;

    // Aktualizuj dane User jeśli są podane
    if (firstName || lastName || email || password || contactNumber) {
      const userDto: UpdateUserDto = { firstName, lastName, email, password, contactNumber };
      await this.updateUser(gymAdmin.user.id, userDto);
    }
    
    // Aktualizuj powiązane siłownie (ManyToMany)
    if (gymIds !== undefined) {
      if (gymIds.length > 0) {
        const gyms = await this.gymRepository.find({ where: { gymId: In(gymIds) } });
        gymAdmin.gyms = gyms;
      } else {
        gymAdmin.gyms = [];
      }
      await this.gymAdminRepository.save(gymAdmin);
    }

    // Aktualizuj dane GymAdmin (brak własnych pól na teraz)
    if (Object.keys(adminData).length > 0) {
      await this.gymAdminRepository.update(id, adminData);
    }
    
    return this.findOneGymAdmin(id);
  }

  async removeGymAdminProfile(id: number) {
    const gymAdmin = await this.findOneGymAdmin(id);
    return this.gymAdminRepository.remove(gymAdmin);
  }

  // Helpers
  private async checkEmail(email: string) {
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email already in use');
  }

  async clientExists(id: number): Promise<boolean> {
    return (await this.clientRepository.count({ where: { clientId: id } })) > 0;
  }

  async trainerExists(id: number): Promise<boolean> {
    return (await this.trainerRepository.count({ where: { trainerId: id } })) > 0;
  }
}