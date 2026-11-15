export default class ProductDetails {
    constructor(productId, dataSource) {
        this.productId = productId;
        this.dataSource = dataSource;
    }

    async init() {
        // Get the product details
        const product = await this.dataSource.findProductById(this.productId);

        // Display the product details
        this.renderProductDetails(product);

        // Add event listener to Add to Cart button
        document.getElementById('addToCart')
            .addEventListener('click', this.addToCart.bind(this));
    }
}