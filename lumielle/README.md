# Lumielle — tienda y landing de la Crema Facial Serum 10 (Colombia)

Tienda Shopify de un producto (con base para sumar más skincare) armada para tráfico frío de Meta Ads con pago contra entrega.

- **Tema listo para subir:** [`../dist/lumielle-theme-v1.0.0.zip`](../dist/lumielle-theme-v1.0.0.zip)
- **Estrategia, margen y CPA máximo:** [`docs/ficha-estrategica.md`](docs/ficha-estrategica.md)
- **Producto para cargar en Shopify:** [`docs/producto.md`](docs/producto.md) (y `docs/producto.json` para el conector)
- **Textos legales de Colombia:** [`docs/legales-colombia.md`](docs/legales-colombia.md)
- **Fotos y videos que faltan:** [`docs/shot-list.md`](docs/shot-list.md)
- **Qué hacer en el admin, paso a paso:** [`docs/checklist-lanzamiento.md`](docs/checklist-lanzamiento.md)

## Qué hay en cada carpeta

```
lumielle/
  theme/            Tema Online Store 2.0 escrito desde cero (secciones lp-*, main-product con packs)
  images/galeria/   9 imágenes de producto 1600×1600 (orden y textos alternativos en docs/producto.md)
  images/secciones/ Imágenes de la landing: subir a Contenido → Archivos con el mismo nombre
  brand/            Logo (SVG claro/oscuro, PNG), símbolo y favicon 32/512
  docs/             Ficha, producto, legales, shot list y checklist
  tools/            build-templates.py: genera product.json e index.json con todo el copy
```

## La página de producto (que ES la landing)

1. Galería deslizable + miniaturas · antetítulo · título · valoración (solo si hay reseñas reales) · gancho · precio con ahorro real · 4 beneficios
2. **Packs** 1/2/3 como tarjetas, «Más popular» preseleccionado, ahorro en pesos y precio por unidad
3. Botón «Pedir ahora – Paga al recibir» · entrega estimada con fechas reales (hora de corte, sábados y festivos de Colombia) · iconos de confianza · pago contra entrega · desplegables
4. Cinta de beneficios → Problema → 3 activos (infografía) → Beneficios → Rutina en 3 pasos → Comparativa → Oferta de packs → Garantía de 30 días → Preguntas frecuentes (con datos estructurados) → Llamado final
5. Barra de compra fija en móvil, WhatsApp flotante, carrito lateral con AJAX

Ocultas hasta tener material real: **Reseñas** (con bloque para Judge.me), **Videos y UGC** y **Completa tu rutina**.

Todo se edita desde el editor de temas: textos, imágenes, colores, fuentes, packs, modo de cobro (contra entrega / en línea), días de entrega, festivos, WhatsApp. No hay textos fijos en el código.

## Para desarrolladores

```bash
cd tools && npm install                                   # una vez
node validate.mjs ../lumielle/theme                       # esquemas y plantillas
node theme-check.mjs ../lumielle/theme                    # Theme Check oficial (0 errores)
node preview-lumielle.mjs --template product              # vista previa → lumielle/preview/product.html
node preview-lumielle.mjs --template index --inline 1     # HTML autocontenido para compartir
python3 ../lumielle/tools/build-templates.py              # regenera product.json / index.json tras editar el copy
cd .. && THEME_DIR=lumielle/theme THEME_NAME=lumielle-theme bash scripts/build-zip.sh   # zip
```

Presupuesto de rendimiento: CSS 41 KB, JS 23 KB sin dependencias, una familia tipográfica (Inter, del Shopify Font Library), imagen principal precargada, el resto en diferido, `prefers-reduced-motion` respetado.
