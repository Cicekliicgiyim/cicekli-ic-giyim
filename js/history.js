document.addEventListener("DOMContentLoaded", function () {
  const orderHistoryContainer = document.getElementById("order-history");

  // Kullanıcının giriş yapıp yapmadığını kontrol et
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) {
    orderHistoryContainer.innerHTML = "<p>Lütfen sipariş geçmişinizi görüntülemek için giriş yapın.</p>";
    return;
  }

  // localStorage'dan sipariş geçmişini al
  const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || {};

  const userOrders = orderHistory[currentUser] || [];

  if (userOrders.length === 0) {
    orderHistoryContainer.innerHTML = "<p>Henüz hiç siparişiniz yok.</p>";
    return;
  }

  // Siparişleri göster
  userOrders.forEach((order, index) => {
    const orderElement = document.createElement("div");
    orderElement.classList.add("order");

    orderElement.innerHTML = `
      <h3>Sipariş #${index + 1}</h3>
      <ul>
        ${order.items
          .map(
            (item) => `
          <li>
            ${item.name} - ${item.quantity} adet - ${item.price} TL
          </li>
        `
          )
          .join("")}
      </ul>
      <strong>Toplam: ${order.total} TL</strong>
      <p>Tarih: ${order.date || "Bilinmiyor"}</p>
    `;

    orderHistoryContainer.appendChild(orderElement);
  });
});
