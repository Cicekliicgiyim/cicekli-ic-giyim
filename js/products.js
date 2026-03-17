document.addEventListener("DOMContentLoaded", () => {
  const container    = document.getElementById("productsContainer");
  const searchInput  = document.getElementById("searchInput");
  const sortOptions  = document.getElementById("sortOptions");
  const categoryFilter = document.getElementById("categoryFilter");

  let products = JSON.parse(localStorage.getItem("products")) || [];

  function renderProducts(list) {
    if (!container) return;

    if (!list.length) {
      container.innerHTML = '<p style="text-align:center; color:#aaa; padding:40px;">Ürün bulunamadı.</p>';
      return;
    }

    container.innerHTML = "";
    list.forEach((product, index) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="/cicekli-ic-giyim/images/${product.image || 'placeholder.jpg'}"
             alt="${product.title}"
             onerror="this.src='/cicekli-ic-giyim/images/placeholder.jpg'"
             style="width:100%; height:200px; object-fit:cover; border-radius:6px; margin-bottom:15px;">
        <h3>${product.title}</h3>
        <p class="price">₺${parseFloat(product.price).toFixed(2)}</p>
        <p style="font-size:13px; color:#888; margin-bottom:15px;">Kategori: ${product.category || "Genel"}</p>
        <button class="btn add-to-cart-btn" data-index="${index}">Sepete Ekle</button>
      `;
      container.appendChild(card);
    });

    // Sepete ekle butonları
    document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.index);
        addToCart(list[idx]);
        showToast(`${list[idx].title} sepete eklendi!`);
      });
    });
  }

  function getFiltered() {
    let list = [...products];
    const query    = searchInput?.value.toLowerCase() || "";
    const sort     = sortOptions?.value || "default";
    const category = categoryFilter?.value || "all";

    if (query) {
      list = list.filter(p =>
        p.title.toLowerCase().includes(query) ||
        (p.category || "").toLowerCase().includes(query)
      );
    }

    if (category !== "all") {
      list = list.filter(p => (p.category || "").toLowerCase() === category);
    }

    if (sort === "priceAsc")  list.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);

    return list;
  }

  // Olayları dinle
  searchInput?.addEventListener("input",  () => renderProducts(getFiltered()));
  sortOptions?.addEventListener("change", () => renderProducts(getFiltered()));
  categoryFilter?.addEventListener("change", () => renderProducts(getFiltered()));

  // İlk yükleme
  if (!products.length) {
    container.innerHTML = '<p style="text-align:center; color:#aaa; padding:40px 0;">Henüz ürün eklenmedi.</p>';
  } else {
    renderProducts(getFiltered());
  }
});

function addToCart(product) {
  const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!currentUser) {
    window.location.href = "/cicekli-ic-giyim/login.html?redirectTo=" +
      encodeURIComponent(window.location.pathname);
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find(item =>
    item.title === product.title && item.userEmail === currentUser.email
  );

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1, userEmail: currentUser.email });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

function showToast(message) {
  const existing = document.getElementById("cart-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "cart-toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: #e91e63;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: fadeInUp 0.3s ease;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}