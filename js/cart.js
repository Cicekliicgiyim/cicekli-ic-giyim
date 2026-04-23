// ═══════════════════════════════════════════
//  cart.js — Atilla Çiçekli İç Giyim
// ═══════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});

// ── Animasyon CSS (bir kez eklenir) ──
if (!document.getElementById("cart-anim-style")) {
  const style = document.createElement("style");
  style.id = "cart-anim-style";
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ── localStorage yardımcıları ──
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ── Sepeti render et ──
function renderCart() {
  const container   = document.getElementById("cart-items");
  const summary     = document.getElementById("cart-summary");
  const subtotalEl  = document.getElementById("cart-subtotal");
  const totalEl     = document.getElementById("cart-total");
  const shippingEl  = document.getElementById("cart-shipping");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const emptyMsg    = document.getElementById("emptyMsg");

  if (!container) return;

  // Sadece giriş yapan kullanıcının ürünlerini göster
  const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  const allCart     = getCart();

  // ✅ DÜZELTME: Kullanıcıya ait ürünleri filtrele
  // Giriş yoksa tüm sepeti göster (misafir deneyimi)
  const cart = currentUser
    ? allCart.filter(item => !item.userEmail || item.userEmail === currentUser.email)
    : allCart;

  // ── Sepet boş ──
  if (!cart.length) {
    container.innerHTML = "";
    if (emptyMsg)    emptyMsg.style.display    = "block";
    if (summary)     summary.style.display     = "none";
    if (checkoutBtn) checkoutBtn.disabled      = true;
    return;
  }

  // ── Sepette ürün var ──
  if (emptyMsg)    emptyMsg.style.display    = "none";
  if (summary)     summary.style.display     = "block";
  if (checkoutBtn) checkoutBtn.disabled      = false;

  container.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    // ✅ DÜZELTME: qty kullan (quantity değil) — products.js ile tutarlı
    const qty      = item.qty || 1;
    const subtotal = parseFloat(item.price) * qty;
    total += subtotal;

    // ✅ DÜZELTME: Görsel — önce base64 imageData, sonra images/ klasörü
    const imgHTML = item.imageData
      ? `<img src="${item.imageData}" alt="${item.title}">`
      : `<img src="/cicekli-ic-giyim/images/${item.image || 'placeholder.jpg'}"
              alt="${item.title}"
              onerror="this.src='/cicekli-ic-giyim/images/placeholder.jpg'">`;

    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.style.animation = "fadeIn 0.3s ease";

    itemDiv.innerHTML = `
      <div class="cart-item-thumb">
        ${imgHTML}
      </div>
      <div class="cart-item-info">
        <h3>${item.title}</h3>
        ${item.size ? `<p class="cart-item-meta">Beden: <strong>${item.size}</strong></p>` : ""}
        <p class="price">₺${subtotal.toFixed(2)}</p>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" data-action="decrease" data-index="${index}" aria-label="Azalt">−</button>
        <span class="qty">${qty}</span>
        <button class="qty-btn" data-action="increase" data-index="${index}" aria-label="Artır">+</button>
        <button class="remove-btn" data-index="${index}" title="Ürünü kaldır" aria-label="Kaldır">✕</button>
      </div>
    `;

    container.appendChild(itemDiv);
  });

  // ── Toplamları güncelle ──
  const shipping = total > 0 ? "Ücretsiz" : "—";
  if (subtotalEl) subtotalEl.textContent = `₺${total.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = shipping;
  if (totalEl)    totalEl.textContent    = `₺${total.toFixed(2)}`;

  // ── Miktar butonları ──
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx    = parseInt(e.currentTarget.dataset.index);
      const action = e.currentTarget.dataset.action;
      const cart   = getCart();

      // Orijinal allCart içindeki gerçek index'i bul
      // (filtrelenmiş liste ile allCart index'i farklı olabilir)
      const targetItem = cart.filter(item =>
        !item.userEmail || !currentUser || item.userEmail === currentUser.email
      )[idx];

      const realIdx = cart.indexOf(targetItem);
      if (realIdx === -1) return;

      if (action === "increase") {
        // ✅ DÜZELTME: qty kullan
        cart[realIdx].qty = (cart[realIdx].qty || 1) + 1;
      } else {
        cart[realIdx].qty = (cart[realIdx].qty || 1) - 1;
        // Adet 0'a düşünce ürünü kaldır
        if (cart[realIdx].qty <= 0) cart.splice(realIdx, 1);
      }

      saveCart(cart);
      renderCart();
    });
  });

  // ── Kaldır butonları ──
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx  = parseInt(e.currentTarget.dataset.index);
      const cart = getCart();

      const targetItem = cart.filter(item =>
        !item.userEmail || !currentUser || item.userEmail === currentUser.email
      )[idx];

      const realIdx = cart.indexOf(targetItem);
      if (realIdx !== -1) cart.splice(realIdx, 1);

      saveCart(cart);
      renderCart();
    });
  });
}