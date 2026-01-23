import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { Gym } from '../../facilities/entities/gym.entity';

@Entity('gym_admins')
export class GymAdmin {
  @PrimaryGeneratedColumn()
  gymAdminId: number;

  @OneToOne(() => User, (user) => user.gymAdmin)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Gym, (gym) => gym.admins)
  gyms: Gym[];

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
