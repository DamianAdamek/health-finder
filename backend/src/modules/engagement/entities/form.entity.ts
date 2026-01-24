import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { ActivityLevel, TrainingType } from '../../../common/enums';
import { Client } from '../../user-management/entities/client.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn()
  formId: number;

  @Column({ type: 'enum', enum: ActivityLevel })
  activityLevel: ActivityLevel;

  @Column('simple-array')
  trainingTypes: TrainingType[];

  @Column({ length: 500 })
  trainingGoal: string;

  @Column('text', { nullable: true })
  healthProfile?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  clientId: number;

  @OneToOne(() => Client, (client) => client.form)
  client: Client;
}