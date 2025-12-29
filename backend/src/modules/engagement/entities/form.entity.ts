import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ActivityLevel, TrainingType } from '../../../common/enums';
import { IsEnum, IsArray, ArrayNotEmpty, IsString, IsOptional } from 'class-validator';
import { Client } from '../../user-management/entities/client.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn()
  formId: number;

  @Column({ type: 'enum', enum: ActivityLevel })
  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @Column('simple-array')
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(TrainingType, { each: true })
  trainingTypes: TrainingType[];

  @Column({ length: 500 })
  @IsString()
  trainingGoal: string;

  @Column('text', { nullable: true })
  @IsString()
  @IsOptional()
  healthProfile?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;
}