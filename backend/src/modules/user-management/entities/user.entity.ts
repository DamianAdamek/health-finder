import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn } from 'typeorm';
import { UserRole } from '../../../common/enums';
import { Trainer } from './trainer.entity';
import { Client } from './client.entity';

@Entity('users') // Tabela w bazie: users
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' }) // W kodzie: firstName, w bazie: first_name
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'contact_number', nullable: true })
  contactNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole; // Odpowiednik "discriminator"

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relacje (nie tworzą kolumn w tej tabeli, służą do nawigacji)
  @OneToOne(() => Trainer, (trainer) => trainer.user)
  trainer: Trainer;

  @OneToOne(() => Client, (client) => client.user)
  client: Client;
}