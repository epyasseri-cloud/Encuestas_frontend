import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ServerConfigService } from './server-config.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private client: AxiosInstance;
  private isInitialized = false;

  constructor(
    private auth: AuthService, 
    private router: Router,
    private serverConfig: ServerConfigService
  ) {
    // Inicializar con URL por defecto
    this.client = axios.create({
      baseURL: environment.apiUrl
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
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
          this.router.navigateByUrl('/home');
        }
        return Promise.reject(error);
      }
    );
  }

  private async ensureServerDetected() {
    if (!this.isInitialized) {
      if (environment.autoDetectServer) {
        const serverUrl = await this.serverConfig.detectServer();
        this.client.defaults.baseURL = serverUrl;
        console.log(`🔗 ApiService configurado con auto-detección: ${serverUrl}`);
      } else {
        // Usar URL fija del environment
        this.client.defaults.baseURL = environment.apiUrl;
        console.log(`🔗 ApiService configurado con URL fija: ${environment.apiUrl}`);
      }
      this.isInitialized = true;
    }
  }

  async login(identifier: string, password: string) {
    await this.ensureServerDetected();
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
    await this.ensureServerDetected();
    return this.client.get(`/api/${path}`);
  }

  async put(path: string, data: any) {
    await this.ensureServerDetected();
    return this.client.put(`/api/${path}`, data);
  }

  async validateToken() {
    try {
      await this.ensureServerDetected();
      const response = await this.client.get('/api/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener la URL del servidor detectado
  getServerUrl(): string | null {
    return this.client.defaults.baseURL || null;
  }

  // Método para forzar re-detección del servidor
  async resetAndDetectServer() {
    this.serverConfig.resetDetection();
    this.isInitialized = false;
    await this.ensureServerDetected();
  }
}
