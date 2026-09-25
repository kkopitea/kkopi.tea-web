<?php
// The Firebase client protects this page and verifies the admin record.
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kkopi.tea | Admin Dashboard</title>
    <link rel="stylesheet" href="css/admin-dashboard.css">
</head>
<body>
    <main class="dashboard-shell">
        <header class="dashboard-header">
            <div>
                <p class="eyebrow">KKOPI.TEA</p>
                <h1>Admin dashboard</h1>
                <p id="adminGreeting" class="muted">Checking your account...</p>
            </div>
            <button id="logoutButton" class="logout-button" type="button">Log out</button>
        </header>

        <section id="dashboardContent" class="dashboard-content" hidden>
            <article class="dashboard-panel">
                <p class="eyebrow">Store management</p>
                <h2>Welcome back</h2>
                <p>Menu, branches, orders, and customer tools can be connected here as the database grows.</p>
            </article>
        </section>

        <p id="dashboardMessage" class="dashboard-message" role="status">Loading...</p>
    </main>

    <script type="module" src="js/admin_dashboard.js"></script>
</body>
</html>
