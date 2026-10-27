<?php

$pageTitle = "Orders";
$adminName = "Admin";
$adminRole = "Administrator";
$currentDate = date("F j, Y");

$menuItems = [
    ["name" => "Dashboard", "href" => "admin-dashboard.php", "icon" => "fa-house"],
    ["name" => "Menu Management", "href" => "menu-management.php", "icon" => "fa-book-open"],
    ["name" => "Inventory", "href" => "admin-inventory.php", "icon" => "fa-boxes-stacked"],
    ["name" => "Orders", "href" => "admin-orders.php", "icon" => "fa-receipt"],
    ["name" => "Reports", "href" => "admin-reports.php", "icon" => "fa-chart-column"],
    ["name" => "Users", "href" => "admin-users.php", "icon" => "fa-users"],
    ["name" => "Settings", "href" => "admin-settings.php", "icon" => "fa-gear"]
];

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?> | KKOPI.TEA</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Baloo+Thambi&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="css/manual-orders.css?v=2">
    <link rel="stylesheet" href="css/admin-responsive.css?v=4">
</head>
<body>
<div class="users-container">

    <aside class="sidebar">
        <div class="sidebar-logo">
            <span class="logo-black">KKOPI</span><span class="logo-white">.TEA</span>
        </div>

        <nav class="sidebar-menu">
            <div class="navigation-section">
                <span class="navigation-title">MAIN</span>

                <?php foreach ($menuItems as $item): ?>
                    <?php $activeClass = $item["name"] === $pageTitle ? "active" : ""; ?>
                    <a href="<?php echo htmlspecialchars($item["href"]); ?>"
                       class="menu-item <?php echo $activeClass; ?>">
                        <span class="menu-icon">
                            <i class="fa-solid <?php echo htmlspecialchars($item["icon"]); ?>"></i>
                        </span>
                        <span class="menu-text"><?php echo htmlspecialchars($item["name"]); ?></span>
                    </a>
                <?php endforeach; ?>
            </div>
        </nav>

        <div class="sidebar-bottom">
            <a href="admin-login.php" class="menu-item logout">
                <span class="menu-icon"><i class="fa-solid fa-right-from-bracket"></i></span>
                <span class="menu-text">Logout</span>
            </a>
        </div>
    </aside>

    <main class="main-content">
        <header class="top-header">
            <div class="header-title">
                <div class="welcome-badge">
                    <span class="welcome-dot"></span>
                    ADMIN
                </div>
                <h1>Manual Orders</h1>
                <p>Manage your manual orders with ease.</p>
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

        <section class="add-product-section">
            <div class="add-product-top">
                <div class="breadcrumb">
                    <a href="admin-orders.php">Orders</a>
                    <i class="fa-solid fa-chevron-right"></i>
                    <span>Manual Orders</span>
                </div>

                <a href="admin-orders.php" class="back-menu-button">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back to Orders</span>
                </a>
            </div>

            <div class="manual-order-layout">
                <section class="manual-order-card">
                    <div class="card-heading">
                        <div class="heading-icon"><i class="fa-solid fa-mug-hot"></i></div>
                        <div>
                            <h2>Add Manual Order</h2>
                            <p>Choose products from your menu and add them to this order.</p>
                        </div>
                    </div>

                    <form id="manual-order-form" autocomplete="off">
                        <div class="form-grid">
                            <div class="form-field">
                                <label for="category-filter">Category</label>
                                <select id="category-filter" required>
                                    <option value="all">Loading categories...</option>
                                </select>
                            </div>

                            <div class="form-field product-search-field">
                                <label for="product-search">Search Product</label>
                                <div class="search-wrap">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="product-search" placeholder="Search product name..."  autocomplete="off">
                                </div>
                                <div id="product-search-results" class="product-search-results" hidden></div>
                            </div>

                            <div class="form-field">
                                <label for="product-name">Product Name</label>
                                <input type="text" id="product-name" placeholder="Select a product" readonly>
                            </div>

                            <div class="form-field">
                                <label for="product-base-price">Base Price</label>
                                <input type="text" id="product-base-price" placeholder="₱0.00" readonly>
                            </div>

                            <div class="form-field">
                                <label for="product-size">Size</label>
                                <select id="product-size">
                                <option value="">Select a product first</option>
                            </select>
                             </div>

                            <div class="form-field">
                                <label for="product-quantity">Quantity</label>
                                <input type="number" id="product-quantity" min="1" step="1" value="1">
                            </div>
                        </div>

                        <div class="selected-price-row">
                            <div>
                                <span>Price per item</span>
                                <strong id="unit-price">₱0.00</strong>
                            </div>
                            <div class="selected-subtotal">
                                <span>Item subtotal</span>
                                <strong id="product-subtotal">₱0.00</strong>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" id="clear-product" class="secondary-button">
                                <i class="fa-solid fa-rotate-left"></i> Clear
                            </button>
                            <button type="button" id="add-item-button" class="primary-button" disabled>
                                <i class="fa-solid fa-plus"></i> Add Orders
                            </button>
                        </div>
                    </form>
                    <p id="product-load-message" class="help-message">Loading products from Firestore...</p>
                    <p id="form-message" class="form-message" role="status" aria-live="polite"></p>
                </section>

                <section class="manual-order-card order-details-card">
                    <div class="card-heading">
                        <div class="heading-icon"><i class="fa-solid fa-receipt"></i></div>
                        <div>
                            <h2>Order Details</h2>
                            <p>Review the items before saving the manual order.</p>
                        </div>
                    </div>

                    <div class="form-grid order-customer-fields">
                        <div class="form-field">
                            <label for="customer-name">Customer Name</label>
                            <input type="text" id="customer-name" value="Walk-in Customer" maxlength="100" required>
                        </div>
                        <div class="form-field">
                            <label for="fulfillment">Fulfillment</label>
                            <select id="fulfillment">
                                <option value="Pickup">Pickup</option>
                                <option value="Dine-in">Dine-in</option>
                            </select>
                        </div>
                    </div>

                    <div class="cart-heading">
                        <h3>Selected Items</h3>
                        <span id="cart-count">0 items</span>
                    </div>

                    <div class="cart-table-wrap">
                        <table class="cart-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Subtotal</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="cart-items">
                                <tr class="cart-empty-row">
                                    <td colspan="5">No items added yet.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="order-total-row">
                        <span>Order Total</span>
                        <strong id="order-total">₱0.00</strong>
                    </div>

                    <button type="button" id="create-order-button"
                        class="primary-button create-order-button" disabled>
                        <i class="fa-solid fa-check"></i> Create Manual Order
                    </button>

                </section>
            </div>
        </section>
    </main>
</div>

<script type="module" src="js/manual-order.js?v=2"></script>
<script src="js/theme.js?v=1"></script>
</body>
</html>
