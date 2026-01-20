import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from './entities/training.entity';
import { Client } from '../user-management/entities/client.entity';
import { Form } from '../engagement/entities/form.entity';
import { LocationService } from '../../common/services/location.service';

export interface RecommendedTraining {
  training: Training;
  distance: number; // in kilometers
}

@Injectable()
export class RecommendationService {
  private recommendationCache = new Map<number, RecommendedTraining[]>();
  private cacheTimestamps = new Map<number, number>();
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(Training)
    private trainingRepository: Repository<Training>,

    @InjectRepository(Client)
    private clientRepository: Repository<Client>,

    @InjectRepository(Form)
    private formRepository: Repository<Form>,

    private locationService: LocationService,
  ) {}

  /**
   * Get recommended trainings for a client based on their location and form preferences
   */
  async getRecommendationsForClient(clientId: number): Promise<RecommendedTraining[]> {
    return this.computeRecommendations(clientId);
  }

  /**
   * Recompute recommendations for client (invalidate cache)
   * Called when client location or form preferences change
   */
  async recomputeRecommendationsForClient(clientId: number): Promise<RecommendedTraining[]> {
    this.recommendationCache.delete(clientId);
    this.cacheTimestamps.delete(clientId);
    return this.computeRecommendations(clientId);
  }

  /**
   * Internal method that computes or retrieves cached recommendations
   */
  private async computeRecommendations(clientId: number): Promise<RecommendedTraining[]> {
    // Check if cache is valid
    const cachedResult = this.recommendationCache.get(clientId);
    const timestamp = this.cacheTimestamps.get(clientId);

    if (cachedResult && timestamp && Date.now() - timestamp < this.CACHE_DURATION_MS) {
      return cachedResult;
    }

    // 1. Get client with location and form
    const client = await this.clientRepository.findOne({
      where: { clientId },
      relations: ['location', 'form'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    if (!client.location) {
      throw new NotFoundException(`Client with ID ${clientId} has no location set`);
    }

    // 2. Get client's form from relation
    const form = client.form;

    // 3. Get client's coordinates from address
    const clientCoords = await this.locationService.getCoordinates(client.location);
    if (!clientCoords) {
      throw new NotFoundException(`Could not determine coordinates for client's location`);
    }

    // 4. Get all trainings with relations
    const allTrainings = await this.trainingRepository.find({
      relations: ['room', 'room.gym', 'room.gym.location', 'trainer'],
    });

    // 5. Filter trainings by type if form exists
    let filteredTrainings = allTrainings;
    if (form && form.trainingTypes && form.trainingTypes.length > 0) {
      filteredTrainings = allTrainings.filter(training =>
        form.trainingTypes.includes(training.type)
      );
    }

    // 6. Calculate distances and sort
    const trainingsWithDistance: RecommendedTraining[] = [];

    for (const training of filteredTrainings) {
      if (training.room?.gym?.location) {
        const gymCoords = await this.locationService.getCoordinates(training.room.gym.location);
        if (gymCoords) {
          const distance = this.locationService.calculateDistance(clientCoords, gymCoords);
          trainingsWithDistance.push({ training, distance });
        }
      }
    }

    // 7. Sort by distance (nearest first) and return top recommendations
    trainingsWithDistance.sort((a, b) => a.distance - b.distance);
    const result = trainingsWithDistance.slice(0, 10); // Return top 10 nearest

    // Cache the result
    this.recommendationCache.set(clientId, result);
    this.cacheTimestamps.set(clientId, Date.now());

    return result;
  }
}
