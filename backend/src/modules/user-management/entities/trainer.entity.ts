import { Entity, PrimaryGeneratedColumn } from 'typeorm';

// Temporary stub — replace with real Trainer implementation
@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn()
  trainerId: number;
}