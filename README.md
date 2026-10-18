# Dermarel PDP — tema de Shopify para testear productos

Tema de Shopify (Online Store 2.0) que reproduce el diseño de página de producto de alta conversión **Dermarel** y lo deja listo como plantilla reutilizable: cada vez que quieras testear un producto, solo cambias fotos y textos desde el editor.

- **Auditoría completa del diseño:** [`docs/AUDITORIA-PDP.md`](docs/AUDITORIA-PDP.md)
- **Tema listo para subir:** `dist/dermarel-pdp-v1.0.0.zip`
- **Código del tema:** `theme/`

## Qué incluye

La ficha reproduce las 7 secciones del modelo, en el mismo orden:

1. **Cabecera** en cápsula con menú centrado y buscador, cuenta y carrito en círculos.
2. **Ficha de producto**: galería con miniaturas verticales, valoración, nombre, promesa, precio con precio anterior, beneficios, cantidad + "Añadir al carrito", "Comprar ahora" con precio, garantía, fotos/vídeos de clientes y desplegables.
3. **Testimonio destacado** ("Tan suave que confías en él cada día") con imagen en círculo y avatares.
4. **Ingredientes** ("Nada aquí que irrite tu piel") en bloque oliva con etiquetas posicionables.
5. **Recomendado para ti**: 4 tarjetas con etiqueta, nota y precio.
6. **Reseñas** ("+2.300 clientes confían en nosotros"): nota media, barras por estrellas, muro de reseñas y "Cargar más".
7. **Pie** oscuro con formulario de contacto, menús y redes.

Además, con un clic desde el editor (ya están en la plantilla, ocultas):

| Extra | Para qué |
|---|---|
| Envío, entrega y pagos | Fecha estimada de entrega, envío gratis, devoluciones y logos de pago reales |
| Packs por cantidad | 1/2/3 unidades con ahorro y precio por unidad |
| Problema (CRO) | Contar el problema antes del producto (tráfico frío de Meta Ads) |
| Rutina en pasos | Cómo se usa en 3 pasos |
| Preguntas frecuentes | Resolver objeciones (con datos estructurados para Google) |
| Barra de anuncios | Mensaje de envío o garantía arriba del todo |

Y activado por defecto: carrito lateral, barra fija de compra en móvil, nota de reseñas calculada automáticamente y fusión del fondo blanco de las fotos de proveedor.

## Instalar el tema

1. Descarga `dist/dermarel-pdp-v1.0.0.zip`.
2. En Shopify: **Tienda online → Temas → Añadir tema → Subir archivo zip**.
3. Pulsa **Personalizar** y revisa primero **Configuración del tema** (icono del engranaje):
   - **Logo**: sube tu logo o deja el nombre de la tienda con el símbolo.
   - **Colores** y **Tipografía**: vienen con los del diseño.
   - **Carrito**: umbral de envío gratis (0 = oculto) y texto de garantía.
   - **Redes sociales**: los iconos del pie solo aparecen si pones la URL.
4. Crea los menús en **Contenido → Menús**: `main-menu` (cabecera y "Enlaces rápidos"), `footer` ("Explora") y uno para "Nuestras soluciones" (elígelo en el pie).
5. Publica el tema cuando la vista previa esté lista.

## Testear un producto nuevo (flujo recomendado)

1. **Crea el producto** en Shopify con sus fotos (verticales 3:4 o cuadradas), precio y *precio de comparación*.
2. En el editor, ve a **Productos → Crear plantilla**, llámala como el producto (por ejemplo `serum-calmante`) y basa la nueva en **Predeterminada**. Así cada test tiene sus propios textos sin tocar los demás.
3. En la ficha del producto (admin) elige esa plantilla en **Plantilla de tema**.
4. Rellena en el editor, de arriba abajo:
   - [ ] **Subtítulo** = la frase exacta que abre tu anuncio.
   - [ ] **Beneficios**: para quién es + 3 beneficios.
   - [ ] **Valoración**: nota y texto reales (o se usará la de tu app de reseñas).
   - [ ] **Fotos/vídeos de clientes** (hasta 8, verticales).
   - [ ] **Desplegables**: modo de uso, ingredientes (INCI real), certificaciones.
   - [ ] **Testimonio destacado**: imagen del círculo y testimonios reales.
   - [ ] **Ingredientes**: imagen central PNG transparente y etiquetas (mueve cada una con X/Y).
   - [ ] **Recomendados**: elige productos y etiquetas.
   - [ ] **Reseñas**: desglose por estrellas (la media y el total salen solos) y reseñas reales.
   - [ ] Activa **Envío, entrega y pagos** con tus plazos reales.
   - [ ] Si el tráfico es frío: activa **Problema (CRO)**, **Rutina en pasos** y **Preguntas frecuentes**.
5. Prueba la compra en móvil (390 px) y ordenador: añadir al carrito, "Comprar ahora" y checkout.

### "Comprar ahora" con descuento (como en el diseño)

El diseño muestra "Buy Now - $28.80" con un precio menor que el de la ficha. Para hacerlo bien:

1. Crea en **Descuentos** un código (por ejemplo `AHORA15`) del 15 %.
2. En **Botones de compra** pon *Descuento de "Comprar ahora"* = 15 y el código.
3. El botón mostrará el precio rebajado y aplicará el código al ir al checkout. Sin código, el botón muestra el precio real (para no crear sorpresas en el checkout).

### Packs por cantidad

Activa el bloque, define unidades y % de cada pack y crea en Shopify un **descuento automático por cantidad** con los mismos porcentajes. El tema muestra el precio, pero quien aplica el descuento es Shopify.

## Importante antes de publicar

Las reseñas, nombres, testimonios, cifras ("+2.300 clientes") y textos de ingredientes del diseño son **contenido de ejemplo**. En España es ilegal publicar reseñas inventadas o marcarlas como verificadas sin comprobarlo (Directiva Ómnibus). Sustitúyelos por reseñas reales o conecta una app (Judge.me, Loox…): el tema admite sus bloques y lee su nota media automáticamente. Más detalle en la sección 8 de la auditoría.

## Para desarrolladores

```bash
cd tools && npm install          # una vez
npm run check                     # Theme Check oficial de Shopify + validador de esquemas y plantillas
npm run preview                   # vista previa local en tools/.preview/product.html (sin tienda)
npm run build                     # valida y genera dist/dermarel-pdp-v<versión>.zip
```

- `tools/validate.mjs` comprueba lo que Theme Check no revisa: que las plantillas JSON usan secciones, bloques y ajustes existentes, límites, rangos, opciones de selects, nombres de ≤ 25 caracteres y que los idiomas tienen las mismas claves.
- `tools/preview.mjs` renderiza la plantilla con datos de ejemplo usando liquidjs. Opciones: `--template index`, `--show-disabled 1` (muestra los extras ocultos), `--variants 1` (producto con variantes), `--images <carpeta>` (fotos de ejemplo).
- Para cambiar la versión del zip, edita `theme_version` en `theme/config/settings_schema.json`.

### Estructura

```
theme/
  layout/       theme.liquid, password.liquid
  sections/     main-product, testimonial-spotlight, ingredients-callouts,
                recommended-products, reviews-wall, header, footer, cart-drawer,
                problem-cards, routine-steps, faq, announcement-bar y páginas secundarias
  snippets/     iconos, estrellas, precio, tarjeta de producto, logo, estilos
  templates/    product.json (el diseño), index.json, colección, carrito, páginas, cuentas…
  assets/       theme.css, theme.js (sin dependencias)
  locales/      es.default.json, en.json
docs/           AUDITORIA-PDP.md
tools/          validación, vista previa
scripts/        build-zip.sh
dist/           tema empaquetado
```
