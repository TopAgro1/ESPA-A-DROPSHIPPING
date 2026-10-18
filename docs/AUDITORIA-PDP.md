# Auditoría CRO completa — PDP "Dermarel Calming Serum"

Auditoría del diseño de página de producto (PDP) de Dermarel y de cómo se ha convertido en el tema de Shopify **Dermarel PDP** (`theme/`). Cubre el 100 % de los elementos visibles del modelo, el sistema de diseño, un análisis CRO por semáforo y los cambios que necesita para venderse en España.

---

## 0. Resumen

**Veredicto:** es un diseño de PDP muy sólido para **tráfico templado** (retargeting, búsqueda, visitas desde Instagram/TikTok orgánico). Tiene una jerarquía limpia, prueba social pronto, un CTA doble (carrito + compra directa) y una paleta tranquila que encaja con el posicionamiento de "piel sensible". Para **tráfico frío de Meta Ads** le faltan tres cosas: el problema contado antes que el producto, la información de envío, entrega y pagos (las sorpresas del checkout) y que el botón de compra se vea en el primer pantallazo del móvil.

| | Lo que hace bien | Lo que falla |
|---|---|---|
| Arriba del pliegue (ordenador) | Valoración, nombre, promesa, precio, 3 beneficios y dos botones visibles sin hacer scroll | La promesa ("en 7 días") es una alegación con plazo que hay que poder demostrar |
| Prueba social | Reseñas en vídeo junto al botón, testimonio destacado, muro de reseñas con desglose | Las cifras no cuadran entre sí (4,8 / 4,9 / 4 estrellas / 2.300 / 2.608 / 2.643) |
| Compra | "Comprar ahora" con precio, garantía bajo el botón | Precio de "Comprar ahora" (28,80) distinto del precio de la ficha (34,00) sin explicación |
| Objeciones | Modo de uso, ingredientes y certificaciones en desplegables | No hay envío, plazo de entrega, devoluciones ni métodos de pago |
| Móvil | Diseño limpio y apilable | Con la galería vertical, el botón de compra queda por debajo del primer pantallazo (390 px) |

**Qué hace el tema:** reproduce el diseño 1:1 por defecto y deja **activables con un clic** las correcciones (bloques y secciones ocultos en la plantilla). Algunas correcciones van activadas porque no cambian el aspecto del diseño: notas de valoración calculadas, barra fija de compra en móvil y descuento de "Comprar ahora" solo si existe el código.

---

## 1. El brief del diseñador y cómo se traduce

| Brief (texto del diseño) | Elemento en la página | Cómo lo implementa el tema |
|---|---|---|
| *Problem: webs de skincare saturadas que estresan y hacen abandonar* | Paleta crema/oliva, mucho aire, una sola acción principal por bloque | Tokens de color y espaciado en `snippets/theme-styles.liquid` y `assets/theme.css` |
| *Calm, mobile-first store that builds instant trust* | Prueba social en la primera pantalla, garantía bajo el botón | Bloques `rating`, `ugc`, `buy_buttons.guarantee`; versión móvil revisada a 390 px |
| *Smart Copy: beneficios en lugar de fichas técnicas* | "Redness Visibly Calmer Within Days", "Zero Fragrance" | Bloque `benefits` (5 líneas) y `subtitle` (promesa) |
| *Fast Buying: botones simplificados* | Cantidad + Añadir al carrito + Comprar ahora | Carrito lateral AJAX, "Comprar ahora" directo al checkout, barra fija móvil |
| *Trust First: reseñas pronto para quitar ansiedad* | Vídeos de clientes junto al botón, sección de testimonio, muro de reseñas | Bloque `ugc` (fotos/vídeos), secciones `testimonial-spotlight` y `reviews-wall` |
| *Routine Focused: cómo usarlo en la rutina diaria* | Desplegable "How To Use" | Desplegable + sección opcional **Rutina en pasos** (oculta por defecto) |
| *ROI y SEO* | — | Datos estructurados de producto y FAQ, imágenes responsive con carga diferida, LCP precargado, ~16 KB de CSS+JS comprimidos |

---

## 2. Sistema de diseño (tokens extraídos del modelo)

Todos los valores se han medido sobre la maqueta (575 px de ancho) y escalado a 1440 px. Se editan en **Personalizar → Configuración del tema**.

### Color

| Token | Hex | Uso en el diseño |
|---|---|---|
| Fondo | `#FEF9E4` | Fondo general crema |
| Texto | `#2E3024` | Títulos de producto, cuerpo |
| Titulares de sección | `#6C7140` | "Gentle Enough…", "Recommended…", texto del testimonio |
| Principal (oliva) | `#6C7140` | Botones primarios, bloque de ingredientes, barras de valoración |
| Texto sobre principal | `#FEF9E4` | Texto de botones y del bloque de ingredientes |
| Oscuro | `#383A2E` | Pie de página |
| Acento (lima) | `#ECF489` | Círculo del testimonio, etiquetas "For Men/Women", iconos de ingredientes |
| Iconos de cabecera | `#E8E4CE` | Círculos del buscador, cuenta y carrito |
| Estrellas | `#EDB15A` | Valoraciones |
| Mancha decorativa | `#8E9463` | Salpicadura del bloque de ingredientes |
| Bordes | `#E3DFC4` | Cabecera, tarjetas, separadores |

**Contraste (WCAG 2.1):** texto/fondo 12,7:1 ✅ · titulares oliva/fondo 4,9:1 ✅ (AA) · botón crema/oliva 4,9:1 ✅ · pie 11,0:1 ✅ · etiqueta lima 11,4:1 ✅ · estrellas 1,8:1 ⚠️ (decorativas: la nota siempre va también en número, así que no bloquea).

### Tipografía

- Familia: **Space Grotesk** (grotesca geométrica con remates cuadrados; coincide con la "G", la "y" recta y la "g" de un piso del diseño). Se puede cambiar por otras 10 de Google Fonts o por fuentes del sistema.
- **Mayúscula en cada palabra** en todas las secciones del diseño ("Repairs Damaged Barrier In 7 Days"). Es un ajuste del tema (`Mayúscula en cada palabra`) que no afecta a descripciones, formularios ni textos legales.

| Elemento | Tamaño (1440 px) | Peso |
|---|---|---|
| Titular de sección | 66 px (`clamp` 32→66) | 500 |
| Titular del bloque de ingredientes | 66 px | 500 |
| Nombre de producto | 29 px | 600 |
| Precio y precio anterior | 26 px | 500 |
| Testimonio destacado | 24 px, interlineado 1,9 | 500 |
| Título de tarjeta y precio | 22 px | 500 |
| Nombre en reseña | 19 px | 600 |
| Cuerpo de reseña | 14,5 px | 400 |
| Beneficios, botones | 14–14,5 px | 400/600 |
| Microtextos (valoración, garantía, pie) | 12,5–13,5 px | 400 |

### Espaciado, formas y componentes

- Ancho de contenido 1300 px + 24 px de margen; los bloques a sangre (ingredientes y pie) dejan 16 px al borde y tienen 24 px de radio.
- Separación entre secciones: 96 px en ordenador, 56 px en móvil.
- Radio de imágenes y tarjetas: 16 px (tarjetas 20 px). Botones en píldora (999 px), 48 px de alto.
- Botón principal: oliva con sombra suave en el mismo tono (`0 8px 18px -6px`).
- Galería: miniaturas verticales (37 % del ancho de la principal), 3 visibles, la activa con borde oscuro; imagen principal 3:4,15.
- Estrellas en SVG con relleno proporcional a la nota (4,8 → 96 %).

---

## 3. Anatomía sección por sección (100 % de los elementos)

### 3.1 Cabecera — `sections/header.liquid`

| Elemento del diseño | Función CRO | Implementación |
|---|---|---|
| Cápsula con borde y esquinas redondas | Marco calmado, separa navegación del contenido | `.header-pill` |
| Logo DERMAREL™ con símbolo | Marca reconocible | Imagen de logo o nombre de la tienda + símbolo + ™ (ajustables) |
| Menú centrado (Home, Routine, **Products**, Skin Quiz, About) con el activo en negrita | Orientación; "Products" activo en la ficha | Menú de Shopify; en la ficha se marca el enlace a `/collections/all` |
| Buscador, cuenta y carrito en círculos | Acciones secundarias discretas | Buscador en ventana, cuenta, carrito con contador que abre el carrito lateral |
| — (móvil) | — | Menú hamburguesa en panel lateral, cabecera fija opcional, barra de anuncios opcional (oculta) |

### 3.2 Ficha de producto — `sections/main-product.liquid`

| Elemento del diseño | Función CRO / principio | Bloque |
|---|---|---|
| 3 miniaturas verticales + imagen grande | Ver el producto desde varios ángulos reduce la incertidumbre | Galería con miniaturas, deslizable en móvil con puntos, zoom al clic, vídeos y modelos 3D |
| ★★★★★ 4.8 · Trusted By 2,300+ Customers | Prueba social antes del nombre (Cialdini) | `rating` — usa la nota real de la app de reseñas si existe (`reviews.rating`) |
| DERMAREL Calming Serum | Identificación | `title` (nombre del producto) |
| Repairs Damaged Barrier In 7 Days | Promesa/hook (debe coincidir con el anuncio) | `subtitle` |
| $34.00 ~~36.25~~ (anterior sin símbolo) | Ancla de precio | `price` (precio anterior sin moneda como en el diseño; % de ahorro opcional) |
| For Sensitive, Over-Exfoliated Or Reactive Skin | Calificación de público: "es para mí" | `benefits.heading` |
| 3 beneficios con check | Beneficios, no especificaciones | `benefits` (hasta 5) |
| − 1 + y Add To Cart | Compra en 2 clics | `buy_buttons` (cantidad + añadir al carrito AJAX) |
| Buy Now - $28.80 (oliva, ancho completo) | CTA principal con precio visible | `buy_buttons` — "Comprar ahora" lleva directo al checkout; el descuento solo se muestra si hay código |
| 30-Days Risk Free Guarantee. | Reversión del riesgo | `buy_buttons.guarantee` |
| Real Customer Reviews + 5 vídeos verticales | Prueba social auténtica junto al CTA | `ugc` (8 fotos o vídeos; se abren en visor) |
| How To Use · Ingredients · Certified | Responder objeciones sin ruido | `collapsible_tab` (texto propio, descripción del producto o una página) |
| — | Variantes | `variant_picker` (solo aparece si el producto tiene variantes) |
| — | Packs por cantidad | `packs` (oculto; precio por unidad y ahorro calculados) |
| — | Envío, entrega, devoluciones, pagos | `shipping_info` (oculto; fecha estimada en días laborables y logos de pago reales) |

### 3.3 "Gentle Enough To Trust Daily" — `sections/testimonial-spotlight.liquid`

| Elemento | Función | Implementación |
|---|---|---|
| Titular centrado | Reencuadre emocional: seguridad diaria | Ajuste `heading` |
| Círculo lima con antes/después | Demostración visual del resultado | Imagen en círculo (recortada o sobresaliendo con PNG transparente), color del círculo editable |
| Testimonio largo entre comillas | Historia en primera persona con la objeción ("productos 'suaves' que irritan") | Bloques `testimonial` (hasta 6) |
| ★★★★★ en oliva | Refuerzo | Estrellas por testimonio |
| 4 avatares con nombre; el activo con anillo discontinuo | Varias voces, navegación por personas | Al tocar un avatar cambia el testimonio; cambio automático opcional |

### 3.4 "Nothing Here To Irritate Your Skin" — `sections/ingredients-callouts.liquid`

| Elemento | Función | Implementación |
|---|---|---|
| Bloque oliva a sangre con esquinas redondas | Cambio de ritmo, ancla visual a mitad de página | `bleed-card`, colores editables |
| Titular + texto | Autoridad: "cada ingrediente elegido para…" (capa 2: por qué importa) | `heading`, `text` |
| Gotero sobre anillo | Producto/textura como héroe | Imagen central (PNG transparente) |
| 5 etiquetas con check lima y línea punteada | Escaneo rápido de beneficios de la fórmula | Bloques `callout` con posición X/Y, lado del texto, longitud y ángulo de la línea; en móvil pasan a lista de 2 columnas |
| Salpicadura crema abajo a la izquierda | Decoración/textura | SVG incluido o imagen propia |

### 3.5 "Recommended For You" — `sections/recommended-products.liquid`

| Elemento | Función | Implementación |
|---|---|---|
| 4 tarjetas con borde | Venta cruzada y AOV | Bloques `product` (elige producto) |
| Etiqueta lima "For Men / For Women" | Segmentación: autoselección | `badge` |
| Foto, nombre, frase corta | Beneficio en una línea | `title` (opcional), `description` |
| ★ 4.8 (1,040 Reviews) + precio | Prueba social + precio en tarjeta | `rating`/`reviews_count` o metacampos de la app de reseñas; precio real del producto |
| — | Fotos de proveedor con fondo blanco | Fusión del fondo blanco con el crema (`multiply`), desactivable |

### 3.6 "2,300+ Customers Trust Us" — `sections/reviews-wall.liquid`

| Elemento | Función | Implementación |
|---|---|---|
| Nota grande 4.9 + estrellas + "Based On…" | Prueba social cuantitativa | **Calculada** a partir del desglose: media ponderada y total, siempre coherentes |
| Write A Review | Reciprocidad / participación | Abre un formulario que llega a tu email (formulario de contacto de Shopify) |
| Barras 5★…1★ en dos columnas | Transparencia (mostrar 1★ aumenta la credibilidad) | Barras proporcionales al total |
| 6 reseñas en 2 columnas: nombre, Verified Customer, estrellas, fecha, texto | Prueba social cualitativa | Bloques `review` (con foto opcional) y casilla "Compra verificada" |
| Load More | Profundidad sin ruido | Muestra N reseñas y va cargando el resto |
| — | Apps de reseñas | Admite bloques de app (Judge.me, Loox…) |

### 3.7 Pie — `sections/footer.liquid`

| Elemento | Función | Implementación |
|---|---|---|
| Bloque oscuro a sangre con logo claro | Cierre de marca | Logo claro opcional |
| "Talk To Someone Who Understands Sensitive Skin" + formulario (nombre, email, consulta) | Atención humana: reduce la ansiedad y capta leads | Formulario de contacto de Shopify con campos subrayados |
| Send Message → | CTA secundario | Botón crema con flecha |
| Quick Links · Our Solutions · Explore | Navegación y legales | 3 bloques de menú (hasta 4) |
| Redes sociales | Prueba de que la marca existe | URLs en Configuración del tema |
| Copyright | Legal | Año automático + nombre de la tienda |

---

## 4. Auditoría CRO por semáforo

Marco: congruencia con el anuncio, pliegue, problema antes que producto, sorpresas del checkout (Baymard), persuasión ética (Cialdini) y facilidad (Fogg).

| # | Punto | Estado en el diseño | Por qué | Solución en el tema |
|---|---|---|---|---|
| 1 | Congruencia anuncio → página | 🟡 Depende del anuncio | El subtítulo es el hook: si el anuncio dice otra cosa, se rompe el *message match* | Subtítulo editable por producto. Escribe la **misma frase** que abre el anuncio |
| 2 | Arriba del pliegue (1440 px) | 🟢 | Valoración, nombre, promesa, precio, beneficios y CTA visibles | — |
| 3 | Arriba del pliegue (390 px) | 🔴 | La galería 3:4 ocupa ~540 px: el botón cae por debajo del primer pantallazo | **Barra fija de compra en móvil, visible también antes de llegar al botón** (activada) o imágenes cuadradas |
| 4 | Problema antes que producto | 🟡 | Válido para tráfico templado. Con tráfico frío faltan las capas "por qué importa" y "por qué no lo has resuelto" | Sección **Problema (CRO)** oculta, colocada justo tras la ficha. Actívala en campañas en frío |
| 5 | Facilidad de uso (Fogg) | 🟡 | Solo un desplegable cuenta cómo se usa | Sección **Rutina en pasos** (3 pasos con imagen), oculta |
| 6 | Coste y umbral de envío | 🔴 | No aparece. Es la 1.ª causa de abandono (≈40 % según Baymard) | Bloque **Envío, entrega y pagos** + barra de envío gratis en el carrito |
| 7 | Fecha de entrega | 🔴 | No aparece | Fecha estimada automática en días laborables ("Recíbelo entre el mié 21 y el lun 26") |
| 8 | Métodos de pago | 🔴 | No aparecen | Logos de los métodos **activos** en tu checkout (no inventados) |
| 9 | Garantía y devoluciones | 🟡 | "30-Days Risk Free" está bien situado, pero no explica cómo se devuelve | Línea de devoluciones en el bloque de envío; enlaza a tu política |
| 10 | Precio de "Comprar ahora" | 🔴 | Muestra 28,80 con un precio de 34,00 (-15,3 %). Si el checkout no aplica ese precio, es una sorpresa que rompe la confianza | Por defecto muestra el precio real. Para replicar el diseño: % + **código de descuento** que se aplica solo al ir al checkout |
| 11 | Ancla de precio | 🟡 | 36,25 → 34,00 es solo un 6,2 % de ahorro: ancla débil. En la UE el precio anterior debe ser el más bajo de los últimos 30 días (Directiva Ómnibus) | Precio anterior desde "Precio de comparación" de Shopify; % de ahorro opcional; packs con ahorro real |
| 12 | Coherencia de la prueba social | 🔴 | 4,8 en la ficha; 4,9 en reseñas pero dibujado con 4 estrellas; "2,300+", "2608+" y un desglose que suma 2.643 (media real 4,82) | Media y total **calculados** del desglose; estrellas con relleno exacto; la ficha usa la nota de la app si existe |
| 13 | Reseñas reales | 🟡 | "Verified Customer" en todas: solo es legal si se ha verificado la compra | Casilla por reseña + aviso en el editor; bloques de app para reseñas verificadas |
| 14 | Urgencia o escasez falsa | 🟢 | No hay contadores ni "X personas viendo" | El tema no incluye ninguno |
| 15 | Alegaciones (claims) | 🟡 | "Repairs… In 7 Days", "Zero Irritation", "Visibly Calmer Within Days" son alegaciones con resultado y plazo. El Reglamento (UE) 655/2013 exige poder demostrarlas | Usa claims de sensación/constancia salvo que tengas estudio ("Ayuda a calmar la sensación de tirantez", "Fórmula sin fragancia") |
| 16 | Venta cruzada | 🟢 | 4 productos segmentados por público | Bloques de producto con etiqueta |
| 17 | Atención humana | 🟢 | Formulario en el pie | Formulario funcional (llega a tu email) |
| 18 | Accesibilidad | 🟡 | Contrastes correctos salvo estrellas; textos de 12 px | Etiquetas ARIA, foco visible, teclado (Escape cierra), "Saltar al contenido", movimiento reducido |
| 19 | Rendimiento y SEO | — | Depende de la implementación | Sin jQuery ni librerías; CSS 10 KB + JS 6 KB comprimidos; imagen principal precargada; `srcset` en todas las imágenes; datos estructurados `Product` y `FAQPage` |

**Resumen del semáforo:** 4 🟢 · 8 🟡 · 6 🔴 (todos los 🔴 se resuelven con ajustes del tema, sin tocar código).

---

## 5. Qué incluye el tema además del diseño

| Mejora | Estado por defecto | Dónde se activa |
|---|---|---|
| Carrito lateral AJAX con barra de envío gratis | Activado (la barra, con umbral > 0) | Configuración del tema → Carrito |
| Barra fija de compra (móvil) | Activada | Ficha de producto → Barra fija de compra |
| Nota y total de reseñas calculados | Activado | Reseñas → desglose |
| Nota real desde la app de reseñas | Activado (si hay metacampos) | Ficha → Valoración |
| Bloque Envío, entrega y pagos | Oculto | Ficha → bloque "Envío, entrega y pagos" (icono del ojo) |
| Packs por cantidad | Oculto | Ficha → bloque "Packs por cantidad" |
| Descuento en "Comprar ahora" | Inactivo hasta poner código | Ficha → Botones de compra |
| Sección Problema (CRO) | Oculta | Plantilla de producto → "Problema (CRO)" |
| Sección Rutina en pasos | Oculta | Plantilla de producto → "Rutina en pasos" |
| Sección Preguntas frecuentes (con datos estructurados) | Oculta | Plantilla de producto → "Preguntas frecuentes" |
| Barra de anuncios | Oculta | Cabecera → "Barra de anuncios" |
| Animación suave al hacer scroll | Activada | Configuración del tema → Diseño |

---

## 6. Recomendación de uso según el tráfico

- **Retargeting / búsqueda / orgánico (templado):** plantilla tal cual + activar **Envío, entrega y pagos**.
- **Meta Ads en frío:** además, activar **Problema (CRO)** (justo debajo de la ficha), **Rutina en pasos** y **Preguntas frecuentes**, y poner como subtítulo la frase exacta del anuncio.
- **Producto con margen para packs:** activar **Packs por cantidad** con el pack de 2 preseleccionado y crear el descuento automático por cantidad en Shopify con los mismos porcentajes.

## 7. Métricas para saber qué falla

| Tramo | Métrica | Referencia | Si falla |
|---|---|---|---|
| Entrada del anuncio | Reproducciones de 3 s ÷ impresiones | 20–25 % | Cambiar el gancho del anuncio, no la página |
| Cuerpo del anuncio | ThruPlays ÷ impresiones | 5–7 % | Acortar el problema o mostrar antes la fricción |
| Clic | CTR de enlace | 1–1,5 % | Revisar el final del anuncio |
| Página | Compras ÷ clics en el enlace | 1–4 % | Congruencia anuncio-página, precio, pagos, envío |

Si el CTR es bueno y la conversión mala, el problema casi siempre está en la página o en la oferta.

## 8. Notas legales para vender en España (no es asesoramiento jurídico)

- **Reseñas:** la Directiva Ómnibus (UE 2019/2161), traspuesta en el Real Decreto-ley 24/2021, prohíbe publicar reseñas falsas o presentarlas como verificadas sin comprobarlo, y obliga a informar de cómo se verifican. Las reseñas, nombres y testimonios del diseño son **contenido de ejemplo**: sustitúyelos por reseñas reales antes de publicar.
- **Precios tachados:** el precio anterior debe ser el más bajo aplicado en los 30 días previos a la rebaja.
- **Garantía de 30 días:** es adicional al derecho de desistimiento legal de 14 días (Ley General para la Defensa de los Consumidores y Usuarios), que debe figurar en tus políticas.
- **Cosméticos:** las alegaciones deben cumplir el Reglamento (UE) 655/2013 (veracidad, pruebas, honradez) y la lista INCI debe ser la real del producto.
- **Privacidad:** las fuentes de Google se cargan desde servidores de Google; si quieres evitarlo, desactiva "Cargar fuentes desde Google Fonts". Los formularios usan el sistema de contacto de Shopify.
