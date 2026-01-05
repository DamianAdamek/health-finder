import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    JoinColumn, 
    OneToMany, 
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable 
} from 'typeorm';
import { Location } from './location.entity';
import { Room } from './room.entity';
import { Trainer } from 'src/modules/user-management/entities/trainer.entity';
import { Schedule } from 'src/modules/scheduling/entities/schedule.entity';

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

    @Column()
    locationId: number;

    @OneToOne(() => Location, { cascade: true, eager: true })
    @JoinColumn({ name: 'locationId' })
    location: Location;

    @OneToMany(() => Room, (room) => room.gym, { cascade: true, eager: true })
    rooms: Room[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => Trainer, (trainer) => trainer.gyms)
    @JoinTable({
        name: 'trainer_gyms',
        joinColumn: { name: 'gym_id' },
        inverseJoinColumn: { name: 'trainer_id' }
      })
    trainers: Trainer[];

    @OneToOne(() => Schedule, { cascade: true, eager: true })
    @JoinColumn({ name: 'schedule_id' })
    schedule: Schedule;
}