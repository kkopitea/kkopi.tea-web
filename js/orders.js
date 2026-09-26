import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


/* ELEMENTS */

const tableBody =
    document.getElementById("orders-table-body");

const loadingRow =
    document.getElementById("orders-loading-row");

const emptyRow =
    document.getElementById("orders-empty-row");

const monthFilter =
    document.getElementById("month-filter");

const selectedPeriodText =
    document.getElementById("selected-period-text");

const statusFilter =
    document.getElementById("status-filter");

const statusFilterText =
    document.getElementById("status-filter-text");

const statusDropdown =
    document.querySelector(".status-dropdown");

const statusButtons =
    document.querySelectorAll(
        ".status-dropdown-menu button"
    );


/* SUMMARY ELEMENTS */

const totalOrdersElement =
    document.getElementById("total-orders");

const completedOrdersElement =
    document.getElementById("completed-orders");

const preparingOrdersElement =
    document.getElementById("preparing-orders");

const totalSalesElement =
    document.getElementById("total-sales");


/* STATE */

let allOrders = [];

let selectedStatus = "all";


/* INITIAL MONTH */

const today = new Date();

const currentYear =
    today.getFullYear();

const currentMonth =
    String(
        today.getMonth() + 1
    ).padStart(2, "0");

monthFilter.value =
    `${currentYear}-${currentMonth}`;


/* STATUS DROPDOWN */

statusFilter.addEventListener(
    "click",
    function () {

        statusDropdown.classList.toggle(
            "open"
        );

    }
);


statusButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                selectedStatus =
                    button.dataset.status;

                statusFilterText.textContent =
                    button.textContent.trim();

                statusButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

                statusDropdown.classList.remove(
                    "open"
                );

                renderOrders();

            }
        );

    }
);


/* CLOSE STATUS DROPDOWN */

document.addEventListener(
    "click",
    function (event) {

        if (
            !statusDropdown.contains(
                event.target
            )
        ) {

            statusDropdown.classList.remove(
                "open"
            );

        }

    }
);


/* MONTH CHANGE */

monthFilter.addEventListener(
    "change",
    function () {

        renderOrders();

    }
);


/* DATE HELPERS */

function getMonthRange() {

    const value =
        monthFilter.value;

    if (!value) {
        return null;
    }

    const [
        year,
        month
    ] = value
        .split("-")
        .map(Number);

    const startDate =
        new Date(
            year,
            month - 1,
            1,
            0,
            0,
            0,
            0
        );

    const endDate =
        new Date(
            year,
            month,
            0,
            23,
            59,
            59,
            999
        );

    return {
        startDate,
        endDate
    };

}


/* FORMAT PERIOD */

function formatPeriod() {

    const range =
        getMonthRange();

    if (!range) {

        selectedPeriodText.textContent =
            "Select a month";

        return;

    }

    const formatter =
        new Intl.DateTimeFormat(
            undefined,
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

    selectedPeriodText.textContent =
        `${formatter.format(
            range.startDate
        )} - ${formatter.format(
            range.endDate
        )}`;

}


/* FIREBASE DATE */

function getOrderDate(order) {

    const possibleDate =
        order.createdAt ||
        order.orderDate ||
        order.date ||
        order.timestamp;

    if (!possibleDate) {
        return null;
    }

    if (
        possibleDate &&
        typeof possibleDate.toDate === "function"
    ) {

        return possibleDate.toDate();

    }

    if (
        possibleDate &&
        typeof possibleDate.seconds === "number"
    ) {

        return new Date(
            possibleDate.seconds * 1000
        );

    }

    if (
        possibleDate instanceof Date
    ) {

        return possibleDate;

    }

    const parsedDate =
        new Date(possibleDate);

    if (
        !Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return parsedDate;

    }

    return null;

}


/* STATUS */

function normalizeStatus(status) {

    return String(
        status || "pending"
    )
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");

}


/* TOTAL */

function getOrderTotal(order) {

    const possibleTotal =
        order.total ??
        order.totalAmount ??
        order.amount ??
        order.grandTotal ??
        0;

    const total =
        Number(
            String(
                possibleTotal
            ).replace(
                /[^0-9.-]/g,
                ""
            )
        );

    return Number.isFinite(total)
        ? total
        : 0;

}


/* ITEMS */

function getItemCount(order) {

    if (
        Array.isArray(
            order.items
        )
    ) {

        return order.items.reduce(
            function (total, item) {

                const quantity =
                    Number(
                        item.quantity ??
                        item.qty ??
                        1
                    );

                return total +
                    (
                        Number.isFinite(
                            quantity
                        )
                            ? quantity
                            : 1
                    );

            },
            0
        );

    }

    return Number(
        order.itemCount ??
        order.quantity ??
        0
    );

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


/* CUSTOMER EMAIL */

function getCustomerEmail(order) {

    return (
        order.customerEmail ||
        order.email ||
        ""
    );

}


/* ORDER ID */

function getOrderId(order) {

    return (
        order.orderNumber ||
        order.orderId ||
        order.id ||
        "Order"
    );

}


/* LOAD ORDERS */

async function loadOrders() {

    showLoading();

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );

        allOrders = [];

        snapshot.forEach(
            function (documentSnapshot) {

                allOrders.push({
                    id: documentSnapshot.id,
                    ...documentSnapshot.data()
                });

            }
        );

        renderOrders();

    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );

        showEmptyState(
            "Unable to load orders",
            "There was a problem retrieving the order records."
        );

    }

}


/* RENDER ORDERS */

function renderOrders() {

    formatPeriod();

    const range =
        getMonthRange();

    if (!range) {

        showEmptyState(
            "Select a month",
            "Choose a month to view the order records."
        );

        return;

    }


    let filteredOrders =
        allOrders.filter(
            function (order) {

                const orderDate =
                    getOrderDate(order);

                if (!orderDate) {
                    return false;
                }

                return (
                    orderDate >=
                        range.startDate &&
                    orderDate <=
                        range.endDate
                );

            }
        );


    if (
        selectedStatus !== "all"
    ) {

        filteredOrders =
            filteredOrders.filter(
                function (order) {

                    return (
                        normalizeStatus(
                            order.status
                        ) ===
                        selectedStatus
                    );

                }
            );

    }


    updateSummary(
        filteredOrders
    );


    if (
        filteredOrders.length === 0
    ) {

        showEmptyState(
            "No Orders Found",
            "There are no orders for the selected month and status."
        );

        return;

    }


    hideLoading();

    emptyRow.hidden = true;

    tableBody
        .querySelectorAll(
            ".dynamic-order-row"
        )
        .forEach(
            function (row) {

                row.remove();

            }
        );


    filteredOrders.sort(
        function (a, b) {

            const dateA =
                getOrderDate(a) || 0;

            const dateB =
                getOrderDate(b) || 0;

            return dateB - dateA;

        }
    );


    filteredOrders.forEach(
        function (order) {

            tableBody.appendChild(
                createOrderRow(order)
            );

        }
    );

}


/* CREATE ORDER ROW */

function createOrderRow(order) {

    const row =
        document.createElement("tr");

    row.className =
        "dynamic-order-row";


    const orderDate =
        getOrderDate(order);

    const status =
        normalizeStatus(
            order.status
        );

    const total =
        getOrderTotal(order);

    const itemCount =
        getItemCount(order);

    const customerName =
        getCustomerName(order);

    const customerEmail =
        getCustomerEmail(order);

    const orderId =
        getOrderId(order);


    const dateText =
        orderDate
            ? new Intl.DateTimeFormat(
                undefined,
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            ).format(orderDate)
            : "—";


    const statusLabel =
        status.charAt(0).toUpperCase() +
        status.slice(1);


    row.innerHTML = `

        <td>

            <span class="order-id">
                ${escapeHtml(orderId)}
            </span>

        </td>


        <td>

            <span class="customer-name">
                ${escapeHtml(customerName)}
            </span>

            ${
                customerEmail
                    ? `
                        <span class="customer-email">
                            ${escapeHtml(customerEmail)}
                        </span>
                    `
                    : ""
            }

        </td>


        <td>
            ${escapeHtml(dateText)}
        </td>


        <td>
            ${itemCount} item${itemCount === 1 ? "" : "s"}
        </td>


        <td>

            <strong>
                ₱${total.toLocaleString(
                    undefined,
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </strong>

        </td>


        <td>

            <span class="order-status ${escapeHtml(status)}">

                ${escapeHtml(statusLabel)}

            </span>

        </td>


        <td>

            <button
                type="button"
                class="order-action"
                title="View Order"
                data-order-id="${escapeHtml(order.id)}"
            >

                <i class="fa-solid fa-eye"></i>

            </button>

        </td>

    `;


    return row;

}


/* SUMMARY */

function updateSummary(orders) {

    const totalOrders =
        orders.length;


    const completed =
        orders.filter(
            function (order) {

                return (
                    normalizeStatus(
                        order.status
                    ) === "completed"
                );

            }
        ).length;


    const preparing =
        orders.filter(
            function (order) {

                return (
                    normalizeStatus(
                        order.status
                    ) === "preparing"
                );

            }
        ).length;


    const totalSales =
        orders.reduce(
            function (total, order) {

                return total +
                    getOrderTotal(order);

            },
            0
        );


    totalOrdersElement.textContent =
        totalOrders;


    completedOrdersElement.textContent =
        completed;


    preparingOrdersElement.textContent =
        preparing;


    totalSalesElement.textContent =
        `₱${totalSales.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}


/* LOADING */

function showLoading() {

    loadingRow.hidden = false;

    emptyRow.hidden = true;

    tableBody
        .querySelectorAll(
            ".dynamic-order-row"
        )
        .forEach(
            function (row) {

                row.remove();

            }
        );

}


function hideLoading() {

    loadingRow.hidden = true;

}


/* EMPTY */

function showEmptyState(
    title,
    message
) {

    hideLoading();

    emptyRow.hidden = false;

    const titleElement =
        emptyRow.querySelector("h3");

    const messageElement =
        emptyRow.querySelector("p");

    titleElement.textContent =
        title;

    messageElement.textContent =
        message;

}


/* ESCAPE HTML */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* START */

loadOrders();