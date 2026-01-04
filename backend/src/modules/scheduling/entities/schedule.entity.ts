import { Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Window } from './window.entity';

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn()
    scheduleId: number;

    @OneToMany(() => Window, (window) => window.schedule, { cascade: true })
    windows: Window[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}