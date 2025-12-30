import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../user-management/entities/client.entity';
import { Trainer } from '../../user-management/entities/trainer.entity';

@Entity('opinions')
export class Opinion {
    @PrimaryGeneratedColumn()
    opinionId: number;

    @Column('float')
    rating: number;

    @Column('text', { nullable: true })
    comment?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    clientId: number;

    @Column()
    trainerId: number;

    @ManyToOne(() => Client, { eager: true })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @ManyToOne(() => Trainer, { eager: true })
    @JoinColumn({ name: 'trainerId' })
    trainer: Trainer;
}