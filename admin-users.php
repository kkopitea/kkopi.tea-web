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
        href="css/admin-users.css?v=3"
    >

</head>

<body>

    <div class="users-container">

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

                        ADMIN USERS

                    </div>

                    <h1>
                        Users Management
                    </h1>

                    <p>
                        Manage your system users and their access levels.
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


            <section class="users-content">


                <div class="users-summary">


                    <div class="users-total-card">

                        <div class="users-total-icon">

                            <i class="fa-solid fa-users"></i>

                        </div>

                        <div class="users-total-information">

                            <span>
                                Total Users
                            </span>

                            <strong id="total-users">
                                0
                            </strong>

                            <small>

                                <span class="active-dot"></span>

                                <span id="active-users">
                                    0
                                </span>

                                Active accounts

                            </small>

                        </div>

                    </div>


                    <div class="users-security-card">

                        <div class="security-icon">

                            <i class="fa-solid fa-shield-halved"></i>

                        </div>

                        <div class="security-information">

                            <div class="security-heading">

                                <strong>
                                    Account Security
                                </strong>

                                <span>
                                    Protected
                                </span>

                            </div>

                            <h3>
                                Keep your account secure
                            </h3>

                            <p>
                                Only authorized users should have access to the system.
                            </p>

                        </div>

                        <div class="security-check">

                            <i class="fa-solid fa-check"></i>

                        </div>

                    </div>

                </div>


                <section class="users-table-section">


                    <div class="users-section-heading">

                        <div>

                            <span class="section-eyebrow">
                                USER DIRECTORY
                            </span>

                            <h2>
                                System Users
                            </h2>

                            <p>
                                View and manage registered users.
                            </p>

                        </div>

                        <div class="users-live-status">

                            <span class="live-dot"></span>

                            Live Records

                        </div>

                    </div>


                    <div class="users-toolbar">


                        <div class="users-search">

                            <div class="search-icon">

                                <i class="fa-solid fa-magnifying-glass"></i>

                            </div>

                            <input
                                type="text"
                                id="user-search"
                                placeholder="Search by name, email or ID..."
                                autocomplete="off"
                            >

                            <span class="search-shortcut">
                                Search
                            </span>

                        </div>


                        <div class="role-filter">

                            <select id="role-filter">

                                <option value="all">
                                    All Roles
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="users-table-wrapper">

                        <table class="users-table">

                            <thead>

                                <tr>

                                    <th class="checkbox-column">

                                        <input
                                            type="checkbox"
                                            id="select-all-users"
                                        >

                                    </th>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        User
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Last Login
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody id="users-table-body">

                                <tr id="users-loading-row">

                                    <td colspan="8">

                                        <div class="users-loading">

                                            <div class="users-loading-spinner"></div>

                                            <strong>
                                                Loading users
                                            </strong>

                                            <span>
                                                Fetching system user records...
                                            </span>

                                        </div>

                                    </td>

                                </tr>


                                <tr
                                    id="users-empty-row"
                                    hidden
                                >

                                    <td colspan="8">

                                        <div class="users-empty">

                                            <div class="users-empty-icon">

                                                <i class="fa-solid fa-users"></i>

                                            </div>

                                            <h3>
                                                No Users Found
                                            </h3>

                                            <p>
                                                No users match your current search or filter.
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>


                    <div class="users-table-footer">

                        <span id="users-result-count">
                            Showing 0 users
                        </span>


                        <div class="users-pagination">

                            <button
                                type="button"
                                id="users-prev"
                                aria-label="Previous page"
                            >

                                <i class="fa-solid fa-chevron-left"></i>

                            </button>

                            <div id="users-page-numbers"></div>

                            <button
                                type="button"
                                id="users-next"
                                aria-label="Next page"
                            >

                                <i class="fa-solid fa-chevron-right"></i>

                            </button>

                        </div>

                    </div>

                </section>

            </section>

        </main>

    </div>

    <script
        type="module"
        src="js/users.js?v=3"
    ></script>
    <script src="js/theme.js?v=3"></script>
</body>

</html>