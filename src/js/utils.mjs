export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error(`Error reading localStorage key "${key}":`, err);
    return null;
  }
}

export function setLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing localStorage key "${key}":`, err);
  }
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function getProductImage(product) {
  if (!product) return "";
  if (typeof product.Image === "string" && product.Image.trim() !== "") {
    return product.Image;
  }
  if (product.Images && typeof product.Images.PrimaryLarge === "string") {
    return product.Images.PrimaryLarge;
  }
  return "";
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false
) {
  if (!parentElement) return;
  if (clear) {
    parentElement.innerHTML = "";
  }
  const htmlStrings = (list || []).map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  if (!parentElement) return;
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${path} (${response.status})`);
  }
  return response.text();
}

export async function loadHeaderFooter(
  headerPath = "../partials/header.html",
  footerPath = "../partials/footer.html"
) {
  const headerEl = document.querySelector("#main-header");
  const footerEl = document.querySelector("#main-footer");

  try {
    if (headerEl) {
      const headerTemplate = await loadTemplate(headerPath);
      renderWithTemplate(headerTemplate, headerEl);
    }
    if (footerEl) {
      const footerTemplate = await loadTemplate(footerPath);
      renderWithTemplate(footerTemplate, footerEl);
    }
  } catch (err) {
    console.error("Error loading header/footer partials:", err);
  }
}

export function alertMessage(message, scroll = true) {
  const existing = document.querySelector(".alert");
  if (existing) existing.remove();

  const alert = document.createElement("div");
  alert.classList.add("alert");
  alert.setAttribute("role", "alert");
  alert.innerHTML = `
    <p>${message}</p>
    <button type="button" class="alert__close" aria-label="Close alert">&times;</button>
  `;

  alert.querySelector(".alert__close").addEventListener("click", () => {
    alert.remove();
  });

  const main = document.querySelector("main") || document.body;
  main.prepend(alert);

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}