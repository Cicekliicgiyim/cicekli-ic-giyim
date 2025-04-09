document.addEventListener("DOMContentLoaded", () => {
    const userInfo = document.getElementById("user-info");
    const logoutBtn = document.getElementById("logoutBtn");
  
    // Kullanıcı oturum bilgisini kontrol et
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
    if (currentUser) {
      userInfo.textContent = `${currentUser.name} (Giriş Yapıldı)`;
      logoutBtn.style.display = "inline-block"; // Çıkış butonunu göster
    } else {
      userInfo.textContent = "Giriş Yapın";
      logoutBtn.style.display = "none"; // Çıkış butonunu gizle
    }
  
    // Çıkış yap butonuna tıklanıldığında
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser"); // Oturumu sil
      window.location.reload(); // Sayfayı yenile
    });
  });
  