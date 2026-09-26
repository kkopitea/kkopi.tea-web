import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


/* ELEMENTS */

const monthInput =
    document.getElementById("reports-month");

const periodText =
    document.getElementById("reports-period-text");

const totalSalesElement =
    document.getElementById("total-sales");

const totalOrdersElement =
    document.getElementById("total-orders");

const bestSellingElement =
    document.getElementById("best-selling-product");

const bestSellingQuantityElement =
    document.getElementById("best-selling-quantity");

const lowStockElement =
    document.getElementById("low-stock-items");

const salesChangeElement =
    document.getElementById("sales-change");

const ordersChangeElement =
    document.getElementById("orders-change");

const salesChartCanvas =
    document.getElementById("sales-chart");

const productsChartCanvas =
    document.getElementById("products-chart");

const salesChartLoading =
    document.getElementById("sales-chart-loading");

const productsChartLoading =
    document.getElementById("products-chart-loading");

const salesChartEmpty =
    document.getElementById("sales-chart-empty");

const productsChartEmpty =
    document.getElementById("products-chart-empty");

const productRanking =
    document.getElementById("product-ranking");

const reportSummaryText =
    document.getElementById("report-summary-text");


/* STATE */

let allOrders = [];

let allInventory = [];

let salesChart = null;

let productsChart = null;


/* INITIAL MONTH */

const today =
    new Date();

const initialYear =
    today.getFullYear();

const initialMonth =
    String(
        today.getMonth() + 1
    ).padStart(
        2,
        "0"
    );

monthInput.value =
    `${initialYear}-${initialMonth}`;


/* DATE HELPERS */

function getMonthRange(value) {

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


function getPreviousMonthRange(value) {

    if (!value) {
        return null;
    }

    const [
        year,
        month
    ] = value
        .split("-")
        .map(Number);

    const previousMonth =
        new Date(
            year,
            month - 2,
            1
        );

    const previousYear =
        previousMonth.getFullYear();

    const previousMonthNumber =
        previousMonth.getMonth();

    return {
        startDate:
            new Date(
                previousYear,
                previousMonthNumber,
                1,
                0,
                0,
                0,
                0
            ),

        endDate:
            new Date(
                previousYear,
                previousMonthNumber + 1,
                0,
                23,
                59,
                59,
                999
            )
    };

}


function formatPeriod(range) {

    if (!range) {
        return "Select a month";
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

    return `${formatter.format(
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
        typeof possibleDate.toDate ===
        "function"
    ) {
        return possibleDate.toDate();
    }

    if (
        typeof possibleDate.seconds ===
        "number"
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
        new Date(
            possibleDate
        );

    if (
        !Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return parsedDate;
    }

    return null;

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


/* STATUS */

function normalizeStatus(status) {

    return String(
        status || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            ""
        );

}


/* ITEMS */

function getOrderItems(order) {

    if (
        Array.isArray(
            order.items
        )
    ) {
        return order.items;
    }

    if (
        Array.isArray(
            order.products
        )
    ) {
        return order.products;
    }

    return [];

}


function getItemName(item) {

    return (
        item.productName ||
        item.name ||
        item.product ||
        item.title ||
        "Unknown Product"
    );

}


function getItemQuantity(item) {

    const quantity =
        Number(
            item.quantity ??
            item.qty ??
            1
        );

    return Number.isFinite(
        quantity
    )
        ? quantity
        : 1;

}


/* LOAD FIREBASE DATA */

async function loadReportsData() {

    showChartLoading();

    try {

        const [
            ordersSnapshot,
            inventorySnapshot
        ] = await Promise.all([
            getDocs(
                collection(
                    db,
                    "orders"
                )
            ),

            getDocs(
                collection(
                    db,
                    "inventory"
                )
            )
        ]);


        allOrders = [];

        ordersSnapshot.forEach(
            function (
                documentSnapshot
            ) {

                allOrders.push({
                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()
                });

            }
        );


        allInventory = [];

        inventorySnapshot.forEach(
            function (
                documentSnapshot
            ) {

                allInventory.push({
                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()
                });

            }
        );


        renderReports();

    } catch (error) {

        console.error(
            "Error loading reports:",
            error
        );

        periodText.textContent =
            "Unable to load report data";

        hideChartLoading();

        showChartEmpty(
            salesChartEmpty
        );

        showChartEmpty(
            productsChartEmpty
        );

    }

}


/* FILTER ORDERS */

function getOrdersForRange(range) {

    if (!range) {
        return [];
    }

    return allOrders.filter(
        function (order) {

            const orderDate =
                getOrderDate(
                    order
                );

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

}


/* SALES */

function calculateSales(
    orders
) {

    return orders.reduce(
        function (
            total,
            order
        ) {

            return total +
                getOrderTotal(
                    order
                );

        },
        0
    );

}


/* PERCENTAGE */

function calculateChange(
    current,
    previous
) {

    if (
        previous === 0 &&
        current === 0
    ) {
        return 0;
    }

    if (
        previous === 0
    ) {
        return 100;
    }

    return (
        (
            current -
            previous
        ) /
        previous
    ) *
    100;

}


/* BEST SELLING */

function getProductSales(
    orders
) {

    const productMap =
        new Map();


    orders.forEach(
        function (order) {

            const items =
                getOrderItems(
                    order
                );


            items.forEach(
                function (item) {

                    const name =
                        getItemName(
                            item
                        );

                    const quantity =
                        getItemQuantity(
                            item
                        );


                    if (
                        !productMap.has(
                            name
                        )
                    ) {

                        productMap.set(
                            name,
                            0
                        );

                    }


                    productMap.set(
                        name,
                        productMap.get(
                            name
                        ) + quantity
                    );

                }
            );

        }
    );


    return Array.from(
        productMap.entries()
    )
        .map(
            function (
                entry
            ) {

                return {
                    name: entry[0],
                    quantity: entry[1]
                };

            }
        )
        .sort(
            function (
                a,
                b
            ) {

                return (
                    b.quantity -
                    a.quantity
                );

            }
        );

}


/* LOW STOCK */

function getLowStockCount() {

    return allInventory.filter(
        function (item) {

            const stock =
                Number(
                    item.stock ??
                    item.quantity ??
                    item.currentStock ??
                    0
                );

            return (
                Number.isFinite(stock) &&
                stock <= 10
            );

        }
    ).length;

}


/* RENDER REPORTS */

function renderReports() {

    const range =
        getMonthRange(
            monthInput.value
        );


    const previousRange =
        getPreviousMonthRange(
            monthInput.value
        );


    if (!range) {
        return;
    }


    periodText.textContent =
        formatPeriod(
            range
        );


    const currentOrders =
        getOrdersForRange(
            range
        );


    const previousOrders =
        getOrdersForRange(
            previousRange
        );


    const currentSales =
        calculateSales(
            currentOrders
        );


    const previousSales =
        calculateSales(
            previousOrders
        );


    const salesChange =
        calculateChange(
            currentSales,
            previousSales
        );


    const ordersChange =
        calculateChange(
            currentOrders.length,
            previousOrders.length
        );


    totalSalesElement.textContent =
        `₱${currentSales.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;


    totalOrdersElement.textContent =
        currentOrders.length;


    salesChangeElement.textContent =
        `${salesChange >= 0 ? "↑" : "↓"} ${Math.abs(
            salesChange
        ).toFixed(1)}%`;


    ordersChangeElement.textContent =
        `${ordersChange >= 0 ? "↑" : "↓"} ${Math.abs(
            ordersChange
        ).toFixed(1)}%`;


    salesChangeElement.style.color =
        salesChange >= 0
            ? "var(--green)"
            : "#d85b5b";


    ordersChangeElement.style.color =
        ordersChange >= 0
            ? "var(--green)"
            : "#d85b5b";


    const productSales =
        getProductSales(
            currentOrders
        );


    if (
        productSales.length > 0
    ) {

        bestSellingElement.textContent =
            productSales[0].name;

        bestSellingQuantityElement.textContent =
            `${productSales[0].quantity} items sold`;

    } else {

        bestSellingElement.textContent =
            "No data";

        bestSellingQuantityElement.textContent =
            "0 items sold";

    }


    lowStockElement.textContent =
        getLowStockCount();


    renderSalesChart(
        currentOrders
    );


    renderProductsChart(
        productSales
    );


    renderProductRanking(
        productSales
    );


    updateReportSummary(
        currentOrders,
        currentSales,
        productSales
    );

}


/* SALES CHART */

function renderSalesChart(
    orders
) {

    const range =
        getMonthRange(
            monthInput.value
        );


    const daysInMonth =
        range.endDate.getDate();


    const dailySales =
        new Array(
            daysInMonth
        ).fill(0);


    orders.forEach(
        function (order) {

            const date =
                getOrderDate(
                    order
                );

            if (!date) {
                return;
            }


            const day =
                date.getDate();


            dailySales[
                day - 1
            ] += getOrderTotal(
                order
            );

        }
    );


    const labels =
        dailySales.map(
            function (
                value,
                index
            ) {

                return `Day ${index + 1}`;

            }
        );


    if (salesChart) {
        salesChart.destroy();
    }


    hideChartEmpty(
        salesChartEmpty
    );


    salesChart =
        new Chart(
            salesChartCanvas,
            {
                type: "bar",

                data: {
                    labels,

                    datasets: [
                        {
                            label: "Sales",

                            data:
                                dailySales,

                            borderRadius: 7,

                            borderSkipped: false,

                            backgroundColor:
                                "#ff9a4d",

                            hoverBackgroundColor:
                                "#ec6e0b"
                        }
                    ]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: false
                        },

                        tooltip: {
                            backgroundColor:
                                "#171717",

                            padding: 10,

                            displayColors:
                                false,

                            callbacks: {
                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            "₱" +
                                            Number(
                                                context.raw
                                            ).toLocaleString(
                                                undefined,
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }
                                            )
                                        );

                                    }
                            }
                        }
                    },

                    scales: {
                        x: {
                            grid: {
                                display: false
                            },

                            ticks: {
                                color: "#999999",

                                font: {
                                    size: 9
                                },

                                maxTicksLimit: 8
                            }
                        },

                        y: {
                                min: 500,
                                max: 20000,

                                ticks: {
                                    stepSize: 5000,

                                    color: "#999999",

                                    font: {
                                        size: 9
                                    },

                                    callback: function (value) {
                                        return (
                                            "₱" +
                                            Number(value).toLocaleString()
                                        );
                                    }
                                },

                                grid: {
                                    color: "#f0ece8"
                                }
                            }
                    }
                }
            }
        );


    hideChartLoadingElement(
        salesChartLoading
    );

}


/* PRODUCT CHART */

function renderProductsChart(
    productSales
) {

    if (productsChart) {
        productsChart.destroy();
    }


    if (
        productSales.length === 0
    ) {

        hideChartLoadingElement(
            productsChartLoading
        );

        showChartEmpty(
            productsChartEmpty
        );

        return;

    }


    hideChartEmpty(
        productsChartEmpty
    );


    const topProducts =
        productSales.slice(
            0,
            5
        );


    const labels =
        topProducts.map(
            function (
                product
            ) {

                return product.name;

            }
        );


    const quantities =
        topProducts.map(
            function (
                product
            ) {

                return product.quantity;

            }
        );


    productsChart =
        new Chart(
            productsChartCanvas,
            {
                type: "doughnut",

                data: {
                    labels,

                    datasets: [
                        {
                            data:
                                quantities,

                            backgroundColor: [
                                "#6c78d8",
                                "#8d97df",
                                "#aeb6e7",
                                "#d0d4ef",
                                "#e6e7ee"
                            ],

                            borderColor:
                                "#ffffff",

                            borderWidth: 5,

                            hoverOffset: 8
                        }
                    ]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "63%",

                    plugins: {
                        legend: {
                            position: "right",

                            labels: {
                                color: "#555555",

                                boxWidth: 10,

                                boxHeight: 10,

                                padding: 12,

                                font: {
                                    size: 9,
                                    weight: "700"
                                }
                            }
                        },

                        tooltip: {
                            backgroundColor:
                                "#171717",

                            padding: 10
                        }
                    }
                }
            }
        );


    hideChartLoadingElement(
        productsChartLoading
    );

}


/* PRODUCT RANKING */

function renderProductRanking(
    productSales
) {

    productRanking.innerHTML = "";


    const topProducts =
        productSales.slice(
            0,
            5
        );


    topProducts.forEach(
        function (
            product,
            index
        ) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "product-ranking-item";


            item.innerHTML = `

                <div class="product-ranking-number">
                    ${index + 1}
                </div>

                <div class="product-ranking-information">

                    <span class="product-ranking-name">
                        ${escapeHtml(
                            product.name
                        )}
                    </span>

                    <span class="product-ranking-quantity">
                        ${product.quantity} items sold
                    </span>

                </div>

                <span class="product-ranking-total">
                    ${product.quantity}
                </span>

            `;


            productRanking.appendChild(
                item
            );

        }
    );

}


/* REPORT SUMMARY */

function updateReportSummary(
    orders,
    sales,
    products
) {

    if (
        orders.length === 0
    ) {

        reportSummaryText.textContent =
            "There are no orders recorded for the selected reporting period.";

        return;

    }


    const bestProduct =
        products.length > 0
            ? products[0].name
            : "No specific product";


    reportSummaryText.textContent =
        `${orders.length} order${
            orders.length === 1
                ? ""
                : "s"
        } generated ₱${sales.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )} in sales. ${bestProduct} had the highest number of units sold.`;

}


/* LOADING */

function showChartLoading() {

    salesChartLoading.hidden = false;

    productsChartLoading.hidden = false;

}


function hideChartLoading() {

    hideChartLoadingElement(
        salesChartLoading
    );

    hideChartLoadingElement(
        productsChartLoading
    );

}


function hideChartLoadingElement(
    element
) {

    element.hidden = true;

}


function showChartEmpty(
    element
) {

    element.hidden = false;

}


function hideChartEmpty(
    element
) {

    element.hidden = true;

}


/* ESCAPE */

function escapeHtml(
    value
) {

    return String(
        value
    )
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


/* MONTH CHANGE */

monthInput.addEventListener(
    "change",
    function () {

        showChartLoading();

        renderReports();

    }
);


/* START */

loadReportsData();