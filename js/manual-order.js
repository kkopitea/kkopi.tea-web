
import { auth, db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const categoryFilter = document.getElementById("category-filter");
const productSearch = document.getElementById("product-search");
const productSearchResults = document.getElementById("product-search-results");

const productName = document.getElementById("product-name");
const productBasePrice = document.getElementById("product-base-price");
const productSize = document.getElementById("product-size");
const productQuantity = document.getElementById("product-quantity");
const unitPrice = document.getElementById("unit-price");
const productSubtotal = document.getElementById("product-subtotal");

const clearProductButton = document.getElementById("clear-product");
const addItemButton = document.getElementById("add-item-button");
const productLoadMessage = document.getElementById("product-load-message");
const formMessage = document.getElementById("form-message");

const customerName = document.getElementById("customer-name");
const fulfillment = document.getElementById("fulfillment");

const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const orderTotal = document.getElementById("order-total");
const createOrderButton = document.getElementById("create-order-button");

let allProducts = [];
let selectedProduct = null;
let cart = [];
let currentUser = null;

const peso = (amount) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(Number(amount) || 0);

function showMessage(element, message, type = "error") {
    if (!element) return;

    element.textContent = message;
    element.className = `form-message ${type}`;
    element.hidden = !message;
}

function getProductName(product) {
    return (
        product.productName ||
        product.name ||
        product.title ||
        product.menuName ||
        "Unnamed Product"
    );
}

function getProductCategory(product) {
    return (
        product.category ||
        product.productCategory ||
        product.categoryName ||
        product.type ||
        "Uncategorized"
    );
}

function getProductPrice(product) {
    return Number(
        product.basePrice ??
        product.price ??
        product.productPrice ??
        product.regularPrice ??
        product.sellingPrice ??
        0
    );
}

function getProductSizes(product) {
    if (!Array.isArray(product.sizes)) {
        return [];
    }

    return product.sizes.map((size) => ({
        name: size.name,
        price:
            getProductPrice(product) +
            Number(size.additionalPrice ?? size.additional ?? 0)
    }));
}

function getSelectedSizePrice() {
    if (!selectedProduct) return 0;

    const sizes = getProductSizes(selectedProduct);

    const selectedSize = sizes.find(
        (size) => size.name === productSize.value
    );

    return selectedSize ? selectedSize.price : 0;
}

function updateProductSubtotal() {
    const price = getSelectedSizePrice();
    const quantity = Math.max(
        1,
        Number(productQuantity.value) || 1
    );

    unitPrice.textContent = peso(price);
    productSubtotal.textContent = peso(price * quantity);
}

function clearSelectedProduct() {
    selectedProduct = null;

    addItemButton.disabled = true;
    productName.value = "";
    productBasePrice.value = "";
    productSize.innerHTML = "";
    productQuantity.value = 1;
    unitPrice.value = "";
    productSubtotal.value = "";

    if (productSearch) {
        productSearch.value = "";
    }

    if (productSearchResults) {
        productSearchResults.innerHTML = "";
    }

    showMessage(formMessage, "");
}

function populateCategories() {
    if (!categoryFilter) return;

    const categories = [
        ...new Set(allProducts.map(getProductCategory))
    ].sort();

    categoryFilter.innerHTML =
        '<option value="">All Categories</option>';

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function renderProductSearchResults() {
    if (!productSearchResults) return;

    const searchText = productSearch.value
        .trim()
        .toLowerCase();

    const selectedCategory =
    categoryFilter.value === "all" ? "" : categoryFilter.value;

    const results = allProducts.filter((product) => {
        const matchesName = getProductName(product)
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =
            !selectedCategory ||
            getProductCategory(product) === selectedCategory;

        return matchesName && matchesCategory;
    });

    productSearchResults.innerHTML = "";
    productSearchResults.hidden = false;

    if (results.length === 0) {
        productSearchResults.innerHTML =
            '<p class="no-products">No products found.</p>';
        return;
    }

    results.forEach((product) => {
        const result = document.createElement("button");

        result.type = "button";
        result.className = "product-result";

        const name = document.createElement("span");
        name.textContent = getProductName(product);

        const price = document.createElement("span");
        price.textContent = peso(getProductPrice(product));

        result.append(name, price);

        result.addEventListener("click", () => {
            selectProduct(product);
        });

        productSearchResults.appendChild(result);
    });
}

function selectProduct(product) {
    selectedProduct = product;

    productName.value = getProductName(product);
    productBasePrice.value =
        getProductPrice(product).toFixed(2);

    const sizes = getProductSizes(product);

    productSize.innerHTML = "";

    sizes.forEach((size) => {
    const option = document.createElement("option");

    option.value = size.name;
    option.textContent = `${size.name} - ${peso(size.price)}`;

    productSize.appendChild(option);
});

productSize.disabled = sizes.length === 0;

    productQuantity.value = 1;

    updateProductSubtotal();

    if (productSearchResults) {
        productSearchResults.innerHTML = "";
    }

    showMessage(formMessage, "");
    addItemButton.disabled = false;
}

function renderCart() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <tr>
                <td colspan="5">No items added yet.</td>
            </tr>
        `;
    } else {
        cart.forEach((item, index) => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent =
                `${item.productName} (${item.size})`;

            const priceCell = document.createElement("td");
            priceCell.textContent = peso(item.price);

            const quantityCell = document.createElement("td");
            quantityCell.textContent = item.quantity;

            const subtotalCell = document.createElement("td");
            subtotalCell.textContent = peso(item.subtotal);

            const actionCell = document.createElement("td");
            const removeButton = document.createElement("button");

            removeButton.type = "button";
            removeButton.className = "cart-remove-button";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", () => {
                cart.splice(index, 1);
                renderCart();
            });

            actionCell.appendChild(removeButton);

            row.append(
                nameCell,
                priceCell,
                quantityCell,
                subtotalCell,
                actionCell
            );

            cartItemsContainer.appendChild(row);
        });
    }

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

const totalAmount = cart.reduce(
    (total, item) => total + item.subtotal,
    0
);
    if (cartCount) {
        cartCount.textContent = totalQuantity;
    }

    if (orderTotal) {
        orderTotal.textContent = peso(totalAmount);
        createOrderButton.disabled = cart.length === 0;
    }
}

function addItemToCart() {
    if (!selectedProduct) {
        showMessage(formMessage, "Please select a product.");
        return;
    }

    const quantity = Number(productQuantity.value);

    if (!Number.isInteger(quantity) || quantity < 1) {
        showMessage(formMessage, "Enter a valid quantity.");
        return;
    }

    const size = productSize.value;
    const price = getSelectedSizePrice();

    const existingItem = cart.find(
        (item) =>
            item.productId === selectedProduct.id &&
            item.size === size
    );

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subtotal =
            existingItem.price * existingItem.quantity;
    } else {
        cart.push({
            productId: selectedProduct.id,
            productName: getProductName(selectedProduct),
            name: getProductName(selectedProduct),
            category: getProductCategory(selectedProduct),
            size,
            price,
            quantity,
            subtotal: price * quantity
        });
    }

    renderCart();
    clearSelectedProduct();

    showMessage(formMessage, "Item added to the order.", "success");
}

async function loadProducts() {
    if (productLoadMessage) {
        productLoadMessage.textContent = "Loading products...";
    }

    try {
        const snapshot = await getDocs(collection(db, "products"));

        allProducts = snapshot.docs
            .map((document) => ({
                id: document.id,
                ...document.data()
            }))
            .filter((product) =>
                String(product.status || "active").toLowerCase() !==
                "inactive"
            );

        populateCategories();
        renderProductSearchResults();

        if (productLoadMessage) {
            productLoadMessage.textContent =
                `${allProducts.length} products available.`;
        }
    } catch (error) {
        console.error("Error loading products:", error);

        if (productLoadMessage) {
            productLoadMessage.textContent =
                "Unable to load products. Please check your connection.";
        }
    }
}

async function createOrder() {
    showMessage(formMessage, "");

    if (!currentUser) {
        showMessage(
            formMessage,
            "You must be logged in as an admin to create an order."
        );
        return;
    }

    if (cart.length === 0) {
        showMessage(formMessage, "Please add at least one item.");
        return;
    }

    const name = customerName.value.trim();

    if (!name) {
        showMessage(formMessage, "Please enter the customer name.");
        customerName.focus();
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.subtotal,
        0
    );

    createOrderButton.disabled = true;
    createOrderButton.textContent = "Creating Order...";

    try {
        await addDoc(collection(db, "orders"), {
            orderType: "walk-in",
            orderSource: "manual",
            source: "manual",
            isWalkIn: true,
            isManual: true,
            customerName: name,
            fulfillment: fulfillment.value,
            items: cart.map((item) => ({ ...item })),
            total,
            totalAmount: total,
            status: "pending",
            createdAt: serverTimestamp(),
            createdBy: currentUser.uid
    
        });

        cart = [];
        renderCart();
        clearSelectedProduct();

        customerName.value = "";
        fulfillment.selectedIndex = 0;

        showMessage(
            formMessage,
            "Walk-in order created successfully!",
            "success"
        );
        window.location.href = "admin-orders.php";
    } catch (error) {
        console.error("Error creating order:", error);

        showMessage(
            formMessage,
            "Failed to create the order. Please try again."
        );
    } finally {
        createOrderButton.disabled = false;
        createOrderButton.textContent = "Create Order";
    }
}

productSearch?.addEventListener("input", renderProductSearchResults);
categoryFilter?.addEventListener("change", renderProductSearchResults);
productSize.addEventListener("change", updateProductSubtotal);
productQuantity.addEventListener("input", updateProductSubtotal);


clearProductButton?.addEventListener("click", clearSelectedProduct);
addItemButton?.addEventListener("click", addItemToCart);
createOrderButton?.addEventListener("click", createOrder);

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
        await loadProducts();
    } else {
        allProducts = [];

        if (productLoadMessage) {
            productLoadMessage.textContent =
                "Please log in to load products.";
        }
    }
});

/* Load admin profile */

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        return;
    }

    try {
        const adminSnapshot = await getDoc(
            doc(db, "admins", user.uid)
        );

        if (!adminSnapshot.exists()) {
            console.error("Admin document not found.");
            return;
        }

        const adminData = adminSnapshot.data();

        const adminGreeting =
            document.getElementById("adminGreeting");

        const adminRole =
            document.getElementById("adminRole");

        if (adminGreeting) {
            adminGreeting.textContent =
                adminData.name || user.email || "Admin";
        }

        if (adminRole) {
            adminRole.textContent =
                adminData.role || "Administrator";
        }
    } catch (error) {
        console.error("Error loading admin profile:", error);
    }
});


renderCart();
