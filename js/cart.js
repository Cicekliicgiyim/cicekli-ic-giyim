document.addEventListener("DOMContentLoaded", () => {
    const cartList = document.getElementById("cart-list");
    const totalElement = document.getElementById("cart-total");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    if (cart.length === 0) {
      cartList.innerHTML = "<p>Sepetiniz boş.</p>";
      totalElement.textContent = "₺0.00";
      return;
    }
  
    let total = 0;
  
    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.style.border = "1px solid #ddd";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";
      div.style.borderRadius = "6px";
      div.style.backgroundColor = "#fff";
  
      div.innerHTML = `
        <img src="images/${item.image}" alt="${item.title}" style="width: 100px;">
        <h4>${item.title}</h4>
        <p>₺${item.price}</p>
        <button onclick="removeFromCart(${index})">Kaldır</button>
      `;
  
      total += parseFloat(item.price);
      cartList.appendChild(div);
    });
  
    totalElement.textContent = `₺${total.toFixed(2)}`;
  });
  
  // Ürünü sepetten kaldır
  function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
  }
  
  // Sepeti tamamen temizle
  function clearCart() {
    localStorage.removeItem("cart");
    location.reload();
  }
  