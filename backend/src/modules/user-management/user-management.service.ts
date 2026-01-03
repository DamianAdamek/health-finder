import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { Trainer } from './entities/trainer.entity';
import { Client } from './entities/client.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UserRole } from '../../../common/enums';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>,
    @InjectRepository(Client) private clientRepository: Repository<Client>,
  ) {}

  // =================================================================
  // AUTH (Register / Login) - To już miałeś
  // =================================================================

  async registerClient(dto: CreateUserDto) {
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
    const newClient = this.clientRepository.create({ user: savedUser });
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
    const newTrainer = this.trainerRepository.create({
      description: dto.description,
      specialization: dto.specialization,
      user: savedUser,
    });
    return this.trainerRepository.save(newTrainer);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    return {
      access_token: `mock_token_${user.id}_${Date.now()}`,
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

    // TypeORM 'preload' lub 'update'
    await this.userRepository.update(id, dto);
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
      where: { id },
      relations: ['user'],
    });
    if (!trainer) throw new NotFoundException(`Trainer with ID ${id} not found`);
    return trainer;
  }

  async updateTrainer(id: number, dto: UpdateTrainerDto) {
    const trainer = await this.findOneTrainer(id);
    await this.trainerRepository.update(id, dto);
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
      relations: ['user'],
    });
  }

  async findOneClient(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!client) throw new NotFoundException(`Client with ID ${id} not found`);
    return client;
  }

  async updateClient(id: number, dto: UpdateClientDto) {
    const client = await this.findOneClient(id);
    await this.clientRepository.update(id, dto);
    return this.findOneClient(id);
  }

  async removeClientProfile(id: number) {
    const client = await this.findOneClient(id);
    return this.clientRepository.remove(client);
  }

  // Helper
  private async checkEmail(email: string) {
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email already in use');
  }
}