document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("sessionUser"));
    const greetingElement = document.getElementById("greeting");
  
    if (currentUser && greetingElement) {
      greetingElement.textContent = `Teşekkürler, ${currentUser.name}! Siparişiniz başarıyla oluşturuldu.`;
    }
  });
  