import { getLocalStorage, setLocalStorage, alertMessage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

function formDataToJSON(formElement) {
    const formData = new FormData(formElement);
    const convertedJSON = {};
    formData.forEach((value, key) => {
        convertedJSON[key] = value;
    });
    return convertedJSON;
}

function packageItems(items) {
    return items.map((item) => ({
        id: item.Id,
        name: item.Name,
        price: Number(item.FinalPrice) || 0,
        quantity: Number(item.quantity) || 1,
    }));
}

export default class CheckoutProcess {
    constructor(key = "so-cart", outputSelector = ".order-summary") {
        this.key = key;
        this.outputSelector = outputSelector;
        this.list = [];
        this.itemTotal = 0;
        this.shipping = 0;
        this.tax = 0;
        this.orderTotal = 0;
        this.services = new ExternalServices();
    }

    init() {
        const stored = getLocalStorage(this.key);
        this.list = Array.isArray(stored) ? stored : [];
        this.calculateItemSummary();
        this.calculateOrderTotal();
    }

    calculateItemSummary() {
        const totalQty = this.list.reduce(
            (sum, item) => sum + (Number(item.quantity) || 1),
            0
        );
        this.itemTotal = this.list.reduce(
            (sum, item) =>
                sum + (Number(item.FinalPrice) || 0) * (Number(item.quantity) || 1),
            0
        );

        const container = document.querySelector(this.outputSelector);
        if (!container) return;

        const countEl = container.querySelector("#num-items");
        const subtotalEl = container.querySelector("#cart-subtotal");
        if (countEl) countEl.textContent = totalQty;
        if (subtotalEl) subtotalEl.textContent = `$${this.itemTotal.toFixed(2)}`;
    }

    calculateOrderTotal() {
        const totalQty = this.list.reduce(
            (sum, item) => sum + (Number(item.quantity) || 1),
            0
        );
        this.shipping = totalQty > 0 ? 10 + (totalQty - 1) * 2 : 0;
        this.tax = this.itemTotal * 0.06;
        this.orderTotal = this.itemTotal + this.shipping + this.tax;
        this.displayOrderTotals();
    }

    displayOrderTotals() {
        const container = document.querySelector(this.outputSelector);
        if (!container) return;

        const shippingEl = container.querySelector("#shipping-estimate");
        const taxEl = container.querySelector("#tax-estimate");
        const totalEl = container.querySelector("#order-total");

        if (shippingEl) shippingEl.textContent = `$${this.shipping.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${this.tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${this.orderTotal.toFixed(2)}`;
    }

    async checkout(form) {
        const jsonData = formDataToJSON(form);
        const payload = {
            ...jsonData,
            orderDate: new Date().toISOString(),
            items: packageItems(this.list),
            orderTotal: this.orderTotal.toFixed(2),
            shipping: this.shipping,
            tax: this.tax.toFixed(2),
        };

        try {
            const response = await this.services.checkout(payload);
            setLocalStorage(this.key, []);
            alertMessage("Order placed successfully! Thank you for shopping with Sleep Outside.");
            return response;
        } catch (err) {
            const message =
                typeof err?.message === "string"
                    ? err.message
                    : "There was an issue submitting your order. Please check your details and try again.";
            alertMessage(message);
            throw err;
        }
    }
}