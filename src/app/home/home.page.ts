import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../services/api.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  email = '';
  password = '';

  constructor(private router: Router, private toastCtrl: ToastController, private api: ApiService) {}

  async login() {
    console.log('🏠 HomePage: Iniciando proceso de login...');
    
    if (!this.email || !this.password) {
      console.log('❌ HomePage: Faltan datos - email:', this.email, 'password:', !!this.password);
      const t = await this.toastCtrl.create({ message: 'Completa email y contraseña', duration: 2000, color: 'warning' });
      await t.present();
      return;
    }

    console.log('🔐 HomePage: Intentando login con datos:', { email: this.email, hasPassword: !!this.password });

    try {
      const response = await this.api.login(this.email, this.password);
      console.log('✅ HomePage: Login exitoso:', response.data);
      const t = await this.toastCtrl.create({ message: 'Inicio de sesión correcto', duration: 1200, color: 'success' });
      await t.present();
      this.router.navigateByUrl('/pacientes');
    } catch (error: any) {
      console.error('❌ HomePage: Error de login completo:', error);
      console.error('❌ HomePage: Error response:', error?.response);
      console.error('❌ HomePage: Error message:', error?.message);
      console.error('❌ HomePage: Error status:', error?.response?.status);
      const t = await this.toastCtrl.create({ message: 'Usuario o contraseña incorrectos', duration: 2500, color: 'danger' });
      await t.present();
    }
  }

  async testConnection() {
    console.log('🔍 HomePage: Iniciando test de conectividad...');
    
    try {
      const response = await this.api.testConnection();
      console.log('✅ HomePage: Test de conectividad exitoso:', response.status);
      const t = await this.toastCtrl.create({ 
        message: `Conectividad OK - Status: ${response.status}`, 
        duration: 2000, 
        color: 'success' 
      });
      await t.present();
    } catch (error: any) {
      console.error('❌ HomePage: Error en test de conectividad:', error);
      console.error('❌ HomePage: Error response:', error?.response);
      console.error('❌ HomePage: Error message:', error?.message);
      const t = await this.toastCtrl.create({ 
        message: `Error de conectividad: ${error?.message || 'Sin conexión'}`, 
        duration: 3000, 
        color: 'danger' 
      });
      await t.present();
    }
  }
}

