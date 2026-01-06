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
import { UserRole } from '../../../common/enums';

@Injectable()
export class GymOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(GymAdmin)
    private readonly gymAdminRepository: Repository<GymAdmin>,
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
      throw new ForbiddenException('Only GymAdmin can manage gyms');
    }

    // Extract gym ID from request params
    const gymId = parseInt(request.params.id || request.params.gymId || request.body?.gymId);
    
    if (!gymId) {
      throw new ForbiddenException('Gym ID not found in request');
    }

    // Load GymAdmin with their gyms
    const gymAdmin = await this.gymAdminRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['gyms'],
    });

    if (!gymAdmin) {
      throw new NotFoundException('GymAdmin profile not found');
    }

    // Check if the gym is in the admin's managed gyms
    const hasAccess = gymAdmin.gyms.some(gym => gym.gymId === gymId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to manage this gym');
    }

    return true;
  }
}
