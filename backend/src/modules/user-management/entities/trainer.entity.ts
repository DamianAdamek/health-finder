import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { TrainingType } from '../../../common/enums';

@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn()
  trainerId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TrainingType,
    nullable: true,
  })
  specialization: TrainingType;

  @Column({ type: 'float', default: 0 })
  rating: number; 

  @OneToOne(() => User, (user) => user.trainer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;
}