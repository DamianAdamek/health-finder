import api from './api';

export async function getActivityLevels(): Promise<string[]> {
  const res = await api.get<string[]>('/enums/activity-levels');
  return res.data;
}

export async function getDaysOfWeek(): Promise<string[]> {
  const res = await api.get<string[]>('/enums/days-of-week');
  return res.data;
}

export async function getTrainingStatuses(): Promise<string[]> {
  const res = await api.get<string[]>('/enums/training-statuses');
  return res.data;
}

export async function getTrainingTypes(): Promise<string[]> {
  const res = await api.get<string[]>('/enums/training-types');
  return res.data;
}

export async function getUserRoles(): Promise<string[]> {
  const res = await api.get<string[]>('/enums/user-roles');
  return res.data;
}

export async function getAllEnums(): Promise<Record<string, string[]>> {
  const res = await api.get<Record<string, string[]>>('/enums');
  return res.data;
}

const enumsService = {
  getActivityLevels,
  getDaysOfWeek,
  getTrainingStatuses,
  getTrainingTypes,
  getUserRoles,
  getAllEnums,
};

export default enumsService;
