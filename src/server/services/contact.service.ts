// Servicio de negocio para el formulario de contacto.
import { getBrevoConfig } from '../config';
import { BrevoClient } from '../email/brevo.client';
import { renderConfirmationEmail, renderLeadEmail } from '../email/templates';

interface ContactRequestInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
}

interface ContactRequestData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactResponse {
  status: number;
  body: {
    detail: string;
    visitorNotified?: boolean;
  };
}

// Devuelve cadena vacía si el valor no es texto; si lo es, hace trim.
function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export class ContactService {
  // Implementa el flujo completo de contacto.
  async send(body: ContactRequestInput): Promise<ContactResponse> {
    // Antes de enviar valida que el body sea texto usable.
    const data: ContactRequestData = {
      name: stringValue(body.name),
      email: stringValue(body.email),
      phone: stringValue(body.phone),
      message: stringValue(body.message),
    };

    // Validación server-side: los 4 campos son obligatorios.
    if (!data.name || !data.email || !data.phone || !data.message) {
      return {
        status: 400,
        body: { detail: 'Faltan campos obligatorios.' },
      };
    }

    let brevo: ReturnType<typeof getBrevoConfig>;

    // Obtiene la configuración; falla explícito con 500 si faltan vars.
    try {
      brevo = getBrevoConfig();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: 500,
        body: { detail: message },
      };
    }
    const brevoClient = new BrevoClient();

    // Paso 1: enviar los datos del lead a Transportes Drakar.
    const leadResult = await brevoClient.send({
      to: brevo.brevoSenderEmail,
      subject: `Nuevo contacto desde la landing: ${data.name}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: 'Contacto',
      details: data.message,
    }, renderLeadEmail({
      ...data,
      service: 'Contacto',
      details: data.message,
    }));

    if (!leadResult.ok) {
      return {
        status: 502,
        body: { detail: leadResult.error ?? 'No se pudo enviar el correo.' },
      };
    }

    // Paso 2: enviar confirmación al visitante. Si falla, el lead ya fue recibido.
    const confirmationResult = await brevoClient.send(
      {
        to: data.email,
        subject: 'Recibimos tu mensaje — Drakar Transportes',
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: 'Contacto',
        details: data.message,
      },
      renderConfirmationEmail(data.name),
    );

    return {
      status: 200,
      body: {
        detail: 'Mensaje enviado.',
        visitorNotified: confirmationResult.ok,
      },
    };
  }
}
