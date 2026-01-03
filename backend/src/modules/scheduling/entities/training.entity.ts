import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToMany,
    ManyToMany,
    JoinTable 
} from 'typeorm';
import { TrainingStatus, TrainingType } from '../../../common/enums';
import { Room } from 'src/modules/facilities/entities/room.entity';
import { Trainer } from 'src/modules/user-management/entities/trainer.entity';
import { Client } from 'src/modules/user-management/entities/client.entity';

@Entity('training')
export class Training {
    @PrimaryGeneratedColumn()
    trainingId: number;

    @OneToMany(() => Room)
    room: Room;

    @Column()
    price: number

    @OneToMany(() => Trainer)
    trainer: Trainer;

    @Column({
        name: 'status',
        type: 'enum',
        enum: TrainingStatus,
        default: TrainingStatus.PLANNED
    })
    status: TrainingStatus;

    @Column({
        name: 'day',
        type: 'enum',
        enum: TrainingType,
        default: TrainingType.FUNCTIONAL
    })
    type: TrainingType;

    @ManyToMany(() => Client)
    @JoinTable()
    clients: Client[];
}