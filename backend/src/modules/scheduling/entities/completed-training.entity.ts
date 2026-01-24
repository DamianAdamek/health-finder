import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { TrainingType } from '../../../common/enums';
import { Client } from '../../user-management/entities/client.entity';
import { Trainer } from '../../user-management/entities/trainer.entity';

@Entity('completed_trainings')
export class CompletedTraining {
    @PrimaryGeneratedColumn()
    completedTrainingId: number;

    @Column()
    price: number;

    @Column({
        name: 'type',
        type: 'enum',
        enum: TrainingType,
    })
    type: TrainingType;

    @Column({ type: 'date' })
    trainingDate: Date;

    @Column({ length: 100 })
    gymName: string;

    @ManyToOne(() => Client, { eager: true })
    @JoinColumn()
    client: Client;

    @ManyToOne(() => Trainer, { eager: true })
    @JoinColumn()
    trainer: Trainer;

    @CreateDateColumn()
    archivedAt: Date;
}
