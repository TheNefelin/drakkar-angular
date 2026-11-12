# Transportes Drakkar

Landing y cotizador estimativo para Transportes Drakkar (fletes, mudanzas y retiro de escombros).

Stack: Angular 22 (signal-based), SSR, Tailwind 4 + DaisyUI 5, pnpm.

## Rutas

- `/`: Home con hero, servicios y contacto.
- `/cotizacion`: Simula tu cotización y obtén un desglose estimativo.

## Arquitectura

`/` y `/cotizacion` están prerenderizadas.

La app incluye un **BFF Express en `src/server.ts`** para trabajo que requiere credenciales o acceso a APIs externas.

### Endpoints BFF

- `POST /ssr-api/contact`: envía correo de contacto vía Zoho Mail API y notificación al visitante.
- `POST /ssr-api/quote`: envía cotización tentativa vía Zoho Mail API y confirmación al visitante.

El proxy distingue entre:

- Contacto de email público → `contact.service` → Zoho Mail API.
- Cotización tentativa → `quote.service` → Zoho Mail API.
- Petición hacia API externa → reenrutado con una lista permitida de rutas.

## Seguridad

- `NG_ALLOWED_HOSTS` configura hosts permitidos para SSR (`transportesdrakkar.cl`, `www.transportesdrakkar.cl`, `localhost`, `127.0.0.1`).
- Los secretos viven en variables de entorno del servidor, nunca en el cliente.
- `.env` no está versionado.
- El proxy externo sólo permite `/health`; el resto responde `403 Ruta no permitida.`
- El endpoint `POST /ssr-api/contact` está protegido en producción con una regla WAF por IP configurada en Vercel.

## Email end-to-end validado

- El formulario de contacto envía los datos como `POST /ssr-api/contact`.
- El servidor envía el correo vía Zoho Mail API hacia la casilla de Transportes Drakkar. (La cotización reproduce el mismo flujo; validación final en producción.)
- El visitante recibe un correo de confirmación con código de referencia y QR a `https://transportesdrakkar.cl`.
- La cotización envía los datos del formulario como `POST /ssr-api/quote`, calcula el estimado en frontend y muestra una preview antes de enviar.
- Validación en cliente y servidor (nombre, email, teléfono, origen, destino, servicio, peso, volumen y km).
- Estado de éxito visible dentro del mismo bloque (`message-success-component`).

## Opciones de implementación de email

El proyecto soporta dos transportes con los **mismos templates** (`renderLeadEmail`, `renderQuoteEmail`, `renderConfirmationEmail`), sin duplicación ni enrutador de providers: el servicio invoca un cliente u otro según el código. La conmutación es un cambio manual deliberado.

### Opción A — Zoho Mail API (implementada y en uso)

Servicios `contact.service` y `quote.service` usan `ZohoClient` (OAuth 2.0 con `refresh_token`, regeneración automática del `access_token` en memoria). Documentación en [Consola de Zoho: cómo se usa paso a paso](#consola-de-zoho-cómo-se-usa-paso-a-paso).

- [Send an Email — `POST /api/accounts/{accountId}/messages` (scope `ZohoMail.messages.CREATE`)](https://www.zoho.com/mail/help/api/post-send-an-email.html)
- [Get All Accounts of a User — `GET /api/accounts` (scope `ZohoMail.accounts.READ`)](https://www.zoho.com/mail/help/api/get-all-users-accounts.html)
- [Zoho Mail API Index — índice general de endpoints y scopes](https://www.zoho.com/mail/help/api)

### Opción B — Brevo (desconectada; referencia para otros proyectos)

`brevo.client.ts` (`BrevoClient`) y `getBrevoConfig()` siguen en el repo: no reciben tráfico en ejecución — los servicios ya no los invocan. Brevo sirve como ejemplo de cliente REST simple con API key (sin OAuth) y como alternativa si recibes más de 5 buzones/dominio o necesitas herramientas de marketing.

Para **reconectar Brevo**:

1. Restaurar las variables en `.env` / Vercel: `BREVO_API_URL`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`.
2. En `contact.service.ts` y `quote.service.ts`, reemplazar el bloque de configuración y el cliente:

   ```ts
   import { getBrevoConfig } from '../config';
   import { BrevoClient } from '../email/brevo.client';
   // ...
   let brevo: ReturnType<typeof getBrevoConfig>;
   try { brevo = getBrevoConfig(); } catch (error) { /* 500 con detalle */ }
   const client = new BrevoClient();
   // envío interno: to: brevo.BREVO_SENDER_EMAIL
   ```

3. Eliminar (o comentar) los `ZohoClient`/`getZohoConfig` si Brevo queda como transporte único. Los templates, el `DK-…` y el flujo del formulario no cambian.
4. Configurar el dominio/DKIM en Brevo: [Authenticate your domain with Brevo](https://help.brevo.com/hc/en-us/articles/12163873383186-Authenticate-your-domain-with-Brevo-Brevo-code-DKIM-DMARC) (DKIM + TXT; el SPF no lo exige en el plan compartido). MX de Zoho no se toca.
5. Verificación: misma prueba end-to-end que Opción A (contacto y cotización con confirmación y DK de referencia).

> Decisión práctica: usa Zoho con dominio propio (plan gratis o Lite) para correos transaccionales de bajo volumen y una presencia de dominio coherente; usa Brevo si necesitas envío marketing/volumen alto y no quieres depender del límite del plan Zoho gratuito (el envío del formulario consume un mensaje por destinatario).

### Self Client en Zoho (pasos para el despliegue)

1. [api-console.zoho.com](https://api-console.zoho.com) → **Applications → Add Client → Self Client** (gratis; no pide tarjeta).
2. Abre el cliente recién creado y anota **Client ID** y **Client Secret** (van en el entorno del servidor, nunca en el repo).
3. Pestaña **Generate code**: scopes `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`, duración lo más corta posible. El código es de un solo uso y caduca en minutos.
4. Intercambia el código por tokens con `POST https://accounts.zoho.com/oauth/v2/token` (`grant_type=authorization_code`). Ver [Authorization Code Flow — Self Client](https://www.zoho.com/developer/oauth/self-client/authorization-code-flow.html). Respuesta: `access_token` (~1 h) y `refresh_token` (no caduca).
5. Descubre el `accountId` con `GET https://mail.zoho.com/api/accounts` (scope `ZohoMail.accounts.READ`) y prueba un envío real con `POST .../api/accounts/{accountId}/messages` (scope `ZohoMail.messages.CREATE`).

### Consola de Zoho: cómo se usa paso a paso

Los siguientes pasos son los que hicimos para dejar el envío de correos operativo. Requiere una cuenta de Zoho Mail (gratis) con dominio propio.

1. **Webmail**: inicia sesión en [mail.zoho.com](https://mail.zoho.com) con la casilla que será remitente. No es un paso obligatorio, solo deja claro qué cuenta se está usando.
2. **API Console**: abre [api-console.zoho.com](https://api-console.zoho.com) (es la consola de desarrolladores, distinta del webmail) e inicia sesión **con la misma cuenta**.
   - Menú lateral → **Applications** → botón azul **Add Client** → elige tipo **Self Client** → **CREATE** (es gratis).
   - El cliente queda creado con dos pestañas: **Generate code** y **Client Secret**.
3. **Client Secret**: anota `Client ID` y `Client Secret` en tu archivo `.env`, **fuera del repo**. Son las credenciales de la app que envía los correos.
4. **Generate code**:
   - **Scope**: `ZohoMail.messages.CREATE,ZohoMail.accounts.READ` (lo mínimo: crear/enviar mensajes + leer datos de la cuenta)
   - **Code expiry**: la duración más corta (p. ej. 3 minutos).
   - **Description**: cualquier texto (p. ej. `Envio de correos contacto y cotizacion Drakkar`).
   - Pulsa **CREATE**: obtienes un código de **un solo uso**, válido solo los minutos indicados.
   - Si caduca antes de usarlo, simplemente genera otro (mismo scope).
5. **Intercambiar el código por tokens** (PowerShell, en tu PC). Ver el doc oficial: [Authorization Code Flow — Self Client](https://www.zoho.com/developer/oauth/self-client/authorization-code-flow.html).

   ```powershell
   $body = @{
     grant_type = 'authorization_code'
     code = '<EL_CODIGO>'
     client_id = '<CLIENT_ID>'
     client_secret = '<CLIENT_SECRET>'
   }
   Invoke-RestMethod -Method Post -Uri 'https://accounts.zoho.com/oauth/v2/token' -Body $body
   ```

   La respuesta trae `access_token`, `refresh_token`, `api_domain`, `expires_in` (p. ej. 3600 s). **Guárdalos** en `.env` local y en Vercel; no los pegues en el repo ni en el chat.
6. **Descubrir el `accountId`** (una sola vez): con el `access_token` recién emitido:

   ```powershell
   Invoke-RestMethod -Uri 'https://mail.zoho.com/api/accounts' -Headers @{ Authorization = 'Zoho-oauthtoken <access_token>' } | ConvertTo-Json -Depth 5
   ```

   Devuelve `data[].accountId` (número). Guárdalo en `ZOHO_ACCOUNT_ID`.
7. **Generar `.env`/Vercel**: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNT_ID`, `ZOHO_SENDER_EMAIL`. (Ver sección siguiente.)
8. **Nota**: el `access_token` expira cada hora; la aplicación lo **renueva sola** con el `refresh_token` cada vez que envía. El `access_token` nunca se guarda.
9. Cuando el dominio tenga **DKIM** configurado en el **admin de Zoho**, los correos de contacto/cotización no caerán (o mucho menos) en spam. El SPF/DKIM se configura en el Admin Console del dominio; DMARC solo puede haber uno por dominio.
10. **Verificar**: enviar un formulario de prueba desde la landing; deben llegar el correo interno y la confirmación al visitante con el `DK-...` de referencia.

### Variables de entorno (Zoho)

Van en `.env` (local, ignorado por Git) y en las variables de Vercel. **Nunca** se guardan en el repo ni en `.env.example` con valores reales.

```env
# Zoho Mail API (OAuth 2.0). Brevo queda desconectado como referencia (ya no recibe tráfico).
ZOHO_CLIENT_ID=<client id del Self Client>
ZOHO_CLIENT_SECRET=<client secret del Self Client>
ZOHO_REFRESH_TOKEN=<refresh_token devuelto por Zoho>
ZOHO_ACCOUNT_ID=<id numérico obtenido de GET /api/accounts>
ZOHO_SENDER_EMAIL=<buzón remitente>
```

> Nota: el `access_token` NO se guarda en el entorno (expira en ~1 h). El servidor lo renueva automáticamente con el `refresh_token`. `brevo.client.ts` permanece en el repo solo como referencia (no se invoca); los secretos de Brevo pueden quedar como respaldo inactivo.

## Estructura

```text
src/app/
├─ app.config.ts                 → router, hydration, fetch + interceptor
├─ app.routes.server.ts          → prerender de páginas
├─ app.routes.ts                 → rutas principales
├─ core/                         → ApiService, ErrorService, LoggerService, Toast/Modal
├─ shared/
│  ├─ constants/api-endpoints.ts → rutas compartidas frontend/BFF
│  ├─ components/                → navbar, footer, rune-line, section-heading,
│  │                              button, loading, message-error, message-success, modal-error, toast
│  └─ directives/reveal.directive.ts
├─ features/
│  ├─ email/
│  │  ├─ components/form-contact-component/
│  │  ├─ components/form-quote-component/
│  │  ├─ components/preview-quote-component/
│  │  ├─ models/email-model.ts
│  │  └─ services/email-service.ts
│  ├─ home/
│  │  ├─ components/
│  │  │  ├─ hero-component/
│  │  │  ├─ services-component/
│  │  │  └─ pages/home-page/
│  └─ quote/
│     └─ pages/quote-page/
└─ server.ts                    → servidor Express SSR + BFF
```

## Fuentes y tema

- Fuentes por CDN: Noto Sans Runic, Cinzel Decorative, Roboto.
- Tema `drakkar` en `src/styles.css` con variables DaisyUI/Tailwind.

## Comandos

```bash
pnpm start         # ng serve (desarrollo)
pnpm build         # build de producción
pnpm test -- --watch=false   # tests (Vitest)
pnpm serve:ssr:drakar-angular  # node dist/drakar-angular/server/server.mjs
```

## Variables de entorno

Plantilla en `.env.example`:

```env
NG_ALLOWED_HOSTS=localhost,127.0.0.1,transportesdrakkar.cl,www.transportesdrakkar.cl
API_URL=http://127.0.0.1:8000/api
API_KEY=...

# Zoho Mail API (OAuth 2.0). Brevo queda desconectado como referencia (ya no recibe tráfico).
ZOHO_CLIENT_ID=...
ZOHO_CLIENT_SECRET=...
ZOHO_REFRESH_TOKEN=...
ZOHO_ACCOUNT_ID=...
ZOHO_SENDER_EMAIL=...
```

`NG_ALLOWED_HOSTS` y las variables `ZOHO_*` deben estar configuradas en Vercel para producción. Brevo (`BREVO_*`) no se invoca en runtime; si el repositorio se usa como referencia en otro proyecto, basta con restaurar las credenciales.
