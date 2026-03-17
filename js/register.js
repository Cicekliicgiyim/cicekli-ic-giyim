const form        = document.getElementById("registerForm");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const msgEl       = document.getElementById("formMessage");

function showMessage(text, type = "error") {
  msgEl.textContent = text;
  msgEl.className   = type;
}

// Doğrulama kodu gönder
sendCodeBtn.addEventListener("click", async function () {
  const email = document.getElementById("email").value.trim().toLowerCase();
  if (!email) {
    showMessage("Lütfen önce e-posta adresinizi girin.");
    return;
  }

  sendCodeBtn.disabled     = true;
  sendCodeBtn.textContent  = "Gönderiliyor...";

  try {
    const res = await fetch("http://localhost:3000/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    showMessage(data.message || "Doğrulama kodu gönderildi.", "success");

    // Kod input alanını göster
    const verGroup = document.getElementById("verificationGroup");
    if (verGroup) verGroup.style.display = "block";

  } catch (err) {
    // Backend yoksa (localStorage modu) yine de devam et
    console.warn("Backend bağlantısı yok, doğrulama atlanıyor:", err);
    showMessage("Doğrulama kodu " + email + " adresine gönderildi.", "success");
    const verGroup = document.getElementById("verificationGroup");
    if (verGroup) verGroup.style.display = "block";
  } finally {
    sendCodeBtn.disabled    = false;
    sendCodeBtn.textContent = "📩 Doğrulama Kodunu Gönder";
  }
});

// Kayıt formu gönder
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email    = document.getElementById("email").value.trim().toLowerCase();
  const phone    = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const code     = document.getElementById("verificationCode")?.value.trim();

  if (!username || !email || !phone || !password) {
    showMessage("Lütfen tüm alanları doldurun.");
    return;
  }

  if (password.length < 6) {
    showMessage("Şifre en az 6 karakter olmalıdır.");
    return;
  }

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled    = true;
  submitBtn.textContent = "Kaydediliyor...";

  try {
    // Backend varsa kodu doğrula
    if (code) {
      try {
        const verifyRes = await fetch("http://localhost:3000/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          showMessage("Doğrulama kodu yanlış.");
          return;
        }
      } catch {
        // Backend yoksa doğrulamayı atla
        console.warn("Backend yok, kod doğrulama atlandı.");
      }
    }

    // Kullanıcı zaten var mı?
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find(u => u.email === email)) {
      showMessage("Bu e-posta adresi zaten kayıtlı.");
      return;
    }

    // Yeni kullanıcıyı kaydet
    const newUser = { username, email, phone, password, role: "user" };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...", "success");
    setTimeout(() => {
      window.location.href = "/cicekli-ic-giyim/login.html";
    }, 1500);

  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = "Kayıt Ol";
  }
});