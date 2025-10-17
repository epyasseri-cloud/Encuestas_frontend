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
    if (!this.email || !this.password) {
      const t = await this.toastCtrl.create({ message: 'Completa email y contraseña', duration: 2000, color: 'warning' });
      await t.present();
      return;
    }

    try {
      const response = await this.api.login(this.email, this.password);
      const t = await this.toastCtrl.create({ message: 'Inicio de sesión correcto', duration: 1200, color: 'success' });
      await t.present();
      this.router.navigateByUrl('/pacientes');
    } catch (error: any) {
      const t = await this.toastCtrl.create({ message: 'Usuario o contraseña incorrectos', duration: 2500, color: 'danger' });
      await t.present();
    }
  }
}

