import axios, {AxiosError} from 'axios';
import {AuthUser, normalizeProperty, Property, PropertyInput, UploadedImage} from '../types/property';

const TOKEN_KEY = 'haven_token';

export function getStoredToken(): string {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) || '' : '';
}

export function setStoredToken(token: string) {
    if (typeof localStorage === 'undefined') return;
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

const baseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export const apiClient = axios.create({
    baseURL,
    timeout: 15000
});

apiClient.interceptors.request.use(config => {
    const token = getStoredToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.info('[HTTP]', (config.method || 'GET').toUpperCase(), `${config.baseURL || ''}${config.url || ''}`);
    return config;
});

apiClient.interceptors.response.use(
    response => response,
    (error: AxiosError<{message?: string; error?: string}>) => {
        const status = error.response?.status ?? 0;
        const serverMessage =
            typeof error.response?.data?.message === 'string'
                ? error.response.data.message
                : typeof error.response?.data?.error === 'string'
                    ? error.response.data.error
                    : '';
        const message =
            status === 0 || status === 504
                ? 'Сервер недоступний. Перевірте, чи запущено Node.js API, та спробуйте ще раз.'
                : serverMessage
                    ? serverMessage
                    : status === 401
                        ? 'Потрібна авторизація. Увійдіть в акаунт.'
                        : status === 404
                            ? 'Оголошення не знайдено. Можливо, його вже видалили.'
                            : 'Не вдалося виконати запит. Спробуйте ще раз.';
        console.error('[HTTP]', error.config?.method?.toUpperCase(), error.config?.url, status);
        return Promise.reject(new Error(message));
    }
);

export interface AuthResponse {
    token: string;
    user: AuthUser;
    message?: string;
}

export const authApi = {
    async register(userName: string, password: string): Promise<AuthResponse> {
        const res = await apiClient.post<AuthResponse>('/auth/register', {userName, password});
        return res.data;
    },

    async login(userName: string, password: string): Promise<AuthResponse> {
        const res = await apiClient.post<AuthResponse>('/auth/login', {userName, password});
        return res.data;
    },

    async me(): Promise<AuthUser> {
        const res = await apiClient.get<{user: AuthUser}>('/auth/me');
        return res.data.user;
    }
};

export const propertiesApi = {
    async list(): Promise<Property[]> {
        const res = await apiClient.get<Property[]>('/products');
        return res.data.map(normalizeProperty);
    },

    async get(id: string): Promise<Property> {
        const res = await apiClient.get<Property>(`/products/${encodeURIComponent(id)}`);
        return normalizeProperty(res.data);
    },

    async create(input: PropertyInput): Promise<Property> {
        const res = await apiClient.post<Property>('/products', input);
        return normalizeProperty(res.data);
    },

    async update(id: string, input: PropertyInput): Promise<Property> {
        const res = await apiClient.put<Property>(`/products/${encodeURIComponent(id)}`, input);
        return normalizeProperty(res.data);
    },

    async patch(id: string, changes: Partial<PropertyInput>): Promise<Property> {
        const res = await apiClient.patch<Property>(`/products/${encodeURIComponent(id)}`, changes);
        return normalizeProperty(res.data);
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(`/products/${encodeURIComponent(id)}`);
    },

    async uploadImage(file: File): Promise<UploadedImage> {
        const res = await apiClient.post<UploadedImage>('/upload', file, {
            headers: {
                'Content-Type': file.type || 'application/octet-stream',
                'X-File-Name': encodeURIComponent(file.name)
            }
        });
        return res.data;
    }
};
