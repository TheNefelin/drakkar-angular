// Hosts confiables para Angular SSR.
// Se leen desde la variable de entorno NG_ALLOWED_HOSTS; no hay fallback hardcodeado.

export function getAllowedHosts(): string[] {
  const raw = process.env['NG_ALLOWED_HOSTS'];

  if (!raw) {
    throw new Error(
      'NG_ALLOWED_HOSTS no está definida. ' +
      'Ejemplo: NG_ALLOWED_HOSTS=localhost,127.0.0.1',
    );
  }

  const hosts = raw
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  if (!hosts.length) {
    throw new Error('NG_ALLOWED_HOSTS está definida, pero no contiene hosts válidos.');
  }

  return hosts;
}
