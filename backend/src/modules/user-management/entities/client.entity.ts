import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('clients') // Tabela w bazie: clients
export class Client {
  @PrimaryGeneratedColumn()
  clientId: number; // To jest ID klienta

  @Column({ name: 'training_goal', nullable: true })
  trainingGoal: string;

  // Relacja do tabeli users
  @OneToOne(() => User, (user) => user.client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // Kolumna klucza obcego w bazie: user_id
  user: User;

  @Column({ name: 'user_id' })
  userId: number;
}