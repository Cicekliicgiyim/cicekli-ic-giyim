document.addEventListener("DOMContentLoaded", () => {
  const container      = document.getElementById("productsContainer");
  const searchInput    = document.getElementById("searchInput");
  const sortOptions    = document.getElementById("sortOptions");
  const categoryFilter = document.getElementById("categoryFilter");
  const sizeFilter     = document.getElementById("sizeFilter");     // ✅ YENİ: beden filtresi
  const emptyState     = document.getElementById("emptyState");     // ✅ YENİ: boş durum elementi

  let products = JSON.parse(localStorage.getItem("products")) || [];

  // ── Ürünleri render et ──
  function renderProducts(list) {
    if (!container) return;

    // Boş durum kontrolü
    if (emptyState) emptyState.style.display = list.length ? "none" : "block";

    if (!list.length) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = "";

    list.forEach((product, index) => {
      const card = document.createElement("div");
      card.className = "product-card";

      // ✅ DÜZELTME: Görsel — önce base64 imageData, sonra images/ klasörü, sonra placeholder
      const imgSrc = product.imageData
        ? product.imageData
        : (product.image
            ? `./images/${product.image}`
            : "./images/placeholder.jpg");

      // ✅ YENİ: Beden rozetleri
      const sizeBadges = (product.sizes && product.sizes.length)
        ? `<div class="size-badges">
            ${product.sizes.map(s => `<span class="size-badge">${s}</span>`).join("")}
           </div>`
        : "";

      // ✅ YENİ: Ürün açıklaması
      const desc = product.desc
        ? `<p class="product-desc">${product.desc}</p>`
        : "";

      card.innerHTML = `
        <div class="product-img-wrap">
          <img src="${imgSrc}"
               alt="${product.title}"
               onerror="this.src='./images/placeholder.jpg'"
               loading="lazy">
        </div>
        <div class="product-card-body">
          <h3>${product.title}</h3>
          ${desc}
          <p class="product-category">📁 ${product.category || "Genel"}</p>
          ${sizeBadges}
          <p class="price">₺${parseFloat(product.price).toFixed(2)}</p>
          <button class="btn add-to-cart-btn" data-index="${index}">
            🛒 Sepete Ekle
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    // Sepete ekle butonları
    document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx     = parseInt(e.target.dataset.index);
        const product = list[idx];

        // ✅ YENİ: Birden fazla beden varsa kullanıcıdan sor
        let selectedSize = null;
        if (product.sizes && product.sizes.length > 1) {
          selectedSize = prompt(
            `"${product.title}" için beden seçin:\n${product.sizes.join(", ")}`
          );
          if (!selectedSize || !product.sizes.includes(selectedSize)) {
            showToast("Geçerli bir beden seçilmedi.", "error");
            return;
          }
        } else if (product.sizes && product.sizes.length === 1) {
          selectedSize = product.sizes[0];
        }

        addToCart(product, selectedSize);
        showToast(`✅ "${product.title}" sepete eklendi!`);

        // ✅ YENİ: Buton geçici geri bildirim
        const btn2 = e.target;
        btn2.textContent = "✓ Eklendi";
        btn2.disabled    = true;
        setTimeout(() => {
          btn2.textContent = "🛒 Sepete Ekle";
          btn2.disabled    = false;
        }, 1500);
      });
    });
  }

  // ── Filtreleme ve sıralama ──
  function getFiltered() {
    let list = [...products];

    const query    = searchInput?.value.trim().toLowerCase()  || "";
    const sort     = sortOptions?.value                        || "default";
    const category = categoryFilter?.value                     || "all";
    const size     = sizeFilter?.value                         || "all"; // ✅ YENİ

    // Arama
    if (query) {
      list = list.filter(p =>
        p.title.toLowerCase().includes(query) ||
        (p.category || "").toLowerCase().includes(query) ||
        (p.desc     || "").toLowerCase().includes(query)  // ✅ YENİ: açıklamada da ara
      );
    }

    // Kategori
    if (category !== "all") {
      list = list.filter(p =>
        (p.category || "").toLowerCase() === category.toLowerCase()
      );
    }

    // ✅ YENİ: Beden filtresi
    if (size !== "all") {
      list = list.filter(p =>
        p.sizes && p.sizes.includes(size)
      );
    }

    // Sıralama
    if (sort === "priceAsc")  list.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    if (sort === "nameAsc")   list.sort((a, b) => a.title.localeCompare(b.title, "tr")); // ✅ YENİ

    return list;
  }

  // ── Event listener'lar ──
  searchInput?.addEventListener("input",    () => renderProducts(getFiltered()));
  sortOptions?.addEventListener("change",   () => renderProducts(getFiltered()));
  categoryFilter?.addEventListener("change", () => renderProducts(getFiltered()));
  sizeFilter?.addEventListener("change",    () => renderProducts(getFiltered())); // ✅ YENİ

  // ── İlk yükleme ──
  renderProducts(getFiltered());
});

// ── Sepete ekle ──
// ✅ DÜZELTME: quantity → qty (cart.html ile tutarlı)
// ✅ DÜZELTME: beden (size) kaydediliyor
// ✅ DÜZELTME: aynı ürün + aynı beden kontrolü
function addToCart(product, size = null) {
  const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

  // Giriş yoksa login'e yönlendir
  if (!currentUser) {
    if (confirm("Sepete eklemek için giriş yapmanız gerekiyor. Giriş sayfasına gidilsin mi?")) {
      window.location.href = "/cicekli-ic-giyim/login.html?redirectTo=" +
        encodeURIComponent(window.location.pathname);
    }
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Aynı ürün + aynı beden varsa adeti artır
  const existing = cart.find(item =>
    item.id        === product.id &&
    item.size      === size &&
    item.userEmail === currentUser.email
  );

  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({
      id        : product.id,
      title     : product.title,
      price     : parseFloat(product.price),
      imageData : product.imageData || null,
      image     : product.image     || null,
      category  : product.category  || "",
      size,                             // ✅ beden bilgisi
      qty       : 1,                    // ✅ qty (quantity yerine)
      userEmail : currentUser.email
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

// ── Toast bildirimi ──
// ✅ YENİ: "error" tipi için kırmızı renk desteği
function showToast(message, type = "success") {
  const existing = document.getElementById("cart-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "cart-toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: ${type === "error" ? "#c62828" : "#e91e63"};
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

  // Animasyon CSS (bir kez ekle)
  if (!document.getElementById("toast-style")) {
    const style = document.createElement("style");
    style.id = "toast-style";
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}