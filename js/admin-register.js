document.addEventListener("DOMContentLoaded", () => {
  const form  = document.getElementById("admin-register-form");
  const msgEl = document.getElementById("formMessage") || createMessageEl(form);

  // Sadece admin erişebilir
  const currentUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  if (!currentUser || currentUser.role !== "admin") {
    window.location.href = "/cicekli-ic-giyim/login.html";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username        = document.getElementById("username").value.trim();
    const email           = document.getElementById("email").value.trim().toLowerCase();
    const password        = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;
    const submitBtn       = form.querySelector("button[type='submit']");

    // Zorunlu alan kontrolü
    if (!username || !email || !password) {
      showMessage("Lütfen tüm alanları doldurun.", "error");
      return;
    }

    // E-posta format kontrolü
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("Geçerli bir e-posta adresi giriniz.", "error");
      return;
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
      showMessage("Şifre en az 6 karakter olmalıdır.", "error");
      return;
    }

    // Şifre tekrar kontrolü
    if (confirmPassword !== undefined && password !== confirmPassword) {
      showMessage("Şifreler eşleşmiyor.", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find(u => u.email === email)) {
      showMessage("Bu e-posta adresi zaten kayıtlı.", "error");
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = "Kaydediliyor...";

    const newAdmin = { username, email, password, role: "admin", phone: "" };
    users.push(newAdmin);
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("✅ Admin başarıyla kaydedildi! Yönlendiriliyorsunuz...", "success");
    form.reset();

    setTimeout(() => {
      window.location.href = "/cicekli-ic-giyim/login.html";
    }, 1500);

    submitBtn.disabled    = false;
    submitBtn.textContent = "Kaydet";
  });

  function showMessage(text, type = "error") {
    msgEl.textContent = text;
    msgEl.className   = type;
  }

  function createMessageEl(parent) {
    const el = document.createElement("div");
    el.id    = "formMessage";
    el.style.cssText = "text-align:center; font-size:14px; margin-bottom:12px; min-height:20px;";
    parent.prepend(el);
    return el;
  }
});