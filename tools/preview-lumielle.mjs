#!/usr/bin/env node
// Vista previa local del tema Lumielle sin tienda: renderiza product.json / index.json con liquidjs
// y datos de ejemplo (Crema Facial Serum 10, packs 1/2/3 en COP).
//
// Uso:
//   node tools/preview-lumielle.mjs [--template product|index] [--out lumielle/preview] [--inline 1]
//
// --inline 1: genera un único HTML autocontenido (CSS, JS e imágenes embebidas) para compartir.
import fs from 'node:fs';
import path from 'node:path';
import { Liquid, Tag, Value, Drop } from 'liquidjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => (arg.startsWith('--') ? [...pairs, [arg.slice(2), all[i + 1]]] : pairs), []),
);
const here = path.dirname(new URL(import.meta.url).pathname);
const base = path.resolve(here, '../lumielle');
const root = path.join(base, 'theme');
const outDir = path.resolve(args.out || path.join(base, 'preview'));
const templateName = args.template || 'product';
const inline = args.inline === '1';
const imageDirs = [path.join(base, 'images/galeria'), path.join(base, 'images/secciones')];

const stripComments = (text) => text.replace(/^\/\*[\s\S]*?\*\/\s*/, '');
const readJSON = (file) => JSON.parse(stripComments(fs.readFileSync(path.join(root, file), 'utf8')));
const locale = readJSON('locales/es.default.json');

fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'images'), { recursive: true });
for (const file of fs.readdirSync(path.join(root, 'assets'))) fs.copyFileSync(path.join(root, 'assets', file), path.join(outDir, 'assets', file));

// ---------- Datos de ejemplo ----------
let mediaId = 100;
function image(name, width = 1600, height = 1600, alt = '') {
  const dir = imageDirs.find((d) => fs.existsSync(path.join(d, name)));
  let src = null;
  if (dir) {
    fs.copyFileSync(path.join(dir, name), path.join(outDir, 'images', name));
    src = `images/${name}`;
  }
  const img = { id: ++mediaId, src, width, height, aspect_ratio: width / height, alt, media_type: 'image' };
  img.preview_image = img;
  return img;
}
class ColorDrop extends Drop {
  constructor(hex) {
    super();
    this.hex = hex;
    const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
    this.red = (n >> 16) & 255; this.green = (n >> 8) & 255; this.blue = n & 255;
  }
  valueOf() { return this.hex; }
  toString() { return this.hex; }
}
class FontDrop extends Drop {
  constructor(handle) {
    super();
    this.family = 'Inter';
    this.fallback_families = 'system-ui, sans-serif';
    this.weight = handle.endsWith('7') ? 700 : 400;
    this.style = 'normal';
  }
  toString() { return this.family; }
}

const galleryAlts = {
  '01-hero.jpg': 'Crema Facial Serum 10 de 110 ml con su caja',
  '02-beneficios.jpg': 'Beneficios: hidratación profunda, líneas finas más suaves, aspecto más firme, rostro y cuello',
  '03-tres-activos.jpg': 'Ácido hialurónico, retinol y colágeno en una sola crema',
  '04-rutina.jpg': 'Rutina de noche en 3 pasos: limpia, aplica y protege',
  '05-rinde-mas.jpg': 'Tubo de 110 ml frente a un sérum típico de 30 ml',
  '06-comparativa.jpg': 'Comparativa: una crema frente a tres productos por separado',
  '07-packs.jpg': 'Packs de 1, 2 y 3 unidades',
  '08-contraentrega.jpg': 'Pago contra entrega en 3 pasos',
  '09-garantia.jpg': 'Garantía de satisfacción de 30 días',
};
const media = Object.entries(galleryAlts).map(([file, alt]) => image(file, 1600, 1600, alt));
const packs = [['1 unidad', 7990000], ['2 unidades', 11990000], ['3 unidades', 15990000]];
const variants = packs.map(([title, price], i) => ({
  id: 4300001 + i, title, price, compare_at_price: null, available: true, options: [title], option1: title,
  featured_media: null, inventory_management: null, inventory_quantity: 0, sku: `SERUM10-CF110-X${i + 1}`,
}));
const product = {
  id: 9001, title: 'Crema Facial Serum 10 – Retinol, Colágeno y Hialurónico', handle: 'crema-facial-serum-10',
  url: '/products/crema-facial-serum-10', vendor: 'Serum 10', type: 'Crema facial',
  price: 7990000, price_min: 7990000, price_max: 15990000, price_varies: true, compare_at_price: null, available: true,
  description: '<p>Crema facial con retinol, colágeno y ácido hialurónico.</p>',
  has_only_default_variant: false, options: ['Cantidad'],
  options_with_values: [{ name: 'Cantidad', position: 1, values: packs.map(([t]) => t), selected_value: '1 unidad' }],
  variants, selected_variant: null, selected_or_first_available_variant: variants[0], first_available_variant: variants[0],
  media, featured_media: media[0], featured_image: media[0], images: media, metafields: {},
};
const link = (title, url) => ({ title, url, active: false, current: false, child_active: false, links: [] });
const linklists = {
  'main-menu': { links: [link('Inicio', '#'), link('Crema Serum 10', '#'), link('Preguntas', '#faq'), link('Contacto', '#')] },
  footer: { links: [link('Sobre nosotros', '#'), link('Contacto', '#'), link('Rastrear pedido', '#')] },
};

// ---------- Ajustes globales ----------
const schema = readJSON('config/settings_schema.json');
const settings = {};
for (const group of schema) for (const s of group.settings || []) if ('default' in s) settings[s.id] = s.default;
Object.assign(settings, readJSON('config/settings_data.json').current, {
  whatsapp_number: '573000000000', contact_email: 'hola@lumielle.co', social_instagram: '#', social_tiktok: '#',
});
for (const group of schema) {
  for (const s of group.settings || []) {
    if (s.type === 'color' && settings[s.id]) settings[s.id] = new ColorDrop(settings[s.id]);
    if (s.type === 'font_picker' && settings[s.id]) settings[s.id] = new FontDrop(settings[s.id]);
  }
}

const policy = (title, handle) => ({ title, url: `/policies/${handle}`, body: '' });
const globals = {
  settings,
  shop: {
    name: 'Lumielle', money_format: '${{amount_no_decimals_with_comma_separator}}', description: 'Skincare en Colombia',
    enabled_payment_types: ['visa', 'master', 'american_express'], url: '#',
    policies: [policy('Política de reembolso', 'refund-policy'), policy('Política de privacidad', 'privacy-policy'),
      policy('Términos del servicio', 'terms-of-service'), policy('Política de envío', 'shipping-policy')],
  },
  product: templateName === 'product' ? product : undefined,
  collections: { all: { products: [product] } },
  cart: { item_count: 0, items: [], total_price: 0, currency: { iso_code: 'COP' }, cart_level_discount_applications: [] },
  request: { locale: { iso_code: 'es' }, page_type: templateName, origin: 'https://lumielle.co' },
  template: { name: templateName },
  routes: {
    root_url: '#', cart_url: '#cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', search_url: '#',
    all_products_collection_url: '#',
  },
  canonical_url: 'https://lumielle.co/products/crema-facial-serum-10',
  page_title: templateName === 'product' ? product.title : 'Lumielle',
  page_description: 'Crema facial con retinol, colágeno y ácido hialurónico. Envío gratis a toda Colombia y pago contra entrega.',
  content_for_header: '',
  current_page: 1,
  linklists,
};

// ---------- Motor Liquid con filtros/etiquetas de Shopify ----------
const engine = new Liquid({ root: [path.join(root, 'snippets')], partials: path.join(root, 'snippets'), extname: '.liquid', strictFilters: true, globals });
const kw = (list) => Object.fromEntries(list.filter(Array.isArray));
const money = (cents) => {
  const value = Math.round(Number(cents || 0) / 100);
  return `$${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};
const lookup = (key) => key.split('.').reduce((obj, k) => (obj ? obj[k] : undefined), locale);
const translate = (key, params) => {
  let value = lookup(key);
  if (value && typeof value === 'object' && 'count' in params) value = Number(params.count) === 1 ? value.one : value.other;
  if (value === undefined) return `translation missing: es.${key}`;
  return String(value).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) => (params[name] ?? ''));
};
const placeholder = (name, cls) => `<svg class="${cls || ''}" viewBox="0 0 525 525" xmlns="http://www.w3.org/2000/svg" data-placeholder="${name}"><rect width="525" height="525" fill="currentColor" opacity=".08"/></svg>`;
const shopImage = (value) => {
  if (typeof value === 'string' && value.startsWith('shopify://shop_images/')) {
    const name = value.replace('shopify://shop_images/', '');
    const [w, h] = name.includes('pack') ? [1000, 1000] : name.includes('hero') ? [1600, 1600] : [1200, 1200];
    return image(name, w, h);
  }
  return value;
};
const srcOf = (obj) => (obj && typeof obj === 'object' ? obj.src : obj);

const filters = {
  money: (v) => money(v), money_without_trailing_zeros: (v) => money(v), money_with_currency: (v) => `${money(v)} COP`,
  money_without_currency: (v) => money(v).replace('$', ''),
  t: (key, ...rest) => translate(key, kw(rest)),
  asset_url: (name) => `assets/${name}`,
  stylesheet_tag: (url) => `<link rel="stylesheet" href="${url}">`,
  image_url: (img) => srcOf(shopImage(img)) || '',
  image_tag: (src, ...rest) => {
    const o = kw(rest);
    if (!src) return placeholder('image', o.class);
    const attrs = ['class', 'loading', 'alt', 'sizes', 'width', 'height', 'fetchpriority'].filter((k) => o[k] !== undefined && o[k] !== null).map((k) => `${k}="${String(o[k]).replace(/"/g, '&quot;')}"`).join(' ');
    return `<img src="${src}" ${attrs}>`;
  },
  placeholder_svg_tag: (name, cls) => placeholder(name, cls),
  payment_type_svg_tag: (type, ...rest) => `<svg class="${kw(rest).class || ''}" viewBox="0 0 38 24"><rect width="38" height="24" rx="4" fill="#fff" stroke="#ccc"/><text x="19" y="15" font-size="7" text-anchor="middle" fill="#333">${type.slice(0, 4).toUpperCase()}</text></svg>`,
  structured_data: (p) => JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p && p.title }),
  json: (v) => JSON.stringify(v, (k, val) => (val instanceof ColorDrop ? val.hex : k === 'preview_image' ? undefined : val)),
  video_tag: () => '<video></video>', external_video_tag: () => '', media_tag: () => '',
  default_errors: () => '', default_pagination: () => '', format_code: (v) => v, time_tag: (v) => v, shopify_asset_url: (v) => v,
  url_encode: (v) => encodeURIComponent(String(v ?? '')),
  font_modify: (font, prop, value) => { const f = new FontDrop('inter_n4'); f.weight = value === 'bold' ? 700 : Number(value); return f; },
  font_face: () => '', font_url: () => '', preload_tag: () => '', payment_button: () => '',
  divided_by: (a, b) => (Number.isInteger(Number(a)) && Number.isInteger(Number(b)) ? Math.floor(Number(a) / Number(b)) : Number(a) / Number(b)),
};
for (const [name, fn] of Object.entries(filters)) engine.registerFilter(name, fn);

function blockTag(endName, wrap) {
  return class extends Tag {
    constructor(token, remain, liquid) {
      super(token, remain, liquid);
      this.args = token.args;
      this.templates = [];
      const stream = this.liquid.parser.parseStream(remain)
        .on(`tag:${endName}`, () => stream.stop())
        .on('template', (tpl) => this.templates.push(tpl))
        .on('end', () => { throw new Error(`${token.name} sin cerrar`); });
      stream.start();
    }
    * render(ctx, emitter) {
      const result = wrap ? yield* wrap.call(this, ctx) : null;
      if (result) emitter.write(result.open);
      yield this.liquid.renderer.renderTemplates(this.templates, ctx, emitter);
      if (result) emitter.write(result.close);
    }
  };
}
engine.registerTag('schema', class extends Tag {
  constructor(token, remain, liquid) {
    super(token, remain, liquid);
    while (remain.length) { const t = remain.shift(); if (t.name === 'endschema') return; }
  }
  * render() {}
});
engine.registerTag('paginate', blockTag('endpaginate'));
engine.registerTag('form', blockTag('endform', function* (ctx) {
  const parts = this.args.split(',').map((p) => p.trim()).filter(Boolean);
  const type = parts.shift().replace(/['"]/g, '');
  const attrs = { method: 'post', action: type === 'product' ? '/cart/add' : '#' };
  for (const part of parts) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    attrs[part.slice(0, i).trim()] = yield new Value(part.slice(i + 1).trim(), this.liquid).value(ctx);
  }
  ctx.push({ form: { errors: null, posted_successfully: false } });
  const html = Object.entries(attrs).map(([k, v]) => (k.startsWith('data-') && v === '' ? k : `${k}="${v}"`)).join(' ');
  return { open: `<form ${html}>`, close: '</form>' };
}));

let sectionIndex = 0;
async function renderSectionFile(type, id, data = {}, index = 0) {
  const file = path.join(root, 'sections', `${type}.liquid`);
  const source = fs.readFileSync(file, 'utf8');
  const sectionSchema = JSON.parse(source.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/)[1]);
  const defaults = (list) => Object.fromEntries((list || []).filter((s) => 'default' in s).map((s) => [s.id, s.default]));
  const resolve = (list, values) => {
    for (const s of list || []) {
      if (s.type === 'link_list') values[s.id] = typeof values[s.id] === 'string' ? (linklists[values[s.id]] || null) : null;
      if (s.type === 'image_picker') values[s.id] = shopImage(values[s.id]);
    }
    return values;
  };
  const settingsValues = resolve(sectionSchema.settings, { ...defaults(sectionSchema.settings), ...(data.settings || {}) });
  const order = data.block_order || [];
  const blocks = order.filter((bid) => !data.blocks[bid].disabled).map((bid) => {
    const block = data.blocks[bid];
    const blockSchema = (sectionSchema.blocks || []).find((b) => b.type === block.type) || {};
    const values = resolve(blockSchema.settings, { ...defaults(blockSchema.settings), ...(block.settings || {}) });
    return { id: bid, type: block.type, settings: values, shopify_attributes: '' };
  });
  const section = { id, index, settings: settingsValues, blocks };
  const html = await engine.parseAndRender(source, { ...globals, section });
  const tag = sectionSchema.tag || 'div';
  return `<${tag} id="shopify-section-${id}" class="shopify-section ${sectionSchema.class || ''}">${html}</${tag}>`;
}

engine.registerTag('section', class extends Tag {
  constructor(token, remain, liquid) { super(token, remain, liquid); this.name = token.args.replace(/['"\s]/g, ''); }
  * render(ctx, emitter) { emitter.write(yield renderSectionFile(this.name, this.name)); }
});
engine.registerTag('sections', class extends Tag {
  constructor(token, remain, liquid) { super(token, remain, liquid); this.name = token.args.replace(/['"\s]/g, ''); }
  * render(ctx, emitter) {
    const group = readJSON(`sections/${this.name}.json`);
    for (const id of group.order) {
      const data = group.sections[id];
      if (data.disabled) continue;
      emitter.write(yield renderSectionFile(data.type, `sections--1__${id}`, data));
    }
  }
});

// ---------- Render ----------
const template = readJSON(`templates/${templateName}.json`);
let content = '';
for (const id of template.order) {
  const data = template.sections[id];
  if (data.disabled) continue;
  sectionIndex += 1;
  content += await renderSectionFile(data.type, `template--1__${id}`, data, sectionIndex);
}
const layout = fs.readFileSync(path.join(root, 'layout', `${template.layout || 'theme'}.liquid`), 'utf8');
let html = await engine.parseAndRender(layout, { ...globals, content_for_layout: content });

// Solo vista previa: fuente Inter desde Google Fonts y aviso al simular el checkout.
const previewHead = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">';
const previewScript = `<script>
  (function () {
    var realFetch = window.fetch;
    window.fetch = function (url, options) {
      if (/\\/cart\\/(add|change)\\.js|\\/cart\\.js|#cart\\.js/.test(String(url))) {
        return Promise.resolve(new Response(JSON.stringify({ item_count: 1, items: [], sections: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return realFetch.apply(this, arguments);
    };
    window.addEventListener('hashchange', function () {
      if (location.hash === '#/checkout') {
        var n = document.getElementById('PreviewNotice');
        n.hidden = false; setTimeout(function () { n.hidden = true; history.replaceState(null, '', location.pathname); }, 3500);
      }
    });
  })();
</script>
<div id="PreviewNotice" hidden style="position:fixed;left:16px;right:16px;top:16px;z-index:99;padding:14px 18px;border-radius:12px;background:#14213D;color:#fff;font:600 15px/1.4 Inter,sans-serif;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.25)">Vista previa: aquí se abre el checkout de Shopify (o el formulario contra entrega de tu app).</div>`;
html = html.replace('</head>', `${previewHead}</head>`).replace('<script src="assets/theme.js" defer></script>', `${previewScript}<script src="assets/theme.js" defer></script>`);

if (inline) {
  const read = (p) => fs.readFileSync(path.join(outDir, p));
  html = html.replace('<link rel="stylesheet" href="assets/base.css">', `<style>${read('assets/base.css')}</style>`);
  html = html.replace('<script src="assets/theme.js" defer></script>', `<script>${read('assets/theme.js')}</script>`);
  html = html.replace(/(src|href)="images\/([^"]+)"/g, (m, attr, name) => `${attr}="data:image/jpeg;base64,${read(`images/${name}`).toString('base64')}"`);
}

const outFile = path.join(outDir, `${templateName}${inline ? '.inline' : ''}.html`);
fs.writeFileSync(outFile, html);
const missing = html.match(/translation missing: [\w.]+/g);
if (missing) console.warn(`Traducciones que faltan: ${[...new Set(missing)].join(', ')}`);
console.log(`✓ Vista previa: ${outFile} (${Math.round(html.length / 1024)} KB)`);
