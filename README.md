# Transportes Drakar

Landing y cotizador estimativo para Transportes Drakar (fletes, mudanzas y retiro de escombros).

Stack: Angular 22 (signal-based), SSR, Tailwind 4 + DaisyUI 5, pnpm.

## Rutas

- `/`: Home con hero, servicios y contacto.
- `/cotizacion`: Simula tu cotización y obtén un desglose estimativo.

## Arquitectura

`/` y `/cotizacion` están prerenderizadas.

La app incluye un **BFF Express en `src/server.ts`** para trabajo que requiere credenciales o acceso a APIs externas.

### Endpoints BFF

- `POST /ssr-api/contact`: envía correo de contacto a Brevo y notificación al visitante.
- `POST /ssr-api/quote`: placeholder; aún no implementado.

El proxy distingue entre:

- Contacto de email público → `contact.service` → Brevo.
- Petición hacia API externa → reenrutado con una lista permitida de rutas.

## Seguridad

- `NG_ALLOWED_HOSTS` configura hosts permitidos para SSR (`transportesdrakkar.cl`, `www.transportesdrakkar.cl`, `localhost`, `127.0.0.1`).
- Los secretos viven en variables de entorno del servidor, nunca en el cliente.
- `.env` no está versionado.
- El proxy externo sólo permite `/health`; el resto responde `403 Ruta no permitida.`
- El endpoint `POST /ssr-api/contact` está protegido en producción con una regla WAF por IP configurada en Vercel.
- `POST /ssr-api/contact` también tiene un rate limit básico en memoria dentro del BFF (`createRateLimit`).

## Contacto end-to-end validado

- El formulario de contacto envía los datos como `POST /ssr-api/contact`.
- El servidor envía el correo a Brevo hacia la casilla de Transportes Drakar.
- El visitante recibe un correo de confirmación con código de referencia y QR a `https://transportesdrakkar.cl`.
- Validación en cliente y servidor (nombre, email, teléfono y mensaje).
- Estado de éxito visible dentro del mismo bloque de contacto (`message-success-component`).

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
│  │                              message-error, message-success, modal-error, toast
│  └─ directives/reveal.directive.ts
├─ features/
│  ├─ email/
│  │  ├─ components/form-contact-component/
│  │  ├─ components/form-quote-component/
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
- Tema `drakar` en `src/styles.css` con variables DaisyUI/Tailwind.

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
BREVO_API_URL=https://api.brevo.com/v3/smtp/email
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=...
BREVO_SENDER_NAME=...
API_URL=http://127.0.0.1:8000/api
API_KEY=...
```

`NG_ALLOWED_HOSTS` debe estar configurada en Vercel para producción.
