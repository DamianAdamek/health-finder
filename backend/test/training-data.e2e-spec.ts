import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Client } from '../src/modules/user-management/entities/client.entity';
import { User } from '../src/modules/user-management/entities/user.entity';
import { Location } from '../src/modules/facilities/entities/location.entity';
import { Form } from '../src/modules/engagement/entities/form.entity';
import { Gym } from '../src/modules/facilities/entities/gym.entity';
import { Room } from '../src/modules/facilities/entities/room.entity';
import { Training } from '../src/modules/scheduling/entities/training.entity';
import { Trainer } from '../src/modules/user-management/entities/trainer.entity';
import { Schedule } from '../src/modules/scheduling/entities/schedule.entity';
import { UserRole, ActivityLevel, TrainingStatus, TrainingType } from '../src/common/enums';
import { LocationService } from '../src/common/services/location.service';
import { JwtAuthGuard } from '../src/modules/user-management/guards/jwt-auth.guard';
import { RolesGuard } from '../src/modules/user-management/guards/roles.guard';
import { RecommendationService } from '../src/modules/scheduling/recommendation.service';
import * as bcrypt from 'bcrypt';

describe('Use Case: Zarządzaj danymi treningowymi (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let recommendationService: RecommendationService;
  let testClient: Client;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(LocationService)
      .useValue({
        getCoordinates: async () => ({ latitude: 52.2297, longitude: 21.0122 }),
        calculateDistance: () => 1,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    recommendationService = moduleFixture.get<RecommendationService>(RecommendationService);
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "window_schedules" CASCADE');
    await dataSource.query('TRUNCATE TABLE "training_clients" CASCADE');
    await dataSource.query('TRUNCATE TABLE "training" CASCADE');
    await dataSource.query('TRUNCATE TABLE "window" CASCADE');
    await dataSource.query('TRUNCATE TABLE "schedules" CASCADE');
    await dataSource.query('TRUNCATE TABLE "rooms" CASCADE');
    await dataSource.query('TRUNCATE TABLE "gyms" CASCADE');
    await dataSource.query('TRUNCATE TABLE "forms" CASCADE');
    await dataSource.query('TRUNCATE TABLE "opinions" CASCADE');
    await dataSource.query('TRUNCATE TABLE "clients" CASCADE');
    await dataSource.query('TRUNCATE TABLE "locations" CASCADE');
    await dataSource.query('TRUNCATE TABLE "users" CASCADE');

    await setupTestClient();
    await setupTestGymsAndTrainings();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('TC-05: Aktualizacja formularza treningowego z przeliczeniem rekomendacji', () => {
    let existingForm: Form;

    beforeEach(async () => {
      existingForm = await createFormForClient({
        trainingTypes: [TrainingType.CARDIO],
        trainingGoal: 'Poprawa kondycji',
        activityLevel: ActivityLevel.MEDIUM,
      });
    });

    it('powinien przeliczyć rekomendacje po zmianie preferencji', async () => {
      const initialRecommendations = await request(app.getHttpServer())
        .get(`/scheduling/recommendations/${testClient.clientId}`)
        .expect(200);

      expect(initialRecommendations.body.length).toBe(1);
      expect(initialRecommendations.body[0].training.type).toBe(TrainingType.CARDIO);

      const updateResponse = await request(app.getHttpServer())
        .patch(`/engagement/forms/${existingForm.formId}`)
        .send({
          trainingTypes: [TrainingType.POWERLIFTING],
          trainingGoal: 'Budowa sily',
        })
        .expect(200);

      expect(updateResponse.body.trainingTypes).toContain(TrainingType.POWERLIFTING);
      expect(updateResponse.body.trainingGoal).toBe('Budowa sily');

      const newRecommendations = await request(app.getHttpServer())
        .get(`/scheduling/recommendations/${testClient.clientId}`)
        .expect(200);

      expect(newRecommendations.body.length).toBe(1);
      expect(newRecommendations.body[0].training.type).toBe(TrainingType.POWERLIFTING);
    });
  });

  describe('TC-06: Utworzenie nowego formularza dla klienta', () => {
    it('powinien utworzyć formularz i przypisać go do klienta', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/engagement/forms')
        .send({
          clientId: testClient.clientId,
          activityLevel: 'Medium',
          trainingTypes: ['Cardio'],
          trainingGoal: 'Utrata wagi',
          healthProfile: 'Brak przeciwwskazan zdrowotnych',
        })
        .expect(201);

      expect(createResponse.body.formId).toBeDefined();
      expect(createResponse.body.clientId).toBe(testClient.clientId);

      const clientCheck = await dataSource.getRepository(Client).findOne({
        where: { clientId: testClient.clientId },
        relations: ['form'],
      });

      expect(clientCheck?.form?.formId).toBe(createResponse.body.formId);

      const recommendations = await request(app.getHttpServer())
        .get(`/scheduling/recommendations/${testClient.clientId}`)
        .expect(200);

      expect(recommendations.body).toBeDefined();
      expect(Array.isArray(recommendations.body)).toBe(true);
    });
  });

  describe('TC-07: Aktualizacja formularza z niepowodzeniem przeliczenia rekomendacji', () => {
    let existingForm: Form;

    beforeEach(async () => {
      existingForm = await createFormForClient({
        trainingTypes: ['Cardio'],
        trainingGoal: 'Test recompute failure',
        activityLevel: 'Low',
      });
    });

    it('powinien zaktualizować formularz mimo błędu rekomendacji', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const recomputeSpy = jest
        .spyOn(recommendationService, 'recomputeRecommendationsForClient')
        .mockRejectedValueOnce(new Error('Simulated recompute failure'));

      const updateResponse = await request(app.getHttpServer())
        .patch(`/engagement/forms/${existingForm.formId}`)
        .send({ trainingGoal: 'Nowy cel treningowy' })
        .expect(200);

      expect(updateResponse.body.trainingGoal).toBe('Nowy cel treningowy');
      expect(recomputeSpy).toHaveBeenCalledWith(testClient.clientId);

      recomputeSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('TC-08: Próba aktualizacji nieistniejącego formularza', () => {
    it('powinien zwrócić 404 dla brakującego formularza', async () => {
      const response = await request(app.getHttpServer())
        .patch('/engagement/forms/8888')
        .send({ trainingGoal: 'Zmiana celu' })
        .expect(404);

      expect(response.body.message).toContain('Form with ID 8888 not found');
    });
  });

  async function createFormForClient(options: {
    trainingTypes: (TrainingType | string)[];
    trainingGoal: string;
    activityLevel?: ActivityLevel | string;
  }): Promise<Form> {
    const formRepo = dataSource.getRepository(Form);
    const form = formRepo.create({
      clientId: testClient.clientId,
      client: testClient,
      trainingTypes: options.trainingTypes as TrainingType[],
      trainingGoal: options.trainingGoal,
      activityLevel: (options.activityLevel as ActivityLevel) ?? ActivityLevel.MEDIUM,
      healthProfile: 'Brak przeciwwskazan',
    });
    await formRepo.save(form);

    const clientRepo = dataSource.getRepository(Client);
    testClient = await clientRepo.findOne({
      where: { clientId: testClient.clientId },
      relations: ['form', 'user', 'location'],
    }) as Client;

    return form;
  }

  async function setupTestClient() {
    const userRepo = dataSource.getRepository(User);
    const clientRepo = dataSource.getRepository(Client);
    const locationRepo = dataSource.getRepository(Location);
    const scheduleRepo = dataSource.getRepository(Schedule);

    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = userRepo.create({
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: `training.client.${Date.now()}@example.com`,
      password: hashedPassword,
      contactNumber: '+48123456789',
      role: UserRole.CLIENT,
    });
    await userRepo.save(testUser);

    const location = locationRepo.create({
      city: 'Warszawa',
      zipCode: '00-001',
      street: 'ul. Glowna',
      buildingNumber: '10',
      apartmentNumber: '5',
    });
    await locationRepo.save(location);

    const schedule = scheduleRepo.create({});
    await scheduleRepo.save(schedule);

    testClient = clientRepo.create({
      user: testUser,
      location,
      schedule,
    });
    await clientRepo.save(testClient);

    const reloaded = await clientRepo.findOne({
      where: { clientId: testClient.clientId },
      relations: ['user', 'location', 'schedule', 'form'],
    });

    if (!reloaded) {
      throw new Error('Failed to reload test client');
    }

    testClient = reloaded;
  }

  async function setupTestGymsAndTrainings() {
    const gymRepo = dataSource.getRepository(Gym);
    const roomRepo = dataSource.getRepository(Room);
    const trainingRepo = dataSource.getRepository(Training);
    const locationRepo = dataSource.getRepository(Location);
    const trainerRepo = dataSource.getRepository(Trainer);
    const userRepo = dataSource.getRepository(User);
    const scheduleRepo = dataSource.getRepository(Schedule);

    const hashedPassword = await bcrypt.hash('TrainerPass123!', 10);
    const trainerUser = userRepo.create({
      firstName: 'Michal',
      lastName: 'Trener',
      email: `trainer.${Date.now()}@example.com`,
      password: hashedPassword,
      contactNumber: '+48111222333',
      role: UserRole.TRAINER,
    });
    await userRepo.save(trainerUser);

    const trainerSchedule = scheduleRepo.create({});
    await scheduleRepo.save(trainerSchedule);

    const trainer = trainerRepo.create({
      user: trainerUser,
      specialization: TrainingType.FUNCTIONAL,
      description: 'Doswiadczony trener',
      schedule: trainerSchedule,
    });
    await trainerRepo.save(trainer);

    const gymLocationWarsaw = locationRepo.create({
      city: 'Warszawa',
      zipCode: '00-002',
      street: 'ul. Sportowa',
      buildingNumber: '1',
    });
    await locationRepo.save(gymLocationWarsaw);

    const gymWarsaw = gymRepo.create({
      name: 'Gym Warsaw Center',
      description: 'Gym w centrum Warszawy',
      location: gymLocationWarsaw,
    });
    await gymRepo.save(gymWarsaw);

    const roomWarsaw = roomRepo.create({
      name: 'Sala fitness',
      capacity: 20,
      gym: gymWarsaw,
    });
    await roomRepo.save(roomWarsaw);

    const trainingWarsaw = trainingRepo.create({
      type: TrainingType.CARDIO,
      price: 80,
      trainer,
      room: roomWarsaw,
      status: TrainingStatus.PLANNED,
    });
    await trainingRepo.save(trainingWarsaw);

    const gymLocationKrakow = locationRepo.create({
      city: 'Krakow',
      zipCode: '30-002',
      street: 'ul. Krakowska',
      buildingNumber: '5',
    });
    await locationRepo.save(gymLocationKrakow);

    const gymKrakow = gymRepo.create({
      name: 'Gym Krakow Plaza',
      description: 'Gym w Krakowie',
      location: gymLocationKrakow,
    });
    await gymRepo.save(gymKrakow);

    const roomKrakow = roomRepo.create({
      name: 'Sala silowa',
      capacity: 15,
      gym: gymKrakow,
    });
    await roomRepo.save(roomKrakow);

    const trainingKrakow = trainingRepo.create({
      type: TrainingType.POWERLIFTING,
      price: 100,
      trainer,
      room: roomKrakow,
      status: TrainingStatus.PLANNED,
    });
    await trainingRepo.save(trainingKrakow);
  }
});
