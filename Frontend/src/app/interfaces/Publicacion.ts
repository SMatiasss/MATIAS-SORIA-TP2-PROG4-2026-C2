export default interface IPublicacion {
  _id: string;
  autor: IAutor;
  titulo: string;
  mensaje: string;
  imagenUrl: string | null;
  meGusta: IMeGusta[];
  cantidadMeGusta: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAutor {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenUrl: string | null;
}

export interface IMeGusta {
  usuario: string;
  fecha: string;
}

export interface ICrearPublicacion {
  titulo: string;
  mensaje: string;
  imagen: File | null;
}

export interface IComentario {
  _id: string;
  publicacion: string;
  autor: IAutor;
  mensaje: string;
  modificado: boolean;
  createdAt: string;
}
