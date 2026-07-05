const thumbs = document.querySelectorAll('.thumb');
const mainImage = document.querySelector('#mainProductImage');
const CONFIG = {
  productName: 'Depiladora YES',
  productPrice: 149000,
  currency: 'PYG',
  origin: 'landing_depiladora_yes',
  supabaseUrl: 'https://roruinqorwgolcrhhmpm.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnVpbnFvcndnb2xjcmhobXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTU0MDcsImV4cCI6MjA5ODIzMTQwN30.VzNSqYUM6amTOToZUsJ7Emjapy-y9Y44hDmbC1XG9Eg',
  supabaseTable: 'pedidos_web',
};

const trackingFired = new Set();

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    thumbs.forEach((item) => item.classList.remove('active'));
    thumb.classList.add('active');
    if (mainImage) mainImage.src = thumb.dataset.image;
  });
});

document.querySelector('.gallery-arrow-right')?.addEventListener('click', () => {
  const currentIndex = Array.from(thumbs).findIndex((thumb) => thumb.classList.contains('active'));
  const nextThumb = thumbs[(currentIndex + 1) % thumbs.length];
  nextThumb.click();
});

document.querySelector('.gallery-arrow-left')?.addEventListener('click', () => {
  const currentIndex = Array.from(thumbs).findIndex((thumb) => thumb.classList.contains('active'));
  const prevThumb = thumbs[(currentIndex - 1 + thumbs.length) % thumbs.length];
  prevThumb.click();
});

const offerDuration = 9 * 60;
let remaining = offerDuration;
const minutes = document.querySelector('#minutes');
const seconds = document.querySelector('#seconds');

function updateTimer() {
  const currentMinutes = Math.floor(remaining / 60);
  const currentSeconds = remaining % 60;

  if (minutes) minutes.textContent = String(currentMinutes).padStart(2, '0');
  if (seconds) seconds.textContent = String(currentSeconds).padStart(2, '0');

  remaining = remaining > 0 ? remaining - 1 : offerDuration;
}

updateTimer();
setInterval(updateTimer, 1000);

const viewerCount = document.querySelector('#viewerCount');

function updateViewerCount() {
  if (!viewerCount) return;
  viewerCount.textContent = String(Math.floor(Math.random() * 12) + 9);
}

setInterval(updateViewerCount, 6500);

const purchaseForm = document.querySelector('#purchaseForm');
const orderForms = document.querySelectorAll('[data-order-form]');
const confirmation = document.querySelector('#confirmation');
const orderNumber = document.querySelector('#orderNumber');
const confirmationPhone = document.querySelector('#confirmationPhone');
const confirmationPaymentText = document.querySelector('#confirmationPaymentText');
const productPage = document.querySelector('[data-page="product"]');
const checkoutPage = document.querySelector('[data-page="checkout"]');
const buyButton = document.querySelector('#pedido');
const backLink = document.querySelector('.back-link');
const closeCheckout = document.querySelector('.checkout-close');
const quantitySelect = document.querySelector('#quantitySelect');
const productPriceTop = document.querySelector('#productPriceTop');
const summaryQuantityText = document.querySelector('#summaryQuantityText');
const summaryQuantity = document.querySelector('#summaryQuantity');
const summaryUnitPrice = document.querySelector('#summaryUnitPrice');
const summaryTotal = document.querySelector('#summaryTotal');
const summaryProfit = document.querySelector('#summaryProfit');
const cityInput = document.querySelector('#cityInput');
const deliveryNotice = document.querySelector('#deliveryNotice');
const paymentNote = document.querySelector('#paymentNote');
const formError = document.querySelector('#formError');
const floatCta = document.querySelector('#floatCta');
let map;
let mapMarker;
let selectedMapLink = '';
let activeMapInput = null;
const pricesByQuantity = {
  1: 149000,
  2: 298000,
  3: 447000,
};

function trackingPayload(quantity = Number(document.querySelector('#quantitySelect')?.value || 1)) {
  const subtotal = pricesByQuantity[quantity] || pricesByQuantity[1] || CONFIG.productPrice;
  return {
    producto: CONFIG.productName,
    precio: CONFIG.productPrice,
    cantidad: quantity,
    subtotal,
    moneda: CONFIG.currency,
    currency: CONFIG.currency,
    value: subtotal,
    items: [{ item_name: CONFIG.productName, price: CONFIG.productPrice, quantity }],
    origen: CONFIG.origin,
    url: window.location.href,
  };
}

function metaPayload(payload) {
  return {
    content_name: CONFIG.productName,
    content_type: 'product',
    value: payload.subtotal,
    currency: CONFIG.currency,
    quantity: payload.cantidad,
  };
}

function fireTracking(key, callback) {
  if (trackingFired.has(key)) return;
  trackingFired.add(key);
  callback();
}

function trackGA(eventName, payload = trackingPayload()) {
  if (typeof window.gtag === 'function') window.gtag('event', eventName, payload);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });
}

function trackMeta(eventName, payload = trackingPayload()) {
  if (typeof window.fbq === 'function') window.fbq('track', eventName, metaPayload(payload));
}

function trackLandingEvent(eventName, payload = trackingPayload()) {
  const events = {
    page_view: () => {
      fireTracking('ga4:page_view', () => trackGA('page_view', payload));
    },
    view_item: () => {
      fireTracking('ga4:view_item', () => trackGA('view_item', payload));
      fireTracking('meta:ViewContent', () => trackMeta('ViewContent', payload));
    },
    add_to_cart: () => {
      fireTracking('ga4:add_to_cart', () => trackGA('add_to_cart', payload));
      fireTracking('meta:AddToCart', () => trackMeta('AddToCart', payload));
    },
    begin_checkout: () => {
      fireTracking('ga4:begin_checkout', () => trackGA('begin_checkout', payload));
      fireTracking('meta:InitiateCheckout', () => trackMeta('InitiateCheckout', payload));
    },
    lead: () => {
      fireTracking('ga4:generate_lead', () => trackGA('generate_lead', payload));
      fireTracking('meta:Lead', () => trackMeta('Lead', payload));
    },
    purchase: () => {
      trackGA('purchase', payload);
      trackMeta('Purchase', payload);
    },
  };
  events[eventName]?.();
}

function formatGuarani(value) {
  return `Gs. ${Number(value).toLocaleString('es-PY')}`;
}

function getQuantityText(quantity) {
  return `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}`;
}

function updateOrderSummary() {
  if (!quantitySelect) return;

  const quantity = Number(quantitySelect.value || 1);
  const price = pricesByQuantity[quantity] || pricesByQuantity[1];
  const quantityText = getQuantityText(quantity);
  const totalText = formatGuarani(price);

  if (productPriceTop) productPriceTop.textContent = totalText;
  if (summaryUnitPrice) summaryUnitPrice.textContent = formatGuarani(CONFIG.productPrice);
  if (summaryQuantityText) summaryQuantityText.textContent = quantityText;
  if (summaryQuantity) summaryQuantity.textContent = quantityText;
  if (summaryTotal) summaryTotal.textContent = totalText;
  if (summaryProfit) summaryProfit.textContent = 'Se calcula en Panel Admin';
}

function updateFooterSummary() {
  const footerQty = document.querySelector('#footerQuantitySelect');
  const footerSummaryQty = document.querySelector('#footerSummaryQuantity');
  const footerSummaryQtyText = document.querySelector('#footerSummaryQty');
  const footerSummaryTotal = document.querySelector('#footerSummaryTotal');

  if (!footerQty) return;

  const quantity = Number(footerQty.value || 1);
  const price = pricesByQuantity[quantity] || pricesByQuantity[1];
  const quantityText = getQuantityText(quantity);
  const totalText = formatGuarani(price);

  if (footerSummaryQty) footerSummaryQty.textContent = quantityText;
  if (footerSummaryQtyText) footerSummaryQtyText.textContent = quantityText;
  if (footerSummaryTotal) footerSummaryTotal.textContent = totalText;
}

function isCashOnDeliveryArea(value) {
  const city = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const centralCities = ['asuncion', 'central', 'san lorenzo', 'fernando de la mora', 'luque', 'capitata', 'capiata', 'lambare', 'mariano roque alonso', 'nemby', 'ñemby', 'villa elisa', 'san antonio', 'limpio', 'itaugua', 'ita', 'aregua', 'ypane', 'yaguaron'];

  return centralCities.some((area) => city.includes(area.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
}

function cleanText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function getDeliveryZone(city) {
  if (!city) return 'No informado';
  return isCashOnDeliveryArea(city) ? 'Asunción/Central' : 'Interior';
}

function updateDeliveryNotice() {
  if (!cityInput || !deliveryNotice || !paymentNote) return;

  const value = cityInput.value.trim();
  const isKnownCashArea = value && isCashOnDeliveryArea(value);

  deliveryNotice.classList.toggle('delivery-ok', Boolean(isKnownCashArea));
  deliveryNotice.classList.toggle('delivery-interior', Boolean(value && !isKnownCashArea));

  if (!value) {
    deliveryNotice.textContent = 'Asunción y Central: envío gratis y pago contra entrega. Interior: se coordina antes del despacho.';
    paymentNote.textContent = 'Asunción y Central: no pagás nada ahora, abonás al recibir.';
    return;
  }

  if (isKnownCashArea) {
    deliveryNotice.textContent = 'Zona habilitada para envío gratis y pago contra entrega. No abonás nada ahora.';
    paymentNote.textContent = 'No pagás nada ahora, abonás al recibir.';
    return;
  }

  deliveryNotice.textContent = 'Para envíos al interior se coordina una seña previa antes del despacho.';
  paymentNote.textContent = 'Interior: se coordina una seña previa y el saldo al recibir.';
}

function setDeliveryNoticeText(notice, value) {
  if (!notice) return;

  const isKnownCashArea = value && isCashOnDeliveryArea(value);
  notice.classList.toggle('delivery-ok', Boolean(isKnownCashArea));
  notice.classList.toggle('delivery-interior', Boolean(value && !isKnownCashArea));

  if (!value) {
    notice.textContent = 'Asunción y Central: envío gratis y pago contra entrega. Interior: se coordina antes del despacho.';
    return;
  }

  notice.textContent = isKnownCashArea
    ? 'Zona habilitada para envío gratis y pago contra entrega. No abonás nada ahora.'
    : 'Para envíos al interior se coordina una seña previa antes del despacho.';
}

function initFormDeliveryNotices() {
  orderForms.forEach((form) => {
    const city = form.querySelector('[name="city"]');
    const notice = form.querySelector('.delivery-notice');
    if (!city || !notice) return;

    setDeliveryNoticeText(notice, city.value.trim());
    city.addEventListener('input', () => setDeliveryNoticeText(notice, city.value.trim()));
  });
}

function setMapLink(link) {
  selectedMapLink = link;
  const mapLinkInput = document.querySelector('#mapLinkInput');
  const mapOpenLink = document.querySelector('#mapOpenLink');

  if (mapLinkInput) mapLinkInput.value = link;
  if (mapOpenLink) mapOpenLink.href = link || 'https://www.google.com/maps';
}

function createGoogleMapsLink(lat, lng) {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function updateMapLocation(lat, lng, zoom = 16) {
  setMapLink(createGoogleMapsLink(lat, lng));

  if (!map) return;
  map.setView([lat, lng], zoom);
  if (!mapMarker) {
    mapMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
    mapMarker.on('dragend', () => {
      const position = mapMarker.getLatLng();
      updateMapLocation(position.lat, position.lng, map.getZoom());
    });
    return;
  }

  mapMarker.setLatLng([lat, lng]);
}

function initMapInstance() {
  if (map || typeof L === 'undefined') return;

  const defaultLocation = [-25.2637, -57.5759];
  map = L.map('mapPicker', { zoomControl: true }).setView(defaultLocation, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);
  map.on('click', (event) => updateMapLocation(event.latlng.lat, event.latlng.lng, map.getZoom()));
  updateMapLocation(defaultLocation[0], defaultLocation[1], 13);
}

function openMapModal(event) {
  const mapModal = document.querySelector('#mapModal');
  if (!mapModal) return;

  activeMapInput = document.querySelector(`#${event?.currentTarget?.dataset?.mapTarget || 'mapsInput'}`) || document.querySelector('#mapsInput');
  mapModal.classList.remove('hidden');
  initMapInstance();
  setTimeout(() => { if (map) map.invalidateSize(); }, 100);
}

function closeMapModal() {
  document.querySelector('#mapModal')?.classList.add('hidden');
}

async function searchMapLocation() {
  const mapSearch = document.querySelector('#mapSearch');
  const mapError = document.querySelector('#mapError');
  const query = mapSearch?.value.trim();

  if (!query) {
    if (mapError) mapError.textContent = 'Escribí una dirección o lugar para buscar.';
    return;
  }

  if (mapError) mapError.textContent = 'Buscando ubicación...';
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${query}, Paraguay`)}`);
    const results = await response.json();
    if (!results.length) {
      if (mapError) mapError.textContent = 'No encontramos esa dirección. Probá con otra referencia.';
      return;
    }

    updateMapLocation(Number(results[0].lat), Number(results[0].lon), 17);
    if (mapError) mapError.textContent = 'Tocá el mapa o arrastrá el pin para ajustar la ubicación exacta.';
  } catch (error) {
    if (mapError) mapError.textContent = 'No se pudo buscar. Tocá directamente el mapa para marcar la ubicación.';
  }
}

function initMapPicker() {
  document.querySelectorAll('[data-open-map]').forEach((button) => button.addEventListener('click', (event) => openMapModal(event)));
  document.querySelectorAll('[data-close-map]').forEach((button) => button.addEventListener('click', closeMapModal));
  document.querySelector('#mapModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'mapModal') closeMapModal();
  });
  document.querySelector('#mapSearchButton')?.addEventListener('click', searchMapLocation);
  document.querySelector('#mapSearch')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchMapLocation();
    }
  });
  document.querySelector('#mapLinkInput')?.addEventListener('input', (event) => {
    selectedMapLink = event.target.value.trim();
    const mapOpenLink = document.querySelector('#mapOpenLink');
    if (mapOpenLink) mapOpenLink.href = selectedMapLink || 'https://www.google.com/maps';
  });
  document.querySelector('#mapConfirm')?.addEventListener('click', () => {
    const link = document.querySelector('#mapLinkInput')?.value.trim() || selectedMapLink;
    if (activeMapInput) activeMapInput.value = link;
    closeMapModal();
  });
}

function showCheckout() {
  if (!productPage || !checkoutPage) return;

  trackLandingEvent('begin_checkout');
  productPage.hidden = true;
  checkoutPage.hidden = false;
  document.body.classList.add('checkout-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showProduct() {
  if (!productPage || !checkoutPage) return;

  checkoutPage.hidden = true;
  productPage.hidden = false;
  document.body.classList.remove('checkout-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateOrderNumber() {
  return `#PY${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

function getComboName(quantity) {
  return `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}`;
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem('bagOrders') || '[]');
  orders.push(order);
  localStorage.setItem('bagOrders', JSON.stringify(orders));
}

async function saveOrderToSupabase(order) {
  const response = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${CONFIG.supabaseTable}`, {
    method: 'POST',
    headers: {
      apikey: CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Error guardando pedido en Supabase.');
  }
}

function showConfirmation(order) {
  if (orderNumber) orderNumber.textContent = order.id;
  if (confirmationPhone) confirmationPhone.textContent = order.phone || '---';
  if (confirmationPaymentText) {
    confirmationPaymentText.innerHTML = order.paymentMode === 'cash_on_delivery'
      ? `Recordá que el pago se realiza al recibir el producto. Te hablaremos al número <strong>${order.phone || '---'}</strong>.`
      : `Para envíos al interior coordinaremos una seña previa. Te hablaremos al número <strong>${order.phone || '---'}</strong>.`;
  }

  if (productPage) productPage.hidden = true;
  if (checkoutPage) checkoutPage.hidden = false;
  confirmation?.classList.remove('hidden');
  document.body.classList.add('checkout-open');
  document.documentElement.style.overflow = 'hidden';
}

function closeConfirmation() {
  confirmation?.classList.add('hidden');
  document.documentElement.style.overflow = '';
  showProduct();
}

buyButton?.addEventListener('click', (event) => {
  event.preventDefault();
  trackLandingEvent('add_to_cart');
  showCheckout();
});

backLink?.addEventListener('click', (event) => {
  event.preventDefault();
  showProduct();
});

closeCheckout?.addEventListener('click', showProduct);
document.querySelector('[data-close-confirmation]')?.addEventListener('click', closeConfirmation);
confirmation?.addEventListener('click', (event) => {
  if (event.target.id === 'confirmation') closeConfirmation();
});
quantitySelect?.addEventListener('change', updateOrderSummary);
document.querySelector('#footerQuantitySelect')?.addEventListener('change', updateFooterSummary);
cityInput?.addEventListener('input', updateDeliveryNotice);
updateOrderSummary();
updateFooterSummary();
updateDeliveryNotice();
initMapPicker();
initFormDeliveryNotices();
trackLandingEvent('page_view');
trackLandingEvent('view_item');

  // Visitor tracking
  (function () {
    const cfg = CONFIG;
    const SUPABASE_URL = cfg.supabaseUrl;
    const SUPABASE_KEY = cfg.supabaseAnonKey;
    const TRACK_URL = `${SUPABASE_URL}/functions/v1/track-visitor`;
    let sessionId = sessionStorage.getItem('lp_session_id') || 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    sessionStorage.setItem('lp_session_id', sessionId);
    let hbInterval = null;
    let hidden = false;

    function send(event, extra = {}) {
      if (!SUPABASE_URL || !SUPABASE_KEY) return;
      const params = new URLSearchParams(window.location.search);
      fetch(TRACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({
          event, sessionId, pageUrl: location.href, pageTitle: document.title,
          referrer: document.referrer, userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`, viewport: `${innerWidth}x${innerHeight}`,
          landingPage: cfg.origin, timestamp: new Date().toISOString(),
          utmSource: params.get('utm_source'), utmMedium: params.get('utm_medium'),
          utmCampaign: params.get('utm_campaign'), utmContent: params.get('utm_content'),
          utmTerm: params.get('utm_term'), ...extra
        }),
        keepalive: event === 'page_hide'
      }).catch(() => {});
    }

    function startHb() { if (!hbInterval) hbInterval = setInterval(() => { if (!hidden && document.visibilityState === 'visible') send('heartbeat'); }, 30000); }
    function stopHb() { if (hbInterval) { clearInterval(hbInterval); hbInterval = null; } }
    document.addEventListener('visibilitychange', () => { hidden = document.hidden; if (hidden) { send('page_hide'); stopHb(); } else { send('page_view'); startHb(); } });
    window.addEventListener('beforeunload', () => send('page_hide'));
    window.addEventListener('pagehide', () => send('page_hide'));

    send('page_view');
    startHb();

    window.VisitorTracker = { trackEvent: send, trackEcommerce: (evt, data) => send(evt, { productName: data?.productName || cfg.productName, productPrice: data?.productPrice || cfg.productPrice, orderId: data?.orderId, revenue: data?.revenue }), getSessionId: () => sessionId };
  })();

orderForms.forEach((form) => form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const quantity = Number(formData.get('quantity') || 1);
  const submitButton = form.querySelector('button[type="submit"]');
  const currentFormError = form.querySelector('.form-error') || formError;

  const city = cleanText(formData.get('city'));
  const department = cleanText(formData.get('department'), getDeliveryZone(city));
  const address = cleanText(formData.get('address'), 'No informado');
  const neighborhood = cleanText(formData.get('neighborhood'));
  const notes = cleanText(formData.get('notes'));
  const mapUrl = cleanText(formData.get('map'), 'No informado');
  const subtotal = pricesByQuantity[quantity] || pricesByQuantity[1];
  const paymentMode = isCashOnDeliveryArea(city) ? 'cash_on_delivery' : 'deposit_required_for_interior';
  const referenceParts = [`Combo: ${getComboName(quantity)}`];
  if (neighborhood) referenceParts.push(`Barrio: ${neighborhood}`);
  if (notes) referenceParts.push(`Referencia: ${notes}`);
  referenceParts.push(paymentMode === 'cash_on_delivery' ? 'Pago contra entrega' : 'Interior: coordinar seña previa');

  const order = {
    id: generateOrderNumber(),
    producto: CONFIG.productName,
    precio: CONFIG.productPrice,
    cantidad: quantity,
    subtotal,
    ganancia: 0,
    nombre: cleanText(formData.get('name')),
    telefono: cleanText(formData.get('phone')),
    correo: cleanText(formData.get('email'), 'No informado'),
    ci: cleanText(formData.get('ci'), 'No informado'),
    departamento: department,
    ciudad: city,
    direccion: address,
    referencia: referenceParts.join(' | '),
    ubicacion_maps: mapUrl,
    estado: 'Pendiente',
    origen: CONFIG.origin,
    created_at: new Date().toISOString(),
  };

  if (currentFormError) currentFormError.textContent = '';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando pedido...';
  }

  try {
    saveOrder(order);
    await saveOrderToSupabase(order);
    const payload = { ...trackingPayload(quantity), transaction_id: order.id, value: order.subtotal };
    trackLandingEvent('lead', payload);
    trackLandingEvent('purchase', payload);
  } catch (error) {
    console.error(error);
    if (currentFormError) currentFormError.textContent = 'No se pudo guardar el pedido. Revisá la conexión o la configuración de Supabase.';
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Realizar pedido';
    }
    return;
  }

  form.reset();
  updateOrderSummary();
  updateFooterSummary();
  updateDeliveryNotice();
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = 'Realizar pedido';
  }
  showConfirmation({
    id: order.id,
    phone: order.telefono,
    paymentMode,
  });
}));

// Floating CTA scroll behavior
if (floatCta) {
  let floatCtaTimer = null;

  window.addEventListener('scroll', () => {
    if (floatCtaTimer) clearTimeout(floatCtaTimer);
    floatCta.classList.add('visible');

    floatCtaTimer = setTimeout(() => {
      const checkoutOpen = document.body.classList.contains('checkout-open');
      if (!checkoutOpen) {
        floatCta.classList.remove('visible');
      }
    }, 3000);
  });

  floatCta.addEventListener('click', (event) => {
    event.preventDefault();
    trackLandingEvent('add_to_cart');
    showCheckout();
  });
}

document.querySelectorAll('.final-buy').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    trackLandingEvent('add_to_cart');
    showCheckout();
  });
});
