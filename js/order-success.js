document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  const greetingEl  = document.getElementById("greeting");
  const orderNumEl  = document.getElementById("orderNumber");

  // Kullanıcı selamlaması
  if (currentUser && greetingEl) {
    const name = currentUser.username || currentUser.email || "Değerli Müşterimiz";
    greetingEl.textContent = `Teşekkürler, ${name}! Siparişiniz başarıyla oluşturuldu.`;
  }

  // Sipariş numarasını göster
  if (orderNumEl) {
    const orderNum = localStorage.getItem("lastOrderNumber") ||
      Math.floor(Math.random() * 900000 + 100000);
    orderNumEl.textContent = "#" + orderNum;
  }

  // Sipariş tamamlandıktan sonra sepeti temizle
  localStorage.removeItem("cart");

  // Geri sayım ile anasayfaya yönlendir
  let countdown = 10;
  const redirectUrl = "/cicekli-ic-giyim/index.html";

  const countdownEl = document.createElement("p");
  countdownEl.style.cssText = "font-size:14px; color:#888; font-weight:500; margin-top:20px;";

  const progressBar = document.createElement("div");
  progressBar.style.cssText = "height:4px; background:#f8bbd0; border-radius:4px; margin-top:10px; overflow:hidden;";

  const progressFill = document.createElement("div");
  progressFill.style.cssText = "height:100%; width:100%; background:#e91e63; border-radius:4px; transition:width 1s linear;";

  progressBar.appendChild(progressFill);

  const main = document.querySelector("main");
  if (main) {
    main.appendChild(progressBar);
    main.appendChild(countdownEl);
  }

  const update = () => {
    countdownEl.textContent = `${countdown} saniye içinde anasayfaya yönlendirileceksiniz...`;
    progressFill.style.width = (countdown / 10 * 100) + "%";

    if (countdown <= 0) {
      clearInterval(timer);
      window.location.href = redirectUrl;
      return;
    }
    countdown--;
  };

  update();
  const timer = setInterval(update, 1000);
});