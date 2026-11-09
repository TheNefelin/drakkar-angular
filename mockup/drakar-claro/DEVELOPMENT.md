# DRAKAR Claro · Mockup variante

Variante **clara y luminosa** del mockup DRAKAR (empresa de **transporte y
mudanzas**: hogar, retiro de compras en **DIMASA** y **Home Center**, traslado de
**materiales de obra** y fletes/encomiendas).

## Cómo se diferencia de las otras variantes

A diferencia de `drakar-cinematic`, `drakar-landing`, `drakar-logistica` y
`drakar-nocturno`, esta variante **rompe deliberadamente** con la identidad previa:
no usa la paleta noche/ámbar, ni las tipografías `Cinzel`/`Manrope`, ni las runas,
ni DaisyUI, ni la metáfora náutica. Es un enfoque propio y claro.

| | drakar-nocturno | drakar-claro |
| --- | --- | --- |
| Fondo | noche + ámbar | **papel cálido** (#f3efe7) + tinta |
| Acento | ámbar | **naranja de señal** (#ff531a) |
| Tipografías | Cinzel + Manrope | **Archivo** + Inter + Space Mono |
| UI kit | DaisyUI | Tailwind puro (sin DaisyUI) |
| Concepto | ruta nocturna | **señalética / obra** |
| Tono | nocturno, épico | claro, directo, industrial |

## Dirección de arte: "señalética de obra"

El concepto es la **claridad de la señalética** (flechas, números, franjas de
advertencia) mezclada con el mundo del **transporte de materiales**:

- **Papel cálido** de fondo, tinta casi negra, un único acento **naranja de
  señal** y gris acero para texto secundario.
- **Etiquetas de envío** como motivo gráfico: la composición del hero superpone
  una etiqueta con código, código de barras y sello "Frágil · Este lado arriba".
- **Franjas de advertencia** (`.stripes`) como separador de la sección hero.
- **Ruta punteada** conectando los pasos de "Cómo funciona".
- **Ticker/tablero** de tránsito en la parte superior.
- Tipografía display **Archivo** (industrial, tipo señalética) con `Space Mono`
  para etiquetas, códigos y datos.

## Estructura de la página

1. **Nav** fija + menú móvil desplegable.
2. **Ticker** deslizante (Mudanzas · Retiro en tienda · Materiales · Fletes...).
3. **Hero** a dos columnas: titular + CTAs + garantías, y composición de foto con
   etiquetas de envío superpuestas.
4. **Franja de datos** (años, mudanzas, puntualidad, carga asegurada).
5. **Servicios** — 4 tarjetas: mudanza de hogar, retiro en tienda, materiales de
   obra, fletes y encomiendas.
6. **Cómo funciona** — ruta de 4 pasos unidos por línea punteada.
7. **Cobertura** — zonas + horario + mosaico de 3 fotos.
8. **Cotizar** — formulario (nombre, teléfono, servicio, detalles) sobre fondo
   tinta, con bloque de contacto.
9. **Footer** — marca, servicios, contacto y créditos.

## Stack y dependencias (CDN)

| Recurso | CDN | Uso |
| --- | --- | --- |
| Tailwind CSS | `https://cdn.tailwindcss.com` | Utilidades + tema extendido (colores y fuentes) |
| Google Fonts | `Archivo` + `Inter` + `Space Mono` | Display, body y mono |
| JS vanilla | script embebido | Menú móvil, año, formulario demo, revelado |

**No** usa DaisyUI (a diferencia de las variantes oscuras). El tema se define en
la config inline de Tailwind (colores `paper`, `ink`, `signal`, `signaldeep`,
`steel`, `line`; fuentes `display`, `body`, `mono`).

## Recursos remotos (dependencia de internet)

Todos verificados por HTTP **200** antes de incrustarlos.

| Uso | Fuente |
| --- | --- |
| Hero | Pexels foto `21838827` (cajas dentro de vehículo) |
| Cobertura (bodega) | Pexels foto `5156696` (estanterías con cajas) |
| Cobertura (reparto) | Pexels foto `7363131` (repartidor con caja) |
| Cobertura (cajas) | Pexels foto `5025503` (cajas apiladas) |

En producción conviene **descargar y versionar** las imágenes.

## Movimiento y accesibilidad

- **Ticker**: animación CSS que se **pausa al pasar el cursor**.
- **Revelado** al hacer scroll con `IntersectionObserver`; el contenido **no se
  oculta** si JavaScript está desactivado (clase `.js` en `<html>`).
- `prefers-reduced-motion`: detiene el ticker, desactiva transiciones y scroll
  suave, y muestra todo el contenido.
- **Contraste**: el acento naranja se usa en rellenos y textos grandes; el cuerpo
  de texto va en tinta/gris para mantener legibilidad. Foco visible con
  `:focus-visible`.

## Cómo abrir

Abrir `index.html` directamente en el navegador (necesita internet para CDN,
fuentes e imágenes). No requiere build ni servidor.

## Limitaciones conocidas

- No se inspeccionó en navegador real desde el entorno de generación; se verificó
  estructura, enlaces, balance de etiquetas y que las URLs devuelvan 200.
- Cifras (años, mudanzas, puntualidad), teléfonos y correo son **de ejemplo**
  (mockup): `+00 000 000 0000`, `hola@drakar.example`.
- El formulario no envía datos: al validar, solo muestra un mensaje de
  confirmación (demo).
