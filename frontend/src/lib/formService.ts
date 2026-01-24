import api from './api';

// ===================== Types =====================

export interface Form {
  formId: number;
  activityLevel: string;
  trainingTypes: string[];
  trainingGoal: string;
  healthProfile?: string;
  clientId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFormPayload {
  activityLevel: string;
  trainingTypes: string[];
  trainingGoal: string;
  healthProfile?: string;
  clientId: number;
}

export interface UpdateFormPayload {
  activityLevel?: string;
  trainingTypes?: string[];
  trainingGoal?: string;
  healthProfile?: string;
}

// ===================== Form API =====================

/**
 * Fetch client's form by fetching user profile (form is embedded in user.client)
 * Returns the form or null if no form exists
 */
export async function fetchClientForm(_clientId: number): Promise<Form | null> {
  try {
    const response = await api.get('/user-management/users/me');
    // Form is nested under client.form in the user object
    return response.data?.client?.form || null;
  } catch (error) {
    console.error('Failed to fetch client form:', error);
    return null;
  }
}

/**
 * Fetch form by ID
 */
export async function getForm(formId: number): Promise<Form> {
  const response = await api.get(`/engagement/forms/${formId}`);
  return response.data;
}

/**
 * Create a new training form
 */
export async function createForm(data: CreateFormPayload): Promise<Form> {
  const response = await api.post('/engagement/forms', data);
  return response.data;
}

/**
 * Update an existing form
 */
export async function updateForm(formId: number, data: UpdateFormPayload): Promise<Form> {
  const response = await api.patch(`/engagement/forms/${formId}`, data);
  return response.data;
}

/**
 * Delete a form
 */
export async function deleteForm(formId: number): Promise<void> {
  await api.delete(`/engagement/forms/${formId}`);
}
