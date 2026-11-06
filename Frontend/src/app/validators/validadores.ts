import { ValidatorFn } from '@angular/forms';

// Exige dominio con punto, igual que el IsEmail del back (Validators.email acepta "a@b").
export const correoValido: ValidatorFn = (control) =>
  !control.value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(control.value) ? null : { email: true };

export const contrasenaSegura: ValidatorFn = (control) => {
  const valor: string = control.value ?? '';
  if (!valor) return null;
  if (!/[A-Z]/.test(valor)) return { mayuscula: true };
  if (!/\d/.test(valor)) return { numero: true };
  return null;
};

export const coincideCon =
  (otroCampo: string): ValidatorFn =>
  (control) =>
    control.parent && control.value !== control.parent.get(otroCampo)?.value
      ? { coincidencia: true }
      : null;

const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp'];

export const imagenValida: ValidatorFn = (control) => {
  const archivo: File | null = control.value;
  if (!archivo) return null;
  if (!TIPOS_IMAGEN.includes(archivo.type)) return { tipoImagen: true };
  if (archivo.size > 1024 * 1024) return { pesoImagen: true };
  return null;
};

// Igual que en el back: entre 3 y 20 caracteres sin contar los espacios de los bordes.
export const DE_3_A_20 = /^\s*\S.{1,18}\S\s*$/;

// "en-CA" da la fecha local como AAAA-MM-DD, el mismo formato que devuelve <input type="date">.
export const fechaHaceAnios = (anios: number) => {
  const fecha = new Date();
  fecha.setFullYear(fecha.getFullYear() - anios);
  return fecha.toLocaleDateString('en-CA');
};

export const edadPermitida: ValidatorFn = (control) => {
  if (!control.value) return null;
  if (control.value > fechaHaceAnios(13)) return { menorDe13: true };
  if (control.value < fechaHaceAnios(120)) return { mayorDe120: true };
  return null;
};
