# DRAKAR Cinematic · Mockup variante

Landing del mockup DRAKAR (empresa de transporte: mudanzas de hogar y retiro
de compras/materiales en **DIMASA** y **Home Center**) con una dirección de arte
**cinematográfica de puerto**: una sola imagen dominante a sangre, oscuridad y
acento ámbar, enfocada a conversión.

Las versiones anteriores (`drakar-first`, `drakar-minimal`, `drakar-esencial`,
`drakar-landing`) usan ilustración SVG, hairlines o compactación. Esta variante
explora lo **fotográfico e inmersivo**, sin cambiar el negocio ni el stack.

## Diferencia de dirección de arte

| | drakar-landing | drakar-cinematic |
| --- | --- | --- |
| Composición del hero | centrada + drakkar SVG | full-bleed fotográfico + overlay, texto a la izquierda |
| Protagonista visual | ilustración | fotografía de puerto nocturno |
| Profundidad | plana | capas (imagen + degradados + reveal al scroll) |
| Secciones | 3 bloques | 6 bloques (servicios, cobertura, cotizar) |
| Objetivo | conversión pura | conversión con contexto de servicio |

Se conserva la identidad de marca: paleta noche/ámbar, **Cinzel** + Manrope,
runas, `rail-teeth` y DaisyUI.

## Stack y dependencias (CDN)

| Recurso | CDN | Uso |
| --- | --- | --- |
| Tailwind CSS | `https://cdn.tailwindcss.com` | Utilidades de estilos (runtime) |
| DaisyUI | `https://cdn.jsdelivr.net/npm/daisyui@4.12.23/dist/full.min.css` | Botones e inputs (CSS puro) |
| Google Fonts | `https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Manrope:wght@400;600;800&display=swap` | Cinzel + Manrope |
| JS vanilla | script embebido en `index.html` | Formulario demo, año dinámico, reveal con IntersectionObserver |

## Librerías JS usadas y compatibilidad con Angular

1. **Vanilla JS (embebido)** — sin dependencias; IIFE + `addEventListener` +
   `IntersectionObserver`, sin globales que choquen con Angular.
2. **Tailwind CSS (runtime JS)** — solo estilos.
3. **DaisyUI** — CSS puro, sin API JS que portar.

## Recursos remotos (dependencia de internet)

- **Hero:** Pexels foto `16196626` (puerto nocturno iluminado).
- **Cobertura:** Pexels foto `3856433` (vista aérea de puerto con contenedores).

Ambas se sirven desde `images.pexels.com` con parámetros de compresión. Si no hay
internet, el hero muestra el fondo `night` con texto legible (el overlay oscuro
mantiene el contraste). En producción se recomienda descargar y versionar las
imágenes en el proyecto.

## Secciones del mockup

1. **Nav** fija → Servicios · Cobertura · Cotizar.
2. **Hero** a sangre con imagen de puerto, overlay, titular, 2 CTA y línea de confianza.
3. **Franja de confianza** — 4 garantías (flota propia, carga asegurada, precio cerrado, atención directa) sin cifras inventadas.
4. **Servicios** — 3 cards (retiro en tienda, mudanza completa, fletes y materiales).
5. **Cobertura y flota** — split con imagen + lista y CTA.
6. **Cotizar** — formulario corto (3 campos) + contacto WhatsApp/teléfono.
7. **Footer** — runas, crédito de imágenes y legal.

## Accesibilidad y movimiento

- Imagen de hero decorativa (`aria-hidden`, `alt=""`); imagen de cobertura con `alt` real.
- Foco y contraste: texto claro sobre overlay oscuro; enlaces con estados hover visibles.
- `prefers-reduced-motion`: desactiva el fade del hero, el reveal y el scroll suave.
- El reveal no oculta contenido si JavaScript está desactivado (clase `.js` en `<html>`).

## Cómo abrir

Abrir `index.html` directamente en el navegador (necesita internet para CDN e imágenes).
No requiere build ni servidor.

## Limitaciones conocidas

- No se inspeccionó en navegador real desde el entorno de generación; se verificó
  estructura, enlaces y contraste de forma estática.
- Cifras y datos de contacto son de ejemplo (mockup).
