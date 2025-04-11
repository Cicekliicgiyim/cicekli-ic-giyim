document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("user-info");
  const greeting = document.getElementById("greeting");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

  const currentUser = JSON.parse(localStorage.getItem("sessionUser"));

  // Kullanıcı bilgisi varsa göster
  if (currentUser) {
    if (userInfo) userInfo.textContent = `${currentUser.name} (Giriş Yapıldı)`;
    if (greeting) greeting.textContent = `Hoş geldin, ${currentUser.name}`;
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
  } else {
    if (userInfo) userInfo.textContent = "";
    if (greeting) greeting.textContent = "";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (registerBtn) registerBtn.style.display = "inline-block";
  }

  // Çıkış yap
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("sessionUser");
      window.location.reload();
    });
  }

  // Giriş yap
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }

  // Kayıt ol
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }

  // Sayfa giriş gerektiriyorsa ve kullanıcı yoksa login'e yönlendir
  const requireLogin = document.body.getAttribute("data-require-login");
  if (requireLogin !== null && !currentUser) {
    window.location.href = "login.html";
  }
});
