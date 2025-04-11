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
      const loginPath = getLoginPath();
      window.location.href = loginPath;
    });
  }

  // Kayıt ol
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      const registerPath = getLoginPath().replace("login.html", "register.html");
      window.location.href = registerPath;
    });
  }

  // Giriş yapılması gereken sayfalarda kontrol
  const requireLogin = document.body.getAttribute("data-require-login");
  if (requireLogin !== null && !currentUser) {
    const loginPath = getLoginPath();
    window.location.href = loginPath + "?redirectTo=" + encodeURIComponent(window.location.pathname);
  }

  // Yalnızca admin erişimi gereken sayfa kontrolü (opsiyonel)
  const requireAdmin = document.body.getAttribute("data-require-admin");
  if (requireAdmin !== null && (!currentUser || currentUser.role !== "admin")) {
    alert("Bu sayfaya yalnızca yöneticiler erişebilir.");
    const loginPath = getLoginPath();
    window.location.href = loginPath;
  }

  // login.html yolu dinamik olarak hesaplanır
  function getLoginPath() {
    const path = window.location.pathname;
    const isInPages = path.includes("/pages/");
    return isInPages ? "login.html" : "pages/login.html";
  }
});
