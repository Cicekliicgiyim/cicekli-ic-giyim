document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("user-info");
  const greeting = document.getElementById("greeting");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

  const currentUser = JSON.parse(localStorage.getItem("sessionUser"));

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

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("sessionUser");
      window.location.reload();
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }

  // Eğer sayfa özel erişim istiyorsa ve giriş yapılmamışsa yönlendir
  const requireLogin = document.body.getAttribute("data-require-login");
  if (requireLogin !== null && !currentUser) {
    window.location.href = "login.html";
  }
});
