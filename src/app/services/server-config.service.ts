import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ServerConfigService {
  private detectedServerUrl: string | null = null;

  private readonly serverCandidates = [
    // Producción (cuando esté desplegado en Heroku)
    'https://tu-app-encuestas.herokuapp.com',
    
    // Red local - diferentes rangos comunes
    'http://192.168.1.204:1337',  // Red actual
    'http://192.168.0.204:1337',  // Red común tipo router 
    'http://10.0.0.204:1337',     // Red corporativa
    'http://172.16.0.204:1337',   // Red VPN común
    
    // Localhost (desarrollo)
    'http://localhost:1337',
    'http://127.0.0.1:1337'
  ];

  async detectServer(): Promise<string> {
    // Si ya detectamos uno, usarlo
    if (this.detectedServerUrl) {
      return this.detectedServerUrl;
    }

    console.log('🔍 Detectando servidor disponible...');

    for (const serverUrl of this.serverCandidates) {
      try {
        console.log(`⏳ Probando: ${serverUrl}`);
        
        // Probar conectividad con timeout corto
        const response = await axios.get(`${serverUrl}`, {
          timeout: 3000,
          headers: { 'Accept': 'text/html,application/json' }
        });

        if (response.status === 200) {
          console.log(`✅ Servidor encontrado: ${serverUrl}`);
          this.detectedServerUrl = serverUrl;
          return serverUrl;
        }
      } catch (error) {
        console.log(`❌ No disponible: ${serverUrl}`);
        continue;
      }
    }

    // Si no encuentra ninguno, usar el primero como fallback
    console.log('⚠️ Ningún servidor detectado, usando Heroku como fallback');
    this.detectedServerUrl = this.serverCandidates[0];
    return this.detectedServerUrl;
  }

  async testServerConnection(serverUrl: string): Promise<boolean> {
    try {
      const response = await axios.get(`${serverUrl}/api/pacientes`, {
        timeout: 5000,
        validateStatus: (status) => status === 200 || status === 401 || status === 403
      });
      return response.status === 200 || response.status === 401 || response.status === 403;
    } catch (error) {
      return false;
    }
  }

  getDetectedServer(): string | null {
    return this.detectedServerUrl;
  }

  resetDetection(): void {
    this.detectedServerUrl = null;
  }
}