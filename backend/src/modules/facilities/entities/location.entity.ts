import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn()
    locationId: number;

    @Column({ length: 100 })
    @IsString()
    @IsNotEmpty()
    city: string;

    @Column({ length: 10 })
    @IsString()
    @IsNotEmpty()
    zipCode: string;

    @Column({ length: 150 })
    @IsString()
    @IsNotEmpty()
    street: string;

    @Column({ length: 20 })
    @IsString()
    @IsNotEmpty()
    buildingNumber: string;

    @Column({ length: 20, nullable: true })
    @IsString()
    @IsOptional()
    apartmentNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}