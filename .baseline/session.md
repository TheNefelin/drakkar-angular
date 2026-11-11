# Sesión

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Migración de envío de correo: Brevo → Zoho Mail (Brevo se mantiene, solo desactivado). Evaluada, pendiente de implementar mañana/después.

## Último avance comprobado

- **MVP email end-to-end** validado en producción (contacto y cotización; WAF Vercel; SSR `NG_ALLOWED_HOSTS`).
- **Cotizador actualizado** (sesión actual, sin commit confirmado): reglas tipadas en `QUOTE_PRICING_RULES`/`QuotePricingRules` (`shared/constants/quote-pricing.ts`): tarifa base $10.000, $2.000/km, peso incluido hasta 1200 kg ($10.000 por cada 500 kg extra, ceil), volumen incluido hasta 3 m³ ($10.000 por cada 1 m³ extra, ceil).
- **Km requerido**: formulario (cliente), `form-quote-component`, y `POST /ssr-api/quote` (BFF responde 400 si km ≤ 0).
- **Preview cotización**: reglas de recargo por puntos + aclaración explícita de que «Enviar cotización» envía el resumen por correo.
- **Incidente resuelto**: `templates.ts` quedó doblemente codificado (mojibake) por un reemplazo con encoding ANSI; reparado con roundtrip windows-1252 → UTF-8. Producción sirve el template reparado tras push+deploy.

## Estado Zoho (investigación completa)

- Cuenta: Zoho Free con dominio propio, región US (datacenter global).
- SMTP documentado: `smtp.zoho.com` 465 SSL / 587 TLS.
- API REST (intento principal): `POST https://mail.zoho.com/api/accounts/{accountId}/messages`, scope `ZohoMail.messages.CREATE`, auth OAuth `client_id`+`client_secret`+`refresh_token` (sin contraseña). Free plan podría no permitirla → verificar antes de implementar.
- Alternativa si API falla: activar 2FA + app-password + nodemailer.
- No se necesita `no-reply@`: la casilla elegida envía y recibe.
- Plan B confirmado: Brevo soporta el mismo dominio (DKIM + brevo code TXT; MX de Zoho intacto; DMARC único; `no-reply@dominio` como sender).

## Pruebas ejecutadas y resultado real

- `pnpm run build` OK (2 rutas prerenderizadas); `pnpm test` 3/3 en verde (en todas las corridas de hoy).

## Bloqueos

- Falta confirmar si la Free de Zoho permite la API (requiere Self Client en api-console.zoho.com + prueba real).

## Siguiente paso

1. Mañana: usuario crea Self Client en api-console.zoho.com; definir casilla remitente y destino del correo interno.
2. Prueba manual de envío con token OAuth (sin tocar código).
3. Implementar `zoho.client.ts` + selector `EMAIL_PROVIDER=zoho|brevo`; build/tests y envío real.
4. Confirmar commit/push de los cambios del cotizador de esta sesión.
