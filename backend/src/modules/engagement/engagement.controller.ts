import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Form } from './entities/form.entity';
import { Opinion } from './entities/opinion.entity';

@ApiTags('Engagement')
@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  // Form endpoints
  @Post('forms')
  @ApiOperation({ summary: 'Create a new form' })
  @ApiCreatedResponse({ description: 'Form created', type: Form})
  createForm(@Body() createFormDto: CreateFormDto) {
    return this.engagementService.createForm(createFormDto);
  }

  @Get('forms')
  @ApiOperation({ summary: 'Get all forms' })
  @ApiOkResponse({ description: 'List of forms', type: Form, isArray: true })
  findAllForms() {
    return this.engagementService.findAllForms();
  }

  @Get('forms/:id')
  @ApiOperation({ summary: 'Get single form by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Form found',type: Form })
  findForm(@Param('id') id: string) {
    return this.engagementService.findForm(+id);
  }

  @Patch('forms/:id')
  @ApiOperation({ summary: 'Update a form' })
  @ApiOkResponse({ description: 'Form updated', type: Form })
  updateForm(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.engagementService.updateForm(+id, updateFormDto);
  }

  @Delete('forms/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a form' })
  @ApiResponse({ status: 204, description: 'Form removed'})
  removeForm(@Param('id') id: string) {
    return this.engagementService.removeForm(+id);
  }

  // Opinion endpoints
  @Post('opinions')
  @ApiOperation({ summary: 'Create an opinion' })
  @ApiCreatedResponse({ description: 'Opinion created',type: Opinion })
  createOpinion(@Body() createOpinionDto: CreateOpinionDto) {
    return this.engagementService.createOpinion(createOpinionDto);
  }

  @Get('opinions')
  @ApiOperation({ summary: 'Get all opinions' })
  @ApiOkResponse({ description: 'List of opinions', type: Opinion, isArray: true })
  findAllOpinions() {
    return this.engagementService.findAllOpinions();
  }

  @Get('opinions/:id')
  @ApiOperation({ summary: 'Get single opinion by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Opinion found', type: Opinion })
  findOpinion(@Param('id') id: string) {
    return this.engagementService.findOpinion(+id);
  }

  @Patch('opinions/:id')
  @ApiOperation({ summary: 'Update an opinion' })
  @ApiOkResponse({ description: 'Opinion updated', type: Opinion })
  updateOpinion(@Param('id') id: string, @Body() updateOpinionDto: UpdateOpinionDto) {
    return this.engagementService.updateOpinion(+id, updateOpinionDto);
  }

  @Delete('opinions/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove an opinion' })
  @ApiResponse({ status: 204, description: 'Opinion removed' })
  removeOpinion(@Param('id') id: string) {
    return this.engagementService.removeOpinion(+id);
  }
}
