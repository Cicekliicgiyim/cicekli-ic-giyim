document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const code = prompt("E-posta adresinize gönderilen doğrulama kodunu girin:");
  const role = "user";

  if (!username || !email || !password || !code) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  // Backend'e kodu doğrulat
  const verifyRes = await fetch("http://localhost:3000/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code })
  });

  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    alert("Doğrulama kodu yanlış.");
    return;
  }

  // Doğrulama başarılıysa kullanıcıyı kaydet
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    alert("Bu e-posta zaten kayıtlı.");
    return;
  }

  const newUser = { name: username, email, password, role };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  alert("✅ Kayıt başarılı!");
  window.location.href = "login.html";
});

// Kayıt butonuna tıklanınca kod gönder
document.getElementById("sendCodeBtn").addEventListener("click", async function () {
  const email = document.getElementById("email").value.trim().toLowerCase();
  if (!email) return alert("Lütfen önce e-posta girin.");

  try {
    const res = await fetch("http://localhost:3000/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message || "Kod gönderildi.");
  } catch (err) {
    console.error(err);
    alert("Kod gönderilemedi.");
  }
});
