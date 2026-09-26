<?php

$pageTitle = "Orders";

$adminName = "Admin";

$adminRole = "Administrator";

$currentDate = date("F j, Y");

$menuItems = [
    [
        "name" => "Dashboard",
        "href" => "admin-dashboard.php",
        "icon" => "fa-house"
    ],
    [
        "name" => "Menu Management",
        "href" => "menu-management.php",
        "icon" => "fa-book-open"
    ],
    [
        "name" => "Inventory",
        "href" => "admin-inventory.php",
        "icon" => "fa-boxes-stacked"
    ],
    [
        "name" => "Orders",
        "href" => "admin-orders.php",
        "icon" => "fa-receipt"
    ],
    [
        "name" => "Reports",
        "href" => "admin-reports.php",
        "icon" => "fa-chart-column"
    ],
    [
        "name" => "Users",
        "href" => "admin-users.php",
        "icon" => "fa-users"
    ],
    [
        "name" => "Settings",
        "href" => "admin-settings.php",
        "icon" => "fa-gear"
    ]
];

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        <?php echo $pageTitle; ?> | KKOPI.TEA
    </title>

    <link
        rel="stylesheet"
        href="css/admin-orders.css?v=4"
    >

    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
    >

</head>

<body>

<div class="orders-container">

    <!-- SIDEBAR -->

    <aside class="sidebar">

        <div class="sidebar-logo">

            <span class="logo-black">
                KKOPI
            </span>

            <span class="logo-white">
                .TEA
            </span>

        </div>


        <div class="sidebar-menu">

            <div class="navigation-section">

                <span class="navigation-title">
                    MAIN
                </span>

                <?php foreach ($menuItems as $item): ?>

                    <a
                        href="<?php echo $item["href"]; ?>"
                        class="menu-item <?php echo $item["name"] === "Orders" ? "active" : ""; ?>"
                    >

                        <span class="menu-icon">
                            <i class="fa-solid <?php echo $item["icon"]; ?>"></i>
                        </span>

                        <span>
                            <?php echo $item["name"]; ?>
                        </span>

                    </a>

                <?php endforeach; ?>

            </div>

        </div>

        <div class="sidebar-bottom">

            <a
                href="admin-login.php"
                class="menu-item logout"
            >

                <span class="menu-icon">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </span>

                <span class="menu-text">
                    Logout
                </span>

            </a>

        </div>

    </aside>


    <!-- MAIN CONTENT -->

    <main class="main-content">


        <!-- HEADER -->

        <header class="top-header">

            <div class="header-title">

                <div class="welcome-badge">

                    <span class="welcome-dot"></span>

                    ADMIN ORDERS

                </div>

                <h1>
                    Sales & Order Records
                </h1>

                <p>
                    Track your sales and keep your order records organized.
                </p>

            </div>


            <div class="admin-profile">

                <div class="admin-information">

                    <strong>
                        <?php echo $adminName; ?>
                    </strong>

                    <span>
                        <?php echo $adminRole; ?>
                    </span>

                    <small>
                        <?php echo $currentDate; ?>
                    </small>

                </div>

                <div class="admin-avatar">

                    <i class="fa-solid fa-user"></i>

                </div>

            </div>

        </header>


        <!-- ORDER CONTENT -->

        <div class="orders-content">


            <!-- SUMMARY CARDS -->

            <section class="order-summary">


                <!-- TOTAL ORDERS -->

                <div class="summary-card">

                    <div class="summary-card-top">

                        <div class="summary-icon orange">

                            <i class="fa-solid fa-receipt"></i>

                        </div>

                        <span class="summary-label">
                            Total Orders
                        </span>

                    </div>

                    <div
                        class="summary-value"
                        id="total-orders"
                    >
                        0
                    </div>

                    <span class="summary-description">
                        Orders received
                    </span>

                </div>


                <!-- COMPLETED -->

                <div class="summary-card">

                    <div class="summary-card-top">

                        <div class="summary-icon green">

                            <i class="fa-solid fa-circle-check"></i>

                        </div>

                        <span class="summary-label">
                            Completed
                        </span>

                    </div>

                    <div
                        class="summary-value"
                        id="completed-orders"
                    >
                        0
                    </div>

                    <span class="summary-description">
                        Completed orders
                    </span>

                </div>


                <!-- PREPARING -->

                <div class="summary-card">

                    <div class="summary-card-top">

                        <div class="summary-icon blue">

                            <i class="fa-solid fa-mug-hot"></i>

                        </div>

                        <span class="summary-label">
                            Preparing
                        </span>

                    </div>

                    <div
                        class="summary-value"
                        id="preparing-orders"
                    >
                        0
                    </div>

                    <span class="summary-description">
                        Orders being prepared
                    </span>

                </div>


                <!-- SALES -->

                <div class="summary-card">

                    <div class="summary-card-top">

                        <div class="summary-icon purple">

                            <i class="fa-solid fa-peso-sign"></i>

                        </div>

                        <span class="summary-label">
                            Total Sales
                        </span>

                    </div>

                    <div
                        class="summary-value sales-value"
                        id="total-sales"
                    >
                        ₱0.00
                    </div>

                    <span class="summary-description">
                        Sales for selected month
                    </span>

                </div>


            </section>


            <!-- ORDERS PANEL -->

            <section class="orders-section">


                <div class="orders-section-header">

                    <div>

                        <span class="section-eyebrow">
                            ORDER MANAGEMENT
                        </span>

                        <h2>
                            Order Records
                        </h2>

                        <p>
                            View and manage customer orders.
                        </p>

                    </div>


                    <!-- FILTERS -->

                    <div class="orders-filters">


                        <!-- MONTH -->

                        <div class="month-filter">

                            <i class="fa-regular fa-calendar"></i>

                            <input
                                type="month"
                                id="month-filter"
                                aria-label="Select month"
                            >

                        </div>


                        <!-- STATUS -->

                        <div class="status-dropdown">

                            <button
                                type="button"
                                class="status-filter"
                                id="status-filter"
                            >

                                <i class="fa-solid fa-filter status-filter-icon"></i>

                                <span id="status-filter-text">
                                    All Status
                                </span>

                                <i class="fa-solid fa-chevron-down status-filter-arrow"></i>

                            </button>


                            <div class="status-dropdown-menu">

                                <button
                                    type="button"
                                    data-status="all"
                                    class="active"
                                >

                                    <span class="status-option-dot all"></span>

                                    All Status

                                </button>


                                <button
                                    type="button"
                                    data-status="pending"
                                >

                                    <span class="status-option-dot pending"></span>

                                    Pending

                                </button>


                                <button
                                    type="button"
                                    data-status="preparing"
                                >

                                    <span class="status-option-dot preparing"></span>

                                    Preparing

                                </button>


                                <button
                                    type="button"
                                    data-status="completed"
                                >

                                    <span class="status-option-dot completed"></span>

                                    Completed

                                </button>


                                <button
                                    type="button"
                                    data-status="cancelled"
                                >

                                    <span class="status-option-dot cancelled"></span>

                                    Cancelled

                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- SELECTED PERIOD -->

                <div class="selected-period">

                    <div class="selected-period-icon">

                        <i class="fa-regular fa-calendar"></i>

                    </div>

                    <div>

                        <span class="selected-period-label">
                            Selected Period
                        </span>

                        <strong id="selected-period-text">
                            Loading...
                        </strong>

                    </div>

                </div>


                <!-- ORDER TABLE -->

                <div class="orders-table-wrapper">

                    <table class="orders-table">

                        <thead>

                            <tr>

                                <th>
                                    Order
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Items
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody id="orders-table-body">

                            <!-- LOADING -->

                            <tr id="orders-loading-row">

                                <td colspan="7">

                                    <div class="orders-loading">

                                        <div class="loading-spinner"></div>

                                        <strong>
                                            Loading orders
                                        </strong>

                                        <span>
                                            Fetching your order records...
                                        </span>

                                    </div>

                                </td>

                            </tr>


                            <!-- EMPTY STATE -->

                            <tr
                                id="orders-empty-row"
                                class="empty-orders-row"
                                hidden
                            >

                                <td colspan="7">

                                    <div class="empty-orders">

                                        <div class="empty-orders-icon">

                                            <i class="fa-solid fa-receipt"></i>

                                        </div>

                                        <h3>
                                            No Orders Found
                                        </h3>

                                        <p>
                                            There are no orders for the selected month and status.
                                        </p>

                                    </div>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </section>

        </div>

    </main>

</div>


<script
    type="module"
    src="js/orders.js?v=4"
></script>
<script src="js/theme.js?v=5"></script>

</body>

</html>