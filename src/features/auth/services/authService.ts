import api from '@/shared/lib/axios';
import type { LoginCredentials, User } from '../types';

export const authService = {
	login: (credentials: LoginCredentials) => api.post<{ token: string }>('/auth/login/', credentials),

	logout: () => api.post('/auth/logout/'),

	me: () => api.get<User>('/auth/me/')
};