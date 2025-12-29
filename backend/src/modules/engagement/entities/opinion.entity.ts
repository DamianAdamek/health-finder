import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { Client } from '../../user-management/entities/client.entity';
import { Trainer } from '../../user-management/entities/trainer.entity';

@Entity('opinions')
export class Opinion {
    @PrimaryGeneratedColumn()
    opinionId: number;

    @Column('float')
    @IsNumber()
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating cannot be more than 5' })
    rating: number;

    @Column('text', { nullable: true })
    @IsString()
    @IsOptional()
    comment?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Client, { eager: true })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @ManyToOne(() => Trainer, { nullable: true, eager: true })
    @JoinColumn({ name: 'trainerId' })
    trainer: Trainer;
}