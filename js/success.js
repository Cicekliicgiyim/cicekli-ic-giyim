document.addEventListener("DOMContentLoaded", () => {
  let countdown = 10;
  const redirectUrl = "/cicekli-ic-giyim/index.html";

  // Sipariş numarasını göster
  const orderNumEl = document.getElementById("orderNumber");
  if (orderNumEl) {
    const orderNum = localStorage.getItem("lastOrderNumber") || Math.floor(Math.random() * 900000 + 100000);
    orderNumEl.textContent = "#" + orderNum;
  }

  // Geri sayım mesajı
  const countdownMessage = document.createElement("p");
  countdownMessage.style.cssText = "font-weight:500; margin-top:20px; color:#888; font-size:14px;";

  // İlerleme çubuğu
  const progressBar = document.createElement("div");
  progressBar.style.cssText = `
    height: 4px;
    background-color: #f8bbd0;
    border-radius: 4px;
    margin-top: 10px;
    overflow: hidden;
  `;

  const progressFill = document.createElement("div");
  progressFill.style.cssText = `
    height: 100%;
    width: 100%;
    background-color: #e91e63;
    border-radius: 4px;
    transition: width 1s linear;
  `;

  progressBar.appendChild(progressFill);

  const main = document.querySelector("main");
  if (main) {
    main.appendChild(progressBar);
    main.appendChild(countdownMessage);
  }

  const update = () => {
    countdownMessage.textContent = `${countdown} saniye içinde anasayfaya yönlendirileceksiniz...`;
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