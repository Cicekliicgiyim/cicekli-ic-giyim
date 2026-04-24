// ─── Backend URL ───────────────────────────────────────────
// Railway'e deploy ettikten sonra bu URL'yi güncelleyin
const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://SIZIN-RAILWAY-URL.railway.app"; // ← Railway URL'nizi buraya yazın

// ─── Genel fetch yardımcısı ────────────────────────────────
const api = async (endpoint, method = "GET", body = null) => {
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Bir hata oluştu.");
  return data;
};

// ══════════════════════════════════════════════════════════
//  AUTH FONKSİYONLARI
// ══════════════════════════════════════════════════════════

const Auth = {
  // Kayıt
  register: (username, email, password, phone) =>
    api("/register", "POST", { username, email, password, phone }),

  // E-posta doğrulama kodu gönder (kayıtta otomatik gönderilir)
  verifyEmail: (email, code) =>
    api("/api/verify-email", "POST", { email, code }),

  // Telefon doğrulama kodu gönder
  sendPhoneCode: (email, phone) =>
    api("/api/send-phone-code", "POST", { email, phone }),

  // Telefon doğrulama kodu onayla
  verifyPhone: (email, code) =>
    api("/api/verify-phone", "POST", { email, code }),

  // Giriş
  login: (email, password) =>
    api("/login", "POST", { email, password }),

  // Şifre sıfırlama kodu gönder
  sendResetCode: (email, phone) =>
    api("/api/send-reset-code", "POST", { email, phone }),

  // Şifre sıfırlama kodu doğrula + yeni şifre
  verifyResetCode: (email, code, newPassword) =>
    api("/api/verify-reset-code", "POST", { email, code, newPassword }),

  // Oturum: kullanıcıyı localStorage'a kaydet
  saveSession: (user) => localStorage.setItem("cicekli_user", JSON.stringify(user)),
  getSession : ()     => JSON.parse(localStorage.getItem("cicekli_user") || "null"),
  clearSession: ()    => localStorage.removeItem("cicekli_user"),
  isLoggedIn  : ()    => !!Auth.getSession()
};

// ══════════════════════════════════════════════════════════
//  ÜRÜN FONKSİYONLARI
// ══════════════════════════════════════════════════════════

const Products = {
  getAll     : (category = "all", sort = "") => api(`/api/products?category=${category}&sort=${sort}`),
  getById    : (id)  => api(`/api/products/${id}`),
  // Admin
  create     : (data) => api("/api/admin/products", "POST", data),
  update     : (id, data) => api(`/api/admin/products/${id}`, "PUT", data),
  delete     : (id)  => api(`/api/admin/products/${id}`, "DELETE")
};

// ══════════════════════════════════════════════════════════
//  SEPET (localStorage tabanlı)
// ══════════════════════════════════════════════════════════

const Cart = {
  get: () => JSON.parse(localStorage.getItem("cicekli_cart") || "[]"),

  add: (product, quantity = 1) => {
    const cart = Cart.get();
    const existing = cart.find(i => i.productId === product._id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId: product._id, name: product.name, price: product.price, quantity });
    }
    localStorage.setItem("cicekli_cart", JSON.stringify(cart));
    Cart.updateBadge();
  },

  remove: (productId) => {
    const cart = Cart.get().filter(i => i.productId !== productId);
    localStorage.setItem("cicekli_cart", JSON.stringify(cart));
    Cart.updateBadge();
  },

  clear: () => {
    localStorage.removeItem("cicekli_cart");
    Cart.updateBadge();
  },

  total: () => Cart.get().reduce((sum, i) => sum + i.price * i.quantity, 0),

  count: () => Cart.get().reduce((sum, i) => sum + i.quantity, 0),

  updateBadge: () => {
    const badge = document.getElementById("cart-badge");
    if (badge) badge.textContent = Cart.count();
  }
};

// ══════════════════════════════════════════════════════════
//  ÖDEME FONKSİYONLARI
// ══════════════════════════════════════════════════════════

const Payment = {
  // iyzico ödeme başlat
  checkout: (cardHolder, cardNumber, expireMonth, expireYear, cvc, address) => {
    const user  = Auth.getSession();
    const items = Cart.get();
    if (!user)  throw new Error("Lütfen giriş yapın.");
    if (!items.length) throw new Error("Sepetiniz boş.");

    return api("/api/payment/start", "POST", {
      userId: user._id,
      items,
      cardHolder,
      cardNumber,
      expireMonth,
      expireYear,
      cvc,
      address
    });
  }
};

// ══════════════════════════════════════════════════════════
//  SİPARİŞ GEÇMİŞİ
// ══════════════════════════════════════════════════════════

const Orders = {
  getMyOrders: () => {
    const user = Auth.getSession();
    if (!user) throw new Error("Lütfen giriş yapın.");
    return api(`/api/orders/${user._id}`);
  },
  // Admin
  getAll       : ()           => api("/api/admin/orders"),
  updateStatus : (id, status) => api(`/api/admin/orders/${id}/status`, "PUT", { status })
};

// ─── Sayfa yüklenince sepet badge'ini güncelle ─────────────
document.addEventListener("DOMContentLoaded", () => Cart.updateBadge());