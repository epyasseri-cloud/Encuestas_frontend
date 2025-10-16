import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private client: AxiosInstance;

  constructor(private auth: AuthService, private router: Router) {
    this.client = axios.create({
      baseURL: 'http://localhost:1337'
    });

    // request interceptor: attach token
    this.client.interceptors.request.use((config) => {
      const token = this.auth.getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = 'Bearer ' + token;
      }
      return config;
    });

    // response interceptor: handle 401 globally
    this.client.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          this.auth.clearAll();
          // redirect to login
          this.router.navigateByUrl('/home');
        }
        return Promise.reject(error);
      }
    );
  }

  async login(identifier: string, password: string) {
    const res = await this.client.post('/api/auth/local', { identifier, password });
    // persist token and user if present
    if (res?.data?.jwt) {
      this.auth.setToken(res.data.jwt);
    }
    if (res?.data?.user) {
      this.auth.setUser(res.data.user);
    }
    return res;
  }

  async get(path: string) {
    return this.client.get(`/api/${path}`);
  }

  async put(path: string, data: any) {
    return this.client.put(`/api/${path}`, data);
  }
}
