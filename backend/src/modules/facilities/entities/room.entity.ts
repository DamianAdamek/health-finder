import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Gym } from './gym.entity';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn()
    roomId: number;

    @Column({ length: 100 })
    @IsString()
    @IsNotEmpty()
    name: string;

    @Column()
    @IsInt()
    @Min(1, { message: 'Capacity must be at least 1' })
    capacity: number;

    @ManyToOne(() => Gym, (gym) => gym.rooms, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'gymId' })
    gym: Gym;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}