function loadData() {
    const sampleProducts = [
      {
        id: 1,
        title: "Dantelli Sütyen",
        price: 249.90,
        image: "images/sutyen.jpg",
        category: "sutyen"
      },
      {
        id: 2,
        title: "Pijama Takımı",
        price: 399.90,
        image: "images/pijama.jpg",
        category: "pijama"
      },
      {
        id: 3,
        title: "Spor Sütyen",
        price: 299.90,
        image: "images/atlet.jpg",
        category: "sutyen"
      }
    ];
  
    const users = [
      {
        name: "Admin",
        email: "admin@admin.com",
        password: "1234",
        role: "admin"
      }
    ];
  
    localStorage.setItem("products", JSON.stringify(sampleProducts));
    localStorage.setItem("users", JSON.stringify(users));
  
    alert("✔ Ürünler ve kullanıcı başarıyla yüklendi!");
  }
  