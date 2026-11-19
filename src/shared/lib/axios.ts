import axios from 'axios';

// import.meta.env.DEV es true con `npm run dev` y false en el build de Vercel
const isDev = import.meta.env.DEV;

const getBaseURL = () => {
	const base = import.meta.env.VITE_API_URL;

	// PRODUCCIÓN: la API es un solo host (https://sf.juanjosepau.dev/api/v1).
	// El tenant NO va en la URL, va en el header X-Tenant (ver interceptor).
	if (!isDev) return base;

	// DESARROLLO: igual que antes, el tenant va como subdominio del Host
	// http://localhost:8000/api/v1 -> http://nikfort.localhost:8000/api/v1
	const subdomain = window.location.hostname.split('.')[0]; // nikfort
	return base.replace('://', `://${subdomain}.`);
};

const api = axios.create({
	baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
	// Le dice al backend qué tenant es, ej: nikfort.juanjosepau.dev
	// (debe existir en la tabla Domain del backend)
	config.headers['X-Tenant'] = window.location.hostname;

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