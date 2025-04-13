document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
  
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const email = loginForm.querySelector('input[type="email"]').value.trim();
      const password = loginForm.querySelector('input[type="password"]').value.trim();
      const users = JSON.parse(localStorage.getItem("users")) || [];
  
      const user = users.find(u => u.email === email && u.password === password);
  
      if (!user) {
        alert("Geçersiz e-posta veya şifre.");
        return;
      }
  
      localStorage.setItem("sessionUser", JSON.stringify(user));
  
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo");
  
      alert("Giriş başarılı!");
      window.location.href = redirectTo ? redirectTo : "/cicekli-ic-giyim/index.html";
    });
  });
  