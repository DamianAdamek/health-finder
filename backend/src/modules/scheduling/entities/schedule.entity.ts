import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { Window } from './window.entity';
import { Training } from './training.entity';

@Entity('schedule')
export class Schedule {
    @PrimaryGeneratedColumn()
    ScheduleId: number;

    @OneToMany(() => Window, (window) => window.schedule)
    windows: Window[]

    @ManyToMany(() => Training)
    @JoinTable()
    trainings: Training[];
}