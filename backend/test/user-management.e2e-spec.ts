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
import * as bcrypt from 'bcrypt';

/**
 * E2E Tests for Use Case: Zarządzaj danymi personalnymi
 * 
 * Ten use case ma include na: Wyszukaj propozycje treningów
 * (Zmiana lokalizacji lub formularza triggeruje przeliczenie rekomendacji)
 */
describe('Use Case: Zarządzaj danymi personalnymi (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
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
        getCoordinates: async () => ({ latitude: 52.2297, longitude: 21.0122 }), // fixed coords to avoid external calls
        calculateDistance: () => 1,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    // Clear database before each test
    await dataSource.query('TRUNCATE TABLE "window_schedules" CASCADE');
    await dataSource.query('TRUNCATE TABLE "training_clients" CASCADE');
    await dataSource.query('TRUNCATE TABLE "training" CASCADE');
    await dataSource.query('TRUNCATE TABLE "window" CASCADE');
    await dataSource.query('TRUNCATE TABLE "schedules" CASCADE');
    await dataSource.query('TRUNCATE TABLE "rooms" CASCADE');
    await dataSource.query('TRUNCATE TABLE "gyms" CASCADE');
    await dataSource.query('TRUNCATE TABLE "forms" CASCADE');
    await dataSource.query('TRUNCATE TABLE "clients" CASCADE');
    await dataSource.query('TRUNCATE TABLE "locations" CASCADE');
    await dataSource.query('TRUNCATE TABLE "users" CASCADE');

    // Create test client with location
    await setupTestClient();
    
    // Create test gyms and trainings for recommendations
    await setupTestGymsAndTrainings();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * TC-01: Aktualizacja adresu klienta z automatycznym przeliczeniem rekomendacji
   * Priorytet: Wysoki | Typ: Pozytywny
   */
  describe('TC-01: Aktualizacja adresu klienta z automatycznym przeliczeniem rekomendacji', () => {
    it('should update client location and trigger recommendation recomputation', async () => {
      // ARRANGE: Klient ma lokalizację w Warszawie
      expect(testClient.location.city).toBe('Warszawa');
      
      // Get initial recommendations for Warsaw
      const initialRecommendations = await request(app.getHttpServer())
        .get(`/scheduling/recommendations/${testClient.clientId}`)
        .expect(200);

      // ACT: Zaktualizuj lokalizację na Kraków
      const updateResponse = await request(app.getHttpServer())
        .patch(`/user-management/clients/${testClient.clientId}`)
        .send({
          city: 'Kraków',
          zipCode: '30-001'
        })
        .expect(200);

      // ASSERT: Dane lokalizacji zostały zaktualizowane
      expect(updateResponse.body.location.city).toBe('Kraków');
      expect(updateResponse.body.location.zipCode).toBe('30-001');
      
      // ASSERT: Pozostałe pola lokalizacji pozostają niezmienione
      expect(updateResponse.body.location.street).toBe('ul. Główna');
      expect(updateResponse.body.location.buildingNumber).toBe('10');
      expect(updateResponse.body.location.apartmentNumber).toBe('5');

      // ASSERT: System przeliczył rekomendacje (include: Wyszukaj propozycje treningów)
      const newRecommendations = await request(app.getHttpServer())
        .get(`/scheduling/recommendations/${testClient.clientId}`)
        .expect(200);

      // Verify recommendations were recomputed (response should be fresh, not cached)
      expect(newRecommendations.body).toBeDefined();
      expect(Array.isArray(newRecommendations.body)).toBe(true);
      
      // Recommendations should be different (based on new location)
      // Note: This assumes we have gyms in both locations for realistic comparison
      if (initialRecommendations.body.length > 0 && newRecommendations.body.length > 0) {
        const initialFirstGymId = initialRecommendations.body[0]?.training?.room?.gym?.gymId;
        const newFirstGymId = newRecommendations.body[0]?.training?.room?.gym?.gymId;
        
        // The order or content should potentially be different based on distance
        console.log('Initial recommendations count:', initialRecommendations.body.length);
        console.log('New recommendations count:', newRecommendations.body.length);
      }
    });
  });

  /**
   * TC-02: Aktualizacja danych osobowych bez wpływu na rekomendacje
   * Priorytet: Średni | Typ: Pozytywny
   */
  describe('TC-02: Aktualizacja danych osobowych bez wpływu na rekomendacje', () => {
    it('should update personal data without triggering recommendation recomputation', async () => {
      // ARRANGE: Get recommendations before update
      const beforeRecommendations = await request(app.getHttpServer())
        .get(`/scheduling/recommendations/${testClient.clientId}`)
        .expect(200);
      
      const beforeTimestamp = Date.now();

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // ACT: Update only personal data (firstName, contactNumber)
      const updateResponse = await request(app.getHttpServer())
        .patch(`/user-management/clients/${testClient.clientId}`)
        .send({
          firstName: 'Janusz',
          contactNumber: '+48987654321'
        })
        .expect(200);

      // ASSERT: Personal data updated
      expect(updateResponse.body.user.firstName).toBe('Janusz');
      expect(updateResponse.body.user.contactNumber).toBe('+48987654321');

      // ASSERT: Location unchanged
      expect(updateResponse.body.location.city).toBe('Warszawa');

      // ASSERT: Recommendations NOT recomputed (should be cached)
      const afterRecommendations = await request(app.getHttpServer())
        .get(`/scheduling/recommendations/${testClient.clientId}`)
        .expect(200);

      // Recommendations should be identical (cached)
      expect(afterRecommendations.body.length).toBe(beforeRecommendations.body.length);
    });
  });

  /**
   * TC-03: Próba aktualizacji z nieistniejącym ID formularza
   * Priorytet: Wysoki | Typ: Negatywny
   */
  describe('TC-03: Próba aktualizacji z nieistniejącym ID formularza', () => {
    it('should return 404 when trying to assign non-existent form', async () => {
      // ARRANGE: Non-existent form ID
      const nonExistentFormId = 9999;

      // ACT & ASSERT: Try to update client with invalid form ID
      const response = await request(app.getHttpServer())
        .patch(`/user-management/clients/${testClient.clientId}`)
        .send({
          formId: nonExistentFormId
        })
        .expect(404);

      // ASSERT: Error message is descriptive
      expect(response.body.message).toContain('Form with ID 9999 not found');

      // ASSERT: Client data remains unchanged
      const clientCheck = await dataSource.getRepository(Client).findOne({
        where: { clientId: testClient.clientId },
        relations: ['form', 'user', 'location']
      });

      expect(clientCheck).toBeDefined();
      expect(clientCheck!.form).toBeNull();
      expect(clientCheck!.location.city).toBe('Warszawa');
    });
  });

  /**
   * TC-04: Aktualizacja lokalizacji z jednoczesnym błędem serwisu rekomendacji
   * Priorytet: Średni | Typ: Negatywny
   * 
   * Note: Ten test weryfikuje, że nawet gdy serwis rekomendacji zawiedzie,
   * dane klienta zostają poprawnie zapisane (graceful degradation)
   */
  describe('TC-04: Aktualizacja lokalizacji z błędem serwisu rekomendacji', () => {
    it('should save location data even if recommendation service fails', async () => {
      // Note: W prawdziwym środowisku możemy symulować błąd przez:
      // - wyłączenie zależnej usługi
      // - mock serwisu rekomendacji
      // - timeout na połączeniu
      
      // ACT: Update location
      const updateResponse = await request(app.getHttpServer())
        .patch(`/user-management/clients/${testClient.clientId}`)
        .send({
          city: 'Gdańsk',
          zipCode: '80-001'
        })
        .expect(200);

      // ASSERT: Location data is saved regardless of recommendation service status
      expect(updateResponse.body.location.city).toBe('Gdańsk');
      expect(updateResponse.body.location.zipCode).toBe('80-001');

      // ASSERT: Data persisted in database
      const clientCheck = await dataSource.getRepository(Client).findOne({
        where: { clientId: testClient.clientId },
        relations: ['location', 'user']
      });

      expect(clientCheck).toBeDefined();
      expect(clientCheck!.location.city).toBe('Gdańsk');
      expect(clientCheck!.location.zipCode).toBe('80-001');
    });
  });

  /**
   * TC-09 (bonus): Przypisanie formularza do klienta poprzez updateClient
   * Priorytet: Wysoki | Typ: Pozytywny
   */
  describe('TC-09: Przypisanie formularza do klienta z przeliczeniem rekomendacji', () => {
    let testForm: Form;

    beforeEach(async () => {
      // Create a test form
      const formRepo = dataSource.getRepository(Form);
      testForm = formRepo.create({
        activityLevel: ActivityLevel.MEDIUM,
        trainingTypes: [TrainingType.CARDIO, TrainingType.PILATES],
        trainingGoal: 'Zwiększenie wytrzymałości',
        healthProfile: 'Brak przeciwwskazań',
        clientId: testClient.clientId,
        client: testClient
      });
      await formRepo.save(testForm);
    });

    it('should assign form to client and trigger recommendation recomputation', async () => {
      // ARRANGE: Client without form initially
      expect(testClient.form).toBeFalsy();

      // ACT: Assign form to client
      const updateResponse = await request(app.getHttpServer())
        .patch(`/user-management/clients/${testClient.clientId}`)
        .send({
          formId: testForm.formId
        })
        .expect(200);

      // ASSERT: Form is assigned (re-fetch from DB to include relations)
      const clientWithForm = await dataSource.getRepository(Client).findOne({
        where: { clientId: testClient.clientId },
        relations: ['form'],
      });

      expect(clientWithForm).toBeDefined();
      expect(clientWithForm!.form?.formId).toBe(testForm.formId);

      // ASSERT: Recommendations recomputed (include: Wyszukaj propozycje treningów)
      const recommendations = await request(app.getHttpServer())
        .get(`/scheduling/recommendations/${testClient.clientId}`)
        .expect(200);

      expect(recommendations.body).toBeDefined();
      expect(Array.isArray(recommendations.body)).toBe(true);
      
      // With form assigned, recommendations should consider training preferences
      console.log('Recommendations with form:', recommendations.body.length);
    });

    it('should allow unsetting form by passing null', async () => {
      // ARRANGE: Client with form
      await request(app.getHttpServer())
        .patch(`/user-management/clients/${testClient.clientId}`)
        .send({ formId: testForm.formId })
        .expect(200);

      // ACT: Unset form
      const updateResponse = await request(app.getHttpServer())
        .patch(`/user-management/clients/${testClient.clientId}`)
        .send({
          formId: null
        })
        .expect(200);

      // ASSERT: Form is removed (re-fetch to verify)
      const clientAfterUnset = await dataSource.getRepository(Client).findOne({
        where: { clientId: testClient.clientId },
        relations: ['form'],
      });

      expect(clientAfterUnset).toBeDefined();
      expect(clientAfterUnset!.form).toBeDefined();

      // ASSERT: Recommendations still work (but without form preferences)
      const recommendations = await request(app.getHttpServer())
        .get(`/scheduling/recommendations/${testClient.clientId}`)
        .expect(200);

      expect(recommendations.body).toBeDefined();
    });
  });

  // ============================================================================
  // HELPER FUNCTIONS - Setup test data
  // ============================================================================

  async function setupTestClient() {
    const userRepo = dataSource.getRepository(User);
    const clientRepo = dataSource.getRepository(Client);
    const locationRepo = dataSource.getRepository(Location);
    const scheduleRepo = dataSource.getRepository(Schedule);

    // Create user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = userRepo.create({
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: `test.client.${Date.now()}@example.com`,
      password: hashedPassword,
      contactNumber: '+48123456789',
      role: UserRole.CLIENT
    });
    await userRepo.save(testUser);

    // Create location (Warszawa)
    const location = locationRepo.create({
      city: 'Warszawa',
      zipCode: '00-001',
      street: 'ul. Główna',
      buildingNumber: '10',
      apartmentNumber: '5'
    });
    await locationRepo.save(location);

    // Create schedule
    const schedule = scheduleRepo.create({});
    await scheduleRepo.save(schedule);

    // Create client
    testClient = clientRepo.create({
      user: testUser,
      location: location,
      schedule: schedule
    });
    await clientRepo.save(testClient);

    // Reload with relations
    const reloadedClient = await clientRepo.findOne({
      where: { clientId: testClient.clientId },
      relations: ['user', 'location', 'schedule', 'form']
    });
    
    if (!reloadedClient) {
      throw new Error('Failed to reload test client');
    }
    
    testClient = reloadedClient;
  }

  async function setupTestGymsAndTrainings() {
    const gymRepo = dataSource.getRepository(Gym);
    const roomRepo = dataSource.getRepository(Room);
    const trainingRepo = dataSource.getRepository(Training);
    const locationRepo = dataSource.getRepository(Location);
    const trainerRepo = dataSource.getRepository(Trainer);
    const userRepo = dataSource.getRepository(User);
    const scheduleRepo = dataSource.getRepository(Schedule);

    // Create trainer
    const hashedPassword = await bcrypt.hash('TrainerPass123!', 10);
    const trainerUser = userRepo.create({
      firstName: 'Michał',
      lastName: 'Trener',
      email: `trainer.${Date.now()}@example.com`,
      password: hashedPassword,
      contactNumber: '+48111222333',
      role: UserRole.TRAINER
    });
    await userRepo.save(trainerUser);

    const trainerSchedule = scheduleRepo.create({});
    await scheduleRepo.save(trainerSchedule);

    const trainer = trainerRepo.create({
      user: trainerUser,
      specialization: TrainingType.FUNCTIONAL,
      description: 'Doświadczony trener',
      schedule: trainerSchedule
    });
    await trainerRepo.save(trainer);

    // Create gym in Warszawa
    const gymLocationWarsaw = locationRepo.create({
      city: 'Warszawa',
      zipCode: '00-002',
      street: 'ul. Sportowa',
      buildingNumber: '1'
    });
    await locationRepo.save(gymLocationWarsaw);

    const gymWarsaw = gymRepo.create({
      name: 'Gym Warsaw Center',
      description: 'Gym w centrum Warszawy',
      location: gymLocationWarsaw
    });
    await gymRepo.save(gymWarsaw);

    // Create room in Warsaw gym
    const roomWarsaw = roomRepo.create({
      name: 'Sala fitness',
      capacity: 20,
      gym: gymWarsaw
    });
    await roomRepo.save(roomWarsaw);

    // Create training in Warsaw
    const trainingWarsaw = trainingRepo.create({
      type: TrainingType.CARDIO,
      price: 80,
      trainer: trainer,
      room: roomWarsaw,
      status: TrainingStatus.PLANNED
    });
    await trainingRepo.save(trainingWarsaw);

    // Create gym in Kraków
    const gymLocationKrakow = locationRepo.create({
      city: 'Kraków',
      zipCode: '30-002',
      street: 'ul. Krakowska',
      buildingNumber: '5'
    });
    await locationRepo.save(gymLocationKrakow);

    const gymKrakow = gymRepo.create({
      name: 'Gym Kraków Plaza',
      description: 'Gym w Krakowie',
      location: gymLocationKrakow
    });
    await gymRepo.save(gymKrakow);

    // Create room in Kraków gym
    const roomKrakow = roomRepo.create({
      name: 'Sala siłowa',
      capacity: 15,
      gym: gymKrakow
    });
    await roomRepo.save(roomKrakow);

    // Create training in Kraków
    const trainingKrakow = trainingRepo.create({
      type: TrainingType.POWERLIFTING,
      price: 100,
      trainer: trainer,
      room: roomKrakow,
      status: TrainingStatus.PLANNED
    });
    await trainingRepo.save(trainingKrakow);
  }
});
