# Producto en Shopify — listo para pegar

Crear en **Productos → Agregar producto** (o con el conector de Shopify, usando `producto.json`). Dejarlo en **Borrador** hasta hacer el pedido de prueba.

## Datos generales

| Campo | Valor |
|---|---|
| Título | Crema Facial Serum 10 – Retinol, Colágeno y Hialurónico |
| Handle (URL) | `crema-facial-serum-10` |
| Proveedor | Serum 10 |
| Tipo de producto | Crema facial |
| Categoría | Salud y belleza › Cuidado personal › Cosméticos › Cuidado de la piel › Lociones y cremas hidratantes |
| Etiquetas | antiedad, retinol, colageno, acido-hialuronico, crema-facial, skincare |
| Colección | Cuidado facial (crear) |
| Plantilla del tema | Producto predeterminado (`product`) |
| Estado | Borrador |

## Variantes (packs)

Opción: **Cantidad**. Los valores deben empezar con el número de unidades: el tema calcula el ahorro y el precio por unidad a partir de ese número.

| Cantidad | Precio | Precio de comparación | Costo por artículo | SKU | Peso |
|---|---|---|---|---|---|
| 1 unidad | 79900 | (vacío) | 16970 | SERUM10-CF110-X1 | 0,15 kg |
| 2 unidades | 119900 | (vacío) | 33940 | SERUM10-CF110-X2 | 0,30 kg |
| 3 unidades | 159900 | (vacío) | 50910 | SERUM10-CF110-X3 | 0,45 kg |

- Deja vacío el precio de comparación: el tema muestra el ahorro real frente a comprar por unidad («Ahorras $39.900»). Un precio tachado inventado es publicidad engañosa.
- Inventario: no rastrear (lo maneja Dropi). Requiere envío: sí.
- En Dropi, vincula cada variante con 1, 2 y 3 unidades del producto del proveedor.

## Descripción (HTML)

```html
<p><strong>Tu rutina antiedad completa en una sola crema.</strong> La Crema Facial Serum 10 combina retinol, colágeno y ácido hialurónico en una fórmula para rostro y cuello: aporta hidratación profunda y suavidad, suaviza visiblemente los signos del envejecimiento y contribuye a mejorar el aspecto de firmeza de la piel.</p>
<ul>
  <li><strong>Ácido hialurónico:</strong> hidrata en profundidad y deja la piel suave.</li>
  <li><strong>Retinol:</strong> suaviza visiblemente las líneas finas y mejora la textura con el uso constante.</li>
  <li><strong>Colágeno:</strong> ayuda a retener la hidratación y contribuye a mejorar el aspecto de firmeza.</li>
</ul>
<p><strong>Modo de uso:</strong> aplica en la noche sobre rostro y cuello limpios, con movimientos ascendentes, evitando el contorno de ojos. Si es tu primera vez con retinol, haz una prueba 24 horas antes y empieza 3 noches por semana. De día, usa protector solar. Si estás embarazada o lactando, consulta con tu médico antes de usarla.</p>
<p>Contenido: 110 ml. Lista completa de ingredientes (INCI) en el empaque. NSO INVIMA: [número que te dé el proveedor]. Los resultados pueden variar según cada piel.</p>
```

Reemplaza `[número que te dé el proveedor]` por la Notificación Sanitaria Obligatoria real antes de publicar; si el proveedor no la tiene, no vendas el producto.

## SEO (Buscadores)

| Campo | Valor |
|---|---|
| Título de la página (≤ 60) | Crema Facial Serum 10 con Retinol y Colágeno \| Lumielle |
| Meta descripción (≤ 155) | Crema facial con retinol, colágeno y ácido hialurónico para rostro y cuello. 110 ml. Envío gratis a toda Colombia y pago contra entrega. |

## Imágenes (en este orden)

Archivos en `lumielle/images/galeria/` (1600 × 1600, JPG ≤ 200 KB).

| # | Archivo | Texto alternativo |
|---|---|---|
| 1 | 01-hero.jpg | Crema Facial Serum 10 de 110 ml con su caja |
| 2 | 02-beneficios.jpg | Beneficios: hidratación profunda, líneas finas más suaves, aspecto más firme, rostro y cuello |
| 3 | 03-tres-activos.jpg | Ácido hialurónico, retinol y colágeno en una sola crema |
| 4 | 04-rutina.jpg | Rutina de noche en 3 pasos: limpia, aplica y protege |
| 5 | 05-rinde-mas.jpg | Tubo de 110 ml frente a un sérum típico de 30 ml |
| 6 | 06-comparativa.jpg | Comparativa: una crema frente a tres productos por separado |
| 7 | 07-packs.jpg | Packs de 1, 2 y 3 unidades |
| 8 | 08-contraentrega.jpg | Pago contra entrega en 3 pasos |
| 9 | 09-garantia.jpg | Garantía de satisfacción de 30 días |

Cuando tengas fotos reales (ver `shot-list.md`), pon una foto de uso real en la posición 3 y un video UGC en la 2.

## Imágenes de secciones (Contenido → Archivos)

El tema ya las referencia por nombre: súbelas a **Contenido → Archivos** con estos nombres exactos y aparecen solas en la landing.

| Archivo | Dónde aparece |
|---|---|
| lumielle-activos.jpg | Ficha: infografía «3 activos» · Inicio: portada |
| lumielle-pack-1.jpg, lumielle-pack-2.jpg, lumielle-pack-3.jpg | Oferta de packs, comparativa e inicio |
| lumielle-final.jpg | Llamado final (ficha) e infografía (inicio) |
