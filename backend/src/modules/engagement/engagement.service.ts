import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from './entities/form.entity';
import { Opinion } from './entities/opinion.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';

@Injectable()
export class EngagementService {
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,

    @InjectRepository(Opinion)
    private opinionRepository: Repository<Opinion>,
  ) {}

  // Form methods
  async createForm(createFormDto: CreateFormDto): Promise<Form> {
    const form = this.formRepository.create(createFormDto);
    return this.formRepository.save(form);
  }

  async findAllForms(): Promise<Form[]> {
    return this.formRepository.find();
  }

  async findForm(id: number): Promise<Form> {
    const form = await this.formRepository.findOne({ where: { formId: id } });

    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }

    return form;
  }

  async updateForm(id: number, updateFormDto: UpdateFormDto): Promise<Form> {
    const form = await this.findForm(id);
    Object.assign(form, updateFormDto);

    return this.formRepository.save(form);
  }

  async removeForm(id: number): Promise<void> {
    const form = await this.findForm(id);
    await this.formRepository.remove(form);
  }

  // Opinion methods
  async createOpinion(createOpinionDto: CreateOpinionDto): Promise<Opinion> {
    // TODO: check if client has had completed sessions with the trainer before allowing opinion creation
    const opinion = this.opinionRepository.create(createOpinionDto);
    return this.opinionRepository.save(opinion);
  }

  async findAllOpinions(): Promise<Opinion[]> {
    return this.opinionRepository.find();
  }

  async findOpinion(id: number): Promise<Opinion> {
    const opinion = await this.opinionRepository.findOne({ where: { opinionId: id } });

    if (!opinion) {
      throw new NotFoundException(`Opinion with ID ${id} not found`);
    }

    return opinion;
  }

  async updateOpinion(id: number, updateOpinionDto: UpdateOpinionDto): Promise<Opinion> {
    const opinion = await this.findOpinion(id);
    Object.assign(opinion, updateOpinionDto);

    return this.opinionRepository.save(opinion);
  }

  async removeOpinion(id: number): Promise<void> {
    const opinion = await this.findOpinion(id);
    await this.opinionRepository.remove(opinion);
  }
}
