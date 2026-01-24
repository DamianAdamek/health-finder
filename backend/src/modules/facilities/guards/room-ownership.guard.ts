import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymAdmin } from '../../user-management/entities/gym-admin.entity';
import { Room } from '../entities/room.entity';
import { UserRole } from '../../../common/enums';

@Injectable()
export class RoomOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(GymAdmin)
    private readonly gymAdminRepository: Repository<GymAdmin>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ADMIN role bypasses ownership check
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Only GYM_ADMIN should reach this point (due to RolesGuard)
    if (user.role !== UserRole.GYM_ADMIN) {
      throw new ForbiddenException('Only GymAdmin can manage rooms');
    }

    // Extract room ID from request params or gym ID from body (for create)
    const roomId = parseInt(request.params.id);
    let gymId: number;

    if (roomId) {
      // For update/delete operations - get gym from room
      const room = await this.roomRepository.findOne({
        where: { roomId },
        relations: ['gym'],
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      gymId = room.gymId;
    } else if (request.body?.gymId) {
      // For create operations - get gym from body
      gymId = parseInt(request.body.gymId);
    } else {
      throw new ForbiddenException('Gym ID not found in request');
    }

    // Load GymAdmin with their gyms. Support tokens that expose either `id` or `userId`.
    const userId = Number(user?.id ?? user?.userId);
    const gymAdmin = await this.gymAdminRepository.findOne({
      where: { user: { id: userId } },
      relations: ['gyms'],
    });

    if (!gymAdmin) {
      throw new NotFoundException('GymAdmin profile not found');
    }

    // Check if the gym is in the admin's managed gyms
    const hasAccess = gymAdmin.gyms.some(gym => gym.gymId === gymId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to manage rooms in this gym');
    }

    return true;
  }
}
