import axios from 'axios';
import { auth } from '../firebase/auth';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Firebase auth token to all requests
apiClient.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const addCompanies = async (names: string[]) => {
    return apiClient.post('/companies', { names });
};

export const getCompanies = async () => {
    return apiClient.get('/companies');
};

export default apiClient;
