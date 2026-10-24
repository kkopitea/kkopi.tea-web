
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

$menuCategories = [
    "milktea" => "Milk Tea",
    "coffee" => "Coffee",
    "snack" => "Snack",
    "frappe" => "Frappe",
    "fruit-tea" => "Fruit Tea"
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
        Set Measurement | KKOPI.TEA
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
        href="css/measure.css?v=2"
    >

</head>

<body>

    <div class="users-container">

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
                            href="<?php echo htmlspecialchars($item["href"]); ?>"
                            class="menu-item <?php echo $activeClass; ?>"
                        >

                            <span class="menu-icon">

                                <i
                                    class="fa-solid <?php echo htmlspecialchars($item["icon"]); ?>"
                                ></i>

                            </span>

                            <span class="menu-text">
                                <?php echo htmlspecialchars($item["name"]); ?>
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

                        ADMIN

                    </div>

                    <h1>
                        Measurement
                    </h1>

                    <p>
                        Set ingredient measurements for each menu product.
                    </p>

                </div>

                <!-- ADMIN PROFILE -->

                <div class="admin-profile">

                    <div class="admin-information">

                        <strong id="adminGreeting">
                            <?php echo htmlspecialchars($adminName); ?>
                        </strong>

                        <span id="adminRole">
                            <?php echo htmlspecialchars($adminRole); ?>
                        </span>

                        <small>
                            <?php echo htmlspecialchars($currentDate); ?>
                        </small>

                    </div>

                    <div class="admin-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>

                </div>

            </header>

            <!-- SET MEASURE -->

            <section class="add-product-section">

                <!-- BREADCRUMB AND BACK BUTTON -->

                <div class="add-product-top">

                    <div class="breadcrumb">

                        <a href="admin-inventory.php">
                            Inventory
                        </a>

                        <i class="fa-solid fa-chevron-right"></i>

                        <span>
                            Set Measurement
                        </span>

                    </div>

                    <a
                        href="admin-inventory.php"
                        class="back-menu-button"
                    >

                        <i class="fa-solid fa-arrow-left"></i>

                        <span>
                            Back to Inventory Management
                        </span>

                    </a>

                </div>

                <!-- PRODUCT SELECTION -->

                <div class="measurement-card">

                    <div class="card-heading">

                        <div>
                            <h3>
                                Select Product
                            </h3>

                            <p>
                                Choose a category, then select the menu product.
                            </p>
                        </div>

                        <span class="step-number">
                            01
                        </span>

                    </div>

                    <div class="selection-grid">

                        <div class="form-group">

                            <label for="menu-category">
                                Menu Category
                            </label>

                            <select
                                id="menu-category"
                                name="menuCategory"
                                required
                            >

                                <option value="">
                                    Select a category
                                </option>

                                <?php foreach ($menuCategories as $value => $label): ?>

                                    <option value="<?php echo htmlspecialchars($value); ?>">
                                        <?php echo htmlspecialchars($label); ?>
                                    </option>

                                <?php endforeach; ?>

                            </select>

                        </div>

                        <div class="form-group">

                            <label for="menu-product">
                                Menu Product
                            </label>

                            <select
                                id="menu-product"
                                name="menuProduct"
                                disabled
                                required
                            >

                                <option value="">
                                    Select a category first
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                
<!-- INVENTORY MEASUREMENTS -->

<div class="measurement-card">

    <div class="card-heading">
        <div>
            <h3>Ingredient Measurements</h3>
            <p>
                Add only the ingredients needed to prepare one serving
                of your selected product.
            </p>
        </div>

        <span class="step-number">02</span>
    </div>

    <div class="measurement-note">
        <p>
            Use the Add Ingredient button under each category.
            Select an inventory item and enter the quantity needed.
            Categories and ingredient fields are optional.
        </p>
    </div>

    <!-- INGREDIENT CATEGORIES AND ROWS LOAD HERE -->

    <div id="measurement-items" class="measurement-items">

        <div class="empty-measurement-state">
            <i class="fa-solid fa-list-check"></i>
            <p>
                Select a menu product to start adding ingredients.
            </p>
        </div>

    </div>

    <!-- SAVE BUTTON -->

    <div class="measurement-actions">
        <button
            type="button"
            id="save-measurements"
            class="save-measurements-button"
            disabled
        >
            <i class="fa-solid fa-floppy-disk"></i>
            Save Measurements
        </button>
    </div>

</div>


            </section>

        </main>

    </div>

   <script src="js/theme.js?v=2"></script>
    <script type="module" src="js/measure.js"></script> 
</body>

</html>
