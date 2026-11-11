// Adaptador para Zoho Mail API (OAuth 2.0, refresh_token).
// Sin dependencias: fetch nativo + refresco de token cacheado en memoria.
import { getZohoConfig } from '@server/config';

export interface ZohoEmailMessage {
  to: string;
  subject: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  details: string;
}

export interface ZohoEmailResult {
  ok: boolean;
  error?: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

// Caché en memoria del access token (se renueva con el refresh_token).
let cachedToken: CachedToken | null = null;

interface AccessTokenSuccess {
  ok: true;
  token: string;
}

interface AccessTokenFailure {
  ok: false;
  error: string;
}

// Obtiene un access token válido, renovándolo con el refresh_token si hace falta.
async function getAccessToken(): Promise<AccessTokenSuccess | AccessTokenFailure> {
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return { ok: true, token: cachedToken.token };
  }

  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = getZohoConfig();

  try {
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        refresh_token: ZOHO_REFRESH_TOKEN,
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok || typeof data['access_token'] !== 'string') {
      const detail = typeof data['error'] === 'string' ? ` (${data['error']})` : '';
      return { ok: false, error: `Zoho no emitió access_token (HTTP ${response.status})${detail}.` };
    }

    const expiresIn = Number(data['expires_in'] ?? 3600);
    cachedToken = {
      token: data['access_token'],
      expiresAt: now + (Number.isFinite(expiresIn) ? expiresIn : 3600) * 1000,
    };

    return { ok: true, token: data['access_token'] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Zoho inalcanzable al renovar token: ${message}` };
  }
}

export class ZohoClient {
  // Envía un correo usando Zoho Mail API. Credenciales solo en servidor.
  async send(payload: ZohoEmailMessage, htmlContent: string): Promise<ZohoEmailResult> {
    const token = await getAccessToken();

    if (!token.ok) {
      return { ok: false, error: token.error };
    }

    const { ZOHO_ACCOUNT_ID, ZOHO_SENDER_EMAIL } = getZohoConfig();
    const url = `https://mail.zoho.com/api/accounts/${encodeURIComponent(ZOHO_ACCOUNT_ID)}/messages`;

    const body = {
      fromAddress: ZOHO_SENDER_EMAIL,
      toAddress: payload.to,
      subject: payload.subject,
      content: htmlContent,
      mailFormat: 'html',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Zoho-oauthtoken ${token.token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        return { ok: false, error: `Zoho respondió ${response.status}: ${text.slice(0, 200)}` };
      }

      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  }
}
