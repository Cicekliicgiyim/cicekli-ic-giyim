document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");
  const products = JSON.parse(localStorage.getItem("products")) || [];

  if (!products.length) {
    productList.innerHTML = "<p>Henüz ürün eklenmedi.</p>";
    return;
  }

  products.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="images/${product.image}" alt="${product.title}" class="product-image">
      <h3>${product.title}</h3>
      <p><strong>₺${product.price}</strong></p>
      <p>Kategori: ${product.category}</p>
      <button data-index="${index}" class="add-to-cart-btn">Sepete Ekle</button>
    `;

    productList.appendChild(card);
  });

  // Sepete Ekle butonlarına tıklama işlemi
  document.querySelectorAll(".add-to-cart-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      addToCart(parseInt(index));
    });
  });
});

function addToCart(index) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Lütfen sepete ürün eklemek için giriş yapınız.");
    window.location.href = "/cicekli-ic-giyim/login.html";
    return;
  }

  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products[index];

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Ürüne kullanıcı bilgisi ekleniyor
  const cartItem = {
    ...product,
    userEmail: currentUser.email
  };

  cart.push(cartItem);
  localStorage.setItem("cart", JSON.stringify(cart));

  alert(`${product.title} sepete eklendi.`);
}
