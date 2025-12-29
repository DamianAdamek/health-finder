import { Entity, PrimaryGeneratedColumn } from 'typeorm';

// Temporary stub — replace with real Client implementation
@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  clientId: number;
}