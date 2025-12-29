import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { CreateEngagementDto } from './dto/create-engagement.dto';
import { UpdateEngagementDto } from './dto/update-engagement.dto';

@Controller('engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post()
  create(@Body() createEngagementDto: CreateEngagementDto) {
    return this.engagementService.create(createEngagementDto);
  }

  @Get()
  findAll() {
    return this.engagementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.engagementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEngagementDto: UpdateEngagementDto) {
    return this.engagementService.update(+id, updateEngagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.engagementService.remove(+id);
  }
}
