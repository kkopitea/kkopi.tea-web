
import { auth, db } from "./firebase-config.js";

import {
    collection,
    onSnapshot,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

/* ELEMENTS */

const tableBody = document.getElementById("orders-table-body");
const loadingRow = document.getElementById("orders-loading-row");
const emptyRow = document.getElementById("orders-empty-row");

const monthFilter = document.getElementById("month-filter");
const selectedPeriodText = document.getElementById("selected-period-text");

const statusFilter = document.getElementById("status-filter");
const statusFilterText = document.getElementById("status-filter-text");
const statusDropdown = document.querySelector(".status-dropdown");
const statusButtons = document.querySelectorAll(".status-dropdown-menu button");

const orderTypeFilter = document.getElementById("order-type-filter");

/* PRODUCT DETAILS POPUP ELEMENTS */

const productDetailsModal = document.getElementById("product-details-modal");
const productDetailsContent = document.getElementById("product-details-content");
const productDetailsClose = document.getElementById("product-details-close");

/* SUMMARY ELEMENTS */

const totalOrdersElement = document.getElementById("total-orders");
const completedOrdersElement = document.getElementById("completed-orders");
const preparingOrdersElement = document.getElementById("preparing-orders");
const totalSalesElement = document.getElementById("total-sales");

/* STATE */

let allOrders = [];
let selectedStatus = "all";
let selectedOrderType = "all";

/* FIXED ADD-ON MEASUREMENTS */

const FIXED_ADDONS = {
    "espressoshot": {
        name: "Espresso Shot",
        quantity: 10,
        unit: "mL"
    },
    "pearl": {
        name: "Pearl",
        quantity: 40,
        unit: "g"
    },
    "crystal": {
        name: "Crystal",
        quantity: 40,
        unit: "g"
    },
    "creampuff": {
        name: "Creampuff",
        quantity: 15,
        unit: "g"
    }
};

/* NORMALIZE ADD-ON NAMES */

function normalizeAddonName(name) {
    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

/* CONVERT ADD-ON MEASUREMENT TO INVENTORY UNIT */

function convertAddonUnit(quantity, fromUnit, toUnit) {
    const unitFactors = {
        ml: 1,
        l: 1000,
        g: 1,
        kg: 1000
    };

    const from = String(fromUnit || "")
        .trim()
        .toLowerCase();

    const to = String(toUnit || "")
        .trim()
        .toLowerCase();

    if (!unitFactors[from] || !unitFactors[to]) {
        throw new Error(
            `Unsupported add-on unit conversion: "${fromUnit}" to "${toUnit}".`
        );
    }

    const fromIsVolume = ["ml", "l"].includes(from);
    const toIsVolume = ["ml", "l"].includes(to);

    if (fromIsVolume !== toIsVolume) {
        throw new Error(
            `Incompatible units for add-on deduction: "${fromUnit}" and "${toUnit}".`
        );
    }

    return Number(
        ((quantity * unitFactors[from]) / unitFactors[to]).toFixed(6)
    );
}

/* INITIAL MONTH */

const today = new Date();

monthFilter.value =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

/* STATUS DROPDOWN */

statusFilter.addEventListener("click", () => {
    statusDropdown.classList.toggle("open");
});

statusButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedStatus = button.dataset.status;

        statusFilterText.textContent = button.textContent.trim();

        statusButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");

        statusDropdown.classList.remove("open");
        renderOrders();
    });
});

document.addEventListener("click", event => {
    if (!statusDropdown.contains(event.target)) {
        statusDropdown.classList.remove("open");
    }
});

/* FILTER EVENTS */

monthFilter.addEventListener("change", renderOrders);

if (orderTypeFilter) {
    orderTypeFilter.addEventListener("change", () => {
        selectedOrderType = orderTypeFilter.value;
        renderOrders();
    });
}

/* DATE HELPERS */

function getMonthRange() {
    if (!monthFilter.value) return null;

    const [year, month] = monthFilter.value.split("-").map(Number);

    return {
        startDate: new Date(year, month - 1, 1, 0, 0, 0, 0),
        endDate: new Date(year, month, 0, 23, 59, 59, 999)
    };
}

function formatPeriod() {
    const range = getMonthRange();

    if (!range) {
        selectedPeriodText.textContent = "Select a month";
        return;
    }

    const formatter = new Intl.DateTimeFormat(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    selectedPeriodText.textContent =
        `${formatter.format(range.startDate)} - ${formatter.format(range.endDate)}`;
}

function getOrderDate(order) {
    const value =
        order.createdAt ||
        order.orderDate ||
        order.date ||
        order.timestamp;

    if (!value) return null;

    if (typeof value.toDate === "function") {
        return value.toDate();
    }

    if (typeof value.seconds === "number") {
        return new Date(value.seconds * 1000);
    }

    const parsedDate = value instanceof Date ? value : new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

/* ORDER STATUS */

function normalizeStatus(status) {
    return String(status || "pending")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");
}

function formatStatus(status) {
    const normalized = normalizeStatus(status);

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/* ORDER TYPE */

function getOrderType(order) {
    const type = String(
        order.orderType ||
        order.orderSource ||
        order.source ||
        order.orderMethod ||
        ""
    ).trim().toLowerCase().replace(/[\s_]+/g, "-");

    if (
        order.isWalkIn === true ||
        order.isManual === true ||
        ["walk-in", "walkin", "manual", "in-store"].includes(type)
    ) {
        return "walk-in";
    }

    if (
        order.isWalkIn === false ||
        ["online", "website", "web", "customer"].includes(type)
    ) {
        return "online";
    }

    return "online";
}

/* ORDER TOTAL */

function getOrderTotal(order) {
    const value =
        order.total ??
        order.totalAmount ??
        order.amount ??
        order.grandTotal ??
        0;

    const total = Number(String(value).replace(/[^0-9.-]/g, ""));

    return Number.isFinite(total) ? total : 0;
}

/* ITEM COUNT */

function getItemCount(order) {
    if (Array.isArray(order.items)) {
        return order.items.reduce((total, item) => {
            const quantity = Number(item.quantity ?? item.qty ?? 1);
            return total + (Number.isFinite(quantity) ? quantity : 1);
        }, 0);
    }

    return Number(order.itemCount ?? order.quantity ?? 0);
}

/* CUSTOMER */

function getCustomerName(order) {
    return (
        order.customerName ||
        order.customer ||
        order.name ||
        order.userName ||
        "Customer"
    );
}

function getCustomerEmail(order) {
    return order.customerEmail || order.email || "";
}

/* LOAD ORDERS */

function loadOrders() {
    showLoading();

    return onSnapshot(
        collection(db, "orders"),
        snapshot => {
            allOrders = snapshot.docs.map(orderDoc => ({
                id: orderDoc.id,
                ...orderDoc.data()
            }));

            renderOrders();
        },
        error => {
            console.error("Error loading orders:", error);

            updateSummary([]);

            showEmptyState(
                "Unable to load orders",
                "There was a problem retrieving the order records."
            );
        }
    );
}

/* FILTER ORDERS */

function getFilteredOrders() {
    const range = getMonthRange();

    if (!range) return [];

    return allOrders.filter(order => {
        const orderDate = getOrderDate(order);

        if (!orderDate) return false;

        const matchesMonth =
            orderDate >= range.startDate &&
            orderDate <= range.endDate;

        const matchesStatus =
            selectedStatus === "all" ||
            normalizeStatus(order.status) === selectedStatus;

        const matchesType =
            selectedOrderType === "all" ||
            getOrderType(order) === selectedOrderType;

        return matchesMonth && matchesStatus && matchesType;
    });
}

/* RENDER ORDERS */

function renderOrders() {
    formatPeriod();

    tableBody.querySelectorAll(".dynamic-order-row").forEach(row => row.remove());

    if (!monthFilter.value) {
        updateSummary([]);

        showEmptyState(
            "Select a month",
            "Choose a month to view order records."
        );

        return;
    }

    const filteredOrders = getFilteredOrders();

    updateSummary(filteredOrders);

    filteredOrders.sort((a, b) => {
        return (getOrderDate(b)?.getTime() || 0) -
            (getOrderDate(a)?.getTime() || 0);
    });

    hideLoading();

    if (filteredOrders.length === 0) {
        showEmptyState(
            "No Orders Found",
            "There are no orders for the selected month, order type, and status."
        );

        return;
    }

    emptyRow.hidden = true;

    filteredOrders.forEach(order => {
        tableBody.appendChild(createOrderRow(order));
    });
}

/* CREATE ORDER ROW */

function createOrderRow(order) {
    const row = document.createElement("tr");
    row.className = "dynamic-order-row";
    row.dataset.orderId = order.id;

    const orderDate = getOrderDate(order);
    const status = normalizeStatus(order.status);
    const orderType = getOrderType(order);
    const total = getOrderTotal(order);
    const itemCount = getItemCount(order);
    const customerName = getCustomerName(order);
    const customerEmail = getCustomerEmail(order);

    const dateText = orderDate
        ? new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(orderDate)
        : "—";

    /* INDIVIDUAL ORDER PRODUCTS */

    const productsHtml = Array.isArray(order.items) && order.items.length
        ? order.items.map((item, index) => {
            const name =
                item.name ||
                item.productName ||
                item.title ||
                "Unnamed Product";

            const quantity = Number(item.quantity ?? item.qty ?? 1) || 1;

            return `
                <div class="order-product">
                    <button
                        type="button"
                        class="order-product-name product-details-trigger"
                        data-item-index="${index}"
                        title="View product details"
                    >
                        ${escapeHtml(name)}
                    </button>

                    <span class="order-product-quantity">× ${quantity}</span>
                </div>
            `;
        }).join("")
        : `<span class="no-order-products">No product details</span>`;

    row.innerHTML = `
        <td>
            <span class="order-type-badge ${orderType}">
                ${orderType === "walk-in" ? "Walk-in" : "Online"}
            </span>
        </td>

        <td>
            <span class="customer-name">${escapeHtml(customerName)}</span>
            ${customerEmail ? `
                <span class="customer-email">${escapeHtml(customerEmail)}</span>
            ` : ""}
            <span class="customer-email">
                ${escapeHtml(order.fulfillment || "Pickup")}
            </span>
        </td>

        <td>${escapeHtml(dateText)}</td>

        <td>${itemCount} item${itemCount === 1 ? "" : "s"}</td>

        <td>
            <strong>
                ₱${total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}
            </strong>
        </td>

        <td class="status-cell">
            <span class="order-status ${escapeHtml(status)}">
                ${escapeHtml(formatStatus(status))}
            </span>
        </td>

        <td>
            <div class="order-products">${productsHtml}</div>
        </td>

        <td>
            <div class="order-actions">
                <button type="button" class="order-action edit-order" title="Edit status">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button type="button" class="order-action delete-order" title="Delete order">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    /* PRODUCT DETAILS CLICK EVENTS */

    row.querySelectorAll(".product-details-trigger").forEach(button => {
        button.addEventListener("click", () => {
            const itemIndex = Number(button.dataset.itemIndex);
            const item = order.items[itemIndex];

            if (item) {
                showProductDetails(item);
            }
        });
    });

    /* EDIT STATUS */

    row.querySelector(".edit-order").addEventListener("click", () => {
        editOrderStatus(row, order);
    });

    /* DELETE ORDER */

    row.querySelector(".delete-order").addEventListener("click", async () => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this order?"
        );

        if (!confirmed) return;

        const deleteButton = row.querySelector(".delete-order");
        deleteButton.disabled = true;

        try {
            await deleteDoc(doc(db, "orders", order.id));
        } catch (error) {
            console.error("Error deleting order:", error);

            alert("Unable to delete this order. Please try again.");

            deleteButton.disabled = false;
        }
    });

    return row;
}

/* PRODUCT DETAILS POPUP */

/* GET ADD-ONS FROM ORDER ITEM */

function getItemAddons(item) {
    const addons =
        item.addons ??
        item.addOns ??
        item.selectedAddons ??
        item.selectedAddOns ??
        item.extras ??
        item.add_ons ??
        [];

    if (Array.isArray(addons)) {
        return addons;
    }

    if (addons && typeof addons === "object") {
        return Object.entries(addons).map(([name, value]) => {
            if (value && typeof value === "object") {
                return {
                    ...value,
                    name: value.name || value.addonName || name
                };
            }

            return {
                name,
                price: value
            };
        });
    }

    return [];
}

/* FORMAT ADD-ON PRICE */

function getAddonPrice(addon) {
    if (typeof addon === "number" || typeof addon === "string") {
        const price = Number(addon);

        return Number.isFinite(price) ? price : null;
    }

    const value =
        addon.additionalPrice ??
        addon.additional_price ??
        addon.addonPrice ??
        addon.addOnPrice ??
        addon.price ??
        addon.amount;

    if (value === undefined || value === null || value === "") {
        return null;
    }

    const price = Number(String(value).replace(/[^0-9.-]/g, ""));

    return Number.isFinite(price) ? price : null;
}

/* SHOW PRODUCT DETAILS */

function showProductDetails(item) {
    if (!productDetailsModal || !productDetailsContent) {
        console.error(
            "Product details popup elements were not found. Check the popup HTML in admin-orders.php."
        );
        return;
    }

    const productName =
        item.name ||
        item.productName ||
        item.title ||
        "Unnamed Product";

    const quantity = Number(item.quantity ?? item.qty ?? 1) || 1;

    const size =
        item.size ||
        item.selectedSize ||
        item.productSize ||
        "";

    const addons = getItemAddons(item);

    const addonsHtml = addons.length
        ? addons.map(addon => {
            const addonName = typeof addon === "string"
                ? addon
                : addon.name ||
                  addon.addonName ||
                  addon.addOnName ||
                  addon.title ||
                  "Unnamed Add-on";

            const addonPrice = getAddonPrice(addon);

            return `
                <div class="product-detail-row addon-detail-row">
                    <span>${escapeHtml(addonName)}</span>

                    <strong>
                        ${addonPrice !== null
                            ? `+ ₱${addonPrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`
                            : ""}
                    </strong>
                </div>
            `;
        }).join("")
        : `
            <p class="no-addons">
                No add-ons selected
            </p>
        `;

    productDetailsContent.innerHTML = `
        <div class="product-detail-section">
            <h3>${escapeHtml(productName)}</h3>

            <div class="product-detail-row">
                <span>Quantity</span>
                <strong>${quantity}</strong>
            </div>

            <div class="product-detail-row">
                <span>Size</span>
                <strong>${escapeHtml(size || "Not specified")}</strong>
            </div>
        </div>

        <div class="product-detail-section">
            <h4>Add-ons</h4>

            <div class="product-addons-list">
                ${addonsHtml}
            </div>
        </div>
    `;

    productDetailsModal.hidden = false;
    document.body.style.overflow = "hidden";
}

/* CLOSE PRODUCT DETAILS POPUP */

function closeProductDetails() {
    if (!productDetailsModal) return;

    productDetailsModal.hidden = true;
    document.body.style.overflow = "";
}

/* PRODUCT DETAILS POPUP EVENTS */

if (productDetailsClose) {
    productDetailsClose.addEventListener("click", closeProductDetails);
}

if (productDetailsModal) {
    productDetailsModal.addEventListener("click", event => {
        if (event.target === productDetailsModal) {
            closeProductDetails();
        }
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && productDetailsModal && !productDetailsModal.hidden) {
        closeProductDetails();
    }
});

/* NORMALIZE ORDER SIZE */

function normalizeOrderSize(size) {
    const normalized = String(size || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/ounces?/g, "oz");

    if (normalized.includes("16oz")) return "16oz";
    if (normalized.includes("22oz")) return "22oz";

    return normalized;
}

/* GET RECIPE QUANTITY BASED ON ORDER SIZE */

function getRecipeQuantity(measurement, selectedSize, ingredientId) {
    const measurementSize = String(measurement.size || "both")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");

    const normalizedSize = normalizeOrderSize(selectedSize);

    if (!["16oz", "22oz"].includes(normalizedSize)) {
        throw new Error(
            `Invalid or missing order size for "${measurement.itemName || ingredientId}".`
        );
    }

    /* SAME QUANTITY FOR BOTH SIZES */

    if (measurementSize === "both") {
        const quantity = Number(measurement.quantity);

        if (
            measurement.quantity === null ||
            measurement.quantity === undefined ||
            measurement.quantity === "" ||
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {
            throw new Error(
                `Missing or invalid shared recipe quantity for "${measurement.itemName || ingredientId}".`
            );
        }

        return quantity;
    }

    /* SEPARATE QUANTITIES FOR 16OZ AND 22OZ */

    if (measurementSize === "separate") {
        const quantityKey = normalizedSize === "16oz"
            ? "quantity16oz"
            : "quantity22oz";

        const recipeQuantityKey = normalizedSize === "16oz"
            ? "recipeQuantity16oz"
            : "recipeQuantity22oz";

        const savedQuantity = measurement[quantityKey];
        const savedRecipeQuantity = measurement[recipeQuantityKey];

        if (
            (savedQuantity === null ||
                savedQuantity === undefined ||
                savedQuantity === "") &&
            (savedRecipeQuantity === null ||
                savedRecipeQuantity === undefined ||
                savedRecipeQuantity === "")
        ) {
            return null;
        }

        const quantityValue =
            savedQuantity !== null &&
            savedQuantity !== undefined &&
            savedQuantity !== ""
                ? savedQuantity
                : savedRecipeQuantity;

        const quantity = Number(quantityValue);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error(
                `Invalid ${normalizedSize} recipe quantity for "${measurement.itemName || ingredientId}".`
            );
        }

        return quantity;
    }

    /* SUPPORT OLDER RECIPES SAVED FOR ONLY ONE SIZE */

    if (measurementSize === "16oz" || measurementSize === "22oz") {
        if (measurementSize !== normalizedSize) {
            return null;
        }

        const quantity = Number(measurement.quantity);

        if (
            measurement.quantity === null ||
            measurement.quantity === undefined ||
            measurement.quantity === "" ||
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {
            throw new Error(
                `Invalid recipe quantity for "${measurement.itemName || ingredientId}".`
            );
        }

        return quantity;
    }

    throw new Error(
        `Invalid recipe size setting "${measurementSize}" for "${measurement.itemName || ingredientId}".`
    );
}

/* ADD REQUIRED QUANTITY TO MAP */

function addRequiredInventoryItem(
    requiredIngredients,
    ingredientId,
    quantity,
    name,
    unit
) {
    if (requiredIngredients.has(ingredientId)) {
        const existing = requiredIngredients.get(ingredientId);

        if (
            String(existing.unit).trim().toLowerCase() !==
            String(unit).trim().toLowerCase()
        ) {
            throw new Error(
                `Conflicting inventory units for "${name}".`
            );
        }

        existing.quantity += quantity;

    } else {
        requiredIngredients.set(ingredientId, {
            quantity,
            name,
            unit
        });
    }
}

/* DEDUCT INVENTORY WHEN ORDER IS COMPLETED */

async function completeOrderAndDeductInventory(orderId) {
    const orderRef = doc(db, "orders", orderId);

    /*
     * READ INVENTORY COLLECTION OUTSIDE THE TRANSACTION.
     * Do not use transaction.get() with a CollectionReference.
     * Individual matching inventory documents are read inside
     * the transaction below.
     */

    const inventoryCollectionSnapshot = await getDocs(
        collection(db, "inventory")
    );

    const inventoryDocuments = inventoryCollectionSnapshot.docs;

    await runTransaction(db, async transaction => {

        /* READ LATEST ORDER */

        const orderSnapshot = await transaction.get(orderRef);

        if (!orderSnapshot.exists()) {
            throw new Error("Order not found.");
        }

        const orderData = orderSnapshot.data();

        /* PREVENT DUPLICATE INVENTORY DEDUCTIONS */

        if (orderData.inventoryDeducted === true) {
            transaction.update(orderRef, {
                status: "completed",
                updatedAt: new Date()
            });

            return;
        }

        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
            throw new Error("This order has no items.");
        }

        const requiredIngredients = new Map();
        const selectedAddons = [];

        /* READ RECIPES AND COLLECT ADD-ONS */

        for (const orderedItem of orderData.items) {
            const productId = orderedItem.productId;

            const orderQuantity = Number(
                orderedItem.quantity ?? orderedItem.qty ?? 1
            );

            if (!productId) {
                throw new Error(
                    `Product ID is missing for "${orderedItem.name || "an order item"}".`
                );
            }

            if (!Number.isFinite(orderQuantity) || orderQuantity <= 0) {
                throw new Error(
                    `Invalid quantity for "${orderedItem.name || productId}".`
                );
            }

            /* COLLECT SELECTED ADD-ONS */

            const addons = getItemAddons(orderedItem);

            for (const addon of addons) {
                const addonName = typeof addon === "string"
                    ? addon
                    : addon.name ||
                      addon.addonName ||
                      addon.addOnName ||
                      addon.title ||
                      "";

                const fixedAddon = FIXED_ADDONS[
                    normalizeAddonName(addonName)
                ];

                if (!fixedAddon) {
                    throw new Error(
                        `No fixed inventory measurement found for add-on "${addonName}".`
                    );
                }

                /*
                 * Each selected add-on counts separately.
                 * Do NOT multiply this by the drink's orderQuantity.
                 */

                const addonCount = Number(
                    typeof addon === "object" && addon !== null
                        ? addon.quantity ?? addon.qty ?? 1
                        : 1
                );

                if (!Number.isFinite(addonCount) || addonCount <= 0) {
                    throw new Error(
                        `Invalid selected quantity for "${fixedAddon.name}".`
                    );
                }

                selectedAddons.push({
                    name: fixedAddon.name,
                    quantity: fixedAddon.quantity * addonCount,
                    unit: fixedAddon.unit
                });
            }

            /* GET THE SIZE OF THIS ORDER ITEM */

            const rawSize =
                orderedItem.size ||
                orderedItem.selectedSize ||
                orderedItem.productSize ||
                "";

            const selectedSize = normalizeOrderSize(rawSize);

            if (!["16oz", "22oz"].includes(selectedSize)) {
                throw new Error(
                    `Missing or invalid size for "${orderedItem.name || productId}". Received: "${rawSize || "empty"}".`
                );
            }

            console.log(
                `Processing ${orderedItem.name || productId}: ${selectedSize}`
            );

            /* READ PRODUCT RECIPE */

            const recipeRef = doc(
                db,
                "productMeasurements",
                productId
            );

            const recipeSnapshot = await transaction.get(recipeRef);

            if (!recipeSnapshot.exists()) {
                throw new Error(
                    `No recipe found for "${orderedItem.name || productId}".`
                );
            }

            const recipe = recipeSnapshot.data();
            const measurements = recipe.measurements;

            if (!measurements || Object.keys(measurements).length === 0) {
                throw new Error(
                    `The recipe for "${recipe.productName || productId}" has no ingredients.`
                );
            }

            /* CALCULATE RECIPE INGREDIENTS */

            for (const [measurementKey, measurement] of Object.entries(measurements)) {
                const ingredientId = measurement.itemId || measurementKey;

                const quantityPerServing = getRecipeQuantity(
                    measurement,
                    selectedSize,
                    ingredientId
                );

                if (quantityPerServing === null) {
                    continue;
                }

                const totalRequired = quantityPerServing * orderQuantity;

                addRequiredInventoryItem(
                    requiredIngredients,
                    ingredientId,
                    totalRequired,
                    measurement.itemName || ingredientId,
                    measurement.unit || ""
                );

                console.log(
                    `Recipe required: ${measurement.itemName || ingredientId} - ${totalRequired} ${measurement.unit || ""}`
                );
            }
        }

        /* MATCH ADD-ONS TO INVENTORY DOCUMENTS */

        const addonInventorySnapshots = new Map();

        for (const addon of selectedAddons) {
            const matchingItems = inventoryDocuments.filter(itemDoc => {
                const inventoryData = itemDoc.data();

                return normalizeAddonName(inventoryData.name) ===
                    normalizeAddonName(addon.name);
            });

            if (matchingItems.length === 0) {
                throw new Error(
                    `Inventory item "${addon.name}" was not found. Check its name in the inventory collection.`
                );
            }

            if (matchingItems.length > 1) {
                throw new Error(
                    `Multiple inventory items named "${addon.name}" were found. Please check your inventory.`
                );
            }

            const matchingDocument = matchingItems[0];
            const inventoryRef = doc(
                db,
                "inventory",
                matchingDocument.id
            );

            /*
             * Read the individual inventory document through
             * the transaction instead of reading the collection.
             */

            if (!addonInventorySnapshots.has(matchingDocument.id)) {
                const inventorySnapshot = await transaction.get(inventoryRef);

                addonInventorySnapshots.set(
                    matchingDocument.id,
                    inventorySnapshot
                );
            }

            const inventorySnapshot = addonInventorySnapshots.get(
                matchingDocument.id
            );

            if (!inventorySnapshot.exists()) {
                throw new Error(
                    `Inventory item "${addon.name}" no longer exists.`
                );
            }

            const inventoryData = inventorySnapshot.data();

            const inventoryUnit = String(
                inventoryData.unit || ""
            ).trim();

            if (!inventoryUnit) {
                throw new Error(
                    `No inventory unit configured for "${addon.name}".`
                );
            }

            const convertedQuantity = convertAddonUnit(
                addon.quantity,
                addon.unit,
                inventoryUnit
            );

            addRequiredInventoryItem(
                requiredIngredients,
                matchingDocument.id,
                convertedQuantity,
                inventoryData.name,
                inventoryUnit
            );

            console.log(
                `Add-on required: ${addon.name} - ${convertedQuantity} ${inventoryUnit}`
            );
        }

        if (requiredIngredients.size === 0) {
            throw new Error("No ingredients or add-ons were found to deduct.");
        }

        /* READ AND VALIDATE ALL INVENTORY DOCUMENTS */

        const inventoryUpdates = [];

        for (const [ingredientId, required] of requiredIngredients) {
            let inventorySnapshot;

            if (addonInventorySnapshots.has(ingredientId)) {
                inventorySnapshot = addonInventorySnapshots.get(ingredientId);
            } else {
                const inventoryRef = doc(
                    db,
                    "inventory",
                    ingredientId
                );

                inventorySnapshot = await transaction.get(inventoryRef);
            }

            if (!inventorySnapshot.exists()) {
                throw new Error(
                    `Inventory item "${required.name}" no longer exists.`
                );
            }

            const inventoryData = inventorySnapshot.data();

            const inventoryRef = doc(
                db,
                "inventory",
                ingredientId
            );

            const currentStock = Number(inventoryData.stock);

            const inventoryUnit = String(
                inventoryData.unit || ""
            ).trim().toLowerCase();

            const requiredUnit = String(
                required.unit || ""
            ).trim().toLowerCase();

            if (!Number.isFinite(currentStock) || currentStock < 0) {
                throw new Error(
                    `Invalid stock value for "${required.name}".`
                );
            }

            if (inventoryUnit !== requiredUnit) {
                throw new Error(
                    `Unit mismatch for "${required.name}": inventory uses "${inventoryData.unit || "unspecified"}", but the required unit is "${required.unit || "unspecified"}".`
                );
            }

            if (currentStock < required.quantity) {
                throw new Error(
                    `Not enough stock for "${required.name}". ` +
                    `Available: ${currentStock} ${inventoryData.unit || ""}; ` +
                    `Needed: ${required.quantity} ${inventoryData.unit || ""}.`
                );
            }

            inventoryUpdates.push({
                ref: inventoryRef,
                newStock: Number(
                    (currentStock - required.quantity).toFixed(6)
                )
            });
        }

        /* UPDATE INVENTORY AFTER ALL VALIDATIONS */

        for (const item of inventoryUpdates) {
            transaction.update(item.ref, {
                stock: item.newStock
            });
        }

        /* MARK ORDER AS COMPLETED */

        transaction.update(orderRef, {
            status: "completed",
            inventoryDeducted: true,
            inventoryDeductedAt: new Date(),
            updatedAt: new Date()
        });
    });
}

/* INLINE STATUS EDITOR */

function editOrderStatus(row, order) {
    const statusCell = row.querySelector(".status-cell");

    if (statusCell.querySelector(".status-edit-select")) return;

    const originalStatus = normalizeStatus(order.status);

    statusCell.innerHTML = `
        <div class="status-editor">
            <select class="status-edit-select" aria-label="Change order status">
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>

            <div class="status-edit-actions">
                <button type="button" class="save-status" title="Save status">
                    <i class="fa-solid fa-check"></i>
                </button>

                <button type="button" class="cancel-status" title="Cancel editing">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    `;

    const select = statusCell.querySelector(".status-edit-select");

    select.value = [
        "pending",
        "preparing",
        "completed",
        "cancelled"
    ].includes(originalStatus)
        ? originalStatus
        : "pending";

    statusCell.querySelector(".cancel-status").addEventListener("click", () => {
        statusCell.innerHTML = `
            <span class="order-status ${escapeHtml(originalStatus)}">
                ${escapeHtml(formatStatus(originalStatus))}
            </span>
        `;
    });

    statusCell.querySelector(".save-status").addEventListener("click", async event => {
        const saveButton = event.currentTarget;
        const newStatus = select.value;

        saveButton.disabled = true;

        try {
            if (newStatus === "completed") {
                await completeOrderAndDeductInventory(order.id);
            } else {
                await updateDoc(doc(db, "orders", order.id), {
                    status: newStatus,
                    updatedAt: new Date()
                });
            }

        } catch (error) {
            console.error("Error updating order or inventory:", error);

            alert(
                "Could not update the order.\n\n" +
                error.message
            );

            saveButton.disabled = false;
        }
    });
}

/* SUMMARY CARDS */

function updateSummary(orders) {
    totalOrdersElement.textContent = orders.length;

    completedOrdersElement.textContent = orders.filter(order =>
        normalizeStatus(order.status) === "completed"
    ).length;

    preparingOrdersElement.textContent = orders.filter(order =>
        normalizeStatus(order.status) === "preparing"
    ).length;

    const totalSales = orders.reduce((sum, order) => {
        return sum + getOrderTotal(order);
    }, 0);

    totalSalesElement.textContent = `₱${totalSales.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

/* LOADING AND EMPTY STATES */

function showLoading() {
    loadingRow.hidden = false;
    emptyRow.hidden = true;

    tableBody.querySelectorAll(".dynamic-order-row").forEach(row => row.remove());
}

function hideLoading() {
    loadingRow.hidden = true;
}

function showEmptyState(title, message) {
    hideLoading();

    tableBody.querySelectorAll(".dynamic-order-row").forEach(row => row.remove());

    emptyRow.hidden = false;
    emptyRow.querySelector("h3").textContent = title;
    emptyRow.querySelector("p").textContent = message;
}

/* ESCAPE HTML */

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ADMIN PROFILE */

onAuthStateChanged(auth, async user => {
    if (!user) return;

    try {
        const adminSnapshot = await getDoc(doc(db, "admins", user.uid));

        if (!adminSnapshot.exists()) {
            console.error("Admin document not found.");
            return;
        }

        const adminData = adminSnapshot.data();

        const adminGreeting = document.getElementById("adminGreeting");
        const adminRole = document.getElementById("adminRole");

        if (adminGreeting) {
            adminGreeting.textContent = adminData.name || user.email || "Admin";
        }

        if (adminRole) {
            adminRole.textContent = adminData.role || "Administrator";
        }
    } catch (error) {
        console.error("Error loading admin profile:", error);
    }
});

/* START */

loadOrders();
