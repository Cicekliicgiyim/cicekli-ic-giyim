// ═══════════════════════════════════════════
//  session.js — Atilla Çiçekli İç Giyim
// ═══════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {

  // ── Elementleri al ──
  const greeting    = document.getElementById("greeting");
  const logoutBtn   = document.getElementById("logoutBtn");
  const loginBtn    = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const adminLink   = document.getElementById("adminLink");
  const userInfo    = document.getElementById("user-info");

  // ── Oturumu oku ──
  let currentUser = null;
  try {
    // ✅ DÜZELTME: JSON.parse hatası oturumu tamamen çökertmesin
    currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  } catch (e) {
    // Bozuk veri varsa temizle
    sessionStorage.removeItem("loggedInUser");
  }

  // ── UI güncelle ──
  if (currentUser) {
    const displayName = currentUser.username || currentUser.email || "Kullanıcı";

    if (userInfo)    userInfo.textContent      = `${displayName} (Giriş Yapıldı)`;
    if (greeting)    greeting.textContent      = `Hoş geldin, ${displayName}`;
    if (logoutBtn)   logoutBtn.style.display   = "inline-block";
    if (loginBtn)    loginBtn.style.display    = "none";
    if (registerBtn) registerBtn.style.display = "none";

    // Admin linki: sadece admin rolünde göster
    if (adminLink) {
      adminLink.style.display = currentUser.role === "admin" ? "inline-block" : "none";
    }

  } else {
    if (userInfo)    userInfo.textContent      = "";
    if (greeting)    greeting.textContent      = "";
    if (logoutBtn)   logoutBtn.style.display   = "none";
    if (loginBtn)    loginBtn.style.display    = "inline-block";
    if (registerBtn) registerBtn.style.display = "inline-block";
    if (adminLink)   adminLink.style.display   = "none";
  }

  // ── Çıkış ──
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("loggedInUser");
      // ✅ DÜZELTME: Hangi sayfada olursa olsun anasayfaya dön
      window.location.href = "/cicekli-ic-giyim/index.html";
    });
  }

  // ── Giriş yap butonu ──
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      // ✅ YENİ: Giriş sonrası geri dönmek için mevcut sayfayı parametre olarak geç
      const redirect = encodeURIComponent(window.location.pathname);
      window.location.href = `/cicekli-ic-giyim/login.html?redirectTo=${redirect}`;
    });
  }

  // ── Üye ol butonu ──
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "/cicekli-ic-giyim/register.html";
    });
  }

  // ── Giriş gerektiren sayfalar (data-require-login) ──
  // ✅ DÜZELTME: Bu özellik artık kullanılmıyor (cart, history sayfalarında
  // sayfa içi mesaj gösteriliyor). Güvenlik için yine de burada tutuyoruz
  // ama HTML'lerde data-require-login attribute'u kaldırıldı.
  const requireLogin = document.body.getAttribute("data-require-login");
  if (requireLogin !== null && !currentUser) {
    const redirect = encodeURIComponent(window.location.pathname);
    window.location.href = `/cicekli-ic-giyim/login.html?redirectTo=${redirect}`;
    return;
  }

  // ── Admin gerektiren sayfalar (data-require-admin) ──
  // ✅ DÜZELTME: admin.html'de JS ile kontrol zaten var,
  // bu ikinci kontrol ek güvenlik katmanı olarak kalıyor.
  const requireAdmin = document.body.getAttribute("data-require-admin");
  if (requireAdmin !== null && (!currentUser || currentUser.role !== "admin")) {
    window.location.href = "/cicekli-ic-giyim/login.html";
    return;
  }

  // ── Sepet sayacı (opsiyonel) ──
  // Nav'daki "Sepetim" linkine ürün sayısı rozeti ekler
  updateCartBadge(currentUser);
});

// ── Sepet rozeti ──
function updateCartBadge(currentUser) {
  const cartLink = document.querySelector('nav a[href*="cart.html"]');
  if (!cartLink) return;

  const allCart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Kullanıcıya ait ürünleri say
  const userCart = currentUser
    ? allCart.filter(item => !item.userEmail || item.userEmail === currentUser.email)
    : allCart;

  const totalQty = userCart.reduce((sum, item) => sum + (item.qty || 1), 0);

  // Mevcut rozeti kaldır
  const existing = cartLink.querySelector(".cart-badge");
  if (existing) existing.remove();

  // Ürün varsa rozet ekle
  if (totalQty > 0) {
    const badge = document.createElement("span");
    badge.className   = "cart-badge";
    badge.textContent = totalQty > 99 ? "99+" : totalQty;
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #e91e63;
      color: white;
      font-size: 10px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      margin-left: 4px;
      vertical-align: middle;
      font-family: 'Montserrat', sans-serif;
    `;
    cartLink.appendChild(badge);
  }
}