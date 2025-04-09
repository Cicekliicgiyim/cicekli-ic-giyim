document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSummaryContainer = document.getElementById("cart-summary");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Sepetinizde ürün bulunmamaktadır.</p>";
    cartSummaryContainer.innerHTML = "<p>Toplam: ₺0.00</p>";
    return;
  }

  let total = 0;

  // Sepetteki her ürünü ekleyelim
  cartItemsContainer.innerHTML = '';  // Önceden eklenen öğeleri temizleyelim
  cart.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");

    itemDiv.innerHTML = `
      <div class="cart-item-details">
        <img src="images/${item.image}" alt="${item.title}" style="width: 100px;">
        <h4>${item.title}</h4>
        <p>₺${item.price}</p>
        <button onclick="removeFromCart(${index})">Kaldır</button>
      </div>
    `;

    cartItemsContainer.appendChild(itemDiv);
    total += parseFloat(item.price);
  });

  // Sepet toplamını ekleyelim
  cartSummaryContainer.innerHTML = `<p>Toplam: ₺${total.toFixed(2)}</p>`;
});

// Sepetten ürün kaldırma fonksiyonu
function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1); // Ürünü sepetten kaldır
  localStorage.setItem("cart", JSON.stringify(cart));

  // Sayfayı yeniden yüklememek için sadece ürünleri güncelle
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSummaryContainer = document.getElementById("cart-summary");

  // Ürünleri yeniden ekle
  cartItemsContainer.innerHTML = '';  
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Sepetinizde ürün bulunmamaktadır.</p>";
    cartSummaryContainer.innerHTML = "<p>Toplam: ₺0.00</p>";
    return;
  }

  cart.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");

    itemDiv.innerHTML = `
      <div class="cart-item-details">
        <img src="images/${item.image}" alt="${item.title}" style="width: 100px;">
        <h4>${item.title}</h4>
        <p>₺${item.price}</p>
        <button onclick="removeFromCart(${index})">Kaldır</button>
      </div>
    `;

    cartItemsContainer.appendChild(itemDiv);
    total += parseFloat(item.price);
  });

  cartSummaryContainer.innerHTML = `<p>Toplam: ₺${total.toFixed(2)}</p>`;
}
