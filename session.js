document.addEventListener("DOMContentLoaded", () => {
    const userInfo = document.getElementById("user-info");
    const logoutBtn = document.getElementById("logoutBtn");
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
  
    if (userInfo && logoutBtn) {
      if (user) {
        userInfo.textContent = `${user.name} olarak giriş yapıldı`;
        logoutBtn.style.display = "inline-block";
  
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("loggedInUser");
          window.location.href = "login.html";
        });
      } else {
        userInfo.textContent = "";
        logoutBtn.style.display = "none";
      }
    }
  
    // Oturum açmadan erişilmemesi gereken sayfalarda kontrol
    if (document.body.hasAttribute("data-require-login") && !user) {
      alert("Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.");
      window.location.href = "login.html";
    }
  });
  