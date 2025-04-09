document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkout-form");

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Formun normal gönderilmesini engelle

    // Form verilerini alalım
    const name = checkoutForm.querySelector('input[placeholder="Ad Soyad"]').value;
    const email = checkoutForm.querySelector('input[placeholder="E-posta"]').value;
    const phone = checkoutForm.querySelector('input[placeholder="Telefon Numarası (05xx xxx xx xx)"]').value;
    const city = checkoutForm.querySelector('input[placeholder="İl"]').value;
    const district = checkoutForm.querySelector('input[placeholder="İlçe"]').value;
    const address = checkoutForm.querySelector('textarea[placeholder="Teslimat Adresi"]').value;
    const shippingCompany = checkoutForm.querySelector('select').value;

    // Verilerin eksik olup olmadığını kontrol edelim
    if (!name || !email || !phone || !city || !district || !address || !shippingCompany) {
      alert("Lütfen tüm bilgileri doldurun.");
      return;
    }

    // Siparişi yerel depolamaya kaydedelim (örnek olarak)
    const orderDetails = {
      name,
      email,
      phone,
      city,
      district,
      address,
      shippingCompany,
      orderDate: new Date().toLocaleString(),
    };

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(orderDetails);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Siparişin başarıyla alındığını bildiren sayfaya yönlendir
    alert("Siparişiniz başarıyla alınmıştır! Siparişinizin detayları sipariş geçmişinizde görüntülenebilir.");
    window.location.href = "order-success.html"; // Sipariş onayı sayfasına yönlendirme
  });
});
