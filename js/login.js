document.addEventListener("DOMContentLoaded", () => {
  const form     = document.getElementById("loginForm");
  const errorMsg = document.getElementById("error-message");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email    = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const submitBtn = form.querySelector("button[type='submit']");

    if (!email || !password) {
      showError("Lütfen tüm alanları doldurun.");
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = "Giriş yapılıyor...";

    // Admin kontrolü
    const isAdmin = email === "admin@atilla.com" && password === "admin123";

    if (isAdmin) {
      const adminUser = { email, role: "admin", username: "Admin" };
      sessionStorage.setItem("loggedInUser", JSON.stringify(adminUser));
      window.location.href = "/cicekli-ic-giyim/admin.html";
      return;
    }

    // Kullanıcı listesinden kontrol
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user  = users.find(u => u.email === email && u.password === password);

    if (!user) {
      showError("E-posta veya şifre yanlış.");
      submitBtn.disabled    = false;
      submitBtn.textContent = "Giriş Yap";
      return;
    }

    sessionStorage.setItem("loggedInUser", JSON.stringify(user));

    // Güvenli yönlendirme — sadece aynı origin'e izin ver
    const params     = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirectTo");
    const safeRedirect = redirectTo && redirectTo.startsWith("/cicekli-ic-giyim/")
      ? redirectTo
      : "/cicekli-ic-giyim/index.html";

    window.location.href = safeRedirect;
  });

  function showError(message) {
    if (errorMsg) {
      errorMsg.textContent     = message;
      errorMsg.style.display   = "block";
    }
  }
});