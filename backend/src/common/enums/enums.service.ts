import { Injectable } from '@nestjs/common';
import {
  ActivityLevel,
  DayOfWeek,
  TrainingStatus,
  TrainingType,
  UserRole,
} from './index';

@Injectable()
export class EnumsService {
  getActivityLevels() {
    return Object.values(ActivityLevel);
  }

  getDaysOfWeek() {
    return Object.values(DayOfWeek);
  }

  getTrainingStatuses() {
    return Object.values(TrainingStatus);
  }

  getTrainingTypes() {
    return Object.values(TrainingType);
  }

  getUserRoles() {
    return Object.values(UserRole);
  }

  getAllEnums() {
    return {
      activityLevels: this.getActivityLevels(),
      daysOfWeek: this.getDaysOfWeek(),
      trainingStatuses: this.getTrainingStatuses(),
      trainingTypes: this.getTrainingTypes(),
      userRoles: this.getUserRoles(),
    };
  }
}
