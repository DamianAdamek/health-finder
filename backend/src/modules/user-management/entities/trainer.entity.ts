import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { TrainingType } from '../../../common/enums';

@Entity('trainers') // Tabela w bazie: trainers
export class Trainer {
  @PrimaryGeneratedColumn()
  trainerId: number; // To jest ID trenera (np. 1, 2, 3...)

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TrainingType,
    nullable: true,
  })
  specialization: TrainingType;

  @Column({ type: 'float', default: 0 })
  rating: number; // Średnia ocena

  // Relacja do tabeli users
  @OneToOne(() => User, (user) => user.trainer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // Kolumna klucza obcego w bazie: user_id
  user: User;

  // Pole pomocnicze (żeby łatwo odczytać ID bez joinowania)
  @Column({ name: 'user_id' })
  userId: number;
}