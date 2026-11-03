import { hashear, verificar } from './contrasena.js';

describe('contrasena', () => {
  it('verifica la contraseña correcta y rechaza otra', async () => {
    const guardada = await hashear('Secreta123');
    expect(guardada).not.toContain('Secreta123');
    expect(await verificar('Secreta123', guardada)).toBe(true);
    expect(await verificar('secreta123', guardada)).toBe(false);
  });

  it('usa una sal distinta en cada hash', async () => {
    expect(await hashear('Secreta123')).not.toBe(await hashear('Secreta123'));
  });
});
