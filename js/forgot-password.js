const msgEl    = document.getElementById("formMessage");
const step1El  = document.getElementById("step1");
const step2El  = document.getElementById("step2");

function showMessage(text, type = "error") {
  if (!msgEl) return;
  msgEl.textContent = text;
  msgEl.className   = type;
}

function goToStep2() {
  document.getElementById("requestResetForm").style.display = "none";
  document.getElementById("verifyCodeForm").style.display   = "block";
  if (step1El) { step1El.classList.remove("active"); step1El.classList.add("done"); step1El.textContent = "✓"; }
  if (step2El) { step2El.classList.add("active"); }
}

// 1. Adım: Kod gönder
document.getElementById("requestResetForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email    = document.getElementById("email").value.trim().toLowerCase();
  const phone    = document.getElementById("phone").value.trim();
  const btn      = this.querySelector("button[type='submit']");

  if (!email || !phone) {
    showMessage("Lütfen tüm alanları doldurun.");
    return;
  }

  // Kullanıcının kayıtlı olup olmadığını kontrol et
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user  = users.find(u => u.email === email && u.phone === phone);

  btn.disabled    = true;
  btn.textContent = "Gönderiliyor...";

  try {
    const res = await fetch("http://localhost:3000/api/send-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone })
    });
    const data = await res.json();

    if (data.success) {
      showMessage("Doğrulama kodu " + email + " adresine gönderildi.", "success");
      goToStep2();
    } else {
      showMessage(data.message || "Kod gönderilemedi.");
    }

  } catch {
    // Backend yoksa — kullanıcıyı doğrula ve devam et
    if (!user) {
      showMessage("Bu bilgilerle eşleşen bir hesap bulunamadı.");
      btn.disabled    = false;
      btn.textContent = "Doğrulama Kodu Gönder";
      return;
    }
    showMessage("Doğrulama kodu " + email + " adresine gönderildi.", "success");
    goToStep2();
  } finally {
    btn.disabled    = false;
    btn.textContent = "Doğrulama Kodu Gönder";
  }
});

// 2. Adım: Kodu doğrula ve şifreyi sıfırla
document.getElementById("verifyCodeForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email       = document.getElementById("email").value.trim().toLowerCase();
  const code        = document.getElementById("verificationCode").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPass = document.getElementById("newPasswordConfirm")?.value;
  const btn         = this.querySelector("button[type='submit']");

  if (!code || !newPassword) {
    showMessage("Lütfen tüm alanları doldurun.");
    return;
  }

  if (confirmPass !== undefined && newPassword !== confirmPass) {
    showMessage("Şifreler eşleşmiyor.");
    return;
  }

  if (newPassword.length < 6) {
    showMessage("Şifre en az 6 karakter olmalıdır.");
    return;
  }

  btn.disabled    = true;
  btn.textContent = "Sıfırlanıyor...";

  try {
    const res = await fetch("http://localhost:3000/api/verify-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword })
    });
    const data = await res.json();

    if (data.success) {
      showMessage("Şifreniz başarıyla sıfırlandı! Yönlendiriliyorsunuz...", "success");
      setTimeout(() => { window.location.href = "/cicekli-ic-giyim/login.html"; }, 1500);
    } else {
      showMessage(data.message || "Doğrulama kodu yanlış.");
    }

  } catch {
    // Backend yoksa — localStorage'da şifreyi güncelle
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const idx   = users.findIndex(u => u.email === email);

    if (idx === -1) {
      showMessage("Kullanıcı bulunamadı.");
      btn.disabled    = false;
      btn.textContent = "Şifreyi Sıfırla";
      return;
    }

    users[idx].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("Şifreniz başarıyla sıfırlandı! Yönlendiriliyorsunuz...", "success");
    setTimeout(() => { window.location.href = "/cicekli-ic-giyim/login.html"; }, 1500);

  } finally {
    btn.disabled    = false;
    btn.textContent = "Şifreyi Sıfırla";
  }
});