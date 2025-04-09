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
      div.style.border = "1px solid #ccc";
      div.style.padding = "15px";
      div.style.marginBottom = "20px";
      div.style.borderRadius = "8px";
      div.style.background = "#fff";
  
      div.innerHTML = `
        <img src="images/${product.image}" alt="${product.title}" style="max-width: 150px;">
        <h3>${product.title}</h3>
        <p><strong>₺${product.price}</strong></p>
        <p>Kategori: ${product.category}</p>
        <button onclick='addToCart(${index})'>Sepete Ekle</button>
      `;
  
      productList.appendChild(div);
    });
  });
  
  // Sepete ürün ekleme
  function addToCart(index) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products[index];
  
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
  
    alert(`${product.title} sepete eklendi.`);
  }
  