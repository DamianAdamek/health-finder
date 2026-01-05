import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToOne, JoinColumn, JoinTable } from 'typeorm';
import { DayOfWeek } from '../../../common/enums';
import { Schedule } from './schedule.entity';
import { Training } from './training.entity';

@Entity('window')
export class Window {
    @PrimaryGeneratedColumn()
    windowId: number;

    @ManyToMany(() => Schedule, (schedule) => schedule.windows)
    @JoinTable({
        name: 'window_schedules',
        joinColumn: { name: 'window_id' },
        inverseJoinColumn: { name: 'schedule_id' }
    })
    schedules: Schedule[];

    // using string, because we need only the time, not date
    @Column({ name: 'start_time' })
    startTime: string;

    @Column({ name: 'end_time' })
    endTime: string;
    
    @Column({
        name: 'day',
        type: 'enum',
        enum: DayOfWeek})
    dayOfWeek: DayOfWeek;

    @OneToOne(() => Training, { nullable: true })
    @JoinColumn({ name: 'training_id' })
    training?: Training;
}