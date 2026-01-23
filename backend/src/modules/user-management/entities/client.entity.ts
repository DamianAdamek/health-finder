import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Schedule } from 'src/modules/scheduling/entities/schedule.entity';
import { Location } from 'src/modules/facilities/entities/location.entity';
import { Form } from 'src/modules/engagement/entities/form.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  clientId: number;

  @OneToOne(() => User, (user) => user.client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Location, { nullable: false, cascade: true, eager: true })
  @JoinColumn({ name: 'locationId' })
  location: Location;

  @OneToOne(() => Schedule, { cascade: true, eager: true })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @OneToOne(() => Form, (form) => form.client, { nullable: true })
  @JoinColumn({ name: 'form_id' })
  form?: Form;
}