function loadData() {
  const sampleProducts = [
    {
      id: 1,
      title: "Dantelli Sütyen",
      price: 249.90,
      image: "sutyen.jpg",
      category: "sutyen"
    },
    {
      id: 2,
      title: "Pijama Takımı",
      price: 399.90,
      image: "pijama.jpg",
      category: "pijama"
    },
    {
      id: 3,
      title: "Spor Sütyen",
      price: 299.90,
      image: "atlet.jpg",
      category: "sutyen"
    },
    {
      id: 4,
      title: "Çiçek Desenli Takım",
      price: 349.90,
      image: "takim.jpg",
      category: "takim"
    },
    {
      id: 5,
      title: "Saten Gecelik",
      price: 449.90,
      image: "gecelik.jpg",
      category: "gecelik"
    },
    {
      id: 6,
      title: "Pamuklu Külot Seti (3'lü)",
      price: 199.90,
      image: "kilot.jpg",
      category: "kilot"
    }
  ];

  const sampleUsers = [
    {
      username: "Admin",
      email: "admin@atilla.com",
      password: "admin123",
      role: "admin",
      phone: ""
    },
    {
      username: "test_kullanici",
      email: "test@atilla.com",
      password: "test123",
      role: "user",
      phone: "05001234567"
    }
  ];

  // Mevcut kullanıcıları koru, sadece örnek kullanıcıları ekle
  const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
  sampleUsers.forEach(sample => {
    if (!existingUsers.find(u => u.email === sample.email)) {
      existingUsers.push(sample);
    }
  });

  localStorage.setItem("products", JSON.stringify(sampleProducts));
  localStorage.setItem("users", JSON.stringify(existingUsers));

  // Sipariş geçmişi ve sepeti sıfırla
  localStorage.removeItem("cart");
  localStorage.removeItem("orderHistory");
  localStorage.removeItem("lastOrderNumber");

  // UI'da başarı mesajı göster
  const msg = document.getElementById("statusMessage");
  if (msg) {
    msg.textContent = "✅ " + sampleProducts.length + " ürün ve " +
      sampleUsers.length + " kullanıcı başarıyla yüklendi!";
    msg.className = "success";
  }

  console.info("Yüklenen ürünler:", sampleProducts);
  console.info("Yüklenen kullanıcılar:", sampleUsers.map(u => u.email));
}