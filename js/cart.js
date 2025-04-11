document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSummaryContainer = document.getElementById("cart-summary");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<div class="empty-cart">Sepetinizde ürün bulunmamaktadır.</div>`;
    cartSummaryContainer.innerHTML = `<div class="total-box">Toplam: ₺0.00</div>`;
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = "";

  cart.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");

    itemDiv.innerHTML = `
      <img src="images/${item.image}" alt="${item.title}" class="cart-item-img">
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <p class="cart-price">₺${item.price}</p>
        <button class="remove-btn" data-index="${index}">Kaldır</button>
      </div>
    `;

    cartItemsContainer.appendChild(itemDiv);
    total += parseFloat(item.price);
  });

  cartSummaryContainer.innerHTML = `
    <div class="total-box">Toplam: ₺${total.toFixed(2)}</div>
  `;

  // Silme butonlarına tıklama olayı
  document.querySelectorAll(".remove-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      removeFromCart(index);
    });
  });
});

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload(); // Sayfayı yenileyerek listeyi güncelle
}
