<?php

$pageTitle = "Menu Management";

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
        href="css/menu-management.css?v=4"
    >

    <link
        rel="stylesheet"
        href="css/admin-responsive.css?v=4"
    >

</head>

<body>

    <div class="menu-container">


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

                         ADMIN MENU

                    </div>

                    <h1>
                        Menu Management
                    </h1>

                    <p>
                        Manage your products and keep your menu up to date.
                    </p>

                </div>

                <!-- ADMIN PROFILE -->

                <div class="admin-profile">


                    <div class="admin-information">

                         <strong id="adminGreeting">
                        <?php echo $adminName; ?>
                    </strong>

                    <span id="adminRole">
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



<!-- MENU MANAGEMENT -->

<section class="menu-management-section">

    <div class="menu-page-heading">

        <div class="menu-page-title">

            <div class="section-icon">
                <i class="fa-solid fa-mug-hot"></i>
            </div>

            <div>
                <h2>Products</h2>
            </div>

        </div>

        <div class="menu-heading-actions">
            <div class="advertisement-dropdown" id="advertisement-dropdown">
                <button
                    type="button"
                    class="advertisement-menu-button"
                    id="advertisement-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                >
                    <i class="fa-solid fa-bullhorn"></i>
                    <span>Advertisements</span>
                    <i class="fa-solid fa-chevron-down dropdown-chevron"></i>
                </button>
                <div
                    class="advertisement-dropdown-menu"
                    id="advertisement-dropdown-menu"
                    hidden
                >
                    <button type="button" id="manage-advertisements-button">
                        <i class="fa-solid fa-rectangle-ad"></i>
                        Manage Advertisements
                    </button>
                    <button type="button" id="new-advertisement-button">
                        <i class="fa-solid fa-plus"></i>
                        Create Advertisement
                    </button>
                </div>
            </div>

            <a
                href="add-product.php"
                class="add-product-button"
            >
                <span class="add-product-icon">
                    <i class="fa-solid fa-plus"></i>
                </span>
                <span>Add New Product</span>
            </a>
        </div>

    </div>

    <section
        class="advertisement-manager-card"
        id="advertisement-manager-card"
        hidden
        aria-labelledby="advertisement-manager-title"
    >
        <div class="advertisement-manager-heading">
            <div>
                <span class="advertisement-eyebrow">PROMOTIONS</span>
                <h2 id="advertisement-manager-title">Manage Advertisements</h2>
                <p>Create campaigns with up to five images and multiple menu products.</p>
            </div>
            <button
                type="button"
                class="advertisement-close-button"
                id="close-advertisements-button"
                aria-label="Close advertisement manager"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="advertisement-manager-toolbar">
            <span id="advertisement-count">Loading advertisements...</span>
            <button
                type="button"
                class="advertisement-create-button"
                id="create-advertisement-button"
            >
                <i class="fa-solid fa-plus"></i>
                Create Advertisement
            </button>
        </div>

        <div
            class="advertisement-list"
            id="advertisement-list"
            aria-live="polite"
        >
            <div class="advertisement-list-message">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading advertisements...
            </div>
        </div>
    </section>

    <div
        class="advertisement-modal-backdrop"
        id="advertisement-modal-backdrop"
        hidden
    >
        <section
            class="advertisement-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="advertisement-form-title"
        >
            <div class="advertisement-modal-header">
                <div>
                    <span class="advertisement-eyebrow">CAMPAIGN SETUP</span>
                    <h2 id="advertisement-form-title">Create Advertisement</h2>
                    <p>Add campaign images and choose one or more existing products.</p>
                    <p class="advertisement-compatibility-note">
                        The current app banner uses the first campaign image and first selected product.
                    </p>
                </div>
                <button
                    type="button"
                    class="advertisement-close-button"
                    id="cancel-advertisement-button"
                    aria-label="Close form"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form id="advertisement-form">
                <input type="hidden" id="advertisement-id">

                <div class="advertisement-form-grid">
                    <div class="advertisement-form-field">
                        <label for="advertisement-title">Campaign title</label>
                        <input
                            type="text"
                            id="advertisement-title"
                            maxlength="80"
                            placeholder="e.g. Weekend specials"
                            required
                        >
                    </div>

                    <div class="advertisement-form-field">
                        <label for="advertisement-images">
                            Advertisement images
                            <span id="advertisement-image-count">0 / 5</span>
                        </label>
                        <label class="advertisement-upload-zone" for="advertisement-images">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <strong>Add up to 5 images</strong>
                            <small>JPG or PNG, up to 5MB each. Recommended: 1200 × 675 px (16:9); full image shown without cropping.</small>
                        </label>
                        <input
                            type="file"
                            id="advertisement-images"
                            accept="image/jpeg,image/png,image/jpg"
                            multiple
                            hidden
                        >
                        <div
                            class="advertisement-image-previews"
                            id="advertisement-image-previews"
                        ></div>
                    </div>

                    <div class="advertisement-form-field">
                        <label>
                            Products to advertise
                            <span id="advertisement-product-count">0 selected</span>
                        </label>
                        <input
                            type="search"
                            id="advertisement-product-search"
                            class="advertisement-product-search"
                            placeholder="Search existing products"
                            autocomplete="off"
                        >
                        <div
                            class="advertisement-product-list"
                            id="advertisement-product-list"
                            role="group"
                            aria-label="Select products for this advertisement"
                        >
                            <p class="advertisement-list-message">Loading products...</p>
                        </div>
                    </div>

                    <div class="advertisement-form-options">
                        <label class="advertisement-option">
                            <input type="checkbox" id="advertisement-bogo">
                            <span class="advertisement-option-check"></span>
                            <span>
                                <strong>Buy One, Take One</strong>
                                <small>Optional promotion for this campaign.</small>
                            </span>
                        </label>
                        <label class="advertisement-option">
                            <input type="checkbox" id="advertisement-active" checked>
                            <span class="advertisement-option-check"></span>
                            <span>
                                <strong>Campaign is active</strong>
                                <small>Inactive campaigns are kept but not advertised.</small>
                            </span>
                        </label>
                    </div>
                </div>

                <p class="advertisement-form-message" id="advertisement-form-message" role="status"></p>
                <div class="advertisement-modal-actions">
                    <button
                        type="button"
                        class="advertisement-cancel-button"
                        id="dismiss-advertisement-form-button"
                    >Cancel</button>
                    <button
                        type="submit"
                        class="advertisement-create-button"
                        id="save-advertisement-button"
                    >
                        <i class="fa-solid fa-floppy-disk"></i>
                        Save Advertisement
                    </button>
                </div>
            </form>
        </section>
    </div>


    <div class="product-management-card">

        <div class="product-toolbar">

            <div class="toolbar-left">

                <div class="product-search">

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <input
                        type="text"
                        id="product-search"
                        placeholder="Search products..."
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

                        <option value="milktea">
                            Milk Tea
                        </option>

                        <option value="coffee">
                            Coffee
                        </option>

                        <option value="snacks">
                            Snacks
                        </option>

                        <option value="frappe">
                            Frappe
                        </option>

                        <option value="fruittea">
                            Fruit Tea
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
                    id="visible-product-count"
                >
                    0
                </span>

                <span class="filter-label">
                    products
                </span>

            </div>

        </div>


        <div class="product-table-container">

            <table class="product-table">

                <thead>

                    <tr>

                        <th class="product-column">
                            Product
                        </th>

                        <th class="category-column">
                            Category
                        </th>

                        <th class="price-column">
                            Price
                        </th>

                        <th class="status-column">
                            Status
                        </th>

                        <th class="actions-column">
                            Actions
                        </th>

                    </tr>

                </thead>


                <tbody id="product-table-body">

                    <tr class="table-loading-row">

                        <td colspan="5">

                            <div class="table-loading">

                                <div class="loading-icon">
                                    <i class="fa-solid fa-mug-hot"></i>
                                </div>

                                <strong>
                                    Loading your menu
                                </strong>

                                <span>
                                    Please wait while we load your products.
                                </span>

                            </div>

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>


        <div class="table-footer">

            <div class="product-count">

                <span id="product-count">
                    Loading products...
                </span>

            </div>


            <div
                class="pagination"
                id="product-pagination"
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


<script type="module" src="js/menu-management.js?v=3"></script>
<script src="js/theme.js?v=2"></script>
        </main>
    </body>
</html>