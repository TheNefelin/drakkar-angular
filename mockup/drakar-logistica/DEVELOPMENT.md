# DRAKAR Logística · Mockup variante

Landing del mockup DRAKAR (empresa de **transporte y mudanzas**: hogar, retiro
de compras en **DIMASA** y **Home Center**, y traslado de materiales) con una
dirección de arte **clara y de logística terrestre**, sin ambigüedad marítima.

## Por qué existe esta variante

La variante `drakar-cinematic` usaba una metáfora **náutica** (runas, drakkar,
vocabulario de mar, franjas amarillo/negro) que podía leerse como **puerto o
marítimo** y confundir al cliente. Esta versión:

- **Elimina** lo náutico: runas, glifos vikingos, "zarpar", "travesía", "puerto".
- **Elimina** las franjas amarillo/negro (`rail-teeth`) y el fondo oscuro.
- **Conserva** el nombre DRAKAR como marca, sin decoración temática.
- **Explicita** el servicio real (transporte terrestre) en el titular y en los textos.

## Dirección de arte

| | drakar-cinematic | drakar-logistica |
| --- | --- | --- |
| Fondo | imagen portuaria nocturna | blanco / gris muy suave, luminoso |
| Paleta | noche + ámbar | azul de confianza + naranja (CTA) |
| Tipografía | Cinzel (serif épica) + Manrope | Sora (geométrica) + Manrope |
| Metáfora | mar / drakkar | carretera / cajas / camión |
| Imágenes | puerto, grúa | personas y cajas de mudanza, van |
| Tono | cinematográfico | directo y comercial |

## Stack y dependencias (CDN)

| Recurso | CDN | Uso |
| --- | --- | --- |
| Tailwind CSS | `https://cdn.tailwindcss.com` | Utilidades de estilos (runtime) |
| Google Fonts | `https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap` | Sora (display) + Manrope (texto) |
| JS vanilla | script embebido en `index.html` | Formulario demo, año, reveal con IntersectionObserver |

No se usa DaisyUI: los componentes se arman con utilidades de Tailwind.

## Librerías JS usadas y compatibilidad con Angular

1. **Vanilla JS (embebido)** — sin dependencias; IIFE + `addEventListener` +
   `IntersectionObserver`, sin globales que choquen con Angular.
2. **Tailwind CSS (runtime JS)** — solo estilos.

> Nota Angular: en la versión final se reemplaza el runtime de Tailwind por el
> build de PostCSS dentro del CLI. No hay librería JS acoplada a este mockup.

## Recursos remotos (dependencia de internet)

- **Hero:** Pexels foto `5025669` (traslado de cajas junto a una van).
- **Cotizar:** Pexels foto `6169669` (cajas de cartón rotuladas).

Servidas desde `images.pexels.com`. Para producción se recomienda descargar y
versionar las imágenes.

## Secciones del mockup

1. **Barra de contacto** (franja superior): horario, cobertura y teléfono.
2. **Nav** pegajosa → Servicios · Cómo funciona · CTA "Cotizar ahora".
3. **Hero** en dos columnas: propuesta, CTAs, garantías y foto con tarjeta flotante.
4. **Franja de confianza** — 4 garantías (flota propia, carga asegurada, precio cerrado, cobertura RM).
5. **Servicios** — 4 cards (mudanza de hogar, retiro en tienda, traslado de materiales, flete simple).
6. **Cómo funciona** — 3 pasos.
7. **Cotizar** — formulario (nombre, teléfono, servicio, origen, destino) + cajas de aseguro + foto.
8. **Footer** — marca, servicios, contacto, cobertura y legal.

## Accesibilidad y movimiento

- Todas las imágenes tienen `alt` descriptivo; iconos decorativos con `aria-hidden`.
- Enlace "Saltar al contenido", `label` en todos los campos y foco visible
  (`focus-visible:ring`) en botones y enlaces.
- `prefers-reduced-motion`: desactiva el fade del hero, el reveal y el scroll suave.
- El reveal no oculta contenido si JavaScript está desactivado (clase `.js`).

## Cómo abrir

Abrir `index.html` directamente en el navegador (necesita internet para CDN e
imágenes). No requiere build ni servidor.

## Limitaciones conocidas

- No se inspeccionó en navegador real desde el entorno de generación; se verificó
  estructura, enlaces y contraste de forma estática.
- Datos de contacto y precios son de ejemplo (mockup).
