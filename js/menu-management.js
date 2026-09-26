import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const productTableBody =
    document.getElementById("product-table-body");

const productSearch =
    document.getElementById("product-search");

const categoryFilter =
    document.getElementById("category-filter");

const visibleProductCount =
    document.getElementById("visible-product-count");

const productCount =
    document.getElementById("product-count");

const previousPage =
    document.getElementById("previous-page");

const currentPage =
    document.getElementById("current-page");

const nextPage =
    document.getElementById("next-page");


let products = [];

let filteredProducts = [];

let currentPageNumber = 1;

const productsPerPage = 8;


/* Load products */

async function loadProducts() {

    try {

        showLoading();


        const snapshot =
            await getDocs(
                collection(db, "products")
            );


        products =
            snapshot.docs.map(
                (productDocument) => {

                    return {

                        id:
                            productDocument.id,

                        ...productDocument.data()

                    };

                }
            );


        filteredProducts =
            [...products];


        currentPageNumber = 1;


        renderProducts();


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        showError();

    }

}


/* Render products */

function renderProducts() {

    productTableBody.innerHTML = "";


    if (
        filteredProducts.length === 0
    ) {

        showEmptyState();

        updatePagination();

        return;

    }


    const startIndex =
        (currentPageNumber - 1) *
        productsPerPage;


    const endIndex =
        startIndex +
        productsPerPage;


    const pageProducts =
        filteredProducts.slice(
            startIndex,
            endIndex
        );


    pageProducts.forEach(
        (product) => {

            const row =
                createProductRow(product);


            productTableBody.appendChild(
                row
            );

        }
    );


    visibleProductCount.textContent =
        filteredProducts.length;


    const firstProduct =
        startIndex + 1;


    const lastProduct =
        Math.min(
            endIndex,
            filteredProducts.length
        );


    productCount.textContent =
        `Showing ${firstProduct}-${lastProduct} of ${filteredProducts.length} products`;


    updatePagination();

}


/* Create product row */

function createProductRow(product) {

    const row =
        document.createElement("tr");


    const productName =
        product.name ||
        "Unnamed Product";


    const category =
        product.categoryId ||
        "milktea";


    const price =
        Number(
            product.basePrice || 0
        );


    const status =
        product.isAvailable === false
            ? "inactive"
            : "active";


    const description =
        product.description || "";


    const imageUrl =
        product.imageUrl || "";


    const categoryName =
        getCategoryName(
            category
        );


    const statusName =
        getStatusName(
            status
        );


    const statusClass =
        status === "active"
            ? "status-active"
            : "status-inactive";


    row.innerHTML = `

        <td>

            <div class="product-info">

                <div class="product-image">

                    ${
                        imageUrl
                            ? `
                                <img
                                    src="${escapeAttribute(imageUrl)}"
                                    alt="${escapeAttribute(productName)}"
                                    loading="lazy"
                                >
                              `
                            : `
                                <div class="product-image-placeholder">
                                    <i class="fa-solid fa-mug-hot"></i>
                                </div>
                              `
                    }

                </div>


                <div class="product-details">

                    <strong>
                        ${escapeHtml(productName)}
                    </strong>


                    ${
                        description
                            ? `
                                <span>
                                    ${escapeHtml(description)}
                                </span>
                              `
                            : ""
                    }

                </div>

            </div>

        </td>


        <td>

            <span
                class="category-badge category-${escapeAttribute(category)}"
            >
                ${escapeHtml(categoryName)}
            </span>

        </td>


        <td>

            <span class="product-price">

                ₱${formatPrice(price)}

            </span>

        </td>


        <td>

            <span class="status-badge ${statusClass}">

                <span class="status-dot"></span>

                ${escapeHtml(statusName)}

            </span>

        </td>


        <td>

            <div class="product-actions">

                <a
                    href="edit-product.php?id=${encodeURIComponent(product.id)}"
                    class="product-action-button edit-product-button"
                    title="Edit Product"
                    aria-label="Edit ${escapeAttribute(productName)}"
                >

                    <i class="fa-solid fa-pen"></i>

                </a>


                <button
                    type="button"
                    class="product-action-button delete-product-button"
                    data-product-id="${escapeAttribute(product.id)}"
                    data-product-name="${escapeAttribute(productName)}"
                    title="Delete Product"
                    aria-label="Delete ${escapeAttribute(productName)}"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </td>

    `;


    const deleteButton =
        row.querySelector(
            ".delete-product-button"
        );


    deleteButton.addEventListener(
        "click",
        () => {

            deleteProduct(
                product.id,
                productName
            );

        }
    );


    return row;

}


/* Category name */

function getCategoryName(category) {

    if (
        category === "milktea"
    ) {

        return "Milk Tea";

    }


    if (
        category === "coffee"
    ) {

        return "Coffee";

    }


    return "Unknown";

}


/* Status name */

function getStatusName(status) {

    if (
        status === "active"
    ) {

        return "Available";

    }


    if (
        status === "inactive"
    ) {

        return "Unavailable";

    }


    return "Unknown";

}


/* Format price */

function formatPrice(price) {

    return price.toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* Search */

productSearch.addEventListener(
    "input",
    () => {

        applyFilters();

    }
);


/* Category filter */

categoryFilter.addEventListener(
    "change",
    () => {

        applyFilters();

    }
);


/* Apply filters */

function applyFilters() {

    const searchValue =
        productSearch.value
            .trim()
            .toLowerCase();


    const categoryValue =
        categoryFilter.value;


    filteredProducts =
        products.filter(
            (product) => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();


                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();


                const category =
                    product.categoryId ||
                    "";


                const matchesSearch =
                    name.includes(
                        searchValue
                    ) ||
                    description.includes(
                        searchValue
                    );


                const matchesCategory =
                    categoryValue === "all" ||
                    category === categoryValue;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    currentPageNumber = 1;


    renderProducts();

}


/* Previous page */

previousPage.addEventListener(
    "click",
    () => {

        if (
            currentPageNumber <= 1
        ) {

            return;

        }


        currentPageNumber--;


        renderProducts();

    }
);


/* Next page */

nextPage.addEventListener(
    "click",
    () => {

        const totalPages =
            Math.ceil(
                filteredProducts.length /
                productsPerPage
            );


        if (
            currentPageNumber >=
            totalPages
        ) {

            return;

        }


        currentPageNumber++;


        renderProducts();

    }
);


/* Update pagination */

function updatePagination() {

    const totalPages =
        Math.ceil(
            filteredProducts.length /
            productsPerPage
        );


    previousPage.disabled =
        currentPageNumber <= 1;


    nextPage.disabled =
        currentPageNumber >=
            totalPages ||
        totalPages === 0;


    currentPage.textContent =
        currentPageNumber;

}


/* Loading */

function showLoading() {

    productTableBody.innerHTML = `

        <tr class="table-loading-row">

            <td colspan="5">

                <div class="table-loading">

                    <div class="loading-icon">

                        <i class="fa-solid fa-mug-hot fa-spin"></i>

                    </div>

                    <strong>
                        Loading your menu
                    </strong>

                    <span>
                        Please wait while we load your products.
                    </span>

                </div>

            </td>

        </tr>

    `;

}


/* Error */

function showError() {

    productTableBody.innerHTML = `

        <tr class="table-loading-row">

            <td colspan="5">

                <div class="table-loading">

                    <div class="loading-icon">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                    </div>

                    <strong>
                        Unable to load products
                    </strong>

                    <span>
                        Please refresh the page and try again.
                    </span>

                </div>

            </td>

        </tr>

    `;


    visibleProductCount.textContent =
        "0";


    productCount.textContent =
        "Unable to load products.";

}


/* Empty */

function showEmptyState() {

    productTableBody.innerHTML = `

        <tr class="empty-product-row">

            <td colspan="5">

                <div class="empty-product-state">

                    <div class="empty-product-icon">

                        <i class="fa-solid fa-mug-hot"></i>

                    </div>

                    <strong>
                        No products found
                    </strong>

                    <span>
                        Try changing your search or category filter.
                    </span>

                </div>

            </td>

        </tr>

    `;


    visibleProductCount.textContent =
        "0";


    productCount.textContent =
        "No products found.";

}


/* Delete */

async function deleteProduct(
    productId,
    productName
) {

    const confirmed =
        confirm(
            `Are you sure you want to delete "${productName}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                productId
            )
        );


        products =
            products.filter(
                (product) =>
                    product.id !==
                    productId
            );


        filteredProducts =
            filteredProducts.filter(
                (product) =>
                    product.id !==
                    productId
            );


        const totalPages =
            Math.ceil(
                filteredProducts.length /
                productsPerPage
            );


        if (
            currentPageNumber >
                totalPages &&
            totalPages > 0
        ) {

            currentPageNumber =
                totalPages;

        }


        renderProducts();


    } catch (error) {

        console.error(
            "Error deleting product:",
            error
        );


        alert(
            "Unable to delete the product. Please try again."
        );

    }

}


/* Escape HTML */

function escapeHtml(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* Escape attribute */

function escapeAttribute(value) {

    return escapeHtml(value);

}


/* Start */

loadProducts();