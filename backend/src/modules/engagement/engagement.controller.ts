import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Engagement')
@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  // Form endpoints
  @Post('forms')
  createForm(@Body() createFormDto: CreateFormDto) {
    return this.engagementService.createForm(createFormDto);
  }

  @Get('forms')
  findAllForms() {
    return this.engagementService.findAllForms();
  }

  @Get('forms/:id')
  findForm(@Param('id') id: string) {
    return this.engagementService.findForm(+id);
  }

  @Patch('forms/:id')
  updateForm(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.engagementService.updateForm(+id, updateFormDto);
  }

  @Delete('forms/:id')
  removeForm(@Param('id') id: string) {
    return this.engagementService.removeForm(+id);
  }

  // Opinion endpoints
  @Post('opinions')
  createOpinion(@Body() createOpinionDto: CreateOpinionDto) {
    return this.engagementService.createOpinion(createOpinionDto);
  }

  @Get('opinions')
  findAllOpinions() {
    return this.engagementService.findAllOpinions();
  }

  @Get('opinions/:id')
  findOpinion(@Param('id') id: string) {
    return this.engagementService.findOpinion(+id);
  }

  @Patch('opinions/:id')
  updateOpinion(@Param('id') id: string, @Body() updateOpinionDto: UpdateOpinionDto) {
    return this.engagementService.updateOpinion(+id, updateOpinionDto);
  }

  @Delete('opinions/:id')
  removeOpinion(@Param('id') id: string) {
    return this.engagementService.removeOpinion(+id);
  }
}
