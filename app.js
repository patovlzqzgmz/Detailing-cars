// ======================================================
// 🎨 EFECTO DEGRADADO HSL CON MOUSE MOVE — PALETA DETAILPRO
// ======================================================
(function () {
  const PALETTE_HEX = ['#16C1C8', '#49CCCC', '#7CD7CF', '#AEE1D3', '#E1ECD6'];

  function hexToHsl(hex) {
    let r = 0, g = 0, b = 0;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  const PALETTE_HSL = PALETTE_HEX.map(hexToHsl);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.body.style.background = makeGradient(135, 0.15);
    return;
  }

  let ticking = false;
  function onPoint(x, y) {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      const nx = Math.min(Math.max(x / vw, 0), 1);
      const ny = Math.min(Math.max(y / vh, 0), 1);
      const angle = Math.round(nx * 360);
      const lShift = Math.round((1 - ny) * 15 - 7.5);
      const sShift = Math.round((Math.abs(nx - 0.5) * 12) - 6);
      document.body.style.background = makeGradient(angle, lShift / 100, sShift / 100);
      ticking = false;
    });
  }

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function makeGradient(angleDeg = 120, lBoost = 0, sBoost = 0) {
    const stops = PALETTE_HSL.map((c, i) => {
      const l = clamp(c.l + lBoost * 100, 6, 94);
      const s = clamp(c.s + sBoost * 100, 5, 95);
      const pos = Math.round((i / (PALETTE_HSL.length - 1)) * 100);
      return `hsl(${c.h} ${s}% ${l}%) ${pos}%`;
    }).join(', ');
    return `linear-gradient(${angleDeg}deg, ${stops})`;
  }

  document.body.style.background = makeGradient(135, 0.1);
  window.addEventListener('mousemove', (e) => onPoint(e.clientX, e.clientY), { passive: true });
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (t) onPoint(t.clientX, t.clientY);
  }, { passive: true });
})();

// ======= WHATSAPP FLOTANTE =======
document.addEventListener('DOMContentLoaded', () => {
  const waBtn = document.querySelector('.whatsapp-float');
  if (!waBtn) return;

  const telefono = '5215512345678'; // cámbialo por el tuyo
  const texto = encodeURIComponent('Hola, me interesa agendar un servicio de detailing.');
  waBtn.href = `https://wa.me/${telefono}?text=${texto}`;

  const hora = new Date().getHours();
  const enHorario = hora >= 9 && hora < 18;
  const msg = enHorario ? '¡Estamos en línea!' : 'Fuera de horario, te respondemos pronto';
  waBtn.title = `WhatsApp — ${msg}`;
  waBtn.setAttribute('aria-label', `Chatea por WhatsApp — ${msg}`);

  const UMBRAL = 300;
  const toggleWA = () => {
    if (window.scrollY > UMBRAL) waBtn.classList.add('show');
    else waBtn.classList.remove('show');
  };
  toggleWA();
  window.addEventListener('scroll', toggleWA, { passive: true });
});

// ======================================================
// 🛒 CARRITO DE COMPRAS (Bootstrap 5 + localStorage)
// ======================================================
(function () {
  const CART_KEY = 'detailpro_cart_v1';
  const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

  // --- Estado ---
  let cart = loadCart();

  // --- DOM ---
  const cartBadge  = document.getElementById('cartBadge');
  const listEl     = document.getElementById('cartItems');
  const totalEl    = document.getElementById('cartTotal');
  const clearBtn   = document.getElementById('btnClearCart');
  const checkoutBtn= document.getElementById('btnCheckout');

  // --- Utils ---
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  const fmt = (n) => currency.format(n);
  const subtotal = (it) => it.price * it.qty;
  const total = () => cart.reduce((s, it) => s + subtotal(it), 0);
  function updateBadge() {
    const count = cart.reduce((s, it) => s + it.qty, 0);
    if (cartBadge) cartBadge.textContent = String(count);
  }

  // --- Mutadores ---
  function addToCart(item) {
    const i = cart.findIndex(p => p.id === item.id);
    if (i > -1) cart[i].qty += item.qty;
    else cart.push(item);
    saveCart(); renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(p => p.id !== id);
    saveCart(); renderCart();
  }

  function setQty(id, qty) {
    const it = cart.find(p => p.id === id);
    if (!it) return;
    it.qty = Math.max(1, qty|0);
    saveCart(); renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart(); renderCart();
  }

  // --- Render ---
  function renderCart() {
    if (listEl) {
      listEl.innerHTML = '';
      if (cart.length === 0) {
        listEl.innerHTML = `<div class="list-group-item text-center text-muted">Tu carrito está vacío</div>`;
      } else {
        cart.forEach(item => {
          const row = document.createElement('div');
          row.className = 'list-group-item';
          row.innerHTML = `
            <div class="d-flex align-items-center justify-content-between gap-2">
              <div class="me-auto">
                <div class="fw-semibold">${item.name}</div>
                <div class="small text-muted">${fmt(item.price)} c/u</div>
              </div>

              <div class="input-group input-group-sm" style="width: 120px;">
                <button class="btn btn-outline-secondary btn-dec" aria-label="Disminuir cantidad">−</button>
                <input type="number" min="1" class="form-control text-center qty-input" value="${item.qty}" aria-label="Cantidad">
                <button class="btn btn-outline-secondary btn-inc" aria-label="Aumentar cantidad">+</button>
              </div>

              <div class="ms-2 fw-semibold">${fmt(subtotal(item))}</div>

              <button class="btn btn-outline-danger btn-sm ms-2 btn-remove" aria-label="Eliminar del carrito">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          `;

          // eventos por fila
          row.querySelector('.btn-remove').addEventListener('click', () => removeFromCart(item.id));
          row.querySelector('.btn-inc').addEventListener('click', () => setQty(item.id, item.qty + 1));
          row.querySelector('.btn-dec').addEventListener('click', () => setQty(item.id, item.qty - 1));
          row.querySelector('.qty-input').addEventListener('change', (e) => setQty(item.id, Number(e.target.value)));

          listEl.appendChild(row);
        });
      }
    }
    if (totalEl) totalEl.textContent = fmt(total());
    updateBadge();
  }

  // --- Listeners globales ---
  // Captura clicks en botones "Agregar al carrito"
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    const id    = btn.dataset.id;
    const name  = btn.dataset.name;
    const price = Number(btn.dataset.price);
    addToCart({ id, name, price, qty: 1 });
  });

  clearBtn && clearBtn.addEventListener('click', clearCart);
  checkoutBtn && checkoutBtn.addEventListener('click', () => {
    // Aquí podrías aplicar cupones o enviar el pedido.
  });

  // --- Inicial ---
  renderCart();
})();
// ======================================================
// 🛒 FIN CARRITO DE COMPRAS
// ======================================================
