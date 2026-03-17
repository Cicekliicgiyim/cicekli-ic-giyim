document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("order-history");
  if (!container) return;

  const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

  if (!currentUser) {
    container.innerHTML = `
      <div class="empty-message">
        Sipariş geçmişinizi görüntülemek için
        <a href="/cicekli-ic-giyim/login.html" style="color:#e91e63;">giriş yapın</a>.
      </div>`;
    return;
  }

  const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "{}");
  const userOrders   = orderHistory[currentUser.email] || [];

  if (userOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-message">
        Henüz hiç siparişiniz yok.
        <br><br>
        <a href="/cicekli-ic-giyim/products.html" style="color:#e91e63; font-weight:600;">
          Alışverişe Başla →
        </a>
      </div>`;
    return;
  }

  const sorted = [...userOrders].reverse();

  sorted.forEach((order, index) => {
    const el = document.createElement("div");
    el.className = "order";

    const date = order.date
      ? new Date(order.date).toLocaleDateString("tr-TR", {
          day: "2-digit", month: "long", year: "numeric",
          hour: "2-digit", minute: "2-digit"
        })
      : "Bilinmiyor";

    const orderNum   = order.orderNumber || (sorted.length - index);
    const total      = parseFloat(order.total || 0).toFixed(2);
    const status     = order.status || "Hazırlanıyor";

    const statusColor = {
      "Teslim Edildi" : "#2e7d32",
      "Kargoda"       : "#e65100",
      "Hazırlanıyor"  : "#1565c0",
      "İptal Edildi"  : "#c62828",
    }[status] || "#1565c0";

    const itemsHTML = (order.items || []).map(item => `
      <li style="display:flex; justify-content:space-between; padding:6px 0;
                 border-bottom:1px solid #f9f9f9; font-size:14px; color:#555;">
        <span>${item.title} × ${item.quantity || 1}</span>
        <span style="font-weight:600;">₺${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}</span>
      </li>
    `).join("");

    el.innerHTML = `
      <div class="order-header">
        <span class="order-number">Sipariş #${orderNum}</span>
        <span class="order-date">${date}</span>
        <span class="order-status" style="background:${statusColor}20; color:${statusColor};">
          ${status}
        </span>
      </div>
      <ul style="list-style:none; padding:0; margin:10px 0;">
        ${itemsHTML}
      </ul>
      <div class="order-total">
        <span>Toplam</span>
        <span>₺${total}</span>
      </div>
    `;

    container.appendChild(el);
  });
});