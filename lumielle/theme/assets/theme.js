/* Lumielle — JS del tema (vanilla, sin dependencias). */
(() => {
  'use strict';

  const L = window.Lumielle || {};
  const routes = L.routes || { root: '/', cartAdd: '/cart/add', cartChange: '/cart/change', cart: '/cart' };
  const strings = L.strings || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utilidades ---------- */
  function formatMoney(cents) {
    const format = String(L.moneyFormat || '${{amount}}').replace(/<[^>]*>/g, '');
    const value = Number(cents || 0) / 100;
    const group = (number, decimals, thousands, decimal) => {
      const [int, dec] = number.toFixed(decimals).split('.');
      const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return dec ? `${grouped}${decimal}${dec}` : grouped;
    };
    const match = format.match(/\{\{\s*(\w+)\s*\}\}/);
    let amount;
    switch (match && match[1]) {
      case 'amount_no_decimals': amount = group(value, 0, ',', '.'); break;
      case 'amount_with_comma_separator': amount = group(value, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': amount = group(value, 0, '.', ','); break;
      case 'amount_with_apostrophe_separator': amount = group(value, 2, "'", '.'); break;
      case 'amount_with_space_separator': amount = group(value, 2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': amount = group(value, 0, ' ', ','); break;
      default: amount = group(value, 2, ',', '.');
    }
    amount = amount.replace(/[.,]00$/, '');
    return match ? format.replace(match[0], amount) : amount;
  }

  function announce(message) {
    const region = document.getElementById('LiveRegion');
    if (!region) return;
    region.textContent = '';
    window.setTimeout(() => { region.textContent = message; }, 50);
  }

  function scrollToEl(el) {
    if (!el) return;
    const header = $('.section-header');
    const offset = header ? header.getBoundingClientRect().height + 12 : 12;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  const packQty = (value) => Math.max(1, parseInt(String(value), 10) || 1);

  async function postJSON(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok || data.status) throw new Error(data.description || data.message || strings.error);
    return data;
  }

  /* ---------- Carrito lateral ---------- */
  const Cart = {
    drawer: null,
    lastFocus: null,

    init() {
      this.drawer = $('[data-cart-drawer]');
      document.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-cart-toggle]');
        if (toggle && L.cartType === 'drawer' && this.drawer && !document.body.classList.contains('template-cart')) {
          event.preventDefault();
          this.open();
          return;
        }
        if (event.target.closest('[data-drawer-close]')) {
          this.close();
          return;
        }
        const qtyButton = event.target.closest('[data-cart-qty]');
        if (qtyButton) {
          const line = qtyButton.closest('[data-line]');
          if (line) this.change(Number(line.dataset.line), Number(qtyButton.dataset.cartQty));
          return;
        }
        const upsell = event.target.closest('[data-upsell-add]');
        if (upsell) this.add([{ id: Number(upsell.dataset.upsellAdd), quantity: 1 }]).catch(() => {});
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.drawer && this.drawer.classList.contains('is-open')) this.close();
      });
    },

    open() {
      if (!this.drawer) return;
      this.lastFocus = document.activeElement;
      this.drawer.classList.add('is-open');
      this.drawer.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      window.setTimeout(() => { const panel = $('.drawer__panel', this.drawer); if (panel) panel.focus(); }, 60);
    },

    close() {
      if (!this.drawer) return;
      this.drawer.classList.remove('is-open');
      this.drawer.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      if (this.lastFocus) this.lastFocus.focus();
    },

    render(sections) {
      const html = sections && sections['cart-drawer'];
      if (!html || !this.drawer) return;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = $('[data-cart-drawer-content]', doc);
      const current = $('[data-cart-drawer-content]', this.drawer);
      if (fresh && current) current.innerHTML = fresh.innerHTML;
    },

    updateCount(count) {
      $$('[data-cart-count]').forEach((el) => {
        el.textContent = count;
        el.classList.toggle('is-empty', count === 0);
      });
    },

    async refreshCount() {
      try {
        const cart = await (await fetch(`${routes.cart}.js`, { headers: { Accept: 'application/json' } })).json();
        this.updateCount(cart.item_count);
      } catch (error) { /* sin conexión: el contador se actualiza al recargar */ }
    },

    async add(items) {
      const data = await postJSON(`${routes.cartAdd}.js`, { items, sections: 'cart-drawer', sections_url: window.location.pathname });
      this.render(data.sections);
      await this.refreshCount();
      announce(strings.cartUpdated || '');
      return data;
    },

    async change(line, quantity) {
      const content = this.drawer ? $('[data-cart-drawer-content]', this.drawer) : null;
      if (content) content.classList.add('is-loading');
      try {
        const data = await postJSON(`${routes.cartChange}.js`, { line, quantity, sections: 'cart-drawer', sections_url: window.location.pathname });
        if (document.body.classList.contains('template-cart')) {
          window.location.reload();
          return;
        }
        this.render(data.sections);
        this.updateCount(data.item_count);
        announce(strings.cartUpdated || '');
      } catch (error) {
        announce(strings.error || '');
      } finally {
        if (content) content.classList.remove('is-loading');
      }
    },
  };

  /* ---------- Ficha de producto ---------- */
  class ProductSection {
    constructor(el) {
      this.el = el;
      const json = $('[data-product-json]', el);
      if (!json) return;
      this.product = JSON.parse(json.textContent);
      this.packIndex = parseInt(el.dataset.packIndex, 10);
      this.unitPrice = parseInt(el.dataset.unitPrice, 10) || 0;
      this.form = document.getElementById(el.dataset.formId);
      this.idInput = this.form ? $('[data-variant-id]', this.form) : null;
      this.cta = this.form ? $('[data-main-cta]', this.form) : null;
      this.error = this.form ? $('[data-form-error]', this.form) : null;
      const currentId = this.idInput ? Number(this.idInput.value) : null;
      this.variant = this.product.variants.find((v) => v.id === currentId) || this.product.variants[0];
      this.initGallery();
      this.initOptions();
      this.initQuantity();
      this.initForm();
    }

    /* Galería */
    initGallery() {
      const gallery = $('[data-gallery]', this.el);
      if (!gallery) return;
      this.track = $('[data-gallery-track]', gallery);
      this.slides = $$('.gallery__slide', this.track);
      this.thumbs = $$('[data-thumb-index]', this.el);
      const counter = $('[data-gallery-current]', gallery);
      const goTo = (index) => {
        const i = Math.max(0, Math.min(this.slides.length - 1, index));
        this.track.scrollTo({ left: i * this.track.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
      };
      this.goToSlide = goTo;
      let ticking = false;
      this.track.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          const index = Math.round(this.track.scrollLeft / Math.max(1, this.track.clientWidth));
          if (counter) counter.textContent = String(index + 1);
          this.thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
          ticking = false;
        });
      }, { passive: true });
      this.thumbs.forEach((thumb) => thumb.addEventListener('click', () => goTo(Number(thumb.dataset.thumbIndex))));
      const current = () => Math.round(this.track.scrollLeft / Math.max(1, this.track.clientWidth));
      const prev = $('[data-gallery-prev]', gallery);
      const next = $('[data-gallery-next]', gallery);
      if (prev) prev.addEventListener('click', () => goTo(current() - 1));
      if (next) next.addEventListener('click', () => goTo(current() + 1));
    }

    showMedia(mediaId) {
      if (!mediaId || !this.slides || !this.goToSlide) return;
      const index = this.slides.findIndex((slide) => Number(slide.dataset.mediaId) === mediaId);
      if (index >= 0) this.goToSlide(index);
    }

    /* Variantes y packs */
    initOptions() {
      this.el.addEventListener('change', (event) => {
        if (!event.target.matches('[data-option-input]')) return;
        this.onOptionChange();
      });
    }

    selectedOptions() {
      return this.product.options.map((_, i) => {
        const checked = $(`[data-option-input="${i}"]:checked`, this.el);
        return checked ? checked.value : this.variant.options[i];
      });
    }

    findVariant(options) {
      return this.product.variants.find((v) => v.options.every((value, i) => value === options[i]));
    }

    onOptionChange() {
      const options = this.selectedOptions();
      const variant = this.findVariant(options);
      $$('.pack', this.el).forEach((pack) => {
        const input = $('.pack__input', pack);
        pack.classList.toggle('is-selected', Boolean(input && input.checked));
      });
      $$('[data-option-selected]', this.el).forEach((el) => { el.textContent = options[Number(el.dataset.optionSelected)] || ''; });
      if (!variant) {
        this.setButton(false, strings.unavailable);
        return;
      }
      this.variant = variant;
      if (this.idInput) this.idInput.value = variant.id;
      this.updatePrice(variant);
      this.updatePacks(options);
      this.setButton(variant.available, variant.available ? null : strings.soldOut);
      if (variant.featured_media) this.showMedia(variant.featured_media.id);
      if (this.el.hasAttribute('data-update-url')) {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }
      $$('[data-sticky-price]').forEach((el) => { el.textContent = formatMoney(variant.price); });
      document.dispatchEvent(new CustomEvent('lumielle:variant-change', { detail: { variant, product: this.product } }));
    }

    qtyOf(variant) {
      return this.packIndex >= 0 ? packQty(variant.options[this.packIndex]) : 1;
    }

    updatePrice(variant) {
      const block = $('[data-price-block]', this.el);
      if (!block) return;
      const qty = this.qtyOf(variant);
      let reference = this.unitPrice * qty;
      if (variant.compare_at_price && variant.compare_at_price > variant.price && variant.compare_at_price > reference) reference = variant.compare_at_price;
      const savings = reference - variant.price;
      const set = (selector, text) => { const el = $(selector, block); if (el) el.textContent = text; };
      const toggle = (selector, show) => { const el = $(selector, block); if (el) el.hidden = !show; };
      set('[data-price-current]', formatMoney(variant.price));
      set('[data-price-ref-value]', formatMoney(reference));
      set('[data-price-save-value]', formatMoney(savings));
      set('[data-price-unit-value]', formatMoney(Math.floor(variant.price / qty)));
      toggle('[data-price-ref]', savings > 0);
      toggle('[data-price-save]', savings > 0);
      toggle('[data-price-unit]', qty > 1);
    }

    updatePacks(options) {
      if (this.packIndex < 0) return;
      $$('.pack', this.el).forEach((pack) => {
        const input = $('.pack__input', pack);
        if (!input) return;
        const candidate = options.slice();
        candidate[this.packIndex] = input.value;
        const variant = this.findVariant(candidate);
        pack.classList.toggle('is-unavailable', !variant || !variant.available);
        if (!variant) return;
        const price = $('.pack__price', pack);
        if (price) price.textContent = formatMoney(variant.price);
      });
    }

    setButton(enabled, label) {
      if (!this.cta) return;
      this.cta.disabled = !enabled;
      const text = $('[data-cta-label]', this.cta);
      if (text) text.textContent = label || this.cta.dataset.label;
    }

    /* Cantidad */
    initQuantity() {
      $$('[data-qty]', this.el).forEach((wrapper) => {
        const input = $('[data-qty-input]', wrapper);
        wrapper.addEventListener('click', (event) => {
          if (!input) return;
          if (event.target.closest('[data-qty-minus]')) input.value = Math.max(1, Number(input.value) - 1);
          if (event.target.closest('[data-qty-plus]')) input.value = Number(input.value) + 1;
        });
      });
    }

    quantity() {
      const input = this.form ? (this.form.querySelector('[name="quantity"]') || document.querySelector(`[form="${this.form.id}"][name="quantity"]`)) : null;
      return input ? Math.max(1, Number(input.value) || 1) : 1;
    }

    /* Compra */
    initForm() {
      if (!this.form) return;
      this.form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.submit();
      });
    }

    async submit() {
      if (!this.cta || this.cta.disabled) return;
      const label = $('[data-cta-label]', this.cta);
      if (this.error) this.error.hidden = true;
      this.cta.disabled = true;
      this.cta.setAttribute('aria-busy', 'true');
      if (label) label.textContent = strings.adding || '…';
      try {
        await Cart.add([{ id: this.variant.id, quantity: this.quantity() }]);
        if (L.cod) {
          window.location.href = `${routes.root.replace(/\/$/, '')}/checkout`;
          return;
        }
        if (label) label.textContent = strings.added || '✓';
        if (L.cartType === 'drawer' && Cart.drawer) Cart.open();
        else window.location.href = routes.cart;
        window.setTimeout(() => {
          if (label) label.textContent = this.cta.dataset.label;
          this.cta.disabled = false;
        }, 1500);
      } catch (error) {
        if (this.error) {
          this.error.textContent = error.message || strings.error;
          this.error.hidden = false;
        }
        if (label) label.textContent = this.cta.dataset.label;
        this.cta.disabled = false;
      } finally {
        this.cta.removeAttribute('aria-busy');
      }
    }
  }

  /* ---------- Barra fija de compra ---------- */
  function initStickyAtc(productSection) {
    const bar = $('[data-sticky-atc]');
    if (!bar || !productSection) return;
    const buyBox = $('.buy', productSection.el) || $('.product__info', productSection.el);
    const target = (productSection.cta && productSection.cta.offsetParent) ? productSection.cta : buyBox;
    if (!target) return;
    const button = $('[data-sticky-cta]', bar);
    const setVisible = (visible) => {
      bar.classList.toggle('is-visible', visible);
      bar.setAttribute('aria-hidden', visible ? 'false' : 'true');
      if (button) button.tabIndex = visible ? 0 : -1;
      document.body.classList.toggle('has-sticky-atc', visible);
    };
    const desktop = window.matchMedia('(min-width: 990px)');
    new IntersectionObserver(([entry]) => {
      const passed = entry.boundingClientRect.top < 0;
      setVisible(!entry.isIntersecting && (passed || !desktop.matches));
    }, { threshold: 0 }).observe(target);
    if (button) {
      button.addEventListener('click', () => {
        if (L.cod || !productSection.form || !productSection.cta || productSection.cta.offsetParent === null) {
          scrollToEl($('[data-variant-picker]', productSection.el) || buyBox);
          return;
        }
        productSection.submit();
      });
    }
  }

  /* ---------- Entrega estimada ---------- */
  function initDelivery() {
    const blocks = $$('[data-delivery]');
    if (!blocks.length) return;
    const d = L.delivery || {};
    const timeZone = d.timeZone || 'America/Bogota';
    const locale = d.locale || 'es-CO';
    let parts;
    try {
      parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).map((p) => [p.type, p.value]));
    } catch (error) { return; }
    const today = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), 12));
    const holidays = new Set(String(d.holidays || '').split(/[\s,;]+/).filter(Boolean));
    const isBusinessDay = (date) => {
      const day = date.getUTCDay();
      if (holidays.has(date.toISOString().slice(0, 10))) return false;
      return day !== 0 && (d.saturday !== false || day !== 6);
    };
    const addBusinessDays = (start, count) => {
      const date = new Date(start);
      let added = 0;
      while (added < count) {
        date.setUTCDate(date.getUTCDate() + 1);
        if (isBusinessDay(date)) added += 1;
      }
      return date;
    };
    let dispatch = new Date(today);
    if (Number(parts.hour) >= Number(d.cutoff ?? 14) || !isBusinessDay(dispatch)) {
      dispatch = addBusinessDays(dispatch, 1);
    }
    const min = addBusinessDays(dispatch, Math.max(1, Number(d.min || 2)));
    const max = addBusinessDays(dispatch, Math.max(1, Number(d.max || 5), Number(d.min || 2)));
    const format = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    blocks.forEach((block) => {
      const template = block.dataset.template;
      const text = $('[data-delivery-text]', block);
      if (!template || !text) return;
      text.innerHTML = template.replace('{min}', escape(format.format(min))).replace('{max}', escape(format.format(max)));
    });
  }

  /* ---------- Cuenta regresiva (solo fecha real, nunca se reinicia) ---------- */
  function initCountdown() {
    $$('[data-countdown]').forEach((el) => {
      const match = el.dataset.countdown.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/);
      if (!match) return;
      const [, y, m, day, h = '23', min = '59'] = match;
      const end = Date.UTC(Number(y), Number(m) - 1, Number(day), Number(h) + 5, Number(min)); // hora de Colombia (UTC-5)
      const value = $('[data-countdown-value]', el);
      const pad = (n) => String(n).padStart(2, '0');
      const tick = () => {
        const diff = end - Date.now();
        if (diff <= 0) { el.hidden = true; return false; }
        const s = Math.floor(diff / 1000);
        const days = Math.floor(s / 86400);
        const text = `${days > 0 ? `${days}d ` : ''}${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
        if (value) value.textContent = text;
        el.hidden = false;
        return true;
      };
      if (tick()) {
        const timer = window.setInterval(() => { if (!tick()) window.clearInterval(timer); }, 1000);
      }
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!document.body.classList.contains('has-reveal') || reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => observer.observe(el));
  }

  /* ---------- Barra de anuncios ---------- */
  function initAnnouncement() {
    $$('[data-announcement]').forEach((bar) => {
      const items = $$('.announcement__item', bar);
      if (items.length < 2) return;
      let index = 0;
      const interval = (Number(bar.dataset.interval) || 4) * 1000;
      window.setInterval(() => {
        items[index].classList.remove('is-active');
        index = (index + 1) % items.length;
        items[index].classList.add('is-active');
      }, interval);
    });
  }

  /* ---------- Enlaces al buy box y packs de la oferta ---------- */
  function initScrollLinks(productSection) {
    document.addEventListener('click', (event) => {
      const toBuyBox = event.target.closest('[data-scroll-buybox]');
      if (toBuyBox && productSection) {
        event.preventDefault();
        scrollToEl($('[data-variant-picker]', productSection.el) || $('.product__info', productSection.el));
        return;
      }
      const pack = event.target.closest('[data-select-pack]');
      if (pack && productSection) {
        const input = $$(`[data-option-input="${pack.dataset.packIndex}"]`, productSection.el).find((el) => el.value === pack.dataset.selectPack);
        if (!input) return;
        event.preventDefault();
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        scrollToEl($('[data-variant-picker]', productSection.el));
      }
    });
  }

  /* ---------- Encabezado ---------- */
  function initHeader() {
    const header = $('[data-header]');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const drawer = $('[data-menu-drawer]');
    if (drawer) {
      drawer.addEventListener('click', (event) => { if (event.target.closest('.menu-drawer__link')) drawer.open = false; });
    }
  }

  /* ---------- Inicio ---------- */
  function init() {
    Cart.init();
    const sections = $$('[data-product-section]').map((el) => new ProductSection(el)).filter((s) => s.product);
    const main = sections[0];
    initStickyAtc(main);
    initScrollLinks(main);
    initDelivery();
    initCountdown();
    initReveal();
    initAnnouncement();
    initHeader();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.Lumielle = Object.assign(L, { formatMoney, cart: Cart });
})();
