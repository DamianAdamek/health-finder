import api from './api';

// Types/Interfaces matching backend entities and DTOs

export interface Location {
  locationId: number;
  city: string;
  zipCode: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
}

export interface Room {
  roomId: number;
  name: string;
  capacity?: number;
  gymId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainerInfo {
  trainerId: number;
  specialization?: string;
  description?: string;
  rating?: number;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export interface Gym {
  gymId: number;
  name: string;
  description?: string;
  rules?: string;
  locationId: number;
  location: Location;
  rooms: Room[];
  trainers?: TrainerInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationPayload {
  city: string;
  zipCode: string;
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
}

export interface CreateRoomPayload {
  name: string;
  capacity?: number;
  gymId: number;
}

export interface UpdateRoomPayload {
  name?: string;
  capacity?: number;
  gymId?: number;
}

export interface CreateGymPayload {
  name: string;
  description?: string;
  rules?: string;
  location: CreateLocationPayload;
  rooms?: Omit<CreateRoomPayload, 'gymId'>[];
}

export interface UpdateGymPayload {
  name?: string;
  description?: string;
  rules?: string;
  location?: Partial<CreateLocationPayload>;
  trainers?: number[];
}

// ============ GYM CRUD ============

export async function fetchAllGyms(): Promise<Gym[]> {
  const response = await api.get('/facilities/gyms');
  return response.data;
}

export async function fetchGymById(id: number): Promise<Gym> {
  const response = await api.get(`/facilities/gyms/${id}`);
  return response.data;
}

export async function createGym(data: CreateGymPayload): Promise<Gym> {
  const response = await api.post('/facilities/gyms', data);
  return response.data;
}

export async function updateGym(id: number, data: UpdateGymPayload): Promise<Gym> {
  const response = await api.patch(`/facilities/gyms/${id}`, data);
  return response.data;
}

export async function removeGym(id: number): Promise<void> {
  await api.delete(`/facilities/gyms/${id}`);
}

// ============ ROOM CRUD ============

export async function fetchAllRooms(): Promise<Room[]> {
  const response = await api.get('/facilities/rooms');
  return response.data;
}

export async function fetchRoomById(id: number): Promise<Room> {
  const response = await api.get(`/facilities/rooms/${id}`);
  return response.data;
}

export async function createRoom(data: CreateRoomPayload): Promise<Room> {
  const response = await api.post('/facilities/rooms', data);
  return response.data;
}

export async function updateRoom(id: number, data: UpdateRoomPayload): Promise<Room> {
  const response = await api.patch(`/facilities/rooms/${id}`, data);
  return response.data;
}

export async function removeRoom(id: number): Promise<void> {
  await api.delete(`/facilities/rooms/${id}`);
}

// ============ LOCATION (optional helpers) ============

export async function fetchAllLocations(): Promise<Location[]> {
  const response = await api.get('/facilities/locations');
  return response.data;
}

// Default export with all functions
const facilitiesService = {
  fetchAllGyms,
  fetchGymById,
  createGym,
  updateGym,
  removeGym,
  fetchAllRooms,
  fetchRoomById,
  createRoom,
  updateRoom,
  removeRoom,
  fetchAllLocations,
};

export default facilitiesService;
