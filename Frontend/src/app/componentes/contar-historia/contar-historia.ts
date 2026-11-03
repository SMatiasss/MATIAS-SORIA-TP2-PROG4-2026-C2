import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Campo } from '../campo/campo';
import { CampoImagen } from '../campo-imagen/campo-imagen';
import { PublicacionesService } from '../../services/publicaciones';
import { Modal } from '../../services/modal';
import { imagenValida } from '../../validators/validadores';
import { ICrearPublicacion } from '../../interfaces/Publicacion';

@Component({
  imports: [ReactiveFormsModule, Campo, CampoImagen],
  selector: 'app-contar-historia',
  templateUrl: './contar-historia.html',
  host: { class: 'panel' },
})
export class ContarHistoria {
  formBuilder = inject(FormBuilder);
  servicio = inject(PublicacionesService);
  modal = inject(Modal);

  contada = output();
  cancelar = output();

  enviando = signal(false);
  suscripcion?: Subscription;

  formulario = this.formBuilder.group({
    titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(60)]],
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(400)]],
    imagen: new FormControl<File | null>(null, [imagenValida]),
  });

  contar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.suscripcion = this.servicio.crear(this.formulario.value as ICrearPublicacion).subscribe({
      next: () => {
        this.modal.exito('Historia contada', 'Tu historia ya brilla como una estrella nueva en el cielo.');
        this.contada.emit();
      },
      error: (error) => {
        this.enviando.set(false);
        this.modal.errorHttp(error, 'No pudimos contar tu historia');
      },
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }
}
