document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

  if (!currentUser) {
    window.location.href = "/cicekli-ic-giyim/login.html?redirectTo=" +
      encodeURIComponent(window.location.pathname);
    return;
  }

  const form = document.getElementById("checkoutForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Form alanlarını name attribute ile al
    const fullname  = form.querySelector('[name="fullname"]').value.trim();
    const email     = form.querySelector('[name="email"]').value.trim().toLowerCase();
    const phone     = form.querySelector('[name="phone"]').value.trim();
    const city      = form.querySelector('[name="city"]').value.trim();
    const district  = form.querySelector('[name="district"]').value.trim();
    const address   = form.querySelector('[name="address"]').value.trim();
    const shipping  = form.querySelector('[name="shipping"]').value;
    const cardName  = form.querySelector('[name="cardName"]')?.value.trim();
    const cardNum   = form.querySelector('[name="cardNumber"]')?.value.replace(/\s/g, "");
    const cardExp   = form.querySelector('[name="cardExpiry"]')?.value.trim();
    const cardCvv   = form.querySelector('[name="cardCvv"]')?.value.trim();

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Zorunlu alan kontrolü
    if (!fullname || !email || !phone || !city || !district || !address || !shipping) {
      showError("Lütfen tüm teslimat bilgilerini eksiksiz doldurun.");
      return;
    }

    // E-posta kontrolü
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Geçerli bir e-posta adresi giriniz.");
      return;
    }

    // Telefon kontrolü
    if (!/^05\d{9}$/.test(phone.replace(/\s/g, ""))) {
      showError("Telefon numarasını 05xxxxxxxxx formatında giriniz.");
      return;
    }

    // Kart bilgileri kontrolü
    if (cardNum && cardNum.length !== 16) {
      showError("Kart numarası 16 haneli olmalıdır.");
      return;
    }

    if (cardCvv && cardCvv.length !== 3) {
      showError("CVV 3 haneli olmalıdır.");
      return;
    }

    if (cart.length === 0) {
      showError("Sepetinizde ürün bulunmamaktadır.");
      return;
    }

    // Toplam hesapla (miktar dahil)
    const total = cart.reduce((sum, item) =>
      sum + parseFloat(item.price) * (item.quantity || 1), 0
    );

    // Sipariş numarası oluştur
    const orderNumber = Math.floor(Math.random() * 900000 + 100000);
    localStorage.setItem("lastOrderNumber", orderNumber);

    const orderDetails = {
      orderNumber,
      fullname,
      email,
      phone,
      city,
      district,
      address,
      shippingCompany: shipping,
      items: cart,
      total: total.toFixed(2),
      status: "Hazırlanıyor",
      date: new Date().toISOString(),
      userEmail: currentUser.email
    };

    // orderHistory[email] altında sakla (history.js ile tutarlı)
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "{}");
    if (!orderHistory[currentUser.email]) orderHistory[currentUser.email] = [];
    orderHistory[currentUser.email].push(orderDetails);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

    // Sepeti temizle
    localStorage.removeItem("cart");

    window.location.href = "/cicekli-ic-giyim/order-success.html";
  });

  function showError(message) {
    // Varolan hata mesajını göster, yoksa oluştur
    let errEl = document.getElementById("checkoutError");
    if (!errEl) {
      errEl = document.createElement("p");
      errEl.id = "checkoutError";
      errEl.style.cssText = "color:#c62828; font-size:14px; text-align:center; margin-top:15px;";
      form.appendChild(errEl);
    }
    errEl.textContent = message;
    errEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});