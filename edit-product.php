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
        href="css/edit-product.css?v=1"
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

                         ADMIN

                    </div>

                    <h1>
                        Edit Product
                    </h1>
                     <p>
                         manage your menu with ease.
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
        <!-- ADD PRODUCT -->

<section class="add-product-section">

    <div class="add-product-top">

        <div class="breadcrumb">

            <a href="menu-management.php">
                Menu Management
            </a>

            <i class="fa-solid fa-chevron-right"></i>

            <span>
                Edit Product
            </span>

        </div>


        <a
            href="menu-management.php"
            class="back-menu-button"
        >

            <i class="fa-solid fa-arrow-left"></i>

            <span>
                Back to Menu Management
            </span>

        </a>

    </div>


    <div class="add-product-card">


        <div class="form-heading">

            <div class="form-heading-icon">
                <i class="fa-solid fa-mug-hot"></i>
            </div>

            <div>

                <h2>
                    Product Information
                </h2>

                <p>
                    Edit the details of your existing product.
                </p>

            </div>

        </div>


        <form
            id="edit-product-form"
            class="add-product-form"
        >


            <div class="product-form-layout">


                <!-- PRODUCT IMAGE -->

                <div class="image-form-group">

                    <label class="form-label">
                        Product Image
                        <span class="required-mark">*</span>
                    </label>


                    <div
                        class="image-upload-box"
                        id="image-upload-box"
                    >

                        <input
                            type="file"
                            id="product-image"
                            accept="image/png,image/jpeg,image/jpg"
                            hidden
                        >


                        <div
                            class="image-upload-content"
                            id="image-upload-content"
                        >

                            <div class="upload-icon">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                            </div>


                            <strong>
                                Drag & drop your image here
                            </strong>


                            <span>
                                or
                            </span>


                            <button
                                type="button"
                                class="upload-button"
                                id="upload-button"
                            >
                                <i class="fa-solid fa-upload"></i>
                                Click to upload
                            </button>


                            <small>
                                PNG or JPG • Maximum 5MB
                            </small>

                        </div>


                        <div
                            class="image-preview"
                            id="image-preview"
                            hidden
                        >

                            <img
                                id="preview-image"
                                src=""
                                alt="Product preview"
                            >


                            <button
                                type="button"
                                class="remove-image-button"
                                id="remove-image-button"
                                title="Remove image"
                            >
                                <i class="fa-solid fa-xmark"></i>
                            </button>


                            <div class="change-image-button">
                                <i class="fa-solid fa-camera"></i>
                                Change Image
                            </div>

                        </div>

                    </div>


                    <span
                        class="field-error"
                        id="image-error"
                    ></span>

                </div>


                <!-- RIGHT FORM -->

                <div class="product-details-form">


                    <!-- PRODUCT NAME -->

                    <div class="form-group">

                        <label
                            for="product-name"
                            class="form-label"
                        >
                            Product Name
                            <span class="required-mark">*</span>
                        </label>


                        <div class="input-wrapper">

                            <i class="fa-solid fa-tag input-icon"></i>

                            <input
                                type="text"
                                id="product-name"
                                name="name"
                                placeholder="Enter product name"
                                maxlength="80"
                                autocomplete="off"
                            >

                        </div>


                        <span
                            class="field-error"
                            id="name-error"
                        ></span>

                    </div>


                    <!-- CATEGORY -->

                    <div class="form-group">

                        <label
                            for="product-category"
                            class="form-label"
                        >
                            Category
                            <span class="required-mark">*</span>
                        </label>


                        <div class="input-wrapper">

                            <i class="fa-solid fa-layer-group input-icon"></i>


                            <select
                                id="product-category"
                                name="category"
                            >

                                <option value="milktea">
                                    Milk Tea
                                </option>

                                <option value="coffee">
                                    Coffee
                                </option>

                            </select>


                            <i class="fa-solid fa-chevron-down select-icon"></i>

                        </div>


                        <span
                            class="field-error"
                            id="category-error"
                        ></span>

                    </div>


                    <!-- PRICE -->

                    <div class="form-group">

                        <label
                            for="product-price"
                            class="form-label"
                        >
                            Base Price
                            <span class="required-mark">*</span>
                        </label>


                        <div class="price-input-wrapper">

                            <span class="currency-symbol">
                                ₱
                            </span>


                            <input
                                type="number"
                                id="product-price"
                                name="price"
                                placeholder="Enter price"
                                min="0"
                                max="999999"
                                step="0.01"
                            >

                        </div>


                        <span
                            class="field-error"
                            id="price-error"
                        ></span>

                    </div>


                    <!-- STATUS -->

                    <div class="form-group">

                        <label
                            for="product-status"
                            class="form-label"
                        >
                            Status
                            <span class="required-mark">*</span>
                        </label>


                        <div class="input-wrapper status-wrapper">

                            <i class="fa-solid fa-circle-check input-icon"></i>


                            <select
                                id="product-status"
                                name="status"
                            >

                                <option value="active">
                                    Available
                                </option>

                                <option value="inactive">
                                    Unavailable
                                </option>

                            </select>


                            <i class="fa-solid fa-chevron-down select-icon"></i>

                        </div>

                    </div>

                </div>

            </div>

            <!-- PRODCUCT OPTION --> 

            <div class="product-options-section">

    <div class="product-options-header">
        <div class="product-options-icon">
            <i class="fa-solid fa-sliders"></i>
        </div>

        <div>
            <h3>Product Options</h3>
            <p>Set the available sizes and sugar levels for this product.</p>
        </div>
    </div>

    <div class="product-option-group">

        <div class="product-option-title">
            <div>
                <span>Sizes</span>
                <small>Select available sizes and set additional prices.</small>
            </div>
        </div>

        <div class="size-options-list">

            <div class="size-option-row">

                <label class="circle-option">
                    <input type="checkbox" name="sizes[]" value="small">
                    <span class="circle-check"></span>
                    <span class="circle-option-text">Small</span>
                </label>

                <div class="additional-price-input">
                    <span>₱</span>
                    <input
                        type="number"
                        name="small_additional"
                        min="0"
                        step="0.01"
                        value="0"
                        placeholder="0"
                    >
                </div>

            </div>
            
            <div class="size-option-row">

                <label class="circle-option">
                    <input type="checkbox" name="sizes[]" value="medium">
                    <span class="circle-check"></span>
                    <span class="circle-option-text">Medium</span>
                </label>

                <div class="additional-price-input">
                    <span>₱</span>
                    <input
                        type="number"
                        name="medium_additional"
                        min="0"
                        step="0.01"
                        value="0"
                        placeholder="0"
                    >
                </div>

            </div>

            <div class="size-option-row">

                <label class="circle-option">
                    <input type="checkbox" name="sizes[]" value="large">
                    <span class="circle-check"></span>
                    <span class="circle-option-text">Large</span>
                </label>

                <div class="additional-price-input">
                    <span>₱</span>
                    <input
                        type="number"
                        name="large_additional"
                        min="0"
                        step="0.01"
                        value="0"
                        placeholder="0"
                    >
                </div>

            </div>

        </div>

    </div>

        
    <div class="product-option-divider"></div>


    <div class="product-option-group">

        <div class="product-option-title">
            <div>
                <span>Sugar Levels</span>
                <small>Select the sugar levels available for this product.</small>
            </div>
        </div>

        <div class="sugar-options-list">

            <label class="circle-option sugar-option">
                <input type="checkbox" name="sugar_levels[]" value="0%">
                <span class="circle-check"></span>
                <span class="circle-option-text">0%</span>
            </label>

            <label class="circle-option sugar-option">
                <input type="checkbox" name="sugar_levels[]" value="25%">
                <span class="circle-check"></span>
                <span class="circle-option-text">25%</span>
            </label>

            <label class="circle-option sugar-option">
                <input type="checkbox" name="sugar_levels[]" value="50%">
                <span class="circle-check"></span>
                <span class="circle-option-text">50%</span>
            </label>

            <label class="circle-option sugar-option">
                <input type="checkbox" name="sugar_levels[]" value="75%">
                <span class="circle-check"></span>
                <span class="circle-option-text">75%</span>
            </label>

            <label class="circle-option sugar-option">
                <input type="checkbox" name="sugar_levels[]" value="100%">
                <span class="circle-check"></span>
                <span class="circle-option-text">100%</span>
            </label>

        </div>

    </div>

</div>


            <!-- DESCRIPTION -->

            <div class="description-form-group">

                <div class="description-label-row">

                    <label
                        for="product-description"
                        class="form-label"
                    >
                        Description
                        <span class="optional-text">
                            Optional
                        </span>
                    </label>


                    <span
                        class="character-counter"
                        id="character-counter"
                    >
                        0 / 300
                    </span>

                </div>


                <textarea
                    id="product-description"
                    name="description"
                    maxlength="300"
                    placeholder="Enter a short description of your product..."
                ></textarea>

            </div>


            <!-- FORM MESSAGE -->

            <div
                class="form-message"
                id="form-message"
            >

                <i class="fa-solid fa-circle-info"></i>

                <span id="form-message-text"></span>

            </div>


            <!-- FORM ACTIONS -->

            <div class="form-actions">

                <a
                    href="menu-management.php"
                    class="cancel-button"
                >
                    Cancel
                </a>


                <button
                    type="submit"
                    class="save-product-button"
                    id="save-product-button"
                >

                    <span class="button-icon">
                        <i class="fa-solid fa-pen"></i>
                    </span>

                    <span>
                        Save Changes
                    </span>

                </button>

            </div>


        </form>

    </div>

</section>


<script type="module" src="js/edit-product.js?v=2"></script>
<script src="js/theme.js?v=2"></script>
        </main>
    </body>
</html>