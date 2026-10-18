#!/usr/bin/env node
// Valida los esquemas de secciones y las plantillas JSON con las reglas que Shopify
// aplica al subir un tema (Theme Check no revisa las plantillas JSON contra los esquemas).
// Uso: node tools/validate.mjs [ruta-del-tema]
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || new URL('../theme', import.meta.url).pathname);
const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const stripComments = (text) => text.replace(/^\/\*[\s\S]*?\*\/\s*/, '');
const readJSON = (file) => JSON.parse(stripComments(fs.readFileSync(file, 'utf8')));

const NO_DEFAULT = new Set(['image_picker', 'video', 'product', 'collection', 'page', 'blog', 'article', 'product_list', 'collection_list', 'metaobject']);
const INPUT_TYPES = new Set(['text', 'textarea', 'richtext', 'inline_richtext', 'html', 'liquid', 'url', 'checkbox', 'number', 'range', 'select', 'radio', 'color', 'color_background', 'color_scheme', 'color_scheme_group', 'font_picker', 'image_picker', 'video', 'video_url', 'link_list', 'product', 'product_list', 'collection', 'collection_list', 'page', 'blog', 'article', 'text_alignment', 'metaobject', 'metaobject_list']);
const SIDEBAR_TYPES = new Set(['header', 'paragraph']);

function validateSettings(file, settings, where) {
  const ids = new Set();
  for (const s of settings || []) {
    if (SIDEBAR_TYPES.has(s.type)) {
      if (!s.content) err(file, `${where}: ${s.type} sin "content"`);
      continue;
    }
    if (!INPUT_TYPES.has(s.type)) err(file, `${where}: tipo desconocido "${s.type}"`);
    if (!s.id) { err(file, `${where}: ajuste sin id`); continue; }
    if (ids.has(s.id)) err(file, `${where}: id duplicado "${s.id}"`);
    ids.add(s.id);
    if (!s.label) err(file, `${where}.${s.id}: sin label`);
    const has = Object.prototype.hasOwnProperty.call(s, 'default');
    const d = s.default;
    if (NO_DEFAULT.has(s.type) && has) err(file, `${where}.${s.id}: ${s.type} no admite default`);
    if (s.type === 'range') {
      for (const k of ['min', 'max', 'step', 'default']) if (typeof s[k] !== 'number') err(file, `${where}.${s.id}: range necesita ${k} numérico`);
      const steps = (s.max - s.min) / s.step;
      if (steps > 101) err(file, `${where}.${s.id}: range con ${steps} pasos (máx. 101)`);
      if (Math.abs(steps - Math.round(steps)) > 1e-9) err(file, `${where}.${s.id}: (max-min) no es múltiplo de step`);
      if (d < s.min || d > s.max) err(file, `${where}.${s.id}: default fuera de rango`);
      if (Math.abs((d - s.min) / s.step - Math.round((d - s.min) / s.step)) > 1e-9) err(file, `${where}.${s.id}: default no alineado con step`);
    }
    if ((s.type === 'select' || s.type === 'radio')) {
      if (!Array.isArray(s.options) || !s.options.length) err(file, `${where}.${s.id}: select sin options`);
      else if (has && !s.options.some((o) => o.value === d)) err(file, `${where}.${s.id}: default "${d}" no está en options`);
    }
    if (s.type === 'checkbox' && has && typeof d !== 'boolean') err(file, `${where}.${s.id}: checkbox default debe ser booleano`);
    if (s.type === 'number' && has && typeof d !== 'number') err(file, `${where}.${s.id}: number default debe ser número`);
    if (s.type === 'color' && has && !/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(d)) err(file, `${where}.${s.id}: color default inválido`);
    if (s.type === 'richtext' && has && !/^<(p|ul|ol|h[1-6])[\s>]/.test(d)) err(file, `${where}.${s.id}: richtext default debe empezar por <p>, <ul>, <ol> o <h*>`);
    if (s.type === 'inline_richtext' && has && /<(p|div|ul|h\d)/.test(d)) err(file, `${where}.${s.id}: inline_richtext no admite etiquetas de bloque`);
    if (s.type === 'link_list' && has && !['main-menu', 'footer'].includes(d)) err(file, `${where}.${s.id}: link_list default solo puede ser main-menu o footer`);
    if (s.type === 'url' && has && !['/collections', '/collections/all'].includes(d)) err(file, `${where}.${s.id}: url default solo /collections o /collections/all`);
    if (s.type === 'video_url' && !Array.isArray(s.accept)) err(file, `${where}.${s.id}: video_url necesita accept`);
  }
  return ids;
}

// ---------- Esquemas de secciones ----------
const sections = {};
for (const name of fs.readdirSync(path.join(root, 'sections'))) {
  if (!name.endsWith('.liquid')) continue;
  const file = `sections/${name}`;
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const match = text.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  if (!match) { err(file, 'sin {% schema %}'); continue; }
  let schema;
  try { schema = JSON.parse(match[1]); } catch (e) { err(file, `schema JSON inválido: ${e.message}`); continue; }
  if (!schema.name) err(file, 'schema sin name');
  if (schema.name && schema.name.length > 25) err(file, `name "${schema.name}" supera 25 caracteres`);
  const settingIds = validateSettings(file, schema.settings, 'settings');
  const blocks = {};
  for (const block of schema.blocks || []) {
    if (block.type === '@app' || block.type === '@theme') { blocks[block.type] = { settings: new Set() }; continue; }
    if (!block.name) err(file, `bloque ${block.type} sin name`);
    if (block.name && block.name.length > 25) err(file, `bloque "${block.name}" supera 25 caracteres`);
    if (blocks[block.type]) err(file, `tipo de bloque duplicado ${block.type}`);
    blocks[block.type] = { settings: validateSettings(file, block.settings, `blocks.${block.type}`), schema: block };
  }
  for (const preset of schema.presets || []) {
    if (preset.name && preset.name.length > 25) err(file, `preset "${preset.name}" supera 25 caracteres`);
    for (const b of preset.blocks || []) {
      if (!blocks[b.type]) err(file, `preset usa bloque inexistente ${b.type}`);
      for (const key of Object.keys(b.settings || {})) if (blocks[b.type] && !blocks[b.type].settings.has(key)) err(file, `preset: ajuste inexistente ${b.type}.${key}`);
    }
    for (const key of Object.keys(preset.settings || {})) if (!settingIds.has(key)) err(file, `preset: ajuste inexistente ${key}`);
  }
  sections[name.replace('.liquid', '')] = { schema, settingIds, blocks };
}

// ---------- settings_schema.json ----------
const globalSchema = readJSON(path.join(root, 'config/settings_schema.json'));
const globalIds = new Set();
for (const group of globalSchema) {
  if (group.name === 'theme_info') continue;
  for (const id of validateSettings('config/settings_schema.json', group.settings, group.name)) {
    if (globalIds.has(id)) err('config/settings_schema.json', `id global duplicado ${id}`);
    globalIds.add(id);
  }
}
const data = readJSON(path.join(root, 'config/settings_data.json'));
for (const key of Object.keys(data.current || {})) if (!globalIds.has(key)) err('config/settings_data.json', `ajuste global inexistente ${key}`);

// ---------- Plantillas JSON y grupos ----------
function validateValue(file, where, def, value) {
  if (!def) return;
  if (def.type === 'range' && (value < def.min || value > def.max)) err(file, `${where}: ${value} fuera de rango`);
  if (def.type === 'select' && !def.options.some((o) => o.value === value)) err(file, `${where}: "${value}" no es una opción válida`);
  if (def.type === 'checkbox' && typeof value !== 'boolean') err(file, `${where}: debe ser booleano`);
  if (def.type === 'richtext' && value && !/^<(p|ul|ol|h[1-6])[\s>]/.test(value)) err(file, `${where}: richtext debe empezar por <p>/<ul>/<ol>`);
}
function settingDef(list, id) { return (list || []).find((s) => s.id === id); }

function validateTemplate(file, json, group) {
  const order = json.order || [];
  for (const id of order) if (!json.sections[id]) err(file, `order incluye sección inexistente ${id}`);
  for (const [id, section] of Object.entries(json.sections || {})) {
    if (!order.includes(id)) err(file, `sección ${id} no está en order`);
    const def = sections[section.type];
    if (!def) { err(file, `tipo de sección inexistente ${section.type}`); continue; }
    const enabled = def.schema.enabled_on && def.schema.enabled_on.groups;
    if (enabled && !(group && enabled.includes(group))) err(file, `${section.type} solo se permite en grupos ${enabled.join(', ')}`);
    for (const [key, value] of Object.entries(section.settings || {})) {
      if (!def.settingIds.has(key)) err(file, `${id}: ajuste inexistente ${key}`);
      validateValue(file, `${id}.${key}`, settingDef(def.schema.settings, key), value);
    }
    const blockOrder = section.block_order || [];
    const counts = {};
    for (const [bid, block] of Object.entries(section.blocks || {})) {
      if (!blockOrder.includes(bid)) err(file, `${id}: bloque ${bid} no está en block_order`);
      const bdef = def.blocks[block.type];
      if (!bdef) { err(file, `${id}: tipo de bloque inexistente ${block.type}`); continue; }
      counts[block.type] = (counts[block.type] || 0) + 1;
      for (const [key, value] of Object.entries(block.settings || {})) {
        if (!bdef.settings.has(key)) err(file, `${id}.${bid}: ajuste inexistente ${key}`);
        validateValue(file, `${id}.${bid}.${key}`, settingDef(bdef.schema && bdef.schema.settings, key), value);
      }
    }
    for (const bid of blockOrder) if (!(section.blocks || {})[bid]) err(file, `${id}: block_order incluye bloque inexistente ${bid}`);
    for (const [type, count] of Object.entries(counts)) {
      const limit = def.blocks[type].schema && def.blocks[type].schema.limit;
      if (limit && count > limit) err(file, `${id}: ${count} bloques ${type} (límite ${limit})`);
    }
    const total = Object.keys(section.blocks || {}).length;
    if (def.schema.max_blocks && total > def.schema.max_blocks) err(file, `${id}: ${total} bloques (max_blocks ${def.schema.max_blocks})`);
  }
}

for (const dir of ['templates', 'templates/customers', 'sections']) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full)) {
    if (!name.endsWith('.json')) continue;
    const file = `${dir}/${name}`;
    let json;
    try { json = readJSON(path.join(full, name)); } catch (e) { err(file, `JSON inválido: ${e.message}`); continue; }
    validateTemplate(file, json, dir === 'sections' ? json.type : null);
  }
}

// ---------- Locales ----------
const flatten = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
const locales = fs.readdirSync(path.join(root, 'locales')).filter((n) => n.endsWith('.json') && !n.includes('.schema.'));
const base = new Set(flatten(readJSON(path.join(root, 'locales', locales.find((n) => n.includes('.default.'))))));
for (const name of locales) {
  const keys = new Set(flatten(readJSON(path.join(root, 'locales', name))));
  for (const k of base) if (!keys.has(k)) err(`locales/${name}`, `falta la clave ${k}`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  console.error(`\n${errors.length} errores`);
  process.exit(1);
}
console.log(`✓ Tema válido: ${Object.keys(sections).length} secciones, plantillas JSON y locales correctos.`);
