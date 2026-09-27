<?php

$pageTitle = "Dashboard";

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
        rel="preconnect"
        href="https://fonts.googleapis.com"
    >

    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin
    >

    <link
        href="https://fonts.googleapis.com/css2?family=Baloo+Thambi&display=swap"
        rel="stylesheet"
    >

    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
    >

    <link
        rel="stylesheet"
        href="css/admin-dashboard.css?v=10"
    >

</head>

<body>

    <div class="dashboard-container">


        <!-- SIDEBAR -->

        <aside class="sidebar">


            <!-- LOGO -->

            <div class="sidebar-logo">

                <span class="logo-black">
                    KKOPI
                </span>

                <span class="logo-white">
                    .TEA
                </span>

            </div>


            <!-- MAIN NAVIGATION -->

            <nav class="sidebar-menu">


                <div class="navigation-section">

                    <span class="navigation-title">
                        MAIN
                    </span>

                    <?php foreach ($menuItems as $item): ?>

                        <?php

                        $activeClass = "";

                        if ($item["name"] === $pageTitle) {
                            $activeClass = "active";
                        }

                        ?>

                        <a
                            href="<?php echo $item["href"]; ?>"
                            class="menu-item <?php echo $activeClass; ?>"
                        >

                            <span class="menu-icon">

                                <i
                                    class="fa-solid <?php echo $item["icon"]; ?>"
                                ></i>

                            </span>

                            <span class="menu-text">
                                <?php echo $item["name"]; ?>
                            </span>

                        </a>

                    <?php endforeach; ?>

                </div>

            </nav>


            <!-- SIDEBAR BOTTOM -->

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


            <!-- TOP HEADER -->

            <header class="top-header">


                <!-- HEADER TITLE -->

                <div class="header-title">

                    <div class="welcome-badge">

                        <span class="welcome-dot"></span>

                        ADMIN DASHBOARD

                    </div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Welcome back! Here's what's happening with your business today.
                    </p>

                </div>


                <!-- ADMIN PROFILE -->

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


            <!-- DASHBOARD -->

            <section class="dashboard-content">


                <!-- STATISTICS -->

                <div class="statistics-grid">


                    <!-- TOTAL SALES -->

                    <div class="stat-card sales-card">

                        <div class="stat-icon orange">

                            <i class="fa-solid fa-wallet"></i>

                        </div>

                        <div class="stat-information">

                            <span class="stat-title">
                                Total Sales
                            </span>

                            <strong
                                class="stat-value"
                                id="total-sales"
                            >
                                —
                            </strong>

                            <div class="stat-change">

                                <span id="sales-change">
                                    —
                                </span>

                                <small>
                                    vs yesterday
                                </small>

                            </div>

                        </div>

                    </div>


                    <!-- TOTAL ORDERS -->

                    <div class="stat-card orders-card">

                        <div class="stat-icon green">

                            <i class="fa-solid fa-bag-shopping"></i>

                        </div>

                        <div class="stat-information">

                            <span class="stat-title">
                                Total Orders
                            </span>

                            <strong
                                class="stat-value"
                                id="total-orders"
                            >
                                —
                            </strong>

                            <div class="stat-change">

                                <span id="orders-change">
                                    —
                                </span>

                                <small>
                                    vs yesterday
                                </small>

                            </div>

                        </div>

                    </div>


                    <!-- AVERAGE ORDER -->

                    <div class="stat-card average-card">

                        <div class="stat-icon purple">

                            <i class="fa-solid fa-mug-hot"></i>

                        </div>

                        <div class="stat-information">

                            <span class="stat-title">
                                Average Order Value
                            </span>

                            <strong
                                class="stat-value"
                                id="average-order"
                            >
                                —
                            </strong>

                            <div class="stat-change">

                                <span id="average-change">
                                    —
                                </span>

                                <small>
                                    vs yesterday
                                </small>

                            </div>

                        </div>

                    </div>


                    <!-- CUSTOMERS -->

                    <div class="stat-card customers-card">

                        <div class="stat-icon blue">

                            <i class="fa-solid fa-user-group"></i>

                        </div>

                        <div class="stat-information">

                            <span class="stat-title">
                                Total Customers
                            </span>

                            <strong
                                class="stat-value"
                                id="total-customers"
                            >
                                —
                            </strong>

                            <div class="stat-change">

                                <span id="customers-change">
                                    —
                                </span>

                                <small>
                                    vs yesterday
                                </small>

                            </div>

                        </div>

                    </div>


                </div>


                <!-- ANALYTICS -->

                <div class="middle-grid">


                    <!-- SALES OVERVIEW -->

                    <div class="panel sales-panel">

                        <div class="panel-header">

                            <div>

                                <span class="panel-label">
                                    PERFORMANCE
                                </span>

                                <h2>
                                    Sales Overview
                                </h2>

                                <p>
                                    Monitor your sales performance
                                </p>

                            </div>


                            <select
                                id="sales-period"
                                class="period-select"
                            >

                                <option value="week">
                                    This week
                                </option>

                                <option value="month">
                                    This month
                                </option>

                                <option value="year">
                                    This year
                                </option>

                            </select>

                        </div>


                        <div class="sales-chart">


                            <div class="chart-y-axis">

                                <span id="chart-value-1">
                                    —
                                </span>

                                <span id="chart-value-2">
                                    —
                                </span>

                                <span id="chart-value-3">
                                    —
                                </span>

                                <span id="chart-value-4">
                                    —
                                </span>

                                <span>
                                    ₱0
                                </span>

                            </div>


                            <div
                                class="chart-area"
                                id="sales-chart"
                            >

                                <div class="chart-grid-line line-1"></div>

                                <div class="chart-grid-line line-2"></div>

                                <div class="chart-grid-line line-3"></div>

                                <div class="chart-grid-line line-4"></div>

                                <div class="chart-grid-line line-5"></div>


                                <div class="chart-empty">

                                    <div class="chart-empty-icon">

                                        <i class="fa-solid fa-chart-line"></i>

                                    </div>

                                    <strong>
                                        Waiting for sales data
                                    </strong>

                                </div>


                                <div class="chart-days">

                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                    <span>Sun</span>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- TOP PRODUCTS -->

                    <div class="panel products-panel">

                        <div class="panel-header">

                            <div>

                                <span class="panel-label">
                                    PRODUCTS
                                </span>

                                <h2>
                                    Top Selling
                                </h2>

                                <p>
                                    Best performing items
                                </p>

                            </div>

                            <a href="menu-management.php">
                                View All
                            </a>

                        </div>


                        <div
                            class="product-list"
                            id="top-products"
                        >

                            <div class="empty-state">

                                <div class="empty-icon orange-empty">

                                    <i class="fa-solid fa-mug-hot"></i>

                                </div>

                                <strong>
                                    No product data yet
                                </strong>

                            </div>

                        </div>

                    </div>


                </div>


                <!-- LOWER DASHBOARD -->

                <div class="bottom-grid">


                    <!-- ORDER OVERVIEW -->

                    <div class="panel order-overview-panel">

                        <div class="panel-header">

                            <div>

                                <span class="panel-label">
                                    ORDERS
                                </span>

                                <h2>
                                    Order Overview
                                </h2>

                                <p>
                                    Current order status
                                </p>

                            </div>

                        </div>


                        <div class="order-overview">


                            <div
                                class="pie-chart"
                                id="orders-chart"
                            >

                                <div class="pie-center">

                                    <strong id="total-order-count">
                                        —
                                    </strong>

                                    <span>
                                        Orders
                                    </span>

                                </div>

                            </div>


                            <div
                                class="order-status-list"
                                id="order-status-list"
                            >

                                <div class="empty-small">

                                    <span>
                                        Waiting for data
                                    </span>

                                </div>

                            </div>


                        </div>

                    </div>


                    <!-- RECENT ORDERS -->

                    <div class="panel recent-orders-panel">

                        <div class="panel-header">

                            <div>

                                <span class="panel-label">
                                    ACTIVITY
                                </span>

                                <h2>
                                    Recent Orders
                                </h2>

                                <p>
                                    Latest customer activity
                                </p>

                            </div>

                            <a href="admin-orders.php">
                                View All
                            </a>

                        </div>


                        <div
                            class="orders-list"
                            id="recent-orders"
                        >

                            <div class="empty-state">

                                <div class="empty-icon">

                                    <i class="fa-solid fa-receipt"></i>

                                </div>

                                <strong>
                                    No recent orders
                                </strong>

                                <span>
                                    New orders will appear here
                                </span>

                            </div>

                        </div>

                    </div>


                    <!-- LOW STOCK -->

                    <div class="panel low-stock-panel">

                        <div class="panel-header">

                            <div>

                                <span class="panel-label">
                                    INVENTORY
                                </span>

                                <h2>
                                    Stock Alerts
                                </h2>

                                <p>
                                    Items needing attention
                                </p>

                            </div>

                            <a href="admin-inventory.php">
                                View All
                            </a>

                        </div>


                        <div
                            class="low-stock-list"
                            id="low-stock-items"
                        >

                            <div class="empty-state">

                                <div class="empty-icon green-empty">

                                    <i class="fa-solid fa-box"></i>

                                </div>

                                <strong>
                                    No alerts
                                </strong>

                                <span>
                                    Low-stock items will appear here
                                </span>

                            </div>

                        </div>

                    </div>


                </div>


                <!-- QUICK ACTIONS -->

                <div class="quick-actions-section">


                    <div class="section-heading">

                        <div>

                            <span class="panel-label">
                                SHORTCUTS
                            </span>

                            <h2>
                                Quick Actions
                            </h2>

                        </div>

                    </div>


                    <div class="quick-actions-grid">


                        <a
                            href="menu-management.php"
                            class="quick-action"
                        >

                            <div class="quick-action-icon orange">

                                <i class="fa-solid fa-plus"></i>

                            </div>

                            <div>

                                <strong>
                                    Manage Menu
                                </strong>

                                <span>
                                    Add or update products
                                </span>

                            </div>

                            <i class="fa-solid fa-arrow-right action-arrow"></i>

                        </a>


                        <a
                            href="admin-inventory.php"
                            class="quick-action"
                        >

                            <div class="quick-action-icon green">

                                <i class="fa-solid fa-boxes-stacked"></i>

                            </div>

                            <div>

                                <strong>
                                    Manage Inventory
                                </strong>

                                <span>
                                    Check current stock
                                </span>

                            </div>

                            <i class="fa-solid fa-arrow-right action-arrow"></i>

                        </a>


                        <a
                            href="admin-orders.php"
                            class="quick-action"
                        >

                            <div class="quick-action-icon purple">

                                <i class="fa-solid fa-receipt"></i>

                            </div>

                            <div>

                                <strong>
                                    View Orders
                                </strong>

                                <span>
                                    Manage customer orders
                                </span>

                            </div>

                            <i class="fa-solid fa-arrow-right action-arrow"></i>

                        </a>


                        <a
                            href="admin-reports.php"
                            class="quick-action"
                        >

                            <div class="quick-action-icon blue">

                                <i class="fa-solid fa-chart-column"></i>

                            </div>

                            <div>

                                <strong>
                                    View Reports
                                </strong>

                                <span>
                                    Review business performance
                                </span>

                            </div>

                            <i class="fa-solid fa-arrow-right action-arrow"></i>

                        </a>


                    </div>

                </div>


            </section>

            <script
                type="module"
                src="js/admin-dashboard.js?v=1"
            ></script>
            <script src="js/theme.js?v=1"></script>

        </main>

    </div>


</body>

</html>