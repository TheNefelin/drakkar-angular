// Configuración del servidor (BFF). Solo proceso del Node, nunca del cliente.

export interface ServerConfig {
  brevoApiKey: string;
  brevoSenderEmail: string;
  brevoSenderName: string;
}

export const config: ServerConfig = {
  brevoApiKey: process.env['BREVO_API_KEY'] ?? '',
  brevoSenderEmail: process.env['BREVO_SENDER_EMAIL'] ?? '',
  brevoSenderName: process.env['BREVO_SENDER_NAME'] ?? '',
};

export function getConfig(): ServerConfig {
  return config;
}
