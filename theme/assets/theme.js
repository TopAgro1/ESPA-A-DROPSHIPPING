/* ==========================================================================
   Dermarel PDP — JavaScript del tema (sin dependencias)
   ========================================================================== */
(() => {
  const theme = window.theme || { routes: {}, strings: {} };
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* ---------- Dinero ---------- */
  function formatMoney(cents, format = theme.moneyFormat || '{{amount}} €') {
    const value = Number(cents) / 100;
    const withSeparators = (number, decimals, thousand, decimal) => {
      const [int, dec] = number.toFixed(decimals).split('.');
      const intWithSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousand);
      return dec ? `${intWithSep}${decimal}${dec}` : intWithSep;
    };
    return String(format)
      .replace(/<[^>]*>/g, '')
      .replace(/\{\{\s*(\w+)\s*\}\}/, (_, placeholder) => {
        switch (placeholder) {
          case 'amount_no_decimals': return withSeparators(value, 0, ',', '.');
          case 'amount_with_comma_separator': return withSeparators(value, 2, '.', ',');
          case 'amount_no_decimals_with_comma_separator': return withSeparators(value, 0, '.', ',');
          case 'amount_with_apostrophe_separator': return withSeparators(value, 2, "'", '.');
          case 'amount_with_space_separator': return withSeparators(value, 2, ' ', ',');
          default: return withSeparators(value, 2, ',', '.');
        }
      });
  }

  /* ---------- Bloqueo de scroll y foco ---------- */
  let openLayers = 0;
  let lastFocus = null;
  function lockScroll(lock) {
    openLayers = Math.max(0, openLayers + (lock ? 1 : -1));
    document.documentElement.style.overflow = openLayers ? 'hidden' : '';
  }
  function focusable(root) {
    return qsa('a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', root)
      .filter((el) => el.offsetParent !== null);
  }
  function trapFocus(event, root) {
    if (event.key !== 'Tab') return;
    const items = focusable(root);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  /* ---------- Capas (drawers y modales) ---------- */
  function openLayer(layer) {
    if (!layer || layer.classList.contains('is-open')) return;
    lastFocus = document.activeElement;
    layer.classList.add('is-open');
    layer.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    const panel = qs('[role="dialog"]', layer) || layer;
    requestAnimationFrame(() => {
      const input = qs('input[type="search"]', panel);
      (input || panel).focus({ preventScroll: true });
    });
    layer._trap = (event) => {
      if (event.key === 'Escape') closeLayer(layer);
      trapFocus(event, panel);
    };
    document.addEventListener('keydown', layer._trap);
  }
  function closeLayer(layer) {
    if (!layer || !layer.classList.contains('is-open')) return;
    layer.classList.remove('is-open');
    layer.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    document.removeEventListener('keydown', layer._trap);
    const content = qs('[data-modal-content]', layer);
    if (content) setTimeout(() => { if (!layer.classList.contains('is-open')) content.innerHTML = ''; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-drawer-open], [data-modal-open]');
    if (opener) {
      event.preventDefault();
      openLayer(document.getElementById(opener.dataset.drawerOpen || opener.dataset.modalOpen));
      return;
    }
    const closer = event.target.closest('[data-drawer-close], [data-modal-close]');
    if (closer) {
      closeLayer(closer.closest('[data-drawer], [data-modal]'));
      return;
    }
    const zoom = event.target.closest('[data-zoom]');
    if (zoom && zoom.dataset.src) {
      const img = new Image();
      img.src = zoom.dataset.src;
      img.alt = '';
      openMedia(img);
    }
  });

  function openMedia(node) {
    const modal = document.getElementById('LightboxModal');
    if (!modal) return;
    const content = qs('[data-modal-content]', modal);
    content.innerHTML = '';
    content.appendChild(node);
    openLayer(modal);
    const video = qs('video', content);
    if (video) video.play().catch(() => {});
  }

  /* ---------- Carrito ---------- */
  const Cart = {
    drawer() { return document.getElementById('CartDrawer'); },
    async request(url, body) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...body, sections: ['cart-drawer'], sections_url: window.location.pathname }),
      });
      const data = await response.json();
      if (!response.ok || data.status) throw new Error(data.description || data.message || theme.strings.cartError);
      return data;
    },
    add(items) { return this.request(`${theme.routes.cartAdd}.js`, { items }); },
    change(line, quantity) { return this.request(`${theme.routes.cartChange}.js`, { line, quantity }); },
    render(sections) {
      const html = sections && sections['cart-drawer'];
      if (!html) return;
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = qs('[data-cart-drawer-content]', doc);
      const current = qs('[data-cart-drawer-content]');
      if (fresh && current) current.replaceWith(fresh);
      const count = fresh ? Number(fresh.dataset.itemCount || 0) : 0;
      qsa('[data-cart-bubble]').forEach((bubble) => {
        bubble.textContent = count;
        bubble.hidden = count === 0;
      });
    },
    open() {
      const drawer = this.drawer();
      if (drawer) openLayer(drawer);
      else window.location.href = theme.routes.cart;
    },
  };

  document.addEventListener('click', async (event) => {
    const toggle = event.target.closest('[data-cart-toggle]');
    if (toggle && Cart.drawer()) {
      event.preventDefault();
      Cart.open();
      return;
    }
    const lineButton = event.target.closest('[data-line-change]');
    if (lineButton) {
      const item = lineButton.closest('[data-line]');
      const content = lineButton.closest('[data-cart-drawer-content]');
      if (content) content.style.opacity = '.55';
      try {
        const data = await Cart.change(Number(item.dataset.line), Number(lineButton.dataset.lineChange));
        Cart.render(data.sections);
      } catch (error) {
        if (content) content.style.opacity = '';
      }
    }
  });

  /* ---------- Galería ---------- */
  function initGallery(root) {
    const slider = qs('[data-slides]', root);
    if (!slider) return null;
    const slides = qsa('[data-slide]', slider);
    const thumbs = qsa('[data-thumb]', root);
    const dots = qsa('.pdp__dot', root);
    let current = 0;

    const setActive = (index) => {
      current = index;
      thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      const activeThumb = thumbs[index];
      if (activeThumb) {
        const track = activeThumb.parentElement;
        const vertical = getComputedStyle(track).position === 'absolute';
        if (vertical) track.scrollTo({ top: activeThumb.offsetTop - track.clientHeight / 3, behavior: 'smooth' });
        else track.scrollTo({ left: activeThumb.offsetLeft - 16, behavior: 'smooth' });
      }
    };
    const goTo = (index, smooth = true) => {
      if (!slides[index]) return;
      slider.scrollTo({ left: slides[index].offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
      setActive(index);
    };

    thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => goTo(index)));

    let ticking = false;
    slider.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const index = Math.round(slider.scrollLeft / slider.clientWidth);
        if (index !== current) setActive(index);
        ticking = false;
      });
    }, { passive: true });

    const initial = thumbs.findIndex((thumb) => thumb.classList.contains('is-active'));
    if (initial > 0) requestAnimationFrame(() => goTo(initial, false));

    return {
      goToMedia(mediaId) {
        const index = slides.findIndex((slide) => slide.dataset.mediaId === String(mediaId));
        if (index > -1) goTo(index);
      },
    };
  }

  /* ---------- Ficha de producto ---------- */
  function initProduct(section) {
    if (section.dataset.ready) return;
    section.dataset.ready = 'true';
    const gallery = initGallery(section);
    const jsonNode = qs('[data-product-json]', section);
    const form = qs('[data-product-form]', section);
    if (!jsonNode || !form) return;

    const product = JSON.parse(jsonNode.textContent);
    const idInput = qs('[data-variant-id]', form);
    const qtyInput = qs('[data-qty-input]', form);
    const addButton = qs('[data-add-to-cart]', form);
    const buyNow = qs('[data-buy-now]', form);
    const errorBox = qs('[data-form-error]', form);
    const sticky = qs('[data-sticky-atc]', section);
    const packs = qsa('[data-pack]', section);
    let variant = product.variants.find((v) => String(v.id) === idInput.value) || product.variants[0];

    const quantity = () => Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);
    const selectedPack = () => packs.find((pack) => pack.checked);

    const showError = (message) => {
      if (!errorBox) return;
      errorBox.textContent = message || '';
      errorBox.hidden = !message;
    };

    const updateBuyNowLabel = () => {
      if (!buyNow) return;
      const text = qs('[data-buy-now-text]', buyNow);
      const discount = Number(buyNow.dataset.discount || 0);
      const pack = selectedPack();
      const packDiscount = pack ? Number(pack.dataset.discount || 0) : 0;
      const qty = pack ? Number(pack.dataset.qty) : 1;
      const total = Math.round(variant.price * qty * (100 - packDiscount) / 100 * (100 - discount) / 100);
      text.textContent = buyNow.dataset.showPrice === 'true'
        ? `${buyNow.dataset.label} - ${formatMoney(total)}`
        : buyNow.dataset.label;
    };

    const updatePacks = () => {
      packs.forEach((pack) => {
        const label = pack.nextElementSibling;
        const qty = Number(pack.dataset.qty);
        const discount = Number(pack.dataset.discount || 0);
        const full = variant.price * qty;
        const total = Math.round(full * (100 - discount) / 100);
        const set = (selector, value) => { const node = qs(selector, label); if (node) node.textContent = value; };
        set('[data-pack-total]', formatMoney(total));
        set('[data-pack-full]', formatMoney(full));
        set('[data-pack-unit]', formatMoney(Math.round(total / qty)));
      });
    };

    const updatePrice = () => {
      const wrap = qs('[data-price-wrap]', section);
      if (wrap) {
        const price = qs('[data-price]', wrap);
        const compare = qs('[data-compare-price]', wrap);
        const badge = qs('[data-save-badge]', wrap);
        const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
        price.textContent = formatMoney(variant.price);
        if (compare) {
          compare.hidden = !onSale;
          compare.textContent = onSale
            ? (compare.hasAttribute('data-no-currency')
              ? formatMoney(variant.compare_at_price).replace(/[^\d.,'\s]/g, '').trim()
              : formatMoney(variant.compare_at_price))
            : '';
        }
        if (badge) {
          badge.hidden = !onSale;
          if (onSale) badge.textContent = `-${Math.round((variant.compare_at_price - variant.price) * 100 / variant.compare_at_price)} %`;
        }
        wrap.classList.toggle('price--sale', Boolean(onSale));
      }
      const stickyPrice = sticky && qs('[data-sticky-price]', sticky);
      if (stickyPrice) stickyPrice.textContent = formatMoney(variant.price);
      updatePacks();
      updateBuyNowLabel();
    };

    const updateAvailability = () => {
      const available = Boolean(variant && variant.available);
      if (addButton) {
        addButton.disabled = !available;
        qs('[data-atc-text]', addButton).textContent = available
          ? addButton.dataset.label
          : (variant ? theme.strings.soldOut : theme.strings.unavailable);
      }
      if (buyNow) buyNow.disabled = !available;
      const stickyButton = sticky && qs('[data-sticky-buy]', sticky);
      if (stickyButton) stickyButton.disabled = !available;
    };

    const onVariantChange = () => {
      const picker = qs('[data-variant-picker]', section);
      if (!picker) return;
      const options = product.options.map((_, index) => {
        const checked = qs(`input[data-option-index="${index}"]:checked`, picker);
        const select = qs(`select[data-option-index="${index}"]`, picker);
        return checked ? checked.value : (select ? select.value : null);
      });
      options.forEach((value, index) => {
        const label = qs(`[data-option-value="${index}"]`, picker);
        if (label) label.textContent = value;
      });
      variant = product.variants.find((v) => v.options.every((value, i) => value === options[i]));
      if (!variant) {
        updateAvailability();
        return;
      }
      idInput.value = variant.id;
      updatePrice();
      updateAvailability();
      if (variant.featured_media && gallery) gallery.goToMedia(variant.featured_media.id);
      const url = new URL(window.location.href);
      if (url.pathname.includes('/products/')) {
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }
    };

    section.addEventListener('change', (event) => {
      if (event.target.closest('[data-variant-picker]')) onVariantChange();
      if (event.target.matches('[data-pack]') && qtyInput) {
        qtyInput.value = event.target.dataset.qty;
        updateBuyNowLabel();
      }
    });

    // Cantidad
    const minus = qs('[data-qty-minus]', form);
    const plus = qs('[data-qty-plus]', form);
    if (minus) minus.addEventListener('click', () => { qtyInput.value = Math.max(1, quantity() - 1); });
    if (plus) plus.addEventListener('click', () => { qtyInput.value = quantity() + 1; });
    const initialPack = selectedPack();
    if (initialPack && qtyInput) qtyInput.value = initialPack.dataset.qty;
    if (packs.length && qs('[data-qty]', form)) qs('[data-qty]', form).hidden = true;
    if (packs.length) qs('.pdp-buy__row', form).classList.add('pdp-buy__row--no-qty');

    const addToCart = async (button) => {
      showError('');
      button.classList.add('is-loading');
      try {
        const data = await Cart.add([{ id: variant.id, quantity: quantity() }]);
        Cart.render(data.sections);
        return true;
      } catch (error) {
        showError(error.message);
        return false;
      } finally {
        button.classList.remove('is-loading');
      }
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!variant || !variant.available) return;
      if (theme.cartType === 'page') {
        if (await addToCart(addButton)) window.location.href = theme.routes.cart;
        return;
      }
      if (await addToCart(addButton)) Cart.open();
    });

    const goToCheckout = () => {
      const code = buyNow && buyNow.dataset.discountCode;
      window.location.href = code
        ? `/discount/${encodeURIComponent(code)}?redirect=/checkout`
        : '/checkout';
    };
    if (buyNow) {
      buyNow.addEventListener('click', async () => {
        if (!variant || !variant.available) return;
        if (await addToCart(buyNow)) goToCheckout();
      });
    }

    // Barra fija de compra
    if (sticky) {
      const target = qs('[data-buy-buttons]', section);
      const stickyButton = qs('[data-sticky-buy]', sticky);
      stickyButton.addEventListener('click', async () => {
        if (!variant || !variant.available) return;
        if (buyNow) {
          if (await addToCart(stickyButton)) goToCheckout();
        } else if (await addToCart(stickyButton)) {
          Cart.open();
        }
      });
      if (target && 'IntersectionObserver' in window) {
        const showBefore = sticky.dataset.showBefore === 'true';
        new IntersectionObserver(([entry]) => {
          const visible = !entry.isIntersecting && (showBefore || entry.boundingClientRect.top < 0);
          sticky.classList.toggle('is-visible', visible);
          sticky.setAttribute('aria-hidden', String(!visible));
        }).observe(target);
      }
    }

    updatePrice();
  }

  /* ---------- Fecha estimada de entrega ---------- */
  function addBusinessDays(date, days) {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) added += 1;
    }
    return result;
  }
  function initDelivery(root) {
    qsa('[data-delivery-estimate]', root).forEach((node) => {
      const locale = document.documentElement.lang || 'es';
      const format = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' });
      const min = format.format(addBusinessDays(new Date(), Number(node.dataset.min)));
      const max = format.format(addBusinessDays(new Date(), Number(node.dataset.max)));
      node.textContent = (theme.strings.deliveryBetween || '[min] - [max]')
        .replace('[min]', min)
        .replace('[max]', max);
    });
  }

  /* ---------- Fotos/vídeos de clientes ---------- */
  document.addEventListener('click', (event) => {
    const item = event.target.closest('[data-ugc-item]');
    if (!item) return;
    const template = qs('template[data-ugc-media]', item);
    if (!template) return;
    const fragment = template.content.cloneNode(true);
    const wrapper = document.createElement('div');
    wrapper.appendChild(fragment);
    openMedia(wrapper.firstElementChild || wrapper);
  });

  /* ---------- Testimonio destacado ---------- */
  function initSpotlight(section) {
    const people = qsa('[data-person]', section);
    const quotes = qsa('[data-quote]', section);
    if (people.length < 2) return;
    let index = 0;
    let timer = null;
    const show = (next) => {
      index = (next + people.length) % people.length;
      people.forEach((person, i) => {
        person.classList.toggle('is-active', i === index);
        person.setAttribute('aria-selected', String(i === index));
      });
      quotes.forEach((quote, i) => {
        quote.classList.toggle('is-active', i === index);
        quote.setAttribute('aria-hidden', String(i !== index));
      });
    };
    const autoplay = Number(section.dataset.autoplay || 0);
    const restart = () => {
      if (!autoplay) return;
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), autoplay * 1000);
    };
    people.forEach((person, i) => person.addEventListener('click', () => { show(i); restart(); }));
    restart();
  }

  /* ---------- Reseñas: cargar más ---------- */
  function initReviews(section) {
    const button = qs('[data-load-more]', section);
    if (!button) return;
    const perPage = Number(section.dataset.perPage || 6);
    button.addEventListener('click', () => {
      const hidden = qsa('[data-review][hidden]', section);
      hidden.slice(0, perPage).forEach((review) => {
        review.hidden = false;
        review.classList.add('is-in');
      });
      if (hidden.length <= perPage) button.parentElement.hidden = true;
    });
    // Si se acaba de enviar una reseña, reabre el formulario para mostrar el mensaje.
    const modal = qs('[data-modal]', section);
    if (modal && qs('.form-success, .errors', modal)) openLayer(modal);
  }

  /* ---------- Aparición al hacer scroll ---------- */
  function initReveal(root) {
    const items = qsa('.reveal:not(.is-in)', root);
    if (!document.body.classList.contains('has-reveal') || !('IntersectionObserver' in window) || (window.Shopify && window.Shopify.designMode)) {
      items.forEach((item) => item.classList.add('is-in'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach((item) => observer.observe(item));
  }

  /* ---------- Arranque ---------- */
  function init(root = document) {
    qsa('[data-product-section]', root).forEach(initProduct);
    qsa('[data-spotlight]', root).forEach(initSpotlight);
    qsa('[data-reviews]', root).forEach(initReviews);
    initDelivery(root);
    initReveal(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();

  // Editor de temas de Shopify
  document.addEventListener('shopify:section:load', (event) => init(event.target));
  document.addEventListener('shopify:block:select', (event) => {
    const quote = event.target.closest('[data-quote]');
    if (quote) {
      const section = quote.closest('[data-spotlight]');
      const index = qsa('[data-quote]', section).indexOf(quote);
      const person = qsa('[data-person]', section)[index];
      if (person) person.click();
    }
  });

  window.themeCart = Cart;
  window.formatMoney = formatMoney;
})();
