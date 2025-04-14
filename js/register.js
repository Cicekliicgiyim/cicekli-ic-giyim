document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const role = "user";

  if (!username || !email || !phone || !password || !role) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  if (!validateEmail(email)) {
    alert("Geçerli bir e-posta adresi giriniz.");
    return;
  }

  if (!validatePhone(phone)) {
    alert("Geçerli bir telefon numarası giriniz. (Örnek: 05551234567)");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    alert("Bu e-posta zaten kayıtlı.");
    return;
  }

  const newUser = {
    name: username,
    email,
    phone,
    password,
    role
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  alert("✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
  window.location.href = "login.html";
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^05\d{9}$/; // Türkiye GSM formatı (örnek: 05XXXXXXXXX)
  return re.test(phone);
}
