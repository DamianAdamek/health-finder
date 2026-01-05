import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Window } from './window.entity';
import { Training } from './training.entity';

@Entity('schedule')
export class Schedule {
    @PrimaryGeneratedColumn()
    scheduleId: number;

    @ManyToMany(() => Window, (window) => window.schedules)
    windows: Window[]

    @ManyToMany(() => Training)
    @JoinTable()
    trainings: Training[];
}