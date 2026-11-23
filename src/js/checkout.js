import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./checkoutProcess.mjs";

loadHeaderFooter();

const myCheckout = new CheckoutProcess("so-cart", ".order-summary");
myCheckout.init();

const zipInput = document.querySelector("#zip");
if (zipInput) {
    zipInput.addEventListener("change", () => {
        myCheckout.calculateOrderTotal();
    });
}

const checkoutForm = document.querySelector("#checkout-form");
const submitBtn = document.querySelector("#checkoutSubmit");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!checkoutForm.checkValidity()) {
            checkoutForm.reportValidity();
            return;
        }
        if (submitBtn) submitBtn.disabled = true;
        try {
            await myCheckout.checkout(checkoutForm);
            checkoutForm.reset();
            myCheckout.init();
        } catch {
            // Error message already displayed via alertMessage
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}