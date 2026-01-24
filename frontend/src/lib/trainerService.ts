import api from './api';

// ===================== Types =====================

export interface TrainerUser {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface Trainer {
  trainerId: number;
  description?: string;
  specialization?: string;
  rating: number;
  user: TrainerUser;
}

export interface Opinion {
  opinionId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  clientId: number;
  trainerId: number;
  client?: {
    clientId: number;
    user?: TrainerUser;
  };
  trainer?: Trainer;
}

export interface CreateOpinionDto {
  rating: number;
  comment?: string;
  clientId: number;
  trainerId: number;
}

// ===================== Trainers API =====================

export async function getAllTrainers(): Promise<Trainer[]> {
  const response = await api.get('/user-management/trainers');
  return response.data;
}

export async function getTrainerById(id: number): Promise<Trainer> {
  const response = await api.get(`/user-management/trainers/${id}`);
  return response.data;
}

// ===================== Opinions API =====================

export async function getAllOpinions(): Promise<Opinion[]> {
  const response = await api.get('/engagement/opinions');
  return response.data;
}

export async function getOpinionById(id: number): Promise<Opinion> {
  const response = await api.get(`/engagement/opinions/${id}`);
  return response.data;
}

export async function createOpinion(data: CreateOpinionDto): Promise<Opinion> {
  const response = await api.post('/engagement/opinions', data);
  return response.data;
}

export async function updateOpinion(id: number, data: Partial<CreateOpinionDto>): Promise<Opinion> {
  const response = await api.patch(`/engagement/opinions/${id}`, data);
  return response.data;
}

export async function deleteOpinion(id: number): Promise<void> {
  await api.delete(`/engagement/opinions/${id}`);
}

// ===================== Service Export =====================

const trainerService = {
  getAllTrainers,
  getTrainerById,
  getAllOpinions,
  getOpinionById,
  createOpinion,
  updateOpinion,
  deleteOpinion,
};

export default trainerService;
