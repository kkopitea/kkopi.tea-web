// HOME PAGE

const adminButton = document.querySelector(".admin-login");
const learnMoreButton = document.querySelector(".learn-more");

if (adminButton) {
    adminButton.addEventListener("click", function() {

        window.location.href = "admin-login.php";
    });
}

if (learnMoreButton) {
    learnMoreButton.addEventListener("click", function() {

        window.location.href = "about.php";
    });
}


// ADMIN LOGIN PAGE
const loginForm = document.querySelector("#loginForm");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#togglePassword");
const loginMessage = document.querySelector("#loginMessage");

// TEMPORARY LOGIN CREDENTIALS

const adminEmail = "admin@kkopi.tea";
const adminPassword = "admin123";

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = passwordInput.value;

        if (email === adminEmail && password === adminPassword) {

            loginMessage.textContent = "Login successful!";

            window.location.href = "admin-dashboard.php";

        } else {

            loginMessage.textContent = "Invalid email or password.";

        }

    });
}

// SHOW / HIDE PASSWORD
// ==============================

if (togglePassword && passwordInput) {

    togglePassword.addEventListener("click", function() {

        const icon = togglePassword.querySelector("i");

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

        } else {

            passwordInput.type = "password";

            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

        }

    });

}