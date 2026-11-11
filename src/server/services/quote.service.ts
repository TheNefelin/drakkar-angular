// Servicio de negocio para la cotización tentativa.
import { getBrevoConfig } from '@server/config';
import { BrevoClient } from '@server/email/brevo.client';
import { renderQuoteEmail, type QuoteEmailData } from '@server/email/templates';
import { generateReferenceCode, stringValue, validateContactFields } from '@server/email/helpers';

interface QuoteRequestInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  origin?: unknown;
  destination?: unknown;
  service?: unknown;
  weight?: unknown;
  volume?: unknown;
  km?: unknown;
  baseRate?: unknown;
  costDistance?: unknown;
  costWeight?: unknown;
  costVolume?: unknown;
  total?: unknown;
}

interface QuoteRequestData {
  name: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  service: string;
  weight: number;
  volume: number;
  km: number;
  baseRate: number;
  costDistance: number;
  costWeight: number;
  costVolume: number;
  total: number;
}

interface QuoteResponse {
  status: number;
  body: {
    detail: string;
    visitorNotified?: boolean;
    reference?: string;
  };
}

// Convierte cualquier valor de entrada a número no negativo.
function numberValue(value: unknown): number | null {
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isFinite(n) || n < 0) {
    return null;
  }
  return n;
}

export class QuoteService {
  // Envía la cotización tentativa a Drakar y al cliente.
  async send(body: QuoteRequestInput): Promise<QuoteResponse> {
    const name = stringValue(body.name);
    const email = stringValue(body.email);
    const phone = stringValue(body.phone);
    const origin = stringValue(body.origin);
    const destination = stringValue(body.destination);
    const service = stringValue(body.service);

    // Validación server-side: nombres, email, teléfono y origen/destino.
    const contactError = validateContactFields(name, email, phone);

    if (contactError) {
      return {
        status: 400,
        body: { detail: contactError },
      };
    }

    if (!origin) {
      return {
        status: 400,
        body: { detail: 'El origen es obligatorio.' },
      };
    }

    if (!destination) {
      return {
        status: 400,
        body: { detail: 'El destino es obligatorio.' },
      };
    }

    if (!service) {
      return {
        status: 400,
        body: { detail: 'El servicio es obligatorio.' },
      };
    }

    const weight = numberValue(body.weight);
    const volume = numberValue(body.volume);
    const km = numberValue(body.km);
    const baseRate = numberValue(body.baseRate);
    const costDistance = numberValue(body.costDistance);
    const costWeight = numberValue(body.costWeight);
    const costVolume = numberValue(body.costVolume);
    const total = numberValue(body.total);

    if (weight === null || volume === null || km === null || baseRate === null ||
        costDistance === null || costWeight === null || costVolume === null || total === null) {
      return {
        status: 400,
        body: { detail: 'Los valores numéricos son inválidos.' },
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
    const reference = generateReferenceCode();

    const emailData: QuoteEmailData = {
      name,
      email,
      phone,
      origin,
      destination,
      service,
      weight,
      volume,
      km,
      baseRate,
      costDistance,
      costWeight,
      costVolume,
      total,
      reference,
    };

    // Paso 1: enviar la cotización a Transportes Drakar.
    const leadResult = await brevoClient.send(
      {
        to: brevo.BREVO_SENDER_EMAIL,
        subject: `Cotización [${reference}]: ${name}`,
        name,
        email,
        phone,
        service,
        details: `${origin} → ${destination}`,
      },
      renderQuoteEmail(emailData, 'business'),
    );

    if (!leadResult.ok) {
      return {
        status: 502,
        body: { detail: leadResult.error ?? 'No se pudo enviar la cotización.' },
      };
    }

    // Paso 2: enviar confirmación al visitante. Si falla, la cotización ya fue recibida.
    const confirmationResult = await brevoClient.send(
      {
        to: email,
        subject: `Recibimos tu cotización [${reference}] — Transportes Drakar`,
        name,
        email,
        phone,
        service,
        details: `${origin} → ${destination}`,
      },
      renderQuoteEmail(emailData, 'customer'),
    );

    return {
      status: 200,
      body: {
        detail: 'Cotización enviada.',
        visitorNotified: confirmationResult.ok,
        reference,
      },
    };
  }
}
