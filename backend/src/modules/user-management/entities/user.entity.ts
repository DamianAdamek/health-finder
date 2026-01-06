import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../../common/enums';
import { Trainer } from './trainer.entity';
import { Client } from './client.entity';
import { GymAdmin } from './gym-admin.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'contact_number', nullable: true })
  contactNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Trainer, (trainer) => trainer.user)
  trainer: Trainer;

  @OneToOne(() => Client, (client) => client.user)
  client: Client;

  @OneToOne(() => GymAdmin, (gymAdmin) => gymAdmin.user)
  gymAdmin: GymAdmin;
}