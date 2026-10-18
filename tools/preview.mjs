#!/usr/bin/env node
// Vista previa local del tema sin tienda Shopify: renderiza una plantilla JSON con
// datos de ejemplo usando liquidjs y emula los filtros/etiquetas de Shopify que usa el tema.
//
// Uso:
//   node tools/preview.mjs [--template product] [--out tools/.preview] [--images carpeta]
//
// --images: carpeta opcional con fotos de ejemplo (main.jpg, thumb1-3.jpg, ugc1-4.jpg,
//           circle.jpg, avatar1-4.jpg, dropper.jpg, card1-4.jpg). Sin ella se usan marcadores.
import fs from 'node:fs';
import path from 'node:path';
import { Liquid, Tag, Value, Drop } from 'liquidjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => (arg.startsWith('--') ? [...pairs, [arg.slice(2), all[i + 1]]] : pairs), []),
);
const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(args.theme || path.join(here, '../theme'));
const outDir = path.resolve(args.out || path.join(here, '.preview'));
const templateName = args.template || 'product';
const imagesDir = args.images ? path.resolve(args.images) : null;

const stripComments = (text) => text.replace(/^\/\*[\s\S]*?\*\/\s*/, '');
const readJSON = (file) => JSON.parse(stripComments(fs.readFileSync(path.join(root, file), 'utf8')));
const locale = readJSON('locales/es.default.json');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'images'), { recursive: true });
for (const file of fs.readdirSync(path.join(root, 'assets'))) fs.copyFileSync(path.join(root, 'assets', file), path.join(outDir, 'assets', file));

// ---------- Datos de ejemplo ----------
let mediaId = 100;
function image(name, width = 1000, height = 1250) {
  let src = null;
  if (imagesDir && fs.existsSync(path.join(imagesDir, name))) {
    fs.copyFileSync(path.join(imagesDir, name), path.join(outDir, 'images', name));
    src = `images/${name}`;
  }
  const img = { id: ++mediaId, src, width, height, aspect_ratio: width / height, alt: '', media_type: 'image' };
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

let variantsMock = null;
const variant = { id: 4100001, title: 'Default Title', price: 3400, compare_at_price: 3625, available: true, options: ['Default Title'], featured_media: null };
const mainMedia = [image('main.jpg', 924, 1280), image('thumb2.jpg', 840, 1040), image('thumb3.jpg', 840, 1040)];
if (args.variants) {
  // Producto con variantes para probar el selector: Tamaño × Formato
  const sizes = ['30 ml', '50 ml'];
  const formats = ['Sérum', 'Crema'];
  variantsMock = sizes.flatMap((size, i) => formats.map((format, j) => ({
    id: 4200000 + i * 10 + j, title: `${size} / ${format}`, price: 3400 + i * 1000 + j * 200,
    compare_at_price: 3625 + i * 1000 + j * 200, available: !(i === 1 && j === 1), options: [size, format], featured_media: null,
  })));
}
const product = {
  id: 9001, title: 'Sérum Calmante DERMAREL', handle: 'serum-calmante', url: '/products/serum-calmante',
  price: 3400, price_min: 3400, price_varies: false, compare_at_price: 3625, available: true,
  description: '<p>Descripción del producto.</p>',
  has_only_default_variant: !variantsMock, options: variantsMock ? ['Tamaño', 'Formato'] : ['Title'],
  options_with_values: variantsMock
    ? [{ name: 'Tamaño', values: ['30 ml', '50 ml'], selected_value: '30 ml' }, { name: 'Formato', values: ['Sérum', 'Crema'], selected_value: 'Sérum' }]
    : [{ name: 'Title', values: ['Default Title'], selected_value: 'Default Title' }],
  variants: variantsMock || [variant], selected_or_first_available_variant: (variantsMock || [variant])[0],
  media: mainMedia, featured_media: mainMedia[0], images: mainMedia, metafields: {},
};
const cardProduct = (i, title, price) => {
  const media = image(`card${i}.jpg`, 1020, 820);
  return { id: 9100 + i, title, url: '#', price, price_min: price, price_varies: false, featured_media: media, metafields: {} };
};
const cardProducts = {
  'card-1': cardProduct(1, 'Sérum post-afeitado', 3000),
  'card-2': cardProduct(2, 'Crema reparadora de noche', 3400),
  'card-3': cardProduct(3, 'Sérum calmante', 3400),
  'card-4': cardProduct(4, 'Protector barrera SPF', 2800),
};
const link = (title, url, active = false) => ({ title, url, active, child_active: false, links: [] });
const linklists = {
  'main-menu': { links: [link('Inicio', '/'), link('Rutina', '/pages/rutina'), link('Productos', '/collections/all'), link('Test de piel', '/pages/test'), link('Sobre nosotros', '/pages/sobre')] },
  footer: { links: [link('Blog', '/blogs/news'), link('Contacto', '/pages/contacto'), link('Política de privacidad', '/policies/privacy-policy'), link('Términos del servicio', '/policies/terms-of-service')] },
  soluciones: { links: [link('Limpiador barrera', '#'), link('Sérum calmante', '#'), link('Sérum recuperador', '#'), link('Protector barrera SPF', '#')] },
};

// Imágenes de ejemplo inyectadas en las secciones (solo vista previa)
const sectionImages = {
  'testimonial-spotlight': { settings: { image: image('circle.jpg', 864, 864) }, blocks: [1, 2, 3, 4].map((i) => ({ avatar: image(`avatar${i}.jpg`, 168, 168) })) },
  'ingredients-callouts': { settings: { image: image('dropper.jpg', 512, 732) } },
  'recommended-products': { blocks: [1, 2, 3, 4].map((i) => ({ product: cardProducts[`card-${i}`] })) },
};
const ugcImages = [1, 2, 3, 4, 1, 2].map((i) => image(`ugc${i}.jpg`, 140, 188));
const footerMenus = { menu_solutions: 'soluciones' };

// ---------- Ajustes globales ----------
const schema = readJSON('config/settings_schema.json');
const settings = {};
for (const group of schema) for (const s of group.settings || []) if ('default' in s) settings[s.id] = s.default;
Object.assign(settings, readJSON('config/settings_data.json').current, {
  social_facebook: '#', social_tiktok: '#', social_instagram: '#', social_pinterest: '#', social_youtube: '#',
});
for (const group of schema) for (const s of group.settings || []) if (s.type === 'color' && settings[s.id]) settings[s.id] = new ColorDrop(settings[s.id]);

const globals = {
  settings,
  shop: {
    name: 'Dermarel', money_format: '{{amount_with_comma_separator}} €', description: 'Cuidado para piel sensible',
    customer_accounts_enabled: true, enabled_payment_types: ['visa', 'master', 'american_express', 'paypal', 'apple_pay', 'google_pay'],
    shipping_policy: {}, url: '/',
  },
  product: templateName === 'product' ? product : undefined,
  cart: { item_count: 0, items: [], total_price: 0, taxes_included: true, currency: { iso_code: 'EUR' }, cart_level_discount_applications: [] },
  request: { locale: { iso_code: 'es' }, page_type: templateName, origin: 'https://example.com' },
  template: { name: templateName },
  routes: {
    root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', search_url: '/search',
    account_url: '/account', account_login_url: '/account/login', all_products_collection_url: '/collections/all',
  },
  canonical_url: 'https://example.com/products/serum-calmante',
  page_title: templateName === 'product' ? product.title : 'Dermarel',
  page_description: 'Sérum calmante para piel sensible.',
  content_for_header: '',
  current_page: 1,
  linklists,
};

// ---------- Motor Liquid con filtros/etiquetas de Shopify ----------
// En Shopify los objetos globales (settings, shop, product…) también son visibles dentro de {% render %}.
const engine = new Liquid({ root: [path.join(root, 'snippets')], partials: path.join(root, 'snippets'), extname: '.liquid', strictFilters: true, globals });
const kw = (list) => Object.fromEntries(list.filter(Array.isArray));
const money = (cents, currency = true) => {
  const value = (Number(cents || 0) / 100).toFixed(2).split('.');
  const amount = `${value[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${value[1]}`;
  return currency ? `${amount} €` : amount;
};
const translate = (key, params) => {
  const value = key.split('.').reduce((obj, k) => (obj ? obj[k] : undefined), locale);
  if (value === undefined) return `translation missing: es.${key}`;
  return String(value).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) => (params[name] ?? ''));
};
const placeholder = (name, cls) => `<svg class="${cls || ''}" viewBox="0 0 525 525" xmlns="http://www.w3.org/2000/svg" data-placeholder="${name}"><rect width="525" height="525" fill="currentColor" opacity=".08"/><circle cx="262" cy="230" r="70" fill="currentColor" opacity=".18"/><rect x="150" y="330" width="225" height="26" rx="13" fill="currentColor" opacity=".18"/></svg>`;
const srcOf = (obj) => (obj && typeof obj === 'object' ? obj.src : obj);

const filters = {
  money: (v) => money(v), money_with_currency: (v) => `${money(v)} EUR`, money_without_currency: (v) => money(v, false),
  t: (key, ...rest) => translate(key, kw(rest)),
  asset_url: (name) => `assets/${name}`,
  stylesheet_tag: (url) => `<link rel="stylesheet" href="${url}">`,
  image_url: (img) => srcOf(img) || '',
  image_tag: (src, ...rest) => {
    const o = kw(rest);
    if (!src) return placeholder('image', o.class);
    const attrs = ['class', 'loading', 'alt', 'sizes', 'width', 'height', 'style'].filter((k) => o[k] !== undefined).map((k) => `${k}="${String(o[k]).replace(/"/g, '&quot;')}"`).join(' ');
    return `<img src="${src}" ${attrs}>`;
  },
  placeholder_svg_tag: (name, cls) => placeholder(name, cls),
  payment_type_svg_tag: (type, ...rest) => `<svg class="${kw(rest).class || ''}" viewBox="0 0 38 24"><rect width="38" height="24" rx="4" fill="#fff" stroke="#ccc"/><text x="19" y="15" font-size="7" text-anchor="middle" fill="#333">${type.slice(0, 4).toUpperCase()}</text></svg>`,
  structured_data: (p) => JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p && p.title }),
  json: (v) => JSON.stringify(v, (k, val) => (val instanceof ColorDrop ? val.hex : k === 'preview_image' ? undefined : val)),
  video_tag: () => '<video></video>', external_video_tag: () => '', media_tag: () => '', model_viewer_tag: () => '',
  default_errors: () => '', default_pagination: () => '', format_code: (v) => v, time_tag: (v) => v, format_address: () => '', link_to: (t, u) => `<a href="${u}">${t}</a>`,
  handleize: (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  divided_by: (a, b) => Number(a) / Number(b),
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
      if (result === false) return;
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
engine.registerTag('style', blockTag('endstyle', function* () { return { open: '<style>', close: '</style>' }; }));
engine.registerTag('paginate', blockTag('endpaginate'));
engine.registerTag('form', blockTag('endform', function* (ctx) {
  const parts = this.args.split(',').map((p) => p.trim()).filter(Boolean);
  const type = parts.shift().replace(/['"]/g, '');
  const attrs = { method: 'post', action: type === 'product' ? '/cart/add' : '/contact' };
  for (const part of parts) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    attrs[part.slice(0, i).trim()] = yield new Value(part.slice(i + 1).trim(), this.liquid).value(ctx);
  }
  ctx.push({ form: { errors: null, posted_successfully: false } });
  const html = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return { open: `<form ${html}>`, close: '</form>' };
}));

async function renderSectionFile(type, id, data = {}) {
  const file = path.join(root, 'sections', `${type}.liquid`);
  const source = fs.readFileSync(file, 'utf8');
  const sectionSchema = JSON.parse(source.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/)[1]);
  const defaults = (list) => Object.fromEntries((list || []).filter((s) => 'default' in s).map((s) => [s.id, s.default]));
  const resolve = (list, values) => {
    for (const s of list || []) {
      if (s.type === 'link_list' && typeof values[s.id] === 'string') values[s.id] = linklists[values[s.id]] || null;
      if (s.type === 'link_list' && values[s.id] === undefined) values[s.id] = null;
    }
    return values;
  };
  const extra = sectionImages[type] || {};
  const settingsValues = resolve(sectionSchema.settings, { ...defaults(sectionSchema.settings), ...(data.settings || {}), ...(extra.settings || {}) });
  const order = data.block_order || [];
  const blocks = order.filter((bid) => args['show-disabled'] || !data.blocks[bid].disabled).map((bid, i) => {
    const block = data.blocks[bid];
    const blockSchema = (sectionSchema.blocks || []).find((b) => b.type === block.type) || {};
    const values = resolve(blockSchema.settings, { ...defaults(blockSchema.settings), ...(block.settings || {}), ...((extra.blocks || [])[i] || {}) });
    if (type === 'footer' && footerMenus[bid]) values.menu = linklists[footerMenus[bid]];
    if (block.type === 'ugc') ugcImages.forEach((img, n) => { values[`image_${n + 1}`] = img; });
    return { id: bid, type: block.type, settings: values, shopify_attributes: '' };
  });
  const section = { id, settings: settingsValues, blocks };
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
  if (data.disabled && !args['show-disabled']) continue;
  content += await renderSectionFile(data.type, `template--1__${id}`, data);
}
const layout = fs.readFileSync(path.join(root, 'layout', `${template.layout || 'theme'}.liquid`), 'utf8');
const html = await engine.parseAndRender(layout, { ...globals, content_for_layout: content });
const outFile = path.join(outDir, `${templateName}.html`);
fs.writeFileSync(outFile, html);
const missing = html.match(/translation missing: [\w.]+/g);
if (missing) console.warn(`Traducciones que faltan: ${[...new Set(missing)].join(', ')}`);
console.log(`✓ Vista previa: ${outFile}`);
