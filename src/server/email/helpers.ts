// Helpers reutilizables para los servicios de email.
import { randomBytes } from 'node:crypto';

// Genera un código de seguimiento sortable en UTC.
export function generateReferenceCode(): string {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `DK-${stamp}-${suffix}`;
}

// Devuelve cadena vacía si el valor no es texto; si lo es, hace trim.
export function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// Valida los campos comunes de contacto (name, email, phone).
export function validateContactFields(name: string, email: string, phone: string): string | null {
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]{0,99}$/u.test(name)) {
    return 'El nombre solo puede contener letras, espacios, guiones o apóstrofes.';
  }

  const emailValid = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(email);

  if (!emailValid) {
    return 'Ingresa un correo válido.';
  }

  if (email.length > 254) {
    return 'El correo es demasiado largo.';
  }

  if (!/^\d{11}$/.test(phone)) {
    return 'Ingresa un teléfono válido de 11 dígitos.';
  }

  return null;
}
