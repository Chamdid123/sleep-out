const baseURL = import.meta.env?.VITE_SERVER_URL || "";

async function convertToJson(res) {
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
        return data;
    }
    throw { name: "servicesError", message: data.message || data };
}

export default class ExternalServices {
    constructor(category = "tents") {
        this.category = category;
        this.path = `../json/${this.category}.json`;
    }

    async getData(category = this.category) {
        const endpoint = baseURL
            ? `${baseURL}/products/search/${category}`
            : `../json/${category}.json`;
        const response = await fetch(endpoint);
        const data = await convertToJson(response);
        return Array.isArray(data) ? data : data.Result || [];
    }

    async findProductById(id) {
        const products = await this.getData(this.category);
        return products.find((item) => String(item.Id) === String(id)) || null;
    }

    async checkout(payload) {
        const endpoint = baseURL ? `${baseURL}/checkout` : "/checkout";
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        };
        const response = await fetch(endpoint, options);
        return convertToJson(response);
    }
}