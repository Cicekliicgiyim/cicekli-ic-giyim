document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const role = "user";
    if (!username || !email || !password || !role) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
  
    if (!validateEmail(email)) {
      alert("Geçerli bir e-posta adresi giriniz.");
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
  