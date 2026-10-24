
import { auth, db } from "./firebase-config.js";

import {
    collection,
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
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

/* SUMMARY ELEMENTS */

const totalOrdersElement = document.getElementById("total-orders");
const completedOrdersElement = document.getElementById("completed-orders");
const preparingOrdersElement = document.getElementById("preparing-orders");
const totalSalesElement = document.getElementById("total-sales");

/* STATE */

let allOrders = [];
let selectedStatus = "all";
let selectedOrderType = "all";

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

    const productsHtml = Array.isArray(order.items) && order.items.length
        ? (() => {
            const groupedProducts = new Map();

            order.items.forEach(item => {
                const name =
                    item.name ||
                    item.productName ||
                    item.title ||
                    "Unnamed Product";

                const key = name.trim().toLowerCase();
                const quantity = Number(item.quantity ?? item.qty ?? 1) || 1;

                if (groupedProducts.has(key)) {
                    groupedProducts.get(key).quantity += quantity;
                } else {
                    groupedProducts.set(key, { name, quantity });
                }
            });

            return Array.from(groupedProducts.values()).map(item => `
                <div class="order-product">
                    <span class="order-product-name">${escapeHtml(item.name)}</span>
                    <span class="order-product-quantity">× ${item.quantity}</span>
                </div>
            `).join("");
        })()
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
                    <span>Edit</span>
                </button>

                <button type="button" class="order-action delete-order" title="Delete order">
                    <i class="fa-solid fa-trash"></i>
                    <span>Delete</span>
                </button>
            </div>
        </td>
    `;

    /* EDIT STATUS IN THE SAME ROW */

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
            // The Firestore listener refreshes the table.
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Unable to delete this order. Please try again.");
            deleteButton.disabled = false;
        }
    });

    return row;
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
            await updateDoc(doc(db, "orders", order.id), {
                status: newStatus,
                updatedAt: new Date()
            });

            // The Firestore listener refreshes the row.
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Unable to update the order status. Please try again.");
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
