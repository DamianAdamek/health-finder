import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from './entities/form.entity';
import { Opinion } from './entities/opinion.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { CreateOpinionDto } from './dto/create-opinion.dto';
import { UpdateOpinionDto } from './dto/update-opinion.dto';
import { UserManagementService } from '../user-management/user-management.service';
import { SchedulingService } from '../scheduling/scheduling.service';
import { RecommendationService } from '../scheduling/recommendation.service';

@Injectable()
export class EngagementService {
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,

    @InjectRepository(Opinion)
    private opinionRepository: Repository<Opinion>,
    private userService: UserManagementService,
    private schedulingService: SchedulingService,
    private recommendationService: RecommendationService,
  ) {}

  // Form methods
  async createForm(createFormDto: CreateFormDto): Promise<Form> {
    const clientExists = await this.userService.clientExists(createFormDto.clientId);
    if (!clientExists) throw new NotFoundException(`Client with ID ${createFormDto.clientId} does not exist`);

    const form = this.formRepository.create(createFormDto);
    const savedForm = await this.formRepository.save(form);

    // Update client's form reference
    await this.userService.updateClient(savedForm.clientId, { formId: savedForm.formId });

    return savedForm;
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

    const savedForm = await this.formRepository.save(form);

    // Recompute recommendations when form preferences change
    await this.recommendationService.recomputeRecommendationsForClient(savedForm.clientId).catch(error => {
      console.error(`Failed to recompute recommendations for client ${savedForm.clientId}:`, error);
    });

    return savedForm;
  }

  async removeForm(id: number): Promise<void> {
    const form = await this.findForm(id);
    await this.formRepository.remove(form);
  }

  // Opinion methods
  async createOpinion(createOpinionDto: CreateOpinionDto): Promise<Opinion> {
    const { clientId, trainerId } = createOpinionDto;

    const clientExists = await this.userService.clientExists(clientId);
    if (!clientExists) throw new NotFoundException(`Client with ID ${clientId} does not exist`);

    const trainerExists = await this.userService.trainerExists(trainerId);
    if (!trainerExists) throw new NotFoundException(`Trainer with ID ${trainerId} does not exist`);

    const hasCompleted = await this.schedulingService.clientHasCompletedWithTrainer(clientId, trainerId);
    if (!hasCompleted) {
      throw new BadRequestException('Client must have at least one completed training with this trainer to leave an opinion');
    }

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
