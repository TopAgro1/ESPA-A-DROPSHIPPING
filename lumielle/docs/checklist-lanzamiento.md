# Checklist de lanzamiento — Lumielle en Colombia

Sigue el orden. Lo marcado con ⚠️ bloquea el lanzamiento.

## Día 1 — Tienda, producto y tema

### Configuración de la tienda (la que era de Argentina)
- [ ] ⚠️ **Configuración → General → Moneda de la tienda: Peso colombiano (COP).** Shopify no convierte los precios al cambiar la moneda: cámbiala antes de cargar el producto. Si la tienda ya tuvo ventas, puede que tengas que pedir el cambio a soporte de Shopify.
- [ ] En el mismo lugar → **Cambiar formato de moneda**: en los cuatro campos usa `${{amount_no_decimals_with_comma_separator}}` (y en «con moneda» `${{amount_no_decimals_with_comma_separator}} COP`). Así los precios salen como **$79.900**.
- [ ] Zona horaria: (GMT-05:00) Bogotá. Unidad de peso: kg.
- [ ] Datos de la tienda: nombre «Lumielle», email de atención (idealmente con tu dominio).
- [ ] **Configuración → Mercados**: Colombia como mercado principal; desactiva Argentina.
- [ ] Archiva los productos argentinos que no vayas a vender en Colombia.

### Producto
- [ ] ⚠️ Pide al proveedor el **número de NSO INVIMA** y la foto original en alta. Sin NSO no se vende.
- [ ] Crea el producto con `producto.md` (variantes «1 unidad / 2 unidades / 3 unidades», precios, costos, SEO) **en borrador**.
- [ ] Sube las 9 imágenes de `images/galeria/` en orden, con su texto alternativo.
- [ ] Crea la colección «Cuidado facial» y agrega el producto.

### Tema
- [ ] **Tienda online → Temas → Agregar tema → Subir archivo zip** → `dist/lumielle-theme-v1.0.0.zip`.
- [ ] **Contenido → Archivos**: sube `images/secciones/` con los nombres exactos (`lumielle-activos.jpg`, `lumielle-pack-1.jpg`, `lumielle-pack-2.jpg`, `lumielle-pack-3.jpg`, `lumielle-final.jpg`).
- [ ] **Personalizar → Configuración del tema**:
  - Marca → Favicon: `brand/lumielle-favicon-512.png` (el logo ya viene en el tema).
  - WhatsApp y contacto: tu número con 57 (p. ej. 573001234567) y tu email.
  - Envíos y entrega: confirma días mínimos/máximos y hora de corte con Dropi.
  - Redes sociales: tus URL (los iconos solo aparecen si las cargas).
- [ ] **Contenido → Menús**: `main-menu` (Inicio, Crema Serum 10, Preguntas frecuentes → `/products/crema-facial-serum-10#faq`, Contacto) y `footer` (Sobre nosotros, Contacto, Rastrear pedido).
- [ ] Páginas: «Sobre nosotros» y «Contacto» (plantilla de página).
- [ ] Revisa la ficha en móvil desde **Vista previa** antes de publicar.

## Día 2 — Cobro, logística, legales y medición

### Contra entrega
- [ ] **Configuración → Pagos → Métodos de pago manuales → Pago contra entrega (COD)**. Con esto el botón «Pedir ahora – Paga al recibir» ya funciona: agrega el pack y lleva al checkout.
- [ ] Recomendado: instala **Releasit COD Form** (gratis hasta 60 pedidos/mes): formulario en la misma página, teléfono +57 obligatorio, departamento/ciudad/barrio, verificación por OTP y bloqueo de duplicados. Agrega su bloque en la ficha (Personalizar → Ficha de producto → Agregar bloque → Apps) y activa **Configuración del tema → Venta y cobro → Ocultar los botones del tema**.
- [ ] Checkout: teléfono obligatorio, dirección completa, idioma español.
- [ ] **Configuración → Envíos**: zona Colombia, tarifa «Envío gratis (2 a 5 días hábiles)» a $0.

### Dropi
- [ ] Conecta Shopify con Dropi y vincula las 3 variantes (1, 2 y 3 unidades del producto del proveedor).
- [ ] Confirma tiempos de despacho, flete real por ciudad y comisión de recaudo, y actualiza `ficha-estrategica.md` si cambian.
- [ ] Define el flujo de confirmación por WhatsApp (mensaje en < 1 hora desde el pedido). Sube la entrega del 55-60 % al 70-85 %.

### Legales
- [ ] ⚠️ Completa los corchetes de `legales-colombia.md` y pégalos en **Configuración → Políticas**. Valídalos con un profesional.
- [ ] Completa **Datos legales** en el pie de página (Personalizar → Pie de página).

### Medición
- [ ] App **Facebook & Instagram** de Shopify: Meta Pixel + API de conversiones con «Máximo» de datos compartidos.
- [ ] Si usas Releasit, conecta el Pixel en Releasit para que envíe *Purchase* al confirmar el formulario.
- [ ] Verifica en el Administrador de eventos: ViewContent, AddToCart, InitiateCheckout y Purchase.

### Antes de publicar
- [ ] ⚠️ Pedido de prueba completo desde el celular (pack de 2) y desde el computador.
- [ ] Publica el tema y pasa el producto a **Activo**.
- [ ] Dominio: cuando compres el dominio internacional, conéctalo en **Configuración → Dominios**, márcalo como principal y crea el email con ese dominio.

## Anuncios (Meta)

- Destino: `/products/crema-facial-serum-10` (la ficha ES la landing).
- Message match: el primer segundo del video y el titular del anuncio repiten «3 activos antiedad en 1 sola crema» y el pack de 2.
- Segmentación 18+ (Meta exige 18+ en antiedad y antes/después). Nada de «elimina arrugas», «rejuvenece 10 años» ni plazos garantizados.
- Objetivos: CPA ≤ $22.000 por pedido, ≥ 55 % de pedidos con 2+ unidades (ver `ficha-estrategica.md`).

## Después del primer pedido

- [ ] **Judge.me** (gratis) para pedir reseñas con foto a los 10-14 días. Cuando tengas reseñas reales, activa la sección **Reseñas** en la ficha (está oculta) y agrega el bloque de la app.
- [ ] Con videos reales, activa la sección **Videos y UGC** (está oculta).
- [ ] Emails de carrito abandonado: 1 h, 24 h y 48-72 h (incentivo solo en el tercero).
