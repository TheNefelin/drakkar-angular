# Sesión

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Evaluación y planificación de migración de envío de correo: Brevo → Zoho Mail (Brevo se mantiene, solo desactivado).

## Último avance comprobado

- **MVP email end-to-end** validado en producción (contacto y cotización; WAF Vercel; SSR `NG_ALLOWED_HOSTS`).
- **Evaluación Zoho Mail (usuario tiene Zoho Free con dominio propio, región US)**:
  - SMTP documentado para free organization: `smtp.zoho.com` 465 SSL / 587 TLS.
  - API REST de Zoho Mail (POST `/api/accounts/{accountId}/messages`, scope `ZohoMail.messages.CREATE`) usa OAuth: `client_id` + `client_secret` + `refresh_token` (sin contraseña; revocable; scope mínimo). Token vive en env vars, nunca en cliente.
  - Plan usuario: probar primero si el plan gratuito permite la API; si falla → `2FA + app-password` + nodemailer (alternativa sin contraseña normal).
  - No se necesita `no-reply@`: la casilla elegida envía y recibe; respuestas de clientes llegan ahí.
  - Si Zoho falla: Brevo soporta el mismo dominio (DKIM + código TXT; MX de Zoho intacto; DMARC único). `no-reply@dominio` en Brevo + `BREVO_SENDER_EMAIL` cambiado, sin tocar código.

## Archivos tocados

- Ninguno en esta sesión (solo investigación; `.env` real no se lee).

## Pruebas ejecutadas y resultado real

- (Sesión anterior confirmada por usuario) Contacto y cotización end-to-end OK en producción.

## Bloqueos

- Falta confirmar si la API de Zoho funciona con cuenta gratuita (requiere crear Self Client en api-console.zoho.com y probar antes de implementar).

## Siguiente paso

1. El usuario crea Self Client en api-console.zoho.com y confirma acceso; define qué casilla será remitente y si el correo interno va a la misma o a la otra.
2. Prueba manual de envío con token OAuth (sin tocar código).
3. Implementar `src/server/email/zoho.client.ts` + selector `EMAIL_PROVIDER=zoho|brevo` (o Space → implementación directa, según feedback). Verificar build/tests y envío real.
