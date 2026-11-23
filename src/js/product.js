import {
  getParam,
  getLocalStorage,
  setLocalStorage,
  getProductImage,
  loadHeaderFooter,
  alertMessage,
} from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

loadHeaderFooter();

const productId = getParam("product");
const dataSource = new ExternalServices("tents");
let currentProduct = null;

function renderProductDetails(product) {
  const container = document.querySelector(".product-detail");
  if (!container) return;

  if (!product) {
    container.innerHTML = "<p>Product not found.</p>";
    return;
  }

  const imageSrc = getProductImage(product);
  const brandName = product.Brand?.Name || "";

  container.innerHTML = `
    <h3>${brandName}</h3>
    <h2 class="divider">${product.NameWithoutBrand || product.Name}</h2>
    <img class="divider" src="${imageSrc}" alt="${product.Name}" />
    <p class="product-card__price">$${Number(product.FinalPrice).toFixed(2)}</p>
    <p class="product__color">${product.Colors?.[0]?.ColorName || ""}</p>
    <p class="product__description">${product.DescriptionHtmlSimple || ""}</p>
    <div class="product-detail__add">
      <button id="addToCart" data-id="${product.Id}">Add to Cart</button>
    </div>
  `;

  const addBtn = document.querySelector("#addToCart");
  if (addBtn) {
    addBtn.addEventListener("click", addToCartHandler);
  }
}

function addProductToCart(product) {
  const cart = getLocalStorage("so-cart");
  const cartItems = Array.isArray(cart) ? [...cart] : [];

  const existingIndex = cartItems.findIndex(
    (item) => String(item.Id) === String(product.Id)
  );

  if (existingIndex > -1) {
    const currentQty = Number(cartItems[existingIndex].quantity) || 1;
    cartItems[existingIndex] = {
      ...cartItems[existingIndex],
      quantity: currentQty + 1,
    };
  } else {
    cartItems.push({
      ...product,
      quantity: 1,
    });
  }

  setLocalStorage("so-cart", cartItems);
}

async function addToCartHandler(e) {
  const id = e.target.dataset.id || productId;
  const product =
    currentProduct && String(currentProduct.Id) === String(id)
      ? currentProduct
      : await dataSource.findProductById(id);

  if (!product) {
    alertMessage("Unable to add product to cart.");
    return;
  }

  addProductToCart(product);
  alertMessage(`${product.NameWithoutBrand || product.Name} added to cart!`);
}

async function init() {
  if (!productId) return;
  currentProduct = await dataSource.findProductById(productId);
  renderProductDetails(currentProduct);
}

init();