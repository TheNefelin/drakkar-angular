// Servicio de negocio para el formulario de contacto.
import { generateReferenceCode, stringValue, validateContactFields } from '@server/email/helpers';
import { getZohoConfig } from '../config';
import { ZohoClient } from '../email/zoho.client';
import { renderConfirmationEmail, renderLeadEmail } from '../email/templates';
// Brevo (`brevo.client.ts`) quedó desconectado como referencia para otros proyectos.

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

    // Validación server-side: name, email y phone.
    const contactError = validateContactFields(data.name, data.email, data.phone);

    if (contactError) {
      return {
        status: 400,
        body: { detail: contactError },
      };
    }

    if (data.message.length < 5) {
      return {
        status: 400,
        body: { detail: 'Cuéntanos un poco más (mínimo 5 caracteres).' },
      };
    }

    if (data.message.length > 500) {
      return {
        status: 400,
        body: { detail: 'El mensaje no puede superar los 500 caracteres.' },
      };
    }

    let zoho: ReturnType<typeof getZohoConfig>;

    // Obtiene la configuración; falla explícito con 500 si faltan vars.
    try {
      zoho = getZohoConfig();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: 500,
        body: { detail: message },
      };
    }
    const client = new ZohoClient();
    const reference = generateReferenceCode();

    // Paso 1: enviar los datos del lead a Transportes Drakar.
    const leadResult = await client.send({
      to: zoho.ZOHO_SENDER_EMAIL,
      subject: `Nuevo contacto [${reference}] desde la landing: ${data.name}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: 'Contacto',
      details: data.message,
    }, renderLeadEmail({
      ...data,
      service: 'Contacto',
      details: data.message,
      reference,
    }));

    if (!leadResult.ok) {
      return {
        status: 502,
        body: { detail: leadResult.error ?? 'No se pudo enviar el correo.' },
      };
    }

    // Paso 2: enviar confirmación al visitante. Si falla, el lead ya fue recibido.
    const confirmationResult = await client.send(
      {
        to: data.email,
        subject: `Recibimos tu mensaje [${reference}] — Transportes Drakar`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: 'Contacto',
        details: data.message,
      },
      renderConfirmationEmail(data.name, reference),
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
