document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const orderContainer = document.getElementById("order-history");
  
    // Kullanıcı giriş yapmamışsa mesaj göster
    if (!currentUser) {
      orderContainer.innerHTML = "<p>Lütfen önce giriş yapınız.</p>";
      return;
    }
  
    // Kullanıcıya ait siparişleri filtrele
    const userOrders = allOrders.filter(order => order.email === currentUser.email);
  
    // Sipariş bulunmazsa kullanıcıya bilgi ver
    if (userOrders.length === 0) {
      orderContainer.innerHTML = "<p>Henüz siparişiniz bulunmamaktadır.</p>";
      return;
    }
  
    // Siparişleri ekrana yazdır
    userOrders.forEach((order, index) => {
      const div = document.createElement("div");
      div.className = "order";
  
      // Sipariş öğelerini listele
      let itemsHTML = order.items.map(item => `
        <li>${item.title} - ₺${item.price}</li>
      `).join("");  // Sipariş öğeleri birleştiriliyor
  
      div.innerHTML = `
        <h3>Sipariş ${index + 1}</h3>
        <ul>${itemsHTML}</ul>
        <p><strong>Tarih:</strong> ${order.date}</p>
        <p><strong>Toplam:</strong> ₺${order.total}</p>
      `;
  
      orderContainer.appendChild(div);
    });
  });
  