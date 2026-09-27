<?php


$pageTitle = "Settings";

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
        href="https://fonts.googleapis.com"
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
        href="css/admin-settings.css?v=4"
    >

    <link
        rel="stylesheet"
        href="css/admin-responsive.css?v=1"
    >

</head>

<body>

    <div class="settings-container">


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


        <!-- MAIN CONTENT -->

        <main class="main-content">


                    <!-- HEADER -->

                    <header class="top-header">

            <div class="header-title">

                <div class="welcome-badge">

                    <span class="welcome-dot"></span>

                    ADMIN SETTINGS

                </div>

                <h1>
                    Settings
                </h1>

                <p>
                     Manage your store information, appearance, and administrator account.
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


            <!-- SETTINGS CONTENT -->

            <section class="settings-content">


                <!-- PAGE INTRO -->

                <div class="settings-intro">

                    <div
                        class="settings-save-status"
                        id="settings-save-status"
                    >

                        <span class="save-status-dot"></span>

                        <span id="settings-save-text">
                            Loading settings...
                        </span>

                    </div>

                </div>


                <!-- STORE INFORMATION -->

                <section class="settings-card">

                    <div class="settings-card-header">

                        <div class="settings-card-icon orange-icon">

                            <i class="fa-solid fa-store"></i>

                        </div>

                        <div class="settings-card-title">

                            <span>
                                STORE INFORMATION
                            </span>

                            <h3>
                                Store Information
                            </h3>

                            <p>
                                Update the information displayed on your public website.
                            </p>

                        </div>

                    </div>


                    <div class="settings-form-grid">


                        <div class="settings-field">

                            <label for="store-name">
                                Store Name
                            </label>

                            <div class="settings-input">

                                <span class="input-icon">

                                    <i class="fa-solid fa-store"></i>

                                </span>

                                <input
                                    type="text"
                                    id="store-name"
                                    placeholder="Loading..."
                                >

                            </div>

                        </div>


                        <div class="settings-field">

                            <label for="store-contact">
                                Contact Number
                            </label>

                            <div class="settings-input">

                                <span class="input-icon">

                                    <i class="fa-solid fa-phone"></i>

                                </span>

                                <input
                                    type="text"
                                    id="store-contact"
                                    placeholder="Loading..."
                                >

                            </div>

                        </div>


                        <div class="settings-field">

                            <label for="store-address">
                                Store Address
                            </label>

                            <div class="settings-input">

                                <span class="input-icon">

                                    <i class="fa-solid fa-location-dot"></i>

                                </span>

                                <input
                                    type="text"
                                    id="store-address"
                                    placeholder="Loading..."
                                >

                            </div>

                        </div>


                        <div class="settings-field">

                            <label for="store-email">
                                Email Address
                            </label>

                            <div class="settings-input">

                                <span class="input-icon">

                                    <i class="fa-solid fa-envelope"></i>

                                </span>

                                <input
                                    type="email"
                                    id="store-email"
                                    placeholder="Loading..."
                                >

                            </div>

                        </div>

                        <div class="settings-field">

                            <label for="store-hours">
                                Store Hours
                            </label>

                            <div class="settings-input">

                                <span class="input-icon">

                                    <i class="fa-regular fa-clock"></i>

                                </span>

                                <input
                                    type="text"
                                    id="store-hours"
                                    placeholder="Loading..."
                                >

                            </div>

                        </div>

                    </div>


                    <div class="settings-card-note">

                        <div class="note-icon">

                            <i class="fa-solid fa-globe"></i>

                        </div>

                        <div>

                            <strong>
                                Connected to your website
                            </strong>

                            <p>
                                Changes made here will also appear on your public Contact page.
                            </p>

                        </div>

                    </div>

                </section>


                <!-- THEME -->

                <section class="settings-card">

                    <div class="settings-card-header">

                        <div class="settings-card-icon purple-icon">

                            <i class="fa-solid fa-palette"></i>

                        </div>

                        <div class="settings-card-title">

                            <span>
                                APPEARANCE
                            </span>

                            <h3>
                                Theme Preferences
                            </h3>

                            <p>
                                Choose your preferred admin panel appearance.
                            </p>

                        </div>

                    </div>


                    <div class="theme-options">


                        <button
                            type="button"
                            class="theme-option active"
                            id="light-theme"
                        >

                            <div class="theme-option-icon">

                                <i class="fa-solid fa-sun"></i>

                            </div>

                            <div>

                                <strong>
                                    Light
                                </strong>

                                <span>
                                    Clean and bright
                                </span>

                            </div>

                            <i class="fa-solid fa-circle-check theme-check"></i>

                        </button>


                        <button
                            type="button"
                            class="theme-option"
                            id="dark-theme"
                        >

                            <div class="theme-option-icon dark-option-icon">

                                <i class="fa-solid fa-moon"></i>

                            </div>

                            <div>

                                <strong>
                                    Dark
                                </strong>

                                <span>
                                    Easier on the eyes
                                </span>

                            </div>

                            <i class="fa-solid fa-circle-check theme-check"></i>

                        </button>

                    </div>

                </section>


                            <!-- ACCOUNT -->

                <section class="settings-card">

                    <div class="settings-card-header">

                        <div class="settings-card-icon blue-icon">

                            <i class="fa-solid fa-user-shield"></i>

                        </div>

                        <div class="settings-card-title">

                            <span>
                                ADMINISTRATOR
                            </span>

                            <h3>
                                Account Information
                            </h3>

                            <p>
                                Update the administrator email and password.
                            </p>

                        </div>

                    </div>


                    <div class="settings-form-grid">

                        <div class="settings-field">

                            <label for="admin-email">
                                Administrator Email
                            </label>

                            <div class="settings-input">

                                <span class="input-icon">

                                    <i class="fa-solid fa-envelope"></i>

                                </span>

                                <input
                                    type="email"
                                    id="admin-email"
                                    placeholder="Loading..."
                                >

                            </div>

                        </div>


                        <div class="settings-field">

                            <label for="admin-password">
                                Administrator Password
                            </label>

                            <div class="settings-input">

                                <span class="input-icon">

                                    <i class="fa-solid fa-lock"></i>

                                </span>

                                <input
                                    type="password"
                                    id="admin-password"
                                    placeholder="Enter new password"
                                >

                            </div>

                        </div>

                    </div>

                </section>
                <!-- ACTIONS -->

                <div class="settings-actions">

                    <button
                        type="button"
                        class="reset-settings-button"
                        id="reset-settings"
                    >

                        <i class="fa-solid fa-rotate-left"></i>

                        Reset

                    </button>


                    <button
                        type="button"
                        class="save-settings-button"
                        id="save-settings"
                    >

                        <i class="fa-solid fa-check"></i>

                        Save Changes

                    </button>

                </div>


            </section>

        </main>

    </div>


    <script
        type="module"
        src="js/settings.js?v=4"
    ></script>
    <script src="js/theme.js?v=5"></script>

</body>

</html>