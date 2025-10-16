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
      baseURL: 'http://192.168.1.204:1337'
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
          this.router.navigateByUrl('/home');
        }
        return Promise.reject(error);
      }
    );
  }

  async login(identifier: string, password: string) {
    try {
      console.log('🔍 ApiService: Intentando login con:', { identifier, url: 'http://192.168.1.204:1337/api/auth/local' });
      
      // Usar la ruta correcta de Strapi v5
      const res = await this.client.post('/api/auth/local', { identifier, password });
      
      console.log('✅ ApiService: Login exitoso:', res.data);
      
      // persist token and user if present
      if (res?.data?.jwt) {
        this.auth.setToken(res.data.jwt);
        console.log('🔑 ApiService: Token guardado');
      }
      if (res?.data?.user) {
        this.auth.setUser(res.data.user);
        console.log('👤 ApiService: Usuario guardado:', res.data.user);
      }
      
      return res;
    } catch (error) {
      console.error('❌ ApiService: Error en login:', error);
      throw error;
    }
  }

  async get(path: string) {
    return this.client.get(`/api/${path}`);
  }

  async put(path: string, data: any) {
    return this.client.put(`/api/${path}`, data);
  }

  async validateToken() {
    try {
      const response = await this.client.get('/api/users/me');
      console.log('✅ Token válido, usuario:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Token inválido:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      console.log('🔍 ApiService: Probando conectividad con servidor...');
      // Probar primero con un endpoint básico sin autenticación
      const response = await axios.get('http://192.168.1.204:1337/_health', {
        timeout: 5000
      });
      console.log('✅ ApiService: Conectividad OK con _health, respuesta:', response.status);
      return response;
    } catch (healthError) {
      console.log('⚠️ ApiService: _health falló, probando con pacientes...');
      try {
        // Si falla health, probar con pacientes (puede dar 401 pero eso significa que conecta)
        const response = await this.client.get('/api/pacientes');
        console.log('✅ ApiService: Conectividad OK con pacientes, respuesta:', response.status);
        return response;
      } catch (error) {
        console.error('❌ ApiService: Error de conectividad total:', error);
        throw error;
      }
    }
  }
}
