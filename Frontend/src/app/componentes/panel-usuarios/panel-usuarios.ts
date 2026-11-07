import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Avatar } from '../avatar/avatar';
import { Campo } from '../campo/campo';
import { CampoImagen } from '../campo-imagen/campo-imagen';
import { Confirmar } from '../../directivas/confirmar';
import { Inactivo } from '../../directivas/inactivo';
import { PluralPipe } from '../../pipes/plural-pipe';
import { UsuariosService } from '../../services/usuarios';
import { Modal } from '../../services/modal';
import IUsuario, { IAltaUsuario } from '../../interfaces/Usuario';
import {
  coincideCon,
  contrasenaSegura,
  correoValido,
  DE_3_A_20,
  edadPermitida,
  fechaHaceAnios,
  imagenValida,
} from '../../validators/validadores';

// Los que entran en el panel blanco de la pizarra sin desplazarse.
const POR_PAGINA = 6;

@Component({
  imports: [ReactiveFormsModule, Avatar, Campo, CampoImagen, Confirmar, Inactivo, PluralPipe],
  selector: 'app-panel-usuarios',
  styleUrl: './panel-usuarios.css',
  templateUrl: './panel-usuarios.html',
})
export class PanelUsuarios {
  servicio = inject(UsuariosService);
  modal = inject(Modal);
  formBuilder = inject(FormBuilder);

  usuarios = signal<IUsuario[]>([]);
  total = signal(0);
  pagina = signal(1);
  // cargando, listo o error
  estado = signal('cargando');
  // listado o formulario: en la pizarra no entran juntos, así que el formulario reemplaza al listado.
  vista = signal('listado');
  enviando = signal(false);
  suscripcion?: Subscription;
  suscripcionContrasena: Subscription;
  fechaMaxima = fechaHaceAnios(13);
  fechaMinima = fechaHaceAnios(120);

  // Los mismos campos y validaciones que el registro, más el perfil que elige el administrador.
  formulario = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.pattern(DE_3_A_20)]],
    apellido: ['', [Validators.required, Validators.pattern(DE_3_A_20)]],
    nombreUsuario: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9_.]+$/),
      ],
    ],
    fechaNacimiento: ['', [Validators.required, edadPermitida]],
    correo: ['', [Validators.required, correoValido]],
    contrasena: ['', [Validators.required, Validators.minLength(8), contrasenaSegura]],
    repetirContrasena: ['', [Validators.required, coincideCon('contrasena')]],
    descripcion: ['', [Validators.maxLength(200)]],
    imagen: new FormControl<File | null>(null, [imagenValida]),
    perfil: ['usuario', [Validators.required]],
  });

  constructor() {
    // Igual que en el registro: si cambia la contraseña, se vuelve a validar "Repetir contraseña".
    this.suscripcionContrasena = this.formulario.controls.contrasena.valueChanges.subscribe(() =>
      this.formulario.controls.repetirContrasena.updateValueAndValidity(),
    );
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.estado.set('cargando');
    this.suscripcion = this.servicio.listar((this.pagina() - 1) * POR_PAGINA, POR_PAGINA).subscribe({
      next: (respuesta) => {
        this.usuarios.set(respuesta.usuarios);
        this.total.set(respuesta.total);
        this.estado.set('listo');
      },
      error: (error) => {
        this.estado.set('error');
        this.modal.errorHttp(error, 'No pudimos traer los usuarios');
      },
    });
  }

  paginas() {
    return Math.max(1, Math.ceil(this.total() / POR_PAGINA));
  }

  irA(pagina: number) {
    this.pagina.set(pagina);
    this.cargar();
  }

  // Baja o alta lógica: el usuario nunca se borra.
  cambiarActivo(usuario: IUsuario) {
    const pedido = usuario.activo ? this.servicio.deshabilitar(usuario._id) : this.servicio.habilitar(usuario._id);
    this.suscripcion = pedido.subscribe({
      next: (actualizado) => {
        this.usuarios.update((lista) => lista.map((u) => (u._id === actualizado._id ? actualizado : u)));
        if (actualizado.activo) {
          this.modal.exito('Usuario habilitado', `@${actualizado.nombreUsuario} puede volver a entrar al campamento.`);
        } else {
          this.modal.exito('Usuario deshabilitado', `@${actualizado.nombreUsuario} ya no puede entrar al campamento.`);
        }
      },
      error: (error) => this.modal.errorHttp(error, 'No pudimos cambiar el estado del usuario'),
    });
  }

  crear() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.suscripcion = this.servicio.crear(this.formulario.value as IAltaUsuario).subscribe({
      next: (usuario) => {
        this.enviando.set(false);
        const perfil = usuario.perfil === 'administrador' ? 'administrador' : 'usuario';
        this.modal.exito('Usuario creado', `@${usuario.nombreUsuario} ya es parte del campamento como ${perfil}.`);
        // reset() deja en null lo que no se nombra: la descripción es opcional y se mandaría el texto "null".
        this.formulario.reset({ perfil: 'usuario', descripcion: '' });
        this.vista.set('listado');
        this.irA(1);
      },
      error: (error) => {
        this.enviando.set(false);
        this.modal.errorHttp(error, 'No pudimos crear el usuario');
      },
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
    this.suscripcionContrasena.unsubscribe();
  }
}
