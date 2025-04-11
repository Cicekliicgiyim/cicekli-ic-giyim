document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const orderContainer = document.getElementById("order-history");

  // Giriş yapılmamışsa uyarı göster
  if (!currentUser) {
    orderContainer.innerHTML = "<p>Lütfen önce giriş yapınız.</p>";
    return;
  }

  // Kullanıcıya ait siparişleri filtrele
  const userOrders = allOrders.filter(order => order.email === currentUser.email);

  if (userOrders.length === 0) {
    orderContainer.innerHTML = "<p>Henüz siparişiniz bulunmamaktadır.</p>";
    return;
  }

  // Siparişleri listele
  userOrders.forEach((order, index) => {
    const div = document.createElement("div");
    div.className = "order";

    const itemsHTML = order.items?.map(item => `
      <li>${item.title} - ₺${item.price}</li>
    `).join("") || "<li>Ürün bilgisi yok</li>";

    div.innerHTML = `
      <h3>Sipariş ${index + 1}</h3>
      <ul>${itemsHTML}</ul>
      <p><strong>Tarih:</strong> ${order.date || "Bilinmiyor"}</p>
      <p><strong>Toplam:</strong> ₺${order.total?.toFixed(2) || "0.00"}</p>
    `;

    orderContainer.appendChild(div);
  });
});
