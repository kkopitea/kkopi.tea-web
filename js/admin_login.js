import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberCheckbox = document.getElementById("remember");
const loginMessage = document.getElementById("loginMessage");

const togglePassword = document.getElementById("togglePassword");


// ========================================
// SHOW / HIDE PASSWORD
// ========================================

togglePassword?.addEventListener("click", () => {

    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";

    const icon = togglePassword.querySelector("i");

    if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
    }
});


// ========================================
// ADMIN LOGIN
// ========================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    loginMessage.textContent = "Logging in...";

    try {

        // Remember Me
        const persistence = rememberCheckbox.checked
            ? browserLocalPersistence
            : browserSessionPersistence;

        await setPersistence(auth, persistence);


        // Firebase Authentication
        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;


        // ========================================
        // CHECK FIRESTORE ADMIN DOCUMENT
        // ========================================

        const adminRef = doc(
            db,
            "admins",
            user.uid
        );

        const adminSnapshot =
            await getDoc(adminRef);


        // Account exists in Authentication
        // but is NOT registered as an admin.
        if (!adminSnapshot.exists()) {

            await signOut(auth);

            loginMessage.textContent =
                "You are not authorized as an administrator.";

            return;
        }


        const adminData =
            adminSnapshot.data();


        // Check role
        if (adminData.role !== "admin") {

            await signOut(auth);

            loginMessage.textContent =
                "Unauthorized account.";

            return;
        }


        // Check account status
        if (adminData.active !== true) {

            await signOut(auth);

            loginMessage.textContent =
                "Your admin account is disabled.";

            return;
        }


        // ========================================
        // SUCCESS
        // ========================================

        loginMessage.textContent =
            "Login successful! Redirecting...";

        console.log(
            "Admin logged in:",
            adminData.name
        );


        // We'll change this once dashboard exists
        setTimeout(() => {

            window.location.href =
                "admin-dashboard.php";

        }, 800);


    } catch (error) {

        console.error(
            "Firebase login error:",
            error
        );


        switch (error.code) {

            case "auth/invalid-email":

                loginMessage.textContent =
                    "Please enter a valid email address.";

                break;


            case "auth/invalid-credential":

                loginMessage.textContent =
                    "Incorrect email or password.";

                break;


            case "auth/user-disabled":

                loginMessage.textContent =
                    "This account has been disabled.";

                break;


            case "auth/too-many-requests":

                loginMessage.textContent =
                    "Too many login attempts. Please try again later.";

                break;


            default:

                loginMessage.textContent =
                    "Login failed. Please try again.";

                break;
        }
    }
});