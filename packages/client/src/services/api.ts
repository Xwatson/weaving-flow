import axios from 'axios';
import type { CrawlerConfig, CrawlerResult } from '@weaving-flow/core';

const api = axios.create({
  baseURL: '/api',
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams extends LoginParams {
  name?: string;
}

export const authApi = {
  login: (params: LoginParams) => api.post('/auth/login', params),
  register: (params: RegisterParams) => api.post('/auth/register', params),
};

export const crawlerApi = {
  crawl: (config: CrawlerConfig): Promise<CrawlerResult> => 
    api.post('/crawler', config),
};

export const bookmarkApi = {
  getAll: () => api.get('/bookmarks'),
  create: (data: any) => api.post('/bookmarks', data),
  update: (id: string, data: any) => api.put(`/bookmarks/${id}`, data),
  delete: (id: string) => api.delete(`/bookmarks/${id}`),
};

export const credentialApi = {
  getAll: () => api.get('/credentials'),
  create: (data: any) => api.post('/credentials', data),
  update: (id: string, data: any) => api.put(`/credentials/${id}`, data),
  delete: (id: string) => api.delete(`/credentials/${id}`),
};

export const workflowApi = {
  getAll: () => api.get('/workflows'),
  create: (data: any) => api.post('/workflows', data),
  update: (id: string, data: any) => api.put(`/workflows/${id}`, data),
  delete: (id: string) => api.delete(`/workflows/${id}`),
  execute: (id: string) => api.post(`/workflows/${id}/execute`),
};
