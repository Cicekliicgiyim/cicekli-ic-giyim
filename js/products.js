document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");
  const products = JSON.parse(localStorage.getItem("products")) || [];

  if (products.length === 0) {
    productList.innerHTML = "<p>Henüz ürün eklenmedi.</p>";
    return;
  }

  products.forEach((product, index) => {
    const div = document.createElement("div");
    div.className = "product-card";

    div.innerHTML = `
      <img src="images/${product.image}" alt="${product.title}" class="product-image">
      <h3>${product.title}</h3>
      <p><strong>₺${product.price}</strong></p>
      <p>Kategori: ${product.category}</p>
      <button onclick='addToCart(${index})'>Sepete Ekle</button>
    `;

    productList.appendChild(div);
  });
});

function addToCart(index) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products[index];

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));

  alert(`${product.title} sepete eklendi.`);
}
