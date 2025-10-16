import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.page.html',
  styleUrls: ['./pacientes.page.scss'],
  standalone: false,
})
export class PacientesPage implements OnInit {
  @ViewChild('modalPaciente') modal!: IonModal;

  pacientes: any[] = [];
  pacienteSeleccionado: any = null;

  constructor(private api: ApiService, private router: Router, private auth: AuthService) { }

  async ngOnInit() {
    try {
      const res = await this.api.get('pacientes');
      this.pacientes = res.data.data || [];
    } catch (error) {
      console.error('Error cargando pacientes', error);
      // If unauthorized, redirect to login
      this.router.navigateByUrl('/home');
    }
  }

  async eliminar(documentId: string, estado: boolean) {
    try {
      await this.api.put(`pacientes/${documentId}`, { data: { estado: !estado } });
      // update local state
      const idx = this.pacientes.findIndex(p => p.id === documentId || p.documentId === documentId);
      if (idx >= 0) this.pacientes[idx].estado = !estado;
    } catch (error) {
      console.error('Error actualizando paciente', error);
    }
  }

  logout() {
    this.auth.clearAll();
    this.router.navigateByUrl('/home');
  }

  abrirModal(paciente: any) {
    this.pacienteSeleccionado = paciente;
    this.modal.present();
  }

  cerrarModal() {
    this.modal.dismiss();
    this.pacienteSeleccionado = null;
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
}
