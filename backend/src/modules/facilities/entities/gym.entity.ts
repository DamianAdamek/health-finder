import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Location } from './location.entity';
import { Room } from './room.entity';

@Entity('gyms')
export class Gym {
    @PrimaryGeneratedColumn()
    gymId: number;

    @Column({ length: 100 })
    name: string;

    @Column('text', { nullable: true })
    description?: string;

    @Column('text', { nullable: true })
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