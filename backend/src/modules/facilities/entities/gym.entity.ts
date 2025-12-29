import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Location } from './location.entity';
import { Room } from './room.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity('gyms')
export class Gym {
    @PrimaryGeneratedColumn()
    gymId: number;

    @Column({ length: 100 })
    @IsString()
    @IsNotEmpty()
    name: string;

    @Column('text', { nullable: true })
    @IsString()
    description?: string;

    @Column('text', { nullable: true })
    @IsString()
    rules?: string;

    @OneToOne(() => Location, { cascade: true, eager: true })
    @JoinColumn()
    location: Location;

    @OneToMany(() => Room, (room) => room.gym, { cascade: true, eager: true })
    rooms: Room[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}