import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const itemTableBody =
    document.getElementById("item-table-body");

const itemSearch =
    document.getElementById("item-search");

const categoryFilter =
    document.getElementById("category-filter");

const visibleItemCount =
    document.getElementById("visible-item-count");

const itemCount =
    document.getElementById("item-count");

const previousPage =
    document.getElementById("previous-page");

const currentPage =
    document.getElementById("current-page");

const nextPage =
    document.getElementById("next-page");


let items = [];

let filteredItems = [];

let currentPageNumber = 1;

const itemsPerPage = 5;


/* Load inventory */

async function loadInventory() {

    try {

        showLoading();


        const snapshot =
            await getDocs(
                collection(db, "inventory")
            );


        items = snapshot.docs.map(
            (itemDocument) => {

                return {
                    id: itemDocument.id,
                    ...itemDocument.data()
                };

            }
        );


        filteredItems = [...items];

        currentPageNumber = 1;

        renderItems();

    } catch (error) {

        console.error(
            "Error loading inventory:",
            error
        );

        showError();

    }

}


/* Render items */

function renderItems() {

    itemTableBody.innerHTML = "";


    if (filteredItems.length === 0) {

        showEmptyState();

        updatePagination();

        return;

    }


    const startIndex =
        (currentPageNumber - 1) *
        itemsPerPage;


    const endIndex =
        startIndex +
        itemsPerPage;


    const pageItems =
        filteredItems.slice(
            startIndex,
            endIndex
        );


    pageItems.forEach(
        (item) => {

            const row =
                createItemRow(item);

            itemTableBody.appendChild(row);

        }
    );


    visibleItemCount.textContent =
        filteredItems.length;


    const firstItem =
        startIndex + 1;


    const lastItem =
        Math.min(
            endIndex,
            filteredItems.length
        );


    itemCount.textContent =
        `Showing ${firstItem}-${lastItem} of ${filteredItems.length} items`;


    updatePagination();

}


/* Create item row */

function createItemRow(item) {

    const row =
        document.createElement("tr");


    const itemName =
        item.name ||
        item.item ||
        "Unnamed Item";


    const category =
        item.category ||
        "other";


    const stock =
        Number(
            item.stock || 0
        );


    const unit =
        item.unit ||
        "";


    const imageUrl =
        item.imageUrl ||
        "";


const stockStatus = getStockStatus(
    stock,
    category,
    unit
);


    const statusClass =
        stockStatus.className;


    row.innerHTML = `

        <td>

            <div class="item-info">

                <div class="item-image">

                    ${
                        imageUrl
                            ? `
                                <img
                                    src="${escapeAttribute(imageUrl)}"
                                    alt="${escapeAttribute(itemName)}"
                                    loading="lazy"
                                >
                              `
                            : `
                                <div class="item-image-placeholder">

                                    <i class="fa-solid fa-box"></i>

                                </div>
                              `
                    }

                </div>


                <div class="item-details">

                    <strong>
                        ${escapeHtml(itemName)}
                    </strong>

                </div>

            </div>

        </td>


        <td>

            <span class="item-category">

                ${escapeHtml(
                    getCategoryName(category)
                )}

            </span>

        </td>


        <td>

            <span class="item-stock">

                ${formatStock(stock)}

            </span>

        </td>


        <td>

            <span class="item-unit">

                ${escapeHtml(unit)}

            </span>

        </td>


        <td>

            <span
                class="item-status ${statusClass}"
            >

                ${escapeHtml(
                    stockStatus.label
                )}

            </span>

        </td>


        <td>

            <div class="item-actions">

                <a
                    href="edit-item.php?id=${encodeURIComponent(item.id)}"
                    class="item-action-button edit-item-button"
                    title="Edit Item"
                    aria-label="Edit ${escapeAttribute(itemName)}"
                >

                    <i class="fa-solid fa-pen"></i>

                </a>


                <button
                    type="button"
                    class="item-action-button delete-item-button"
                    data-item-id="${escapeAttribute(item.id)}"
                    data-item-name="${escapeAttribute(itemName)}"
                    title="Delete Item"
                    aria-label="Delete ${escapeAttribute(itemName)}"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </td>

    `;


    const deleteButton =
        row.querySelector(
            ".delete-item-button"
        );


    deleteButton.addEventListener(
        "click",
        () => {

            deleteItem(
                item.id,
                itemName
            );

        }
    );


    return row;

}


/* Category name */

function getCategoryName(category) {

    const categoryNames = {

        tea: "Tea",
        syrup: "Syrup",
        milk: "Milk",
        toppings: "Toppings",
        powder: "Powder",
        packaging: "Packaging Supplies",
        snacks: "Snacks",
        other: "Other"

    };

    return (
        categoryNames[category] ||
        category
    );

}



/* Stock status by inventory category */

function getStockStatus(stock, category, unit) {
    const currentStock = Number(stock) || 0;
    const normalizedCategory = String(category || "")
        .toLowerCase()
        .trim();

    const normalizedUnit = String(unit || "")
        .toLowerCase()
        .trim();

    // Out of stock always takes priority.
    if (currentStock <= 0) {
        return {
            label: "Out of Stock",
            className: "status-out"
        };
    }

    let threshold;
    let comparableStock;

    switch (normalizedCategory) {
        case "tea":
        case "toppings":
        case "powder":
            threshold = 3000;

            if (["kg", "kilogram", "kilograms"].includes(normalizedUnit)) {
                comparableStock = currentStock * 1000;
            } else if (["g", "gram", "grams"].includes(normalizedUnit)) {
                comparableStock = currentStock;
            } else {
                comparableStock = null;
            }
            break;

        case "syrup":
        case "milk":
            threshold = 3000;

            if (["l", "liter", "liters", "litre", "litres"].includes(normalizedUnit)) {
                comparableStock = currentStock * 1000;
            } else if (["ml", "milliliter", "milliliters", "millilitre", "millilitres"].includes(normalizedUnit)) {
                comparableStock = currentStock;
            } else {
                comparableStock = null;
            }
            break;

        case "packaging":
            threshold = 20;

            if (["pcs", "pc", "piece", "pieces"].includes(normalizedUnit)) {
                comparableStock = currentStock;
            } else {
                comparableStock = null;
            }
            break;

        case "snacks":
            threshold = 10;

            if (["kg", "kilogram", "kilograms"].includes(normalizedUnit)) {
                comparableStock = currentStock * 1000;
                threshold = 1000; // 1 kg remaining
            } else if (["g", "gram", "grams"].includes(normalizedUnit)) {
                comparableStock = currentStock;
                threshold = 1000; // 1000 grams remaining
            } else if (["pcs", "pc", "piece", "pieces"].includes(normalizedUnit)) {
                comparableStock = currentStock;
                threshold = 10; // 10 pieces remaining
            } else {
                comparableStock = null;
            }

            break;

        default:
            // Keep the original threshold for other categories.
            threshold = 10;
            comparableStock = currentStock;
    }

    // If the item's unit doesn't match the expected measurement,
    // don't apply an incorrect category threshold.
    if (comparableStock === null) {
        return {
            label: "In Stock",
            className: "status-in"
        };
    }

    if (comparableStock <= threshold) {
        return {
            label: "Low Stock",
            className: "status-low"
        };
    }

    return {
        label: "In Stock",
        className: "status-in"
    };
}



/* Format stock */

function formatStock(stock) {

    return stock.toLocaleString(
        "en-PH"
    );

}


/* Search */

itemSearch.addEventListener(
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
        itemSearch.value
            .trim()
            .toLowerCase();


    const categoryValue =
        categoryFilter.value;


    filteredItems =
        items.filter(
            (item) => {

                const name =
                    String(
                        item.name ||
                        item.item ||
                        ""
                    ).toLowerCase();


                const category =
                    String(
                        item.category ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    name.includes(
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

    renderItems();

}


/* Previous page */

previousPage.addEventListener(
    "click",
    () => {

        if (currentPageNumber <= 1) {

            return;

        }


        currentPageNumber--;

        renderItems();

    }
);


/* Next page */

nextPage.addEventListener(
    "click",
    () => {

        const totalPages =
            Math.ceil(
                filteredItems.length /
                itemsPerPage
            );


        if (
            currentPageNumber >= totalPages
        ) {

            return;

        }


        currentPageNumber++;

        renderItems();

    }
);


/* Update pagination */

function updatePagination() {

    const totalPages =
        Math.ceil(
            filteredItems.length /
            itemsPerPage
        );


    previousPage.disabled =
        currentPageNumber <= 1;


    nextPage.disabled =
        currentPageNumber >= totalPages ||
        totalPages === 0;


    currentPage.textContent =
        currentPageNumber;

}


/* Loading */

function showLoading() {

    itemTableBody.innerHTML = `

        <tr class="table-loading-row">

            <td colspan="6">

                <div class="table-loading">

                    <div class="loading-icon">

                        <i class="fa-solid fa-boxes-stacked fa-spin"></i>

                    </div>

                    <strong>
                        Loading your inventory
                    </strong>

                    <span>
                        Please wait while we load your items.
                    </span>

                </div>

            </td>

        </tr>

    `;


    visibleItemCount.textContent =
        "0";


    itemCount.textContent =
        "Loading inventory...";

}


/* Error */

function showError() {

    itemTableBody.innerHTML = `

        <tr class="table-loading-row">

            <td colspan="6">

                <div class="table-loading">

                    <div class="loading-icon">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                    </div>

                    <strong>
                        Unable to load inventory
                    </strong>

                    <span>
                        Please refresh the page and try again.
                    </span>

                </div>

            </td>

        </tr>

    `;


    visibleItemCount.textContent =
        "0";


    itemCount.textContent =
        "Unable to load inventory.";

}


/* Empty state */

function showEmptyState() {
    itemTableBody.innerHTML = `
        <tr class="empty-item-row">
            <td colspan="6">
                <div class="empty-item-state">
                    <div class="empty-item-icon">
                        <i class="fa-solid fa-boxes-stacked"></i>
                    </div>
                    <strong>No inventory items found</strong>
                    <span>Try changing your search or category filter.</span>
                </div>
            </td>
        </tr>
    `;

    visibleItemCount.textContent = "0";
    itemCount.textContent = "No inventory items found.";
}


/* Delete */

async function deleteItem(
    itemId,
    itemName
) {

    const confirmed =
        confirm(
            `Are you sure you want to delete "${itemName}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "inventory",
                itemId
            )
        );


        items =
            items.filter(
                (item) =>
                    item.id !== itemId
            );


        filteredItems =
            filteredItems.filter(
                (item) =>
                    item.id !== itemId
            );


        const totalPages =
            Math.ceil(
                filteredItems.length /
                itemsPerPage
            );


        if (
            currentPageNumber > totalPages &&
            totalPages > 0
        ) {

            currentPageNumber =
                totalPages;

        }


        renderItems();

    } catch (error) {

        console.error(
            "Error deleting inventory item:",
            error
        );


        alert(
            "Unable to delete the item. Please try again."
        );

    }

}


/* Escape HTML */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* Escape attribute */

function escapeAttribute(value) {

    return escapeHtml(value);

}


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

/* Start */

loadInventory();