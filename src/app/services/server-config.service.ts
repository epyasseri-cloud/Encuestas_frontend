import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ServerConfigService {
  private serverUrl: string = '';

  constructor() { }

  async detectServer(): Promise<string> {
    if (this.serverUrl) {
      return this.serverUrl;
    }

    console.log('🔍 Buscando servidor Strapi en la red local...');

    // IPs más comunes para probar (actualizada con tu IP actual)
    const ipsToTest = [
      '192.168.1.204',  // Tu IP actual (primera prioridad)
      'localhost',
      '127.0.0.1',
      '192.168.0.204',  
      '192.168.1.1',
      '192.168.0.1',
      '10.0.0.1',
    ];

    for (const ip of ipsToTest) {
      const testUrl = `http://${ip}:1337`;
      try {
        console.log(`⏳ Probando: ${testUrl}`);

        // A backend may respond 404 on /api root but still be up.
        // Accept any response < 500 as "available" using validateStatus.
        const resRoot = await axios.get(testUrl + '/', {
          timeout: 2000,
          validateStatus: (status) => status < 500,
        }).catch(() => null);

        // Also try the common Strapi path /api
        const resApi = await axios.get(testUrl + '/api', {
          timeout: 2000,
          validateStatus: (status) => status < 500,
        }).catch(() => null);

        if (resRoot || resApi) {
          this.serverUrl = testUrl;
          console.log(`✅ ¡Servidor encontrado! ${testUrl}`);
          return testUrl;
        }

        console.log(`❌ No disponible (respuesta inválida): ${testUrl}`);
      } catch (error) {
        // Network / CORS / DNS errors end up here
        console.log(`❌ No disponible: ${testUrl}`);
      }
    }

    // Si no encuentra nada, usar localhost
    const fallback = 'http://localhost:1337';
    console.log(`⚠️ Usando localhost por defecto: ${fallback}`);
    this.serverUrl = fallback;
    return fallback;
  }

  resetDetection() {
    this.serverUrl = '';
  }
}