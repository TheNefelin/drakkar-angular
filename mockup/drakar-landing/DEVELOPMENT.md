# DRAKAR Landing · Mockup variante

Variante **landing de conversión** del mockup DRAKAR: conserva la identidad
visual del original (`../drakar/` — noche/ámbar, Cinzel, runas, DaisyUI) pero
reduce todo a lo mínimo para lograr **una sola acción**: pedir cotización.

Pensada para campañas (Google Ads, RRSS o un flyer): el visitante entiende qué
hace la empresa, confía en 3 líneas y cotiza. Cero turismo por la página.

## Diferencia con la versión completa

| | drakar (completo) | drakar-landing |
| --- | --- | --- |
| Objetivo | informar | convertir |
| Secciones | 11 | 3 bloques |
| Servicios / tarifas | 6 cards + 3 planes | 3 beneficios en una fila |
| Proceso / FAQ / flota | secciones completas | — |
| Formulario | 6 campos | 3 campos (nombre, teléfono, servicio) |
| Nav | 6 anclas + CTA | 1 botón CTA |

Se conserva: hero con drakkar SVG, rail-teeth, runas, DaisyUI y el trimado final.

## Stack y dependencias (CDN)

| Recurso | CDN | Uso |
| --- | --- | --- |
| Tailwind CSS | `https://cdn.tailwindcss.com` | Utilidades de estilos (runtime) |
| DaisyUI | `https://cdn.jsdelivr.net/npm/daisyui@4.12.23/dist/full.min.css` | Botones e inputs (CSS puro) |
| Google Fonts | `https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Manrope:wght@400;600;800&display=swap` | Cinzel + Manrope |
| JS vanilla | script embebido en `index.html` | Formulario demo, año dinámico |

## Librerías JS usadas y compatibilidad con Angular

1. **Vanilla JS (embebido)** — sin dependencias; IIFE + `addEventListener`, sin
   globales que choquen con Angular. (En esta variante no hay menú ni animaciones.)
2. **Tailwind CSS (runtime JS)** — solo estilos.
3. **DaisyUI** — CSS puro, sin API JS que portar.

## Bloques del mockup

1. **Nav** fija → solo el logo y el botón "Cotizar".
2. **Hero** centrado — titular, una línea de propuesta, CTA principal, enlace
   secundario, drakkar SVG y línea de confianza (flota propia, precio cerrado, 48 h).
3. **Beneficios** — 3 columnas cortas (retiro DIMASA/Home Center, mudanza completa,
   precio cerrado en 48 h).
4. **Cotizar** — formulario corto (3 campos) + contacto WhatsApp/teléfono.
5. **Footer** — one-liner con runas.

## Cómo abrir

Abrir `index.html` directamente en el navegador (necesita internet para los CDN).