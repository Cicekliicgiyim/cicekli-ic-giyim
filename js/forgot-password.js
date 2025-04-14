document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetForm");
  
    resetForm.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const newPassword = document.getElementById("newPassword").value.trim();
  
      let users = JSON.parse(localStorage.getItem("users")) || [];
  
      const userIndex = users.findIndex(u => u.email === email && u.phone === phone);
  
      if (userIndex === -1) {
        alert("E-posta veya telefon numarası hatalı.");
        return;
      }
  
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
  
      alert("Şifre başarıyla güncellendi.");
      window.location.href = "/cicekli-ic-giyim/login.html";
    });
  });
  