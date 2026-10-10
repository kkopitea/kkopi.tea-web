import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const rememberCheckbox =
    document.getElementById("remember");

const loginMessage =
    document.getElementById("loginMessage");

const forgotPasswordLink =
    document.getElementById("forgotPassword");

const togglePassword =
    document.getElementById("togglePassword");


/* Show saved remember me state */

const savedRemember =
    localStorage.getItem("kkopi-remember");

if (savedRemember === "true") {
    rememberCheckbox.checked = true;
}


/* Save remember me preference */

rememberCheckbox.addEventListener(
    "change",
    () => {

        if (rememberCheckbox.checked) {

            localStorage.setItem(
                "kkopi-remember",
                "true"
            );

        } else {

            localStorage.removeItem(
                "kkopi-remember"
            );

        }
    }
);


/* Forgot password */

forgotPasswordLink?.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        if (!email) {

            loginMessage.textContent =
                "Enter your email address first.";

            emailInput.focus();

            return;
        }

        try {

            await sendPasswordResetEmail(
                auth,
                email
            );

            loginMessage.textContent =
                "Password reset instructions sent to your email.";

        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );

            loginMessage.textContent =
                "We could not send password reset instructions.";
        }
    }
);


/* Show / hide password */

togglePassword?.addEventListener(
    "click",
    () => {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type =
            isPassword
                ? "text"
                : "password";

        const icon =
            togglePassword.querySelector("i");

        if (icon) {

            icon.classList.toggle(
                "fa-eye",
                !isPassword
            );

            icon.classList.toggle(
                "fa-eye-slash",
                isPassword
            );
        }
    }
);


/* Admin login */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        loginMessage.textContent =
            "Logging in...";


        try {

            /* Set Firebase login persistence */

            const persistence =
                rememberCheckbox.checked
                    ? browserLocalPersistence
                    : browserSessionPersistence;

            await setPersistence(
                auth,
                persistence
            );


            /* Firebase Authentication */

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user =
                userCredential.user;


            /* Check Firestore admin document */

            const adminRef =
                doc(
                    db,
                    "admins",
                    user.uid
                );

            const adminSnapshot =
                await getDoc(adminRef);


            if (!adminSnapshot.exists()) {

                await signOut(auth);

                loginMessage.textContent =
                    "You are not authorized as an administrator.";

                return;
            }


            const adminData =
                adminSnapshot.data();


            /* Check role */

            const allowedRoles = [
                "administrator",
                "manager",
                "staff"
            ];

            const userRole = String(adminData.role || "")
                .trim()
                .toLowerCase();

            if (!allowedRoles.includes(userRole)) {
                await signOut(auth);

                loginMessage.textContent =
                    "Unauthorized account.";

                return;
            }

            /* Check account status */

            const adminIsActive =
                adminData.active === true ||
                adminData.isActive === true ||
                adminData.status === "active";


            if (!adminIsActive) {

                await signOut(auth);

                loginMessage.textContent =
                    "Your admin account is disabled.";

                return;
            }


            /* Login successful */

            loginMessage.textContent =
                "Login successful! Redirecting...";


            console.log(
                "Admin logged in:",
                adminData.name
            );


            setTimeout(
                () => {

                    window.location.href =
                        "admin-dashboard.php";

                },
                800
            );


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
    }
);