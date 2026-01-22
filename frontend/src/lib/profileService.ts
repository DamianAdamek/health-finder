import api from './api';
import type { UserProfile } from './authService';

// ===================== Types =====================

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
}

export interface UpdateClientLocationPayload {
  city?: string;
  zipCode?: string;
  street?: string;
  buildingNumber?: string;
  apartmentNumber?: string;
}

export interface UpdateTrainerPayload {
  specialization?: string;
  description?: string;
}

// ===================== Profile API =====================

/**
 * Fetch current user profile with all relations (client/trainer data)
 */
export async function fetchProfile(): Promise<UserProfile> {
  const response = await api.get('/user-management/users/me');
  return response.data;
}

/**
 * Update current user's basic information (firstName, lastName, email, contactNumber)
 */
export async function updateUser(data: UpdateUserPayload): Promise<UserProfile> {
  const response = await api.patch('/user-management/users/me', data);
  return response.data;
}

/**
 * Update current client's location
 */
export async function updateClientLocation(data: UpdateClientLocationPayload): Promise<any> {
  const response = await api.patch('/user-management/clients/me', data);
  return response.data;
}

/**
 * Fetch current trainer profile
 */
export async function fetchTrainerProfile(): Promise<any> {
  const response = await api.get('/user-management/trainers/me');
  return response.data;
}

/**
 * Update current trainer's profile (specialization, description)
 */
export async function updateTrainerProfile(data: UpdateTrainerPayload): Promise<any> {
  const response = await api.patch('/user-management/trainers/me', data);
  return response.data;
}
