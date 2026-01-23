import api from './api';

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  contactNumber?: string;
  createdAt?: string;
  trainer?: Trainer;
  client?: Client;
  gymAdmin?: GymAdmin;
}

export interface Client {
  clientId: number;
  user?: User;
  location?: {
    locationId?: number;
    city?: string;
    zipCode?: string;
    street?: string;
    buildingNumber?: string;
    apartmentNumber?: string;
  };
  schedule?: {
    scheduleId?: number;
  };
}

export interface Trainer {
  trainerId: number;
  specialization?: string;
  description?: string;
  rating?: number;
  user?: User;
  schedule?: {
    scheduleId?: number;
  };
}

export interface GymAdmin {
  gymAdminId: number;
  user?: User;
  gyms?: Array<{
    gymId: number;
    name: string;
  }>;
}

export interface CreateClientPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber?: string;
  city: string;
  zipCode: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
}

export interface CreateTrainerPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber?: string;
  specialization?: string;
  description?: string;
}

export interface CreateGymAdminPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber?: string;
  gymIds?: number[];
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  contactNumber?: string;
}

export interface UpdateClientPayload extends UpdateUserPayload {
  city?: string;
  zipCode?: string;
  street?: string;
  buildingNumber?: string;
  apartmentNumber?: string;
}

export interface UpdateTrainerPayload extends UpdateUserPayload {
  specialization?: string;
  description?: string;
}

export interface UpdateGymAdminPayload extends UpdateUserPayload {
  gymIds?: number[];
}

export async function fetchAllUsers(): Promise<User[]> {
  const response = await api.get('/user-management/users');
  return response.data;
}

export async function fetchUserById(id: number): Promise<User> {
  const response = await api.get(`/user-management/users/${id}`);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/user-management/users/${id}`);
}

export async function updateUser(id: number, data: UpdateUserPayload): Promise<User> {
  const response = await api.patch(`/user-management/users/${id}`, data);
  return response.data;
}

export async function fetchAllClients(): Promise<Client[]> {
  const response = await api.get('/user-management/clients');
  return response.data;
}

export async function fetchClientById(id: number): Promise<Client> {
  const response = await api.get(`/user-management/clients/${id}`);
  return response.data;
}

export async function createClient(data: CreateClientPayload): Promise<Client> {
  const response = await api.post('/user-management/auth/register/client', data);
  return response.data;
}

export async function updateClient(id: number, data: UpdateClientPayload): Promise<Client> {
  const response = await api.patch(`/user-management/clients/${id}`, data);
  return response.data;
}

export async function deleteClient(id: number): Promise<void> {
  await api.delete(`/user-management/clients/${id}`);
}

export async function fetchAllTrainers(): Promise<Trainer[]> {
  const response = await api.get('/user-management/trainers');
  return response.data;
}

export async function fetchTrainerById(id: number): Promise<Trainer> {
  const response = await api.get(`/user-management/trainers/${id}`);
  return response.data;
}

export async function createTrainer(data: CreateTrainerPayload): Promise<Trainer> {
  const response = await api.post('/user-management/auth/register/trainer', data);
  return response.data;
}

export async function updateTrainer(id: number, data: UpdateTrainerPayload): Promise<Trainer> {
  const response = await api.patch(`/user-management/trainers/${id}`, data);
  return response.data;
}

export async function deleteTrainer(id: number): Promise<void> {
  await api.delete(`/user-management/trainers/${id}`);
}

export async function fetchAllGymAdmins(): Promise<GymAdmin[]> {
  const response = await api.get('/user-management/gym-admins');
  return response.data;
}

export async function fetchGymAdminById(id: number): Promise<GymAdmin> {
  const response = await api.get(`/user-management/gym-admins/${id}`);
  return response.data;
}

export async function createGymAdmin(data: CreateGymAdminPayload): Promise<GymAdmin> {
  const response = await api.post('/user-management/auth/register/gym-admin', data);
  return response.data;
}

export async function updateGymAdmin(id: number, data: UpdateGymAdminPayload): Promise<GymAdmin> {
  const response = await api.patch(`/user-management/gym-admins/${id}`, data);
  return response.data;
}

export async function deleteGymAdmin(id: number): Promise<void> {
  await api.delete(`/user-management/gym-admins/${id}`);
}
