import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, ToastController } from '@ionic/angular';
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
  @ViewChild('modalEditar') modalEditar!: IonModal;

  pacientes: any[] = [];
  pacienteSeleccionado: any = null;
  pacienteEditando: any = {};

  constructor(private api: ApiService, private router: Router, private auth: AuthService, private toastCtrl: ToastController) { }

  async ngOnInit() {
    try {
      const res = await this.api.get('pacientes');
      this.pacientes = res.data.data || [];
    } catch (error) {
      console.error('Error cargando pacientes', error);
      // si no se autoriza redirigir al login
      this.router.navigateByUrl('/home');
    }
  }

  async eliminar(documentId: string, estado: boolean) {
    try {
      await this.api.put(`pacientes/${documentId}`, { data: { estado: !estado } });
      // update local state
      const idx = this.pacientes.findIndex(p => p.documentId === documentId);
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

  // Funciones para el modal de edición
  abrirModalEditar(paciente: any) {
    this.pacienteSeleccionado = paciente;
    // Crear una copia para editar (evitar mutar el original)
    this.pacienteEditando = { ...paciente };
    this.modalEditar.present();
  }

  cerrarModalEditar() {
    this.modalEditar.dismiss();
    this.pacienteSeleccionado = null;
    this.pacienteEditando = {};
  }

  get formularioValido(): boolean {
    return !!(this.pacienteEditando.nombre && 
              this.pacienteEditando.Apellido &&
              this.pacienteEditando.nombre.trim() !== '' &&
              this.pacienteEditando.Apellido.trim() !== '');
  }

  async guardarCambios() {
    if (!this.formularioValido) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa los campos requeridos',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    try {
      const pacienteId = this.pacienteSeleccionado.documentId;
      
      if (!pacienteId) {
        throw new Error('No se encontró documentId del paciente');
      }
      
      const datosActualizados = {
        data: {
          nombre: this.pacienteEditando.nombre?.trim(),
          Apellido: this.pacienteEditando.Apellido?.trim(),
          Peso: this.pacienteEditando.Peso ? Number(this.pacienteEditando.Peso) : null,
          Estatura: this.pacienteEditando.Estatura ? Number(this.pacienteEditando.Estatura) : null,
          Edad: this.pacienteEditando.Edad ? Number(this.pacienteEditando.Edad) : null,
          Diabetes: !!this.pacienteEditando.Diabetes,
          Hipertencion: !!this.pacienteEditando.Hipertencion
        }
      };
      
      const endpoint = `pacientes/${pacienteId}`;
      const response = await this.api.put(endpoint, datosActualizados);

      // Actualizar el paciente en la lista local
      const index = this.pacientes.findIndex(p => p.documentId === pacienteId);
      
      if (index >= 0) {
        const datosActualizadosLocal = response.data?.data || this.pacienteEditando;
        this.pacientes[index] = { ...this.pacientes[index], ...datosActualizadosLocal };
      }

      
      const toast = await this.toastCtrl.create({
        message: 'Paciente actualizado correctamente',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();

      
      this.cerrarModalEditar();

    } catch (error: any) {
      console.error('Error actualizando paciente:', error);
      
      const toast = await this.toastCtrl.create({
        message: 'Error al actualizar el paciente. Inténtalo de nuevo.',
        duration: 3000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
}
