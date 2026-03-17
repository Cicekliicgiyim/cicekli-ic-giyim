document.addEventListener("DOMContentLoaded", () => {
  const greeting    = document.getElementById("greeting");
  const logoutBtn   = document.getElementById("logoutBtn");
  const loginBtn    = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const adminLink   = document.getElementById("adminLink");
  const userInfo    = document.getElementById("user-info");

  const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

  if (currentUser) {
    const displayName = currentUser.username || currentUser.email || "Kullanıcı";
    if (userInfo)    userInfo.textContent         = `${displayName} (Giriş Yapıldı)`;
    if (greeting)    greeting.textContent         = `Hoş geldin, ${displayName}`;
    if (logoutBtn)   logoutBtn.style.display      = "inline-block";
    if (loginBtn)    loginBtn.style.display       = "none";
    if (registerBtn) registerBtn.style.display    = "none";
    if (adminLink)   adminLink.style.display      = currentUser.role === "admin" ? "inline-block" : "none";
  } else {
    if (userInfo)    userInfo.textContent         = "";
    if (greeting)    greeting.textContent         = "";
    if (logoutBtn)   logoutBtn.style.display      = "none";
    if (loginBtn)    loginBtn.style.display       = "inline-block";
    if (registerBtn) registerBtn.style.display    = "inline-block";
    if (adminLink)   adminLink.style.display      = "none";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("loggedInUser");
      window.location.href = "/cicekli-ic-giyim/index.html";
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "/cicekli-ic-giyim/login.html";
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "/cicekli-ic-giyim/register.html";
    });
  }

  // Giriş gerektiren sayfalar (data-require-login)
  const requireLogin = document.body.getAttribute("data-require-login");
  if (requireLogin !== null && !currentUser) {
    window.location.href =
      "/cicekli-ic-giyim/login.html?redirectTo=" + encodeURIComponent(window.location.pathname);
    return;
  }

  // Admin gerektiren sayfalar (data-require-admin)
  const requireAdmin = document.body.getAttribute("data-require-admin");
  if (requireAdmin !== null && (!currentUser || currentUser.role !== "admin")) {
    window.location.href = "/cicekli-ic-giyim/login.html";
    return;
  }
});