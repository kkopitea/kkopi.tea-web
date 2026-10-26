
<?php

$pageTitle = "Users";
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

    <title>Edit User | KKOPI.TEA</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">

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
        href="css/edit-users.css?v=2"
    >

    <link
        rel="stylesheet"
        href="css/admin-responsive.css?v=4"
    >

</head>

<body>

    <div class="users-container">

        <!-- SIDEBAR -->

        <aside class="sidebar">

            <div class="sidebar-logo">
                <span class="logo-black">KKOPI</span>
                <span class="logo-white">.TEA</span>
            </div>

            <nav class="sidebar-menu">

                <div class="navigation-section">

                    <span class="navigation-title">MAIN</span>

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
                                <i class="fa-solid <?php echo $item["icon"]; ?>"></i>
                            </span>

                            <span class="menu-text">
                                <?php echo $item["name"]; ?>
                            </span>

                        </a>

                    <?php endforeach; ?>

                </div>

            </nav>

            <div class="sidebar-bottom">

                <a href="admin-login.php" class="menu-item logout">

                    <span class="menu-icon">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </span>

                    <span class="menu-text">Logout</span>

                </a>

            </div>

        </aside>

        <!-- MAIN CONTENT -->

        <main class="main-content">

            <!-- TOP HEADER -->

            <header class="top-header">

                <div class="header-title">

                    <div class="welcome-badge">
                        <span class="welcome-dot"></span>
                        ADMIN
                    </div>

                    <h1>Edit User</h1>

                    <p>manage your system users with ease.</p>

                </div>

                <div class="admin-profile">

                    <div class="admin-information">

                          <strong id="adminGreeting">
                        <?php echo $adminName; ?>
                    </strong>

                    <span id="adminRole">
                        <?php echo $adminRole; ?>
                    </span>

                        <small><?php echo $currentDate; ?></small>

                    </div>

                    <div class="admin-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>

                </div>

            </header>

            <!-- EDIT USER -->

            <section class="edit-user-section">

                <div class="edit-user-top">

                    <div class="breadcrumb">

                        <a href="admin-users.php">Users</a>

                        <i class="fa-solid fa-chevron-right"></i>

                        <span>Edit User</span>

                    </div>

                    <a
                        href="admin-users.php"
                        class="back-user-button"
                    >
                        <i class="fa-solid fa-arrow-left"></i>
                        <span>Back to Users</span>
                    </a>

                </div>

                <!-- MAIN CARD -->

                <div class="edit-user-card">

                    <div class="form-heading">

                        <div class="form-heading-icon">
                            <i class="fa-solid fa-user-pen"></i>
                        </div>

                        <div>
                            <h2>User Information</h2>
                            <p>Edit the details of this system user.</p>
                        </div>

                    </div>

                    <!-- FORM -->

                    <form
                        id="edit-admin-form"
                        class="edit-user-form"
                    >

                        <!-- TWO-COLUMN, TWO-ROW FIELD LAYOUT -->

                        <div class="user-form-layout">

                            <div class="form-group">

                                <label
                                    for="admin-name"
                                    class="form-label"
                                >
                                    Full Name
                                    <span class="required-mark">*</span>
                                </label>

                                <div class="input-wrapper">

                                    <i class="fa-solid fa-user input-icon"></i>

                                    <input
                                        type="text"
                                        id="admin-name"
                                        name="name"
                                        placeholder="Enter full name"
                                        maxlength="80"
                                        autocomplete="off"
                                        required
                                    >

                                </div>

                            </div>

                            <div class="form-group">

                                <label
                                    for="admin-role"
                                    class="form-label"
                                >
                                    Role
                                    <span class="required-mark">*</span>
                                </label>

                                <div class="input-wrapper">

                                    <i class="fa-solid fa-shield-halved input-icon"></i>

                                    <select
                                        id="admin-role"
                                        name="role"
                                        required
                                    >
                                        <option value="Administrator">
                                            Administrator
                                        </option>

                                        <option value="Manager">
                                            Manager
                                        </option>

                                        <option value="Staff">
                                             Staff
                                        </option>
                                    </select>

                                    <i class="fa-solid fa-chevron-down select-icon"></i>

                                </div>

                            </div>

                            <div class="form-group">

                                <label
                                    for="admin-status"
                                    class="form-label"
                                >
                                    Status
                                    <span class="required-mark">*</span>
                                </label>

                                <div class="input-wrapper">

                                    <i class="fa-solid fa-circle-check input-icon"></i>

                                    <select
                                        id="admin-status"
                                        name="status"
                                        required
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>

                                    <i class="fa-solid fa-chevron-down select-icon"></i>

                                </div>

                            </div>

                            <div class="form-group">

                                <label
                                    for="admin-id"
                                    class="form-label"
                                >
                                    User ID
                                </label>

                                <div class="input-wrapper readonly">

                                    <i class="fa-solid fa-fingerprint input-icon"></i>

                                    <input
                                        type="text"
                                        id="admin-id"
                                        name="adminId"
                                        placeholder="User ID"
                                        readonly
                                    >

                                </div>

                            </div>

                        </div>

                        <!-- FORM MESSAGE -->

                        <div
                            class="form-message"
                            id="edit-message"
                        >

                            <i class="fa-solid fa-circle-info"></i>

                            <span id="edit-message-text"></span>

                        </div>

                        <!-- BUTTONS BELOW THE FIELDS -->

                        <div class="form-actions">

                            <a
                                href="admin-users.php"
                                class="cancel-button"
                            >
                                Cancel
                            </a>

                            <button
                                type="submit"
                                class="save-user-button"
                                id="save-admin"
                            >

                                <span class="button-icon">
                                    <i class="fa-solid fa-pen"></i>
                                </span>

                                <span>Save Changes</span>

                            </button>

                        </div>

                    </form>

                </div>

            </section>

        </main>

    </div>

    <script src="js/theme.js?v=2"></script>

    <script
        type="module"
        src="js/edit-users.js?v=1"
    ></script>

</body>

</html>