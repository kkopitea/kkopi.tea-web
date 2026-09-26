<?php

$pageTitle = "Reports";

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
        href="css/admin-reports.css?v=2"
    >

</head>

<body>

    <div class="reports-container">


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

                         ADMIN REPORTS

                    </div>

                    <h1>
                        Reports Overview
                    </h1>

                    <p>
                        Get a clear view of your business performance and trends.
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
                <section class="reports-content">

            <div class="reports-toolbar">

                <div class="reports-period">

                    <div class="reports-period-icon">
                        <i class="fa-regular fa-calendar"></i>
                    </div>

                    <div class="reports-period-information">

                        <span>
                            REPORTING PERIOD
                        </span>

                        <strong id="reports-period-text">
                            Loading...
                        </strong>

                    </div>

                </div>

                <div class="reports-month-picker">

                    <i class="fa-regular fa-calendar"></i>

                    <input
                        type="month"
                        id="reports-month"
                        aria-label="Select reporting month"
                    >

                    <i class="fa-solid fa-chevron-down"></i>

                </div>

            </div>


            <section class="reports-summary">

                <div class="report-card">

                    <div class="report-card-header">

                        <div class="report-card-icon sales">
                            <i class="fa-solid fa-peso-sign"></i>
                        </div>

                        <span>
                            TOTAL SALES
                        </span>

                    </div>

                    <strong
                        class="report-card-value"
                        id="total-sales"
                    >
                        ₱0.00
                    </strong>

                    <div class="report-card-comparison">

                        <span
                            class="comparison-value"
                            id="sales-change"
                        >
                            0%
                        </span>

                        <span>
                            vs previous month
                        </span>

                    </div>

                </div>


                <div class="report-card">

                    <div class="report-card-header">

                        <div class="report-card-icon orders">
                            <i class="fa-solid fa-receipt"></i>
                        </div>

                        <span>
                            TOTAL ORDERS
                        </span>

                    </div>

                    <strong
                        class="report-card-value"
                        id="total-orders"
                    >
                        0
                    </strong>

                    <div class="report-card-comparison">

                        <span
                            class="comparison-value"
                            id="orders-change"
                        >
                            0%
                        </span>

                        <span>
                            vs previous month
                        </span>

                    </div>

                </div>


                <div class="report-card">

                    <div class="report-card-header">

                        <div class="report-card-icon best">
                            <i class="fa-solid fa-trophy"></i>
                        </div>

                        <span>
                            BEST SELLING
                        </span>

                    </div>

                    <strong
                        class="report-card-value product-value"
                        id="best-selling-product"
                    >
                        No data
                    </strong>

                    <div class="report-card-comparison">

                        <span
                            id="best-selling-quantity"
                        >
                            0 items sold
                        </span>

                    </div>

                </div>


                <div class="report-card">

                    <div class="report-card-header">

                        <div class="report-card-icon stock">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>

                        <span>
                            LOW STOCK ITEMS
                        </span>

                    </div>

                    <strong
                        class="report-card-value"
                        id="low-stock-items"
                    >
                        0
                    </strong>

                    <div class="report-card-comparison">

                        <span>
                            Items need restocking
                        </span>

                    </div>

                </div>

            </section>


            <section class="reports-grid">


                <div class="report-panel sales-panel">

                    <div class="report-panel-header">

                        <div>

                            <span class="report-panel-eyebrow">
                                SALES PERFORMANCE
                            </span>

                            <h2>
                                Sales Overview
                            </h2>

                            <p id="sales-chart-description">
                                Sales activity for the selected month.
                            </p>

                        </div>

                        <div class="panel-icon">
                            <i class="fa-solid fa-chart-column"></i>
                        </div>

                    </div>

                    <div class="chart-container">

                        <div
                            class="chart-loading"
                            id="sales-chart-loading"
                        >

                            <div class="reports-spinner"></div>

                            <span>
                                Loading sales data...
                            </span>

                        </div>

                        <canvas
                            id="sales-chart"
                        ></canvas>

                        <div
                            class="chart-empty"
                            id="sales-chart-empty"
                            hidden
                        >

                            <div class="chart-empty-icon">
                                <i class="fa-solid fa-chart-column"></i>
                            </div>

                            <strong>
                                No Sales Data
                            </strong>

                            <span>
                                No sales were found for this period.
                            </span>

                        </div>

                    </div>

                </div>


                <div class="report-panel products-panel">

                    <div class="report-panel-header">

                        <div>

                            <span class="report-panel-eyebrow">
                                PRODUCT PERFORMANCE
                            </span>

                            <h2>
                                Top Selling Products
                            </h2>

                            <p>
                                Products based on units sold.
                            </p>

                        </div>

                        <div class="panel-icon">
                            <i class="fa-solid fa-ranking-star"></i>
                        </div>

                    </div>

                    <div class="products-chart-container">

                        <div
                            class="chart-loading"
                            id="products-chart-loading"
                        >

                            <div class="reports-spinner"></div>

                            <span>
                                Loading product data...
                            </span>

                        </div>

                        <canvas
                            id="products-chart"
                        ></canvas>

                        <div
                            class="chart-empty"
                            id="products-chart-empty"
                            hidden
                        >

                            <div class="chart-empty-icon">
                                <i class="fa-solid fa-box-open"></i>
                            </div>

                            <strong>
                                No Product Data
                            </strong>

                            <span>
                                No product sales were found.
                            </span>

                        </div>

                    </div>

                    <div
                        class="product-ranking"
                        id="product-ranking"
                    ></div>

                </div>


            </section>


            <section class="reports-insight-panel">

                <div class="insight-icon">
                    <i class="fa-solid fa-lightbulb"></i>
                </div>

                <div class="insight-information">

                    <span>
                        REPORT SUMMARY
                    </span>

                    <strong id="report-summary-text">
                        Analyzing your sales data...
                    </strong>

                </div>

            </section>

        </section>

        </main>

        <script
            src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"
        ></script>

        <script
            type="module"
            src="js/reports.js?v=1"
        ></script>
        <script src="js/theme.js?v=2"></script>

    </body>

</html>