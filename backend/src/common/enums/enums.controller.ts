import { Controller, Get } from '@nestjs/common';
import { EnumsService } from './enums.service';

@Controller('enums')
export class EnumsController {
  constructor(private readonly enumsService: EnumsService) {}

  @Get('activity-levels')
  getActivityLevels() {
    return this.enumsService.getActivityLevels();
  }

  @Get('days-of-week')
  getDaysOfWeek() {
    return this.enumsService.getDaysOfWeek();
  }

  @Get('training-statuses')
  getTrainingStatuses() {
    return this.enumsService.getTrainingStatuses();
  }

  @Get('training-types')
  getTrainingTypes() {
    return this.enumsService.getTrainingTypes();
  }

  @Get('user-roles')
  getUserRoles() {
    return this.enumsService.getUserRoles();
  }

  @Get()
  getAllEnums() {
    return this.enumsService.getAllEnums();
  }
}
