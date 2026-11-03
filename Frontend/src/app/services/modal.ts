import { Service, signal } from '@angular/core';
import IModal from '../interfaces/Modal';

@Service()
export class Modal {
  estado = signal<IModal | null>(null);

  exito(titulo: string, mensaje: string) {
    this.estado.set({ tipo: 'exito', titulo, mensaje });
  }

  error(titulo: string, mensaje: string | string[]) {
    this.estado.set({ tipo: 'error', titulo, mensaje });
  }

  errorHttp(error: any, titulo: string) {
    if (error.status === 0) {
      this.error('Se voló la carpa', 'No se pudo conectar con el servidor');
      return;
    }
    this.error(titulo, error.error?.message ?? 'Ocurrió un error inesperado. Intentá de nuevo en unos minutos.');
  }

  confirmar(titulo: string, mensaje: string, textoBoton: string, alConfirmar: () => void) {
    this.estado.set({ tipo: 'confirmar', titulo, mensaje, textoBoton, alConfirmar });
  }

  aceptar() {
    const alConfirmar = this.estado()?.alConfirmar;
    this.cerrar();
    alConfirmar?.();
  }

  cerrar() {
    this.estado.set(null);
  }
}
