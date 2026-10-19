import axios from 'axios';

const getBaseURL = () => {
	const hostname = window.location.hostname; // nikfort.localhost
	const subdomain = hostname.split('.')[0];  // nikfort

	const base = import.meta.env.VITE_API_URL; // http://localhost:8000/api/v1

	// http://localhost:8000/api/v1 -> http://nikfort.localhost:8000/api/v1
	return base.replace('://', `://${subdomain}.`);
};

const api = axios.create({
	baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) config.headers.Authorization = `Token ${token}`;
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('token');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export default api;