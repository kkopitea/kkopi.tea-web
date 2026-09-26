<?php

$pageTitle = "Inventory";

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
        href="css/admin-inventory.css?v=1"
    >

</head>

<body>

    <div class="menu-container">


        <aside class="sidebar">

            <div class="sidebar-logo">

                <span class="logo-black">
                    KKOPI
                </span>

                <span class="logo-white">
                    .TEA
                </span>

            </div>


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


        <main class="main-content">


            <header class="top-header">

                <div class="header-title">

                    <div class="welcome-badge">

                        <span class="welcome-dot"></span>

                        ADMIN INVENTORY

                    </div>

                    <h1>
                        Inventory Management
                    </h1>

                    <p>
                        Monitor your stock and keep your supplies on track.
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


            <section class="menu-management-section">


                <div class="menu-page-heading">

                    <div class="menu-page-title">

                        <div class="section-icon">

                            <i class="fa-solid fa-boxes-stacked"></i>

                        </div>

                        <div>

                            <h2>
                                Items
                            </h2>

                        </div>

                    </div>


                    <a
                        href="add-item.php"
                        class="add-product-button"
                    >

                        <span class="add-product-icon">

                            <i class="fa-solid fa-plus"></i>

                        </span>

                        <span>
                            Add New Item
                        </span>

                    </a>

                </div>


                <div class="product-management-card">


                    <div class="product-toolbar">


                        <div class="toolbar-left">


                            <div class="product-search">

                                <i class="fa-solid fa-magnifying-glass"></i>

                                <input
                                    type="text"
                                    id="item-search"
                                    placeholder="Search item..."
                                    autocomplete="off"
                                >

                            </div>


                            <div class="category-filter-wrapper">

                                <i class="fa-solid fa-layer-group"></i>

                                <select
                                    id="category-filter"
                                    class="category-filter"
                                >

                                    <option value="all">
                                        All Categories
                                    </option>

                                    <option value="tea">
                                        Tea
                                    </option>

                                    <option value="syrup">
                                        Syrup
                                    </option>

                                    <option value="milk">
                                        Milk
                                    </option>

                                    <option value="toppings">
                                        Toppings
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div class="toolbar-right">

                            <span class="filter-label">
                                Showing
                            </span>

                            <span
                                class="visible-product-count"
                                id="visible-item-count"
                            >
                                0
                            </span>

                            <span class="filter-label">
                                items
                            </span>

                        </div>

                    </div>


                    <div class="product-table-container">

                        <table class="product-table">

                            <thead>

                                <tr>

                                    <th class="product-column">
                                        Item
                                    </th>

                                    <th class="category-column">
                                        Category
                                    </th>

                                    <th class="stock-column">
                                        Stock
                                    </th>

                                    <th class="unit-column">
                                        Unit
                                    </th>

                                    <th class="status-column">
                                        Status
                                    </th>

                                    <th class="actions-column">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody id="item-table-body">

                                <tr class="table-loading-row">

                                    <td colspan="6">

                                        <div class="table-loading">

                                            <div class="loading-icon">

                                                <i class="fa-solid fa-boxes-stacked"></i>

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

                            </tbody>

                        </table>

                    </div>


                    <div class="table-footer">

                        <div class="product-count">

                            <span id="item-count">
                                Loading items...
                            </span>

                        </div>


                        <div
                            class="pagination"
                            id="item-pagination"
                        >

                            <button
                                type="button"
                                class="pagination-button previous-button"
                                id="previous-page"
                                disabled
                            >

                                <i class="fa-solid fa-chevron-left"></i>

                            </button>


                            <button
                                type="button"
                                class="pagination-button active"
                                id="current-page"
                            >
                                1
                            </button>


                            <button
                                type="button"
                                class="pagination-button next-button"
                                id="next-page"
                                disabled
                            >

                                <i class="fa-solid fa-chevron-right"></i>

                            </button>

                        </div>

                    </div>

                </div>

            </section>


            <script
                type="module"
                src="js/inventory.js?v=1"
            ></script>
            <script src="js/theme.js?v=1"></script>

        </main>

    </div>

</body>

</html>