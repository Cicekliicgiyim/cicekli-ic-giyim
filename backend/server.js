document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
  
    if (!username || !email || !password) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
  
    fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: username, email, password })
    })
      .then(response => response.json())
      .then(data => {
        alert("✅ " + data.message);
        window.location.href = "login.html"; // başarılıysa login'e yönlendir
      })
      .catch(error => {
        console.error("Kayıt hatası:", error);
        alert("❌ Kayıt sırasında bir hata oluştu.");
      });
  });
  