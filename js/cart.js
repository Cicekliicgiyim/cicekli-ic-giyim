document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  const container  = document.getElementById("cart-items");
  const summary    = document.getElementById("cart-summary");
  const totalEl    = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const cart       = getCart();

  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `<div class="cart-empty">Sepetiniz boş.</div>`;
    if (summary)    summary.style.display    = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    return;
  }

  container.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const qty      = item.quantity || 1;
    const subtotal = parseFloat(item.price) * qty;
    total += subtotal;

    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.style.animation = "fadeIn 0.3s ease";
    itemDiv.innerHTML = `
      <img src="/cicekli-ic-giyim/images/${item.image || 'placeholder.jpg'}"
           alt="${item.title}"
           onerror="this.src='/cicekli-ic-giyim/images/placeholder.jpg'"
           style="width:70px; height:70px; object-fit:cover; border-radius:8px;">
      <div class="cart-item-info" style="flex:1;">
        <h3 style="font-size:15px; margin-bottom:5px;">${item.title}</h3>
        <p class="price">₺${parseFloat(item.price).toFixed(2)}</p>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" data-action="decrease" data-index="${index}">−</button>
        <span class="qty">${qty}</span>
        <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
        <button class="remove-btn" data-index="${index}" title="Kaldır"
                style="background:transparent; color:#e91e63; border:none;
                       font-size:20px; cursor:pointer; padding:0 4px;">✕</button>
      </div>
    `;
    container.appendChild(itemDiv);
  });

  // Toplam güncelle
  if (summary)  summary.style.display = "flex";
  if (totalEl)  totalEl.textContent   = "₺" + total.toFixed(2);
  if (checkoutBtn) checkoutBtn.style.display = "inline-block";

  // Miktar ve kaldır butonları
  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx    = parseInt(e.target.dataset.index);
      const action = e.target.dataset.action;
      const cart   = getCart();

      if (action === "increase") {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
      } else {
        cart[idx].quantity = (cart[idx].quantity || 1) - 1;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      }

      saveCart(cart);
      renderCart();
    });
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx  = parseInt(e.target.dataset.index);
      const cart = getCart();
      cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
    });
  });
}

// Animasyon
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);