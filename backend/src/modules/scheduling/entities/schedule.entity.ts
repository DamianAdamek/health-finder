import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Window } from './window.entity';

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn()
    scheduleId: number;

    @ManyToMany(() => Window, (window) => window.schedules)
    windows: Window[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}