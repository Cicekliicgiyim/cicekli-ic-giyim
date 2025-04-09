document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("checkout-form");
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const name = form.querySelector('input[placeholder="Ad Soyad"]').value;
      const email = form.querySelector('input[placeholder="E-posta"]').value;
      const phone = form.querySelector('input[placeholder="Telefon Numarası (05xx xxx xx xx)"]').value;
      const city = form.querySelector('input[placeholder="İl"]').value;
      const district = form.querySelector('input[placeholder="İlçe"]').value;
      const address = form.querySelector('textarea').value;
      const cargo = form.querySelector("select").value;
  
      if (!name || !email || !phone || !city || !district || !address || !cargo) {
        alert("Lütfen tüm alanları doldurunuz.");
        return;
      }
  
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);
  
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        alert("Lütfen giriş yapınız.");
        window.location.href = "login.html";
        return;
      }
  
      const order = {
        name,
        email,
        phone,
        city,
        district,
        address,
        cargo,
        items: cart,
        total,
        date: new Date().toLocaleString(),
      };
  
      const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
      allOrders.push(order);
      localStorage.setItem("orders", JSON.stringify(allOrders));
  
      // Sepeti temizle
      localStorage.removeItem("cart");
  
      // Başarı sayfasına yönlendir
      window.location.href = "order-success.html";
    });
  });
  