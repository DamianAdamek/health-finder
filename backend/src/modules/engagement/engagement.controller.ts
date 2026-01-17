import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Form } from './entities/form.entity';
import { Opinion } from './entities/opinion.entity';
import { JwtAuthGuard } from '../user-management/guards/jwt-auth.guard';
import { RolesGuard } from '../user-management/guards/roles.guard';
import { Roles } from '../user-management/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Engagement')
@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  // Form endpoints
  @Post('forms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new form - Client fills out for training matching' })
  @ApiCreatedResponse({ description: 'Form created', type: Form})
  createForm(@Body() createFormDto: CreateFormDto) {
    return this.engagementService.createForm(createFormDto);
  }

  @Get('forms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all forms - Trainer/GymAdmin/Admin can view client forms' })
  @ApiOkResponse({ description: 'List of forms', type: Form, isArray: true })
  findAllForms() {
    return this.engagementService.findAllForms();
  }

  @Get('forms/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single form by id - Client (own), Trainer, GymAdmin, Admin' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Form found',type: Form })
  findForm(@Param('id') id: string) {
    return this.engagementService.findForm(+id);
  }

  @Patch('forms/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a form - Client (own form) or Admin' })
  @ApiOkResponse({ description: 'Form updated', type: Form })
  updateForm(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.engagementService.updateForm(+id, updateFormDto);
  }

  @Delete('forms/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a form - Client (own form) or Admin' })
  @ApiResponse({ status: 204, description: 'Form removed'})
  removeForm(@Param('id') id: string) {
    return this.engagementService.removeForm(+id);
  }

  // Opinion endpoints
  @Post('opinions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an opinion - Client rates Trainer' })
  @ApiCreatedResponse({ description: 'Opinion created',type: Opinion })
  createOpinion(@Body() createOpinionDto: CreateOpinionDto) {
    return this.engagementService.createOpinion(createOpinionDto);
  }

  @Get('opinions')
  @ApiOperation({ summary: 'Get all opinions - Public (clients can view trainer ratings)' })
  @ApiOkResponse({ description: 'List of opinions', type: Opinion, isArray: true })
  findAllOpinions() {
    return this.engagementService.findAllOpinions();
  }

  @Get('opinions/:id')
  @ApiOperation({ summary: 'Get single opinion by id - Public' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Opinion found', type: Opinion })
  findOpinion(@Param('id') id: string) {
    return this.engagementService.findOpinion(+id);
  }

  @Patch('opinions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an opinion - Client (own opinion) or Admin' })
  @ApiOkResponse({ description: 'Opinion updated', type: Opinion })
  updateOpinion(@Param('id') id: string, @Body() updateOpinionDto: UpdateOpinionDto) {
    return this.engagementService.updateOpinion(+id, updateOpinionDto);
  }

  @Delete('opinions/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove an opinion - Client (own opinion) or Admin' })
  @ApiResponse({ status: 204, description: 'Opinion removed' })
  removeOpinion(@Param('id') id: string) {
    return this.engagementService.removeOpinion(+id);
  }
}
