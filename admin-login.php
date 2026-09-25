
<?php
// Firebase Authentication and Firestore enforce access in the client module.
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Kkopi.tea | Admin Login</title>
    <link rel="stylesheet" href="css/admin-login.css">

    <link href="https://fonts.googleapis.com/css2?family=Baloo+Thambi&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&family=Baloo+Thambi+2&display=swap" rel="stylesheet">
</head>

<body>

    <main class="login-container">

        <!-- LEFT SECTION -->
        <section class="welcome-section">

            <h1>
                <span class="KKOPI">KKOPI</span><span class="TEA">.TEA</span>
            </h1>

            <img src="Images/login.png" alt="KKOPI.TEA Drinks">

            <div class="welcome-text">
                <h2>Welcome to KKOPI TEA Admin</h2>

                <p>
                    Manage your store, menu, orders, and
                    customers in one place.
                </p>
            </div>

        </section>


        <!-- RIGHT SECTION -->
        <section class="login-section">
            <div class="security-badge">
                    <img src="Images/solid_shield.png" alt="Security Shield">
                    
                </div>

            <div class="login-content">

                <h2>ADMIN LOGIN</h2>

                <p class="subtitle">
                    Please login your admin account.
                </p>

                <form id="loginForm">

                    <label for="email">Email Address</label>

                    <div class="input-box">
                        <span>✉</span>

                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            required
                        >
                    </div>


                    <label for="password">Password</label>

                    <div class="input-box">
                        <span>🔒</span>

                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                        >

                        <button
                            type="button"
                            id="togglePassword"
                            class="toggle-password"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </div>


                    <div class="login-options">

                        <label class="remember">
                            <input type="checkbox" id="remember">
                            <span>Remember me</span>
                        </label>

                        <a href="#" class="forgot" id="forgotPassword">
                            Forgot password?
                        </a>

                    </div>


                    <button type="submit" class="login-button">
                        Log in
                    </button>

                    <p id="loginMessage" class="login-message"></p>

                </form>


                <div class="login-notice">
                    <h3>
                        Only authorized personnel can access
                        the admin dashboard
                    </h3>
                </div>
            

            </div>

        </section>

    </main>

    <script type="module" src="js/admin_login.js"></script>

</body>
</html>