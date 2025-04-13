document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetForm");
  
    resetForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const email = document.getElementById("resetEmail").value.trim();
      const newPassword = document.getElementById("newPassword").value.trim();
  
      let users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex(u => u.email === email);
  
      if (userIndex === -1) {
        alert("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.");
        return;
      }
  
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
  
      alert("Şifreniz başarıyla güncellendi.");
      window.location.href = "/cicekli-ic-giyim/login.html";
    });
  });
  