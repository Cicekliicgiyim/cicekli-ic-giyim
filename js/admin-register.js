document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("admin-register-form");
  
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
  
      if (!username || !email || !password) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }
  
      let users = JSON.parse(localStorage.getItem("users")) || [];
  
      // Aynı e-posta daha önce kayıtlı mı kontrol et
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        alert("Bu e-posta zaten kayıtlı.");
        return;
      }
  
      const newAdmin = {
        username,
        email,
        password,
        role: "admin"
      };
  
      users.push(newAdmin);
      localStorage.setItem("users", JSON.stringify(users));
  
      alert("Admin başarıyla kaydedildi!");
      registerForm.reset();
      window.location.href = "/cicekli-ic-giyim/login.html"; // Giriş sayfasına yönlendir
    });
  });
  