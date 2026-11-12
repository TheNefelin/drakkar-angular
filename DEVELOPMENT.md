# DEVELOPMENT.md — Transportes Drakkar (Angular 22 + SSR)

Memoria del proyecto para decisiones y proceso en curso. No es un diario.
(Patrón: memory viva del proyecto; el checkpoint vive en `.baseline/session.md`.)

## Propósito

Landing + cotizador estimativo de Transportes Drakkar (fletes, mudanzas, retiro de escombros). Objetivo cercano: cerrar envío de correos transaccionales con Zoho Mail y dejar el MVP email sólido.

## Stack

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | Angular 22 (signal-based), CSR/SSR | Existente |
| Estilos | Tailwind 4 + DaisyUI 5 | Existente |
| Server/BFF | Express (`src/server.ts`) + modules (`src/server/`) | En uso |
| Tests | Vitest (`ng test`) | 3/3 verdes |
| Build | `ng build` | OK |
| Deploy | Vercel (SSR + WAF para POST /ssr-api/\*) | En uso |

## Estado verificado

- **Email contacto (Zoho)**: flujo probado por el usuario (local). OK.
- **Email cotización (Zoho)**: validado bajo Brevo previamente; hoy apunta a Zoho; pendiente validación en producción tras deploy.
- **WAF** Vercel activo para POST email; **SSR** protegido por `NG_ALLOWED_HOSTS`; proxy restringido a `/health`.
- **Contacto y cotización** validados de extremo a extremo en producción antes de Zoho (con Brevo).

## Decisiones de diseño (en curso)

| Decisión | Justificación | Estado |
|---|---|---|
| Email vía **Zoho Mail API** (OAuth 2.0 `refresh_token`) | Alineado con cuenta gratis de la empresa; sin dependencias nuevas | Aceptado |
| **Sin enrutador de providers**; Brevo queda como referencia | Simplicidad; Brevo se conserva como ejemplo documentado | Aceptado |
| **Mismos templates** para Zoho y Brevo (lead/quote/confirm) | Sin duplicación | Aceptado |
| Templates HTML con `escapeHtml` + `DK-…` oculto en confirmaciones | Anti-inyección y rastreo de referencia | Aceptado |
| `DK-YYYYMMDDHHMMSS-XXXXXX` generado server-side | Referencia única por envío | Aceptado |

## Arquitectura de email — proceso de implementación

1. Crear **Self Client** en api-console.zoho.com (Applications → Add Client → Self Client). Gratis. Scope mínimo: `ZohoMail.messages.CREATE,ZohoMail.accounts.READ` (crear/enviar + leer datos de la cuenta).
2. Intercambiar el `code` por `access_token`/`refresh_token` (doc: Authorization Code Flow — Self Client; ver README).
3. Descubrir `accountId` con `GET https://mail.zoho.com/api/accounts`.
4. `.env`/Vercel: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNT_ID`, `ZOHO_SENDER_EMAIL`. El `access_token` no se guarda; lo renueva el servidor.
5. `src/server/email/zoho.client.ts` (sin dependencias): refresh de token + POST `/api/accounts/{accountId}/messages` (formato `mailFormat: 'html'`).
6. `contact.service.ts` y `quote.service.ts` usan el cliente directamente. `getZohoConfig()` valida env (500 si faltan).
7. **Brevo desconectado**: `brevo.client.ts`/`getBrevoConfig()` conservados como referencia; no invocados.
8. **README** documenta las 2 opciones de implementación; este archivo y `.baseline/session.md` el proceso interno.

## Mapa del backend

```
src/server/
├─ config.ts              → getZohoConfig() (required en runtime); getBrevoConfig() conservado
├─ email/
│  ├─ zoho.client.ts      → cliente activo (refresh_token cacheado en memoria)
│  ├─ brevo.client.ts     → referencia desconectada
│  ├─ templates.ts        → renderLeadEmail / renderQuoteEmail / renderConfirmationEmail
│  └─ helpers.ts          → generateReferenceCode / stringValue / validateContactFields
├─ services/
│  ├─ contact.service.ts  → flujo de contacto (valida, envía a buzón + confirma visitante)
│  └─ quote.service.ts    → flujo de cotización (valida, envía negocio + confirmación)
└─ proxy/api-proxy.ts     → monta /ssr-api: contact, quote (+ WAF distinto según Vercel)
```

## Pendientes

- Validar **cotización E2E en producción** con Zoho (deploy + env vars Vercel + envío real).
- **DKIM** en el admin de Zoho para el dominio (mejora entregabilidad a visitantes).
- Commit/push pendiente de esta sesión (mensaje a emitir tras confirmación).

## Comandos

```bash
pnpm build                     # producción (prerender 2 rutas)
pnpm test -- --watch=false     # Vitest (3/3)
```
