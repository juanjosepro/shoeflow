import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '../services/authService';
import type { LoginCredentials } from '../types';

export const useAuth = () => {
	const { user, token, setUser, setToken, clear } = useAuthStore();
	const [loading, setLoading] = useState(!!token && !user); // loading si hay token pero no user
	const navigate = useNavigate();

	// Si hay token pero no user, obtener el usuario
	useEffect(() => {
		if (token && !user) {
			authService.me()
				.then(({ data }) => setUser(data))
				.catch(() => clear()) // token inválido, limpiar
				.finally(() => setLoading(false));
		}
	}, []);

	const login = async (credentials: LoginCredentials) => {
		const { data } = await authService.login(credentials);
		setToken(data.token);
		const { data: userData } = await authService.me();
		setUser(userData);
		navigate('/dashboard');
	};

	const logout = async () => {
		try {
			await authService.logout();
		} finally {
			clear();
			navigate('/login');
		}
	};

	return {
		user,
		token,
		loading,
		isAuthenticated: !!token,
		login,
		logout,
	};
};