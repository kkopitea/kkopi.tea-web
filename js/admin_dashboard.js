import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const dashboardContent = document.getElementById("dashboardContent");
const dashboardMessage = document.getElementById("dashboardMessage");
const adminGreeting = document.getElementById("adminGreeting");
const logoutButton = document.getElementById("logoutButton");
const salesPeriod = document.getElementById("sales-period");
const chartArea = document.getElementById("sales-chart");
const chartBars = document.getElementById("sales-chart-bars");
const chartEmpty = chartArea.querySelector(".chart-empty");
const chartDays = chartArea.querySelector(".chart-days");
const orderChart = document.getElementById("orders-chart");
const orderStatusList = document.getElementById("order-status-list");
const topProductsList = document.getElementById("top-products");
const recentOrdersList = document.getElementById("recent-orders");
const lowStockList = document.getElementById("low-stock-items");

const dashboardErrors = new Set();

let allOrders = null;
let inventoryItems = null;
let unsubscribeDashboard = [];


function redirectToLogin() {
    window.location.replace("admin-login.php");
}


function formatMoney(value) {
    return "₱" + Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


function getOrderDate(order) {
    const value = order.createdAt || order.orderDate || order.date || order.timestamp;

    if (value && typeof value.toDate === "function") {
        return value.toDate();
    }
    if (value && typeof value.seconds === "number") {
        return new Date(value.seconds * 1000);
    }
    if (value instanceof Date) {
        return value;
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}


function getOrderTotal(order) {
    const value = order.total ?? order.totalAmount ?? order.amount ?? order.grandTotal ?? 0;
    const total = Number(String(value).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(total) ? total : 0;
}


function getOrderItems(order) {
    if (Array.isArray(order.items)) {
        return order.items;
    }
    return Array.isArray(order.products) ? order.products : [];
}


function getCustomerKey(order) {
    return String(
        order.customerId || order.userId || order.uid || order.customerEmail ||
        order.email || order.customerName || order.customer || order.name || ""
    ).trim().toLowerCase();
}


function sameDay(firstDate, secondDate) {
    return firstDate.getFullYear() === secondDate.getFullYear() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getDate() === secondDate.getDate();
}


function getDayOrders(date, orders) {
    return orders.filter((order) => {
        const orderDate = getOrderDate(order);
        return orderDate && sameDay(orderDate, date);
    });
}


function updateChange(element, currentValue, previousValue) {
    const change = previousValue === 0
        ? (currentValue === 0 ? 0 : 100)
        : ((currentValue - previousValue) / previousValue) * 100;

    element.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(0)}%`;
    element.classList.toggle("negative", change < 0);
}


function renderStatistics(orders) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todaysOrders = getDayOrders(today, orders);
    const yesterdaysOrders = getDayOrders(yesterday, orders);
    const todaysSales = todaysOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const yesterdaysSales = yesterdaysOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
    const customerCount = new Set(orders.map(getCustomerKey).filter(Boolean)).size;
    const todaysCustomers = new Set(todaysOrders.map(getCustomerKey).filter(Boolean)).size;
    const yesterdaysCustomers = new Set(yesterdaysOrders.map(getCustomerKey).filter(Boolean)).size;

    document.getElementById("total-sales").textContent = formatMoney(todaysSales);
    document.getElementById("total-orders").textContent = String(todaysOrders.length);
    document.getElementById("average-order").textContent = formatMoney(
        todaysOrders.length ? todaysSales / todaysOrders.length : 0
    );
    document.getElementById("total-customers").textContent = String(customerCount);

    updateChange(document.getElementById("sales-change"), todaysSales, yesterdaysSales);
    updateChange(document.getElementById("orders-change"), todaysOrders.length, yesterdaysOrders.length);
    updateChange(
        document.getElementById("average-change"),
        todaysOrders.length ? todaysSales / todaysOrders.length : 0,
        yesterdaysOrders.length ? yesterdaysSales / yesterdaysOrders.length : 0
    );
    updateChange(
        document.getElementById("customers-change"),
        todaysCustomers,
        yesterdaysCustomers
    );
}


function getDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}


function getSalesBuckets(orders) {
    const now = new Date();
    const period = salesPeriod.value;
    let buckets;

    if (period === "year") {
        buckets = Array.from({ length: 12 }, (_, index) => ({
            label: new Intl.DateTimeFormat(undefined, { month: "short" })
                .format(new Date(now.getFullYear(), index, 1)),
            month: index,
            value: 0
        }));
    } else if (period === "month") {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        buckets = Array.from({ length: daysInMonth }, (_, index) => ({
            label: String(index + 1),
            day: index + 1,
            value: 0
        }));
    } else {
        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        buckets = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return {
                label: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
                dateKey: getDateKey(date),
                value: 0
            };
        });
    }

    orders.forEach((order) => {
        const date = getOrderDate(order);
        if (!date) {
            return;
        }

        let bucketIndex = -1;
        if (period === "year" && date.getFullYear() === now.getFullYear()) {
            bucketIndex = date.getMonth();
        } else if (
            period === "month" &&
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth()
        ) {
            bucketIndex = date.getDate() - 1;
        } else if (period === "week") {
            bucketIndex = buckets.findIndex((bucket) => bucket.dateKey === getDateKey(date));
        }

        if (bucketIndex >= 0) {
            buckets[bucketIndex].value += getOrderTotal(order);
        }
    });

    return buckets;
}


function getChartScaleMax(value) {
    if (value <= 0) {
        return 1000;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));
    const normalized = value / magnitude;
    const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return factor * magnitude;
}


function renderSalesChart(orders) {
    const buckets = getSalesBuckets(orders);
    const peak = Math.max(...buckets.map((bucket) => bucket.value));
    const scaleMax = getChartScaleMax(peak);

    chartBars.replaceChildren();
    chartBars.style.setProperty("--chart-columns", buckets.length);
    chartDays.replaceChildren();
    chartDays.style.setProperty("--chart-columns", buckets.length);

    buckets.forEach((bucket, index) => {
        const column = document.createElement("div");
        column.className = "dashboard-chart-column";
        const bar = document.createElement("div");
        bar.className = "dashboard-chart-bar";
        bar.style.height = bucket.value > 0
            ? `${Math.max(2, (bucket.value / scaleMax) * 100)}%`
            : "0";
        bar.title = `${bucket.label}: ${formatMoney(bucket.value)}`;
        bar.setAttribute("aria-label", bar.title);
        column.appendChild(bar);
        chartBars.appendChild(column);

        const shouldShowLabel = salesPeriod.value !== "month" ||
            index === 0 || index === buckets.length - 1 || (index + 1) % 5 === 0;
        if (shouldShowLabel) {
            const label = document.createElement("span");
            label.textContent = bucket.label;
            label.style.gridColumn = String(index + 1);
            chartDays.appendChild(label);
        }
    });

    [1, 2, 3, 4].forEach((tick, index) => {
        document.getElementById(`chart-value-${tick}`).textContent = formatMoney(
            scaleMax * (1 - (index + 1) / 5)
        ).replace(/\.00$/, "");
    });

    chartEmpty.querySelector("strong").textContent = orders.length
        ? "No sales for this period"
        : "No sales data yet";
    chartEmpty.style.display = peak > 0 ? "none" : "flex";
}


function getStatusGroup(order) {
    const status = String(order.status || "pending")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

    if (["completed", "complete", "delivered"].includes(status)) return "completed";
    if (["cancelled", "canceled", "rejected"].includes(status)) return "cancelled";
    if (["preparing", "processing", "inprogress"].includes(status)) return "preparing";
    if (["ready", "readyforpickup"].includes(status)) return "ready";
    if (["confirmed", "accepted"].includes(status)) return "confirmed";
    return "pending";
}


function createEmptyState(iconClass, iconName, title, detail = "") {
    const state = document.createElement("div");
    state.className = "empty-state";
    const icon = document.createElement("div");
    icon.className = `empty-icon ${iconClass}`.trim();
    const iconElement = document.createElement("i");
    iconElement.className = `fa-solid ${iconName}`;
    icon.appendChild(iconElement);
    state.appendChild(icon);

    const heading = document.createElement("strong");
    heading.textContent = title;
    state.appendChild(heading);
    if (detail) {
        const description = document.createElement("span");
        description.textContent = detail;
        state.appendChild(description);
    }
    return state;
}


function renderTopProducts(orders) {
    const totals = new Map();
    orders.forEach((order) => {
        getOrderItems(order).forEach((item) => {
            const name = String(item.productName || item.name || item.product || item.title || "Unknown Product");
            const quantity = Number(item.quantity ?? item.qty ?? 1);
            totals.set(name, (totals.get(name) || 0) + (Number.isFinite(quantity) ? quantity : 1));
        });
    });

    const products = [...totals.entries()]
        .sort((first, second) => second[1] - first[1])
        .slice(0, 5);
    topProductsList.replaceChildren();

    if (!products.length) {
        topProductsList.appendChild(createEmptyState("orange-empty", "fa-mug-hot", "No product data yet"));
        return;
    }

    products.forEach(([name, quantity], index) => {
        const row = document.createElement("div");
        row.className = "dashboard-list-row";
        const rank = document.createElement("span");
        rank.className = "dashboard-rank";
        rank.textContent = String(index + 1);
        const details = document.createElement("div");
        details.className = "dashboard-row-details";
        const productName = document.createElement("strong");
        productName.textContent = name;
        const sold = document.createElement("span");
        sold.textContent = `${quantity} sold`;
        details.append(productName, sold);
        row.append(rank, details);
        topProductsList.appendChild(row);
    });
}


function renderOrderOverview(orders) {
    const colors = {
        pending: "#f0a347",
        confirmed: "#4d91df",
        preparing: "#9a61d0",
        ready: "#2da7a0",
        completed: "#37a75b",
        cancelled: "#df5d5d"
    };
    const counts = new Map();
    orders.forEach((order) => {
        const status = getStatusGroup(order);
        counts.set(status, (counts.get(status) || 0) + 1);
    });

    document.getElementById("total-order-count").textContent = String(orders.length);
    let currentPercent = 0;
    const gradient = [...counts.entries()].map(([status, count]) => {
        const start = currentPercent;
        currentPercent += (count / Math.max(orders.length, 1)) * 100;
        return `${colors[status]} ${start}% ${currentPercent}%`;
    });
    orderChart.style.background = gradient.length
        ? `conic-gradient(${gradient.join(", ")})`
        : "#f1f1f1";
    orderStatusList.replaceChildren();

    if (!counts.size) {
        const empty = document.createElement("div");
        empty.className = "empty-small";
        empty.textContent = "No orders yet";
        orderStatusList.appendChild(empty);
        return;
    }

    counts.forEach((count, status) => {
        const row = document.createElement("div");
        row.className = "dashboard-status-row";
        row.style.setProperty("--status-color", colors[status]);
        const label = document.createElement("span");
        label.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        const value = document.createElement("strong");
        value.textContent = String(count);
        row.append(label, value);
        orderStatusList.appendChild(row);
    });
}


function renderRecentOrders(orders) {
    recentOrdersList.replaceChildren();
    const recentOrders = [...orders]
        .sort((first, second) => (getOrderDate(second)?.getTime() || 0) - (getOrderDate(first)?.getTime() || 0))
        .slice(0, 4);

    if (!recentOrders.length) {
        recentOrdersList.appendChild(
            createEmptyState("", "fa-receipt", "No recent orders", "New orders will appear here")
        );
        return;
    }

    recentOrders.forEach((order) => {
        const row = document.createElement("div");
        row.className = "dashboard-list-row dashboard-order-row";
        const details = document.createElement("div");
        details.className = "dashboard-row-details";
        const customer = document.createElement("strong");
        customer.textContent = String(order.customerName || order.customer || order.name || order.userName || "Customer");
        const date = getOrderDate(order);
        const orderNumber = document.createElement("span");
        orderNumber.textContent = date
            ? `${order.orderNumber || order.orderId || order.id} · ${date.toLocaleDateString()}`
            : String(order.orderNumber || order.orderId || order.id || "Order");
        details.append(customer, orderNumber);

        const summary = document.createElement("div");
        summary.className = "dashboard-order-summary";
        const total = document.createElement("strong");
        total.textContent = formatMoney(getOrderTotal(order));
        const status = document.createElement("span");
        status.className = `dashboard-status status-${getStatusGroup(order)}`;
        status.textContent = getStatusGroup(order);
        summary.append(total, status);
        row.append(details, summary);
        recentOrdersList.appendChild(row);
    });
}


function renderLowStock(items) {
    lowStockList.replaceChildren();
    const lowStockItems = items
        .filter((item) => Number(item.stock ?? 0) <= 10)
        .sort((first, second) => Number(first.stock ?? 0) - Number(second.stock ?? 0))
        .slice(0, 5);

    if (!lowStockItems.length) {
        lowStockList.appendChild(
            createEmptyState("green-empty", "fa-box", "No low-stock items", "Stock alerts appear at 10 units or fewer")
        );
        return;
    }

    lowStockItems.forEach((item) => {
        const row = document.createElement("div");
        row.className = "dashboard-list-row dashboard-stock-row";
        const details = document.createElement("div");
        details.className = "dashboard-row-details";
        const name = document.createElement("strong");
        name.textContent = String(item.name || item.item || "Unnamed Item");
        const category = document.createElement("span");
        category.textContent = String(item.category || "Inventory");
        details.append(name, category);
        const stock = document.createElement("strong");
        stock.className = Number(item.stock ?? 0) <= 0
            ? "dashboard-stock-count out-of-stock"
            : "dashboard-stock-count";
        stock.textContent = `${Number(item.stock ?? 0)} ${item.unit || ""}`.trim();
        row.append(details, stock);
        lowStockList.appendChild(row);
    });
}


function renderDashboard() {
    if (allOrders !== null) {
        renderStatistics(allOrders);
        renderSalesChart(allOrders);
        renderTopProducts(allOrders);
        renderOrderOverview(allOrders);
        renderRecentOrders(allOrders);
    }
    if (inventoryItems !== null) {
        renderLowStock(inventoryItems);
    }
}


function updateDashboardError(source, error) {
    console.error(`Could not load dashboard ${source}:`, error);
    dashboardErrors.add(source);
    dashboardMessage.textContent =
        `Unable to load ${[...dashboardErrors].join(" and ")}. Check the active admin Firestore permissions.`;
    dashboardMessage.hidden = false;
    dashboardMessage.classList.add("dashboard-message-error");
}


function clearDashboardError(source) {
    dashboardErrors.delete(source);
    if (!dashboardErrors.size) {
        dashboardMessage.hidden = true;
        dashboardMessage.classList.remove("dashboard-message-error");
        return;
    }
    dashboardMessage.textContent =
        `Unable to load ${[...dashboardErrors].join(" and ")}. Check the active admin Firestore permissions.`;
}


function subscribeToDashboardData() {
    unsubscribeDashboard.forEach((unsubscribe) => unsubscribe());
    unsubscribeDashboard = [
        onSnapshot(
            collection(db, "orders"),
            (snapshot) => {
                allOrders = snapshot.docs.map((orderDocument) => ({
                    id: orderDocument.id,
                    ...orderDocument.data()
                }));
                clearDashboardError("orders");
                renderDashboard();
            },
            (error) => updateDashboardError("orders", error)
        ),
        onSnapshot(
            collection(db, "inventory"),
            (snapshot) => {
                inventoryItems = snapshot.docs.map((itemDocument) => ({
                    id: itemDocument.id,
                    ...itemDocument.data()
                }));
                clearDashboardError("inventory");
                renderDashboard();
            },
            (error) => updateDashboardError("inventory", error)
        )
    ];
}


salesPeriod.addEventListener("change", renderDashboard);

logoutButton.addEventListener("click", async (event) => {
    event.preventDefault();
    logoutButton.setAttribute("aria-disabled", "true");
    try {
        await signOut(auth);
        redirectToLogin();
    } catch (error) {
        console.error("Logout failed:", error);
        dashboardMessage.textContent = "Logout failed. Please try again.";
        dashboardMessage.hidden = false;
        logoutButton.removeAttribute("aria-disabled");
    }
});


onAuthStateChanged(auth, async (user) => {
    if (!user) {
        redirectToLogin();
        return;
    }

    dashboardMessage.hidden = false;
    dashboardMessage.classList.remove("dashboard-message-error");
    dashboardMessage.textContent = "Verifying administrator access...";

    try {
        const adminSnapshot = await getDoc(doc(db, "admins", user.uid));
        const adminData = adminSnapshot.exists() ? adminSnapshot.data() : null;
        const adminIsActive = adminData && (
            adminData.active === true ||
            (adminData.active === undefined && adminData.isActive === true)
        );

        if (!adminData || adminData.role !== "admin" || !adminIsActive) {
            await signOut(auth);
            redirectToLogin();
            return;
        }

        adminGreeting.textContent = adminData.name || user.email || "Admin";
        dashboardContent.hidden = false;
        dashboardMessage.hidden = true;
        subscribeToDashboardData();
    } catch (error) {
        console.error("Could not verify admin access:", error);
        dashboardMessage.textContent = "We could not verify your admin access. Please try again.";
        dashboardMessage.hidden = false;
        dashboardMessage.classList.add("dashboard-message-error");
    }
});
