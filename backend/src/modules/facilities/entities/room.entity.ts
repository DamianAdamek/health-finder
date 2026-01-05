import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Gym } from './gym.entity';

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn()
    roomId: number;

    @Column({ length: 100 })
    name: string;

    @Column({ nullable: true })
    capacity?: number;

    @Column()
    gymId: number;

    @ManyToOne(() => Gym, (gym) => gym.rooms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'gymId' })
    gym: Gym;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}