document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkout-form");

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Formun normal gönderilmesini engelle

    // Form verilerini al
    const name = checkoutForm.querySelector('input[placeholder="Ad Soyad"]').value.trim();
    const email = checkoutForm.querySelector('input[placeholder="E-posta"]').value.trim();
    const phone = checkoutForm.querySelector('input[placeholder="Telefon Numarası (05xx xxx xx xx)"]').value.trim();
    const city = checkoutForm.querySelector('input[placeholder="İl"]').value.trim();
    const district = checkoutForm.querySelector('input[placeholder="İlçe"]').value.trim();
    const address = checkoutForm.querySelector('textarea[placeholder="Teslimat Adresi"]').value.trim();
    const shippingCompany = checkoutForm.querySelector('select').value;

    if (!name || !email || !phone || !city || !district || !address || !shippingCompany) {
      alert("Lütfen tüm bilgileri doldurun.");
      return;
    }

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

    alert("Siparişiniz başarıyla alınmıştır! Siparişinizin detayları sipariş geçmişinizde görüntülenebilir.");
    window.location.href = "order-success.html";
  });
});
