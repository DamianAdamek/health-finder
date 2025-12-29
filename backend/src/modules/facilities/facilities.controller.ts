import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  create(@Body() createFacilityDto: CreateFacilityDto) {
    return this.facilitiesService.create(createFacilityDto);
  }

  @Get()
  findAll() {
    return this.facilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacilityDto: UpdateFacilityDto) {
    return this.facilitiesService.update(+id, updateFacilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facilitiesService.remove(+id);
  }
}
