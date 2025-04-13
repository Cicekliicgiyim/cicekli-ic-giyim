document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkout-form");
  const currentUser = JSON.parse(localStorage.getItem("sessionUser"));

  if (!currentUser) {
    alert("Sipariş verebilmek için giriş yapmalısınız.");
    window.location.href = "/cicekli-ic-giyim/login.html";
    return;
  }

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = checkoutForm.querySelector('input[placeholder="Ad Soyad"]').value.trim();
    const email = checkoutForm.querySelector('input[placeholder="E-posta"]').value.trim();
    const phone = checkoutForm.querySelector('input[placeholder="Telefon Numarası (05xx xxx xx xx)"]').value.trim();
    const city = checkoutForm.querySelector('input[placeholder="İl"]').value.trim();
    const district = checkoutForm.querySelector('input[placeholder="İlçe"]').value.trim();
    const address = checkoutForm.querySelector('textarea[placeholder="Teslimat Adresi"]').value.trim();
    const shippingCompany = checkoutForm.querySelector('select').value;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!name || !email || !phone || !city || !district || !address || !shippingCompany) {
      alert("Lütfen tüm bilgileri eksiksiz doldurun.");
      return;
    }

    // E-posta kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Geçerli bir e-posta adresi giriniz.");
      return;
    }

    // Telefon kontrolü
    const phoneRegex = /^05\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Telefon numarasını 05xx xxx xx xx formatında giriniz.");
      return;
    }

    if (cart.length === 0) {
      alert("Sepetinizde ürün bulunmamaktadır.");
      return;
    }

    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

    const orderDetails = {
      name,
      email,
      phone,
      city,
      district,
      address,
      shippingCompany,
      items: cart,
      total,
      date: new Date().toLocaleString(),
    };

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(orderDetails);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Sepeti temizle
    localStorage.removeItem("cart");

    alert("Siparişiniz başarıyla alındı!");
    window.location.href = "/cicekli-ic-giyim/order-success.html";
  });
});
