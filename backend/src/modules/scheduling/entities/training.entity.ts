import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToMany,
    JoinTable,
    ManyToOne,
    JoinColumn,
    OneToOne, 
    UpdateDateColumn,
    CreateDateColumn
} from 'typeorm';
import { TrainingStatus, TrainingType } from '../../../common/enums';
import { Room } from 'src/modules/facilities/entities/room.entity';
import { Trainer } from 'src/modules/user-management/entities/trainer.entity';
import { Client } from 'src/modules/user-management/entities/client.entity';
import { Window } from './window.entity';

@Entity('training')
export class Training {
    @PrimaryGeneratedColumn()
    trainingId: number;

    @ManyToOne(() => Room)
    @JoinColumn({ name: 'room_id' })
    room: Room;

    @Column()
    price: number;

    @ManyToOne(() => Trainer)
    @JoinColumn({ name: 'trainer_id' })
    trainer: Trainer;

    @Column({
        name: 'status',
        type: 'enum',
        enum: TrainingStatus,
        default: TrainingStatus.PLANNED
    })
    status: TrainingStatus;

    @Column({
        name: 'type',
        type: 'enum',
        enum: TrainingType
    })
    type: TrainingType;

    @ManyToMany(() => Client)
    @JoinTable({
        name: 'training_clients',
        joinColumn: { name: 'training_id' },
        inverseJoinColumn: { name: 'client_id' }
    }
    )
    clients: Client[];

    @OneToOne(() => Window, (window) => window.training, { nullable: true })
    window?: Window;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}