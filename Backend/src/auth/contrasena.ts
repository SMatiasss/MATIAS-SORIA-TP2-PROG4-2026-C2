import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// Esto no lo hice yo, es para el hasheo de la contraseña.
const derivar = promisify(scrypt) as (clave: string, sal: string, largo: number) => Promise<Buffer>;
const LARGO = 64;

// Se guarda como "sal:hash" (hex) en un solo campo.
export async function hashear(contrasena: string) {
  const sal = randomBytes(16).toString('hex');
  return `${sal}:${(await derivar(contrasena, sal, LARGO)).toString('hex')}`;
}

export async function verificar(contrasena: string, guardada: string) {
  const [sal, hash] = guardada.split(':');
  const calculado = await derivar(contrasena, sal, LARGO);
  return timingSafeEqual(calculado, Buffer.from(hash, 'hex'));
}
