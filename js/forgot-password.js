// 1. Adım: Kod gönderme işlemi
document.getElementById("requestResetForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();

  if (!email || !phone) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  fetch("http://localhost:3000/api/send-reset-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, phone })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("📩 Doğrulama kodu e-posta adresinize gönderildi.");
        // Kod gönderildiyse 2. formu göster
        document.getElementById("requestResetForm").style.display = "none";
        document.getElementById("verifyCodeForm").style.display = "block";
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch(error => {
      console.error("Kod gönderme hatası:", error);
      alert("❌ Bir hata oluştu. Lütfen tekrar deneyin.");
    });
});

// 2. Adım: Kod doğrulama ve şifreyi sıfırlama
document.getElementById("verifyCodeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase(); // aynı e-posta kullanılacak
  const code = document.getElementById("verificationCode").value.trim();
  const newPassword = document.getElementById("newPassword").value;

  if (!code || !newPassword) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  fetch("http://localhost:3000/api/verify-reset-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, newPassword })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("✅ Şifreniz başarıyla sıfırlandı.");
        window.location.href = "/cicekli-ic-giyim/login.html";
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch(error => {
      console.error("Şifre sıfırlama hatası:", error);
      alert("❌ Bir hata oluştu. Lütfen tekrar deneyin.");
    });
});
