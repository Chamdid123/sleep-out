import {
  getLocalStorage,
  setLocalStorage,
  getProductImage,
  renderListWithTemplate,
} from "./utils.mjs";

function cartItemTemplate(item) {
  const qty = Number(item.quantity) || 1;
  const unitPrice = Number(item.FinalPrice) || 0;
  const lineTotal = (unitPrice * qty).toFixed(2);
  const imgSrc = getProductImage(item);
  const colorName = item.Colors?.[0]?.ColorName || "";

  return `
    <li class="cart-card divider" data-id="${item.Id}">
      <a href="../product_pages/index.html?product=${item.Id}" class="cart-card__image">
        <img src="${imgSrc}" alt="${item.Name}" />
      </a>
      <a href="../product_pages/index.html?product=${item.Id}">
        <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${colorName}</p>
      <p class="cart-card__quantity">qty: ${qty}</p>
      <p class="cart-card__price">$${lineTotal}</p>
      <button type="button" class="cart-card__remove" data-id="${item.Id}" aria-label="Remove ${item.Name}">X</button>
    </li>
  `;
}

export default class ShoppingCart {
  constructor(key = "so-cart", parentSelector = ".product-list") {
    this.key = key;
    this.parentSelector = parentSelector;
    this.parentElement = document.querySelector(this.parentSelector);
  }

  getItems() {
    const data = getLocalStorage(this.key);
    return Array.isArray(data) ? data : [];
  }

  getSubtotal(items = this.getItems()) {
    return items.reduce((sum, item) => {
      const price = Number(item.FinalPrice) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  }

  removeItem(id) {
    const updated = this.getItems().filter(
      (item) => String(item.Id) !== String(id)
    );
    setLocalStorage(this.key, updated);
    this.render();
  }

  render() {
    if (!this.parentElement) return;
    const items = this.getItems();

    if (items.length === 0) {
      this.parentElement.innerHTML = "<p>Your cart is currently empty.</p>";
      this.updateTotalDisplay(0);
      return;
    }

    renderListWithTemplate(
      cartItemTemplate,
      this.parentElement,
      items,
      "afterbegin",
      true
    );

    this.parentElement.querySelectorAll(".cart-card__remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.removeItem(e.currentTarget.dataset.id);
      });
    });

    this.updateTotalDisplay(this.getSubtotal(items));
  }

  updateTotalDisplay(subtotal) {
    const totalEl = document.querySelector(".cart-total");
    if (totalEl) {
      totalEl.textContent = `Total: $${subtotal.toFixed(2)}`;
    }
  }
}