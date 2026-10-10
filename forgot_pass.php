
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KKOPI.TEA | Forgot Password</title>

    <link rel="stylesheet" href="css/forgot_pass.css?v=1">
    <link href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>

    <main class="forgot-container">
        <a href="admin-login.php" class="back-link">
            <i class="fa-solid fa-arrow-left"></i>
            Back to Login
        </a>

        <section class="forgot-card">
            <div class="forgot-icon">
                <i class="fa-solid fa-lock"></i>
            </div>

            <h1>Forgot Password?</h1>
            <p class="subtitle">
                No worries! Enter your admin email address and we'll send you a link to reset your password.
            </p>

            <form id="forgotPasswordForm">
                <label for="email">Email Address</label>

                <div class="input-box">
                    <i class="fa-solid fa-envelope"></i>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your admin email"
                        autocomplete="email"
                        required
                    >
                </div>

                <button type="submit" id="send-reset-button">
                    Send Reset Link
                </button>

                <p id="resetMessage" class="reset-message" role="status" aria-live="polite"></p>
            </form>

            <div class="security-note">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Only use an email address associated with your account.</span>
            </div>
        </section>

        <p class="brand-name">
            <span>KKOPI</span><span>.TEA</span>
        </p>
    </main>

    <script type="module" src="js/forgot_pass.js?v=1"></script>
</body>
</html>