import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { Trainer } from './entities/trainer.entity';
import { Client } from './entities/client.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Trainer) private trainerRepository: Repository<Trainer>,
    @InjectRepository(Client) private clientRepository: Repository<Client>,
  ) {}

  // --- REGISTER CLIENT ---
  async registerClient(dto: CreateUserDto) {
    await this.checkEmail(dto.email);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 1. Create generic User
    const newUser = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      contactNumber: dto.contactNumber,
      role: UserRole.CLIENT,
    });
    const savedUser = await this.userRepository.save(newUser);

    // 2. Create specific Client profile linked to User
    const newClient = this.clientRepository.create({
      user: savedUser,
    });
    
    return this.clientRepository.save(newClient);
  }

  // --- REGISTER TRAINER ---
  async registerTrainer(dto: CreateTrainerDto) {
    await this.checkEmail(dto.email);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 1. Create generic User
    const newUser = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
      contactNumber: dto.contactNumber,
      role: UserRole.TRAINER,
    });
    const savedUser = await this.userRepository.save(newUser);

    // 2. Create specific Trainer profile
    const newTrainer = this.trainerRepository.create({
      description: dto.description,
      specialization: dto.specialization,
      user: savedUser,
    });

    return this.trainerRepository.save(newTrainer);
  }

  // --- LOGIN ---
  async login(dto: LoginDto) {
    // 1. Find user (and include roles if needed)
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2. Validate password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // 3. Return mock token
    return {
      access_token: `mock_token_${user.id}_${Date.now()}`,
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private async checkEmail(email: string) {
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email already in use');
  }
}