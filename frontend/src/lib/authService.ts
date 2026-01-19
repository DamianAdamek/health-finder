import api, { TOKEN_KEY } from './api';

// ===================== Types =====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  userId: number;
  email: string;
  role: string;
}

export interface RegisterClientPayload {
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

export interface RegisterTrainerPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber?: string;
  specialization?: string;
  description?: string;
}

export interface UserInfo {
  userId: number;
  email: string;
  role: string;
}

// ===================== Token Management =====================

/**
 * Get the stored access token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store the access token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the stored access token
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is logged in (has valid token)
 */
export function isLoggedIn(): boolean {
  const token = getToken();
  return !!token;
}

// ===================== User Info Storage =====================

const USER_INFO_KEY = 'health_finder_user';

/**
 * Store user info after login
 */
export function setUserInfo(userInfo: UserInfo): void {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * Get stored user info
 */
export function getUserInfo(): UserInfo | null {
  const data = localStorage.getItem(USER_INFO_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Clear stored user info
 */
export function clearUserInfo(): void {
  localStorage.removeItem(USER_INFO_KEY);
}

// ===================== Auth API Methods =====================

/**
 * Login user with email and password
 * POST /user-management/auth/login
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/user-management/auth/login', credentials);
  const data = response.data;
  
  // Store token and user info
  setToken(data.access_token);
  setUserInfo({
    userId: data.userId,
    email: data.email,
    role: data.role,
  });
  
  return data;
}

/**
 * Logout user - clear all stored data
 */
export function logout(): void {
  clearToken();
  clearUserInfo();
}

/**
 * Register a new client
 * POST /user-management/auth/register/client
 */
export async function registerClient(payload: RegisterClientPayload): Promise<unknown> {
  const response = await api.post('/user-management/auth/register/client', payload);
  return response.data;
}

/**
 * Register a new trainer
 * POST /user-management/auth/register/trainer
 */
export async function registerTrainer(payload: RegisterTrainerPayload): Promise<unknown> {
  const response = await api.post('/user-management/auth/register/trainer', payload);
  return response.data;
}

/**
 * Get current user profile (protected endpoint)
 * GET /user-management/users/me
 */
export async function getCurrentUser(): Promise<unknown> {
  const response = await api.get('/user-management/users/me');
  return response.data;
}

// Export as default object for convenience
const authService = {
  login,
  logout,
  registerClient,
  registerTrainer,
  getCurrentUser,
  getToken,
  setToken,
  clearToken,
  isLoggedIn,
  getUserInfo,
  setUserInfo,
  clearUserInfo,
};

export default authService;
