// Configuración del servidor (BFF). Solo proceso de Node, nunca del cliente.

try {
  // Carga .env si existe. Las variables ya definidas en el entorno tienen prioridad.
  process.loadEnvFile();
} catch {
  // Sin archivo .env: se usan las variables del proceso.
}

export interface ServerConfig {
  API_URL: string;
  API_KEY: string;
  BREVO_API_URL:string;
  BREVO_API_KEY: string;
  BREVO_SENDER_EMAIL: string;
  BREVO_SENDER_NAME: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno del servidor: ${name}. ` +
      'Defínela en la configuración del entorno del servidor.',
    );
  }
  return value;
}

export function getExternalApiConfig(): Pick<ServerConfig, 'API_URL' | 'API_KEY'> {
  return {
    API_URL: required('API_URL').replace(/\/+$/, ''),
    API_KEY: required('API_KEY'),
  };
}

export function getBrevoConfig(): Pick<ServerConfig, 'BREVO_API_URL' | 'BREVO_API_KEY' | 'BREVO_SENDER_EMAIL' | 'BREVO_SENDER_NAME'> {
  return {
    BREVO_API_URL: required('BREVO_API_URL'),
    BREVO_API_KEY: required('BREVO_API_KEY'),
    BREVO_SENDER_EMAIL: required('BREVO_SENDER_EMAIL'),
    BREVO_SENDER_NAME: required('BREVO_SENDER_NAME'),
  };
}
