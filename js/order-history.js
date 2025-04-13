document.addEventListener("DOMContentLoaded", function () {
  const orderHistoryContainer = document.getElementById("order-history");

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    orderHistoryContainer.innerHTML = "<p>Lütfen sipariş geçmişinizi görüntülemek için giriş yapın.</p>";
    return;
  }

  const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || {};
  const userOrders = orderHistory[currentUser.email] || [];

  if (userOrders.length === 0) {
    orderHistoryContainer.innerHTML = "<p>Henüz hiç siparişiniz yok.</p>";
    return;
  }

  userOrders.forEach((order, index) => {
    const orderElement = document.createElement("div");
    orderElement.classList.add("order");

    orderElement.innerHTML = `
      <h3>Sipariş #${index + 1}</h3>
      <ul>
        ${order.items
          .map(
            (item) => `
              <li>${item.title} - 1 adet - ₺${item.price}</li>
            `
          )
          .join("")}
      </ul>
      <strong>Toplam: ₺${order.total}</strong>
      <p>Tarih: ${order.date || "Bilinmiyor"}</p>
    `;

    orderHistoryContainer.appendChild(orderElement);
  });
});
