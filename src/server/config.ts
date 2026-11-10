// Configuración del servidor (BFF). Solo proceso de Node, nunca del cliente.

try {
  // Carga .env si existe. Las variables ya definidas en el entorno tienen prioridad.
  process.loadEnvFile();
} catch {
  // Sin archivo .env: se usan las variables del proceso.
}

export interface ServerConfig {
  PORTFOLIO_API_URL: string;
  PORTFOLIO_API_KEY: string;
  brevoApiKey: string;
  brevoSenderEmail: string;
  brevoSenderName: string;
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

export function getPortfolioConfig(): Pick<ServerConfig, 'PORTFOLIO_API_URL' | 'PORTFOLIO_API_KEY'> {
  return {
    PORTFOLIO_API_URL: required('PORTFOLIO_API_URL').replace(/\/+$/, ''),
    PORTFOLIO_API_KEY: required('PORTFOLIO_API_KEY'),
  };
}

export function getBrevoConfig(): Pick<ServerConfig, 'brevoApiKey' | 'brevoSenderEmail' | 'brevoSenderName'> {
  return {
    brevoApiKey: required('BREVO_API_KEY'),
    brevoSenderEmail: required('BREVO_SENDER_EMAIL'),
    brevoSenderName: required('BREVO_SENDER_NAME'),
  };
}
