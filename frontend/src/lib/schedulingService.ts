import api from './api';

// ===================== Types =====================

export interface Schedule {
  scheduleId: number;
  windows?: Window[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Window {
  windowId: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  dayOfWeek: DayOfWeek;
  schedules?: Schedule[];
  training?: Training | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Training {
  trainingId: number;
  price: number;
  status: TrainingStatus;
  type: TrainingType;
  room?: Room;
  trainer?: TrainerInfo;
  clients?: ClientInfo[];
  window?: Window;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  roomId: number;
  name: string;
  capacity?: number;
  gymId: number;
  gym?: {
    gymId: number;
    name: string;
  };
}

export interface TrainerInfo {
  trainerId: number;
  specialization?: string;
  description?: string;
  rating?: number;
  schedule?: Schedule;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export interface ClientInfo {
  clientId: number;
  schedule?: Schedule;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export const DayOfWeek = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const TrainingStatus = {
  PLANNED: 'Planned',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

export type TrainingStatus = (typeof TrainingStatus)[keyof typeof TrainingStatus];

export const TrainingType = {
  FUNCTIONAL: 'Functional',
  HEALTHY_BACK: 'Healthy Back',
  CARDIO: 'Cardio',
  YOGA: 'Yoga',
  CALISTHENICS: 'Calisthenics',
  PILATES: 'Pilates',
  ZUMBA: 'Zumba',
  BODYBUILDING: 'Bodybuilding',
  POWERLIFTING: 'Powerlifting',
} as const;

export type TrainingType = (typeof TrainingType)[keyof typeof TrainingType];

// ===================== DTOs =====================

export interface CreateScheduleDto {
  windowIds?: number[];
}

export interface UpdateScheduleDto {
  windowIds?: number[];
}

export interface CreateWindowDto {
  scheduleIds?: number[];
  startTime: string;
  endTime: string;
  dayOfWeek: DayOfWeek;
  trainingId?: number;
}

export interface UpdateWindowDto {
  scheduleIds?: number[];
  startTime?: string;
  endTime?: string;
  dayOfWeek?: DayOfWeek;
  trainingId?: number;
}

export interface CreateTrainingDto {
  roomId: number;
  price: number;
  trainerId: number;
  status: TrainingStatus;
  type: TrainingType;
  clientIds: number[];
}

export interface UpdateTrainingDto {
  roomId?: number;
  price?: number;
  trainerId?: number;
  status?: TrainingStatus;
  type?: TrainingType;
  clientIds?: number[];
}

// ===================== Schedule API =====================

export async function createSchedule(data: CreateScheduleDto): Promise<Schedule> {
  const response = await api.post('/scheduling/schedules', data);
  return response.data;
}

export async function getAllSchedules(): Promise<Schedule[]> {
  const response = await api.get('/scheduling/schedules');
  return response.data;
}

export async function getScheduleById(id: number): Promise<Schedule> {
  const response = await api.get(`/scheduling/schedules/${id}`);
  return response.data;
}

export async function updateSchedule(id: number, data: UpdateScheduleDto): Promise<Schedule> {
  const response = await api.patch(`/scheduling/schedules/${id}`, data);
  return response.data;
}

export async function deleteSchedule(id: number): Promise<void> {
  await api.delete(`/scheduling/schedules/${id}`);
}

// ===================== Window API =====================

export async function createWindow(data: CreateWindowDto): Promise<Window> {
  const response = await api.post('/scheduling/windows', data);
  return response.data;
}

export async function getAllWindows(): Promise<Window[]> {
  const response = await api.get('/scheduling/windows');
  return response.data;
}

export async function getWindowById(id: number): Promise<Window> {
  const response = await api.get(`/scheduling/windows/${id}`);
  return response.data;
}

export async function getWindowsByScheduleId(scheduleId: number): Promise<Window[]> {
  const response = await api.get(`/scheduling/windows/schedule/${scheduleId}`);
  return response.data;
}

export async function updateWindow(id: number, data: UpdateWindowDto): Promise<Window> {
  const response = await api.patch(`/scheduling/windows/${id}`, data);
  return response.data;
}

export async function deleteWindow(id: number): Promise<void> {
  await api.delete(`/scheduling/windows/${id}`);
}

// ===================== Training API =====================

export async function createTraining(data: CreateTrainingDto): Promise<Training> {
  const response = await api.post('/scheduling/trainings', data);
  return response.data;
}

export async function getAllTrainings(): Promise<Training[]> {
  const response = await api.get('/scheduling/trainings');
  return response.data;
}

export async function getTrainingById(id: number): Promise<Training> {
  const response = await api.get(`/scheduling/trainings/${id}`);
  return response.data;
}

export async function updateTraining(id: number, data: UpdateTrainingDto): Promise<Training> {
  const response = await api.patch(`/scheduling/trainings/${id}`, data);
  return response.data;
}

export async function deleteTraining(id: number): Promise<void> {
  await api.delete(`/scheduling/trainings/${id}`);
}

// ===================== Recommendations API =====================

export interface RecommendedTraining {
  training: Training;
  distance: number;
}

export async function getMyRecommendations(): Promise<RecommendedTraining[]> {
  const response = await api.get('/scheduling/recommendations/me');
  return response.data;
}

// ===================== Client Training Management API =====================

export async function getMyTrainings(): Promise<Training[]> {
  const response = await api.get('/scheduling/trainings/my');
  return response.data;
}

export async function signUpForTraining(trainingId: number): Promise<Training> {
  const response = await api.post(`/scheduling/trainings/${trainingId}/sign-up`);
  return response.data;
}

export async function cancelTrainingReservation(trainingId: number): Promise<Training> {
  const response = await api.post(`/scheduling/trainings/${trainingId}/cancel`);
  return response.data;
}

// ===================== Service Export =====================

const schedulingService = {
  // Schedule
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  // Window
  createWindow,
  getAllWindows,
  getWindowById,
  getWindowsByScheduleId,
  updateWindow,
  deleteWindow,
  // Training
  createTraining,
  getAllTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
  // Recommendations
  getMyRecommendations,
  // Client Training Management
  getMyTrainings,
  signUpForTraining,
  cancelTrainingReservation,
};

export default schedulingService;
