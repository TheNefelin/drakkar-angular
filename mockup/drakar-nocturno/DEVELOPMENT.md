# DRAKAR Nocturno · Mockup variante

Variante del mockup DRAKAR (empresa de **transporte y mudanzas**: hogar, retiro
de compras en **DIMASA** y **Home Center**, y traslado de materiales) con el
hero en **video de fondo**.

## Por qué existe esta variante

Las tres variantes anteriores (`drakar-cinematic`, `drakar-landing`,
`drakar-logistica`) usan el hero con **imagen fija o SVG**. Ninguna tenía un
**hero en movimiento**. Esta variante cubre esa carencia: un video POV de
autopista nocturna como fondo del hero, manteniendo la identidad de marca.

Se conserva: paleta noche/ámbar, **Cinzel** + Manrope, runas, `rail-teeth` y
DaisyUI. Respecto de `drakar-cinematic`, se reemplaza la metáfora **náutica**
(puerto, travesía, "buen viento y buena mar") por la **ruta / carretera
nocturna**, coherente con el video del hero.

## Diferencia de dirección de arte

| | drakar-cinematic | drakar-nocturno |
| --- | --- | --- |
| Fondo del hero | foto fija de puerto nocturno | **video** POV de autopista nocturna |
| Metáfora | puerto / marítimo | ruta / carretera |
| Imagen de cobertura | vista aérea de puerto | cuadrilla con cajas y van |
| Titular | "De puerto a puerta" | "En ruta toda la noche" |
| Cierre del footer | "buen viento y buena mar" | "buena ruta y buena entrega" |

## Stack y dependencias (CDN)

| Recurso | CDN | Uso |
| --- | --- | --- |
| Tailwind CSS | `https://cdn.tailwindcss.com` | Utilidades de estilos (runtime) |
| DaisyUI | `https://cdn.jsdelivr.net/npm/daisyui@4.12.23/dist/full.min.css` | Botones, inputs y selects (CSS puro) |
| Google Fonts | `https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Manrope:wght@400;600;800&display=swap` | Cinzel + Manrope |
| JS vanilla | script embebido en `index.html` | Formulario demo, año, control del video, reveal con IntersectionObserver |

## Librerías JS usadas y compatibilidad con Angular

1. **Vanilla JS (embebido)** — sin dependencias; IIFE + `addEventListener` +
   `IntersectionObserver`, sin globales que choquen con Angular.
2. **Tailwind CSS (runtime JS)** — solo estilos.
3. **DaisyUI** — CSS puro, sin API JS que portar.

## Video y accesibilidad

- Video **decorativo y silenciado** (`autoplay muted loop playsinline`), con
  `poster` y una imagen base detrás como respaldo si el video no carga.
- Overlay con degradados para garantizar contraste del texto sobre el video.
- `prefers-reduced-motion`: **pausa y oculta el video** (queda la imagen base) y
  desactiva el fade, el reveal y el scroll suave.
- El reveal no oculta contenido si JavaScript está desactivado (clase `.js`).

## Recursos remotos (dependencia de internet)

Se verificó por HTTP que las URLs devuelvan **200** antes de incrustarlas.

| Uso | Fuente |
| --- | --- |
| Hero (video) | Pexels video `15270404` — `.../15270404-hd_1280_720_60fps.mp4` (~5,4 MB) |
| Hero (póster/base) | Pexels imagen `videos/15270404/carriage-florida-freeway-miami-15270404.jpeg` |
| Cobertura | Pexels foto `5025669` (cuadrilla con cajas y van) |

Existe una versión 1080p del mismo video (`15270404-hd_1920_1080_60fps.mp4`,
~11,7 MB) si se prefiere más resolución a costa de peso. En producción se
recomienda **descargar y versionar** video e imágenes.

## Secciones del mockup

1. **Nav** fija → Servicios · Cobertura · Cotizar.
2. **Hero** con **video de fondo**, overlay, titular, 2 CTA y línea de confianza.
3. **Franja de confianza** — 4 garantías (flota propia, carga asegurada, precio cerrado, atención directa).
4. **Servicios** — 3 cards (retiro en tienda, mudanza completa, fletes y materiales).
5. **Cobertura y flota** — split con imagen + lista y CTA.
6. **Cotizar** — formulario corto (nombre, teléfono, servicio) + teléfono.
7. **Footer** — runas, crédito de medios y legal.

## Cómo abrir

Abrir `index.html` directamente en el navegador (necesita internet para CDN,
video e imágenes). No requiere build ni servidor.

## Limitaciones conocidas

- No se inspeccionó en navegador real desde el entorno de generación; se verificó
  estructura, enlaces y contraste de forma estática, y que las URLs de video,
  póster y fuentes devuelvan 200.
- El video pesa ~5,4 MB; para producción conviene recomprimir o servir una
  versión más liviana.
- Cifras y datos de contacto son de ejemplo (mockup).
