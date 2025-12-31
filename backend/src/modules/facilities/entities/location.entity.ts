import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn()
    locationId: number;

    @Column({ length: 100 })
    city: string;

    @Column({ length: 10 })
    zipCode: string;

    @Column({ length: 150 })
    street: string;

    @Column({ length: 20 })
    buildingNumber: string;

    @Column({ length: 20, nullable: true })
    apartmentNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}