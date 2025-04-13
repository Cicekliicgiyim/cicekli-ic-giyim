document.addEventListener("DOMContentLoaded", () => {
    // Geri sayım süresi (saniye)
    let countdown = 10;
    const redirectUrl = "/index.html";
  
    // Geri sayım göstermek için paragraf oluştur
    const countdownMessage = document.createElement("p");
    countdownMessage.style.fontWeight = "500";
    countdownMessage.style.marginTop = "20px";
    document.querySelector("main").appendChild(countdownMessage);
  
    const updateCountdown = () => {
      countdownMessage.textContent = `${countdown} saniye içinde anasayfaya yönlendirileceksiniz...`;
      countdown--;
  
      if (countdown < 0) {
        window.location.href = redirectUrl;
      }
    };
  
    updateCountdown(); // İlk çağrı
    setInterval(updateCountdown, 1000); // Her saniye tekrar
  });
  