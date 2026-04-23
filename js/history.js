// ═══════════════════════════════════════════
//  history.js — Atilla Çiçekli İç Giyim
// ═══════════════════════════════════════════

document.addEventListener("DOMContentLoaded", function () {
  const container  = document.getElementById("order-history");
  const orderCount = document.getElementById("orderCount");
  if (!container) return;

  const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

  // ── Giriş yapılmamış ──
  if (!currentUser) {
    container.innerHTML = `
      <div class="login-required">
        <div class="icon">🔒</div>
        <p>Sipariş geçmişinizi görüntülemek için giriş yapmanız gerekiyor.</p>
        <a href="/cicekli-ic-giyim/login.html" class="btn-login">Giriş Yap</a>
      </div>`;
    return;
  }

  // ✅ DÜZELTME: İki farklı storage yapısını destekle
  // history.html "orders" key'ini, checkout.js ise "orderHistory" key'ini kullanıyor olabilir.
  // Her ikisini de okuyup birleştiriyoruz.

  // Yöntem 1: { "kullanici@email.com": [ ...siparişler ] } yapısı
  const orderHistoryMap = JSON.parse(localStorage.getItem("orderHistory") || "{}");
  const fromMap         = orderHistoryMap[currentUser.email] || [];

  // Yöntem 2: [ { userEmail, ...sipariş }, ... ] düz dizi yapısı
  const ordersList = JSON.parse(localStorage.getItem("orders") || "[]");
  const fromList   = ordersList.filter(o =>
    o.userEmail === currentUser.email || o.userId === currentUser.id
  );

  // İkisini birleştir, id'ye göre tekrar eleme
  const seen      = new Set();
  const userOrders = [...fromMap, ...fromList].filter(o => {
    const key = o.id || o.orderNumber || JSON.stringify(o);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ── Sipariş sayacı (history.html'deki rozet) ──
  if (orderCount) {
    orderCount.textContent = userOrders.length > 0
      ? `${userOrders.length} sipariş`
      : "";
  }

  // ── Sipariş yok ──
  if (!userOrders.length) {
    container.innerHTML = `
      <div class="empty-message">
        <div class="icon">📦</div>
        <p>Henüz hiç siparişiniz yok.</p>
        <a href="/cicekli-ic-giyim/products.html">Alışverişe Başla →</a>
      </div>`;
    return;
  }

  // ── En yeniden eskiye sırala ──
  const sorted = [...userOrders].sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : 0;
    const dateB = b.date ? new Date(b.date) : 0;
    return dateB - dateA;
  });

  container.innerHTML = "";

  sorted.forEach((order, index) => {
    const el = document.createElement("div");
    el.className = "order";

    // ── Tarih formatla ──
    const date = order.date
      ? new Date(order.date).toLocaleDateString("tr-TR", {
          day    : "2-digit",
          month  : "long",
          year   : "numeric",
          hour   : "2-digit",
          minute : "2-digit"
        })
      : "Bilinmiyor";

    // ── Sipariş numarası ──
    const orderNum = order.orderNumber || order.id || (sorted.length - index);

    // ── Toplam ──
    const total = parseFloat(order.total || 0).toFixed(2);

    // ── Durum ──
    const status = order.status || "Hazırlanıyor";
    const statusClass = {
      "Hazırlanıyor"  : "status-hazirlaniyor",
      "Kargoda"       : "status-kargoda",
      "Teslim Edildi" : "status-teslim",
      "İptal Edildi"  : "status-iptal",
    }[status] || "status-default";

    // ── Ürün satırları ──
    // ✅ DÜZELTME: quantity ve qty her ikisini de destekle
    const itemsHTML = (order.items || []).map(item => {
      const qty      = item.qty || item.quantity || 1;
      const subtotal = (parseFloat(item.price) * qty).toFixed(2);
      return `
        <li class="order-item-row">
          <span>
            ${item.title}
            ${item.size ? `<em style="color:#bbb; font-size:12px;">(${item.size})</em>` : ""}
            × ${qty}
          </span>
          <span>₺${subtotal}</span>
        </li>
      `;
    }).join("") || `<li style="color:#bbb; font-size:13px;">Ürün bilgisi bulunamadı.</li>`;

    // ── Teslimat adresi ──
    const addressHTML = order.address
      ? `<span class="order-address">📍 ${order.address}</span>`
      : "<span></span>";

    el.innerHTML = `
      <div class="order-header">
        <div class="order-header-left">
          <span class="order-number">Sipariş #${orderNum}</span>
          <span class="order-date">🗓️ ${date}</span>
        </div>
        <span class="order-status ${statusClass}">${status}</span>
      </div>

      <ul class="order-items" style="list-style:none; padding:0; margin:10px 0;">
        ${itemsHTML}
      </ul>

      <div class="order-footer">
        ${addressHTML}
        <span class="order-total">
          Toplam: <span>₺${total}</span>
        </span>
      </div>
    `;

    // Kart animasyonu
    el.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;
    container.appendChild(el);
  });

  // Animasyon CSS
  if (!document.getElementById("history-anim-style")) {
    const style = document.createElement("style");
    style.id = "history-anim-style";
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
});