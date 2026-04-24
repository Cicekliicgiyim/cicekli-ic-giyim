const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "mongodb+srv://cicekliticaret98_db_user:MYKKcvagRah1XyV2@cluster0.zyb223o.mongodb.net/cicekli"; // ← Render URL'nizi buraya yazın

const msgEl   = document.getElementById("formMessage");
const step1El = document.getElementById("step1");
const step2El = document.getElementById("step2");

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

  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const btn   = this.querySelector("button[type='submit']");

  if (!email || !phone) {
    showMessage("Lütfen tüm alanları doldurun.");
    return;
  }

  btn.disabled    = true;
  btn.textContent = "Gönderiliyor...";

  try {
    const res = await fetch(`${API_URL}/api/send-reset-code`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ email, phone })
    });
    const data = await res.json();

    if (data.success) {
      showMessage("Doğrulama kodu " + email + " adresine gönderildi.", "success");
      goToStep2();
    } else {
      showMessage(data.message || "Kod gönderilemedi.");
    }

  } catch {
    showMessage("Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.");
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
    const res = await fetch(`${API_URL}/api/verify-reset-code`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ email, code, newPassword })
    });
    const data = await res.json();

    if (data.success) {
      showMessage("Şifreniz başarıyla sıfırlandı! Yönlendiriliyorsunuz...", "success");
      setTimeout(() => { window.location.href = "/cicekli-ic-giyim/login.html"; }, 1500);
    } else {
      showMessage(data.message || "Doğrulama kodu yanlış.");
    }

  } catch {
    showMessage("Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.");
  } finally {
    btn.disabled    = false;
    btn.textContent = "Şifreyi Sıfırla";
  }
});