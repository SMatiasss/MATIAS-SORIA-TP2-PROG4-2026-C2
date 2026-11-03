export default interface IUsuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  imagenUrl: string | null;
  perfil: 'usuario' | 'administrador';
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICrearUsuario {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  contrasena: string;
  fechaNacimiento: string;
  descripcion: string;
  imagen: File | null;
}

export interface ILogin {
  usuario: string;
  contrasena: string;
}

export interface IActualizarPerfil {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  descripcion: string;
}

export interface ISesion {
  token: string;
  usuario: IUsuario;
}
