
import { app, auth, db } from "./firebase-config.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    createUserWithEmailAndPassword,
    deleteUser,
    getAuth,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const form = document.getElementById("edit-admin-form");
const nameInput = document.getElementById("admin-name");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const confirmPasswordInput = document.getElementById("admin-confirm-password");
const roleInput = document.getElementById("admin-role");
const statusInput = document.getElementById("admin-status");
const message = document.getElementById("edit-message");
const messageText = document.getElementById("edit-message-text");
const submitButton = document.getElementById("save-admin");

let currentAdmin = null;
let isSubmitting = false;


/* Create a separate Firebase app so the current administrator stays signed in */
const secondaryApp = initializeApp(
    app.options,
    "KKOPITEA-User-Creation"
);

const secondaryAuth = getAuth(secondaryApp);


/* Show form messages */
function showMessage(text, type = "error") {
    messageText.textContent = text;

    message.classList.remove("success", "error");
    message.classList.add("show", type);

    const icon = message.querySelector("i");

    if (icon) {
        icon.className = type === "success"
            ? "fa-solid fa-circle-check"
            : "fa-solid fa-circle-info";
    }
}


/* Hide form messages */
function clearMessage() {
    message.classList.remove("show", "success", "error");
    messageText.textContent = "";
}


/* Verify the currently signed-in administrator */
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.replace("admin-login.php");
        return;
    }

    try {
        const adminSnapshot = await getDoc(
            doc(db, "admins", user.uid)
        );

        if (!adminSnapshot.exists()) {
            window.location.replace("admin-login.php");
            return;
        }

        const adminData = adminSnapshot.data();
        const role = String(adminData.role || "")
            .trim()
            .toLowerCase();

        const isActive =
            adminData.active === true ||
            adminData.isActive === true;

        const allowedRoles = [
            "admin",
            "administrator",
            "manager",
            "staff"
        ];

        if (!allowedRoles.includes(role) || !isActive) {
            window.location.replace("admin-login.php");
            return;
        }
        const adminGreeting = document.getElementById("adminGreeting");
        const adminRole = document.getElementById("adminRole");

        if (adminGreeting) {
            adminGreeting.textContent =
                adminData.name || user.email || "Admin";
        }

        if (adminRole) {
            adminRole.textContent =
                adminData.role || "Administrator";
        }
        currentAdmin = user;
    } catch (error) {
        console.error("Administrator verification failed:", error);
        showMessage(
            "Unable to verify administrator access. Please try again."
        );
    }
});


/* Show or hide password fields */
document.querySelectorAll(".password-toggle").forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        const icon = button.querySelector("i");

        if (!input || !icon) {
            return;
        }

        const showPassword = input.type === "password";

        input.type = showPassword ? "text" : "password";

        icon.classList.toggle("fa-eye", !showPassword);
        icon.classList.toggle("fa-eye-slash", showPassword);

        button.setAttribute(
            "aria-label",
            showPassword ? "Hide password" : "Show password"
        );

        button.setAttribute(
            "aria-pressed",
            String(showPassword)
        );
    });
});


/* Add a new user */
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) {
        return;
    }

    clearMessage();

    if (!currentAdmin) {
        showMessage(
            "Administrator access has not been verified. Please wait or sign in again."
        );
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const role = roleInput.value;
    const status = statusInput.value;

    if (!name || !email || !password || !confirmPassword || !role || !status) {
        showMessage("Please complete all required fields.");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must contain at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.");
        confirmPasswordInput.focus();
        return;
    }

    if (!["Administrator", "Manager", "Staff"].includes(role)) {
        showMessage("Please select a valid user role.");
        return;
    }

    if (!["active", "inactive"].includes(status)) {
        showMessage("Please select a valid user status.");
        return;
    }

    isSubmitting = true;
    submitButton.disabled = true;

    const buttonText = submitButton.querySelector("span:last-child");
    const originalButtonText = buttonText?.textContent || "Add Users";

    if (buttonText) {
        buttonText.textContent = "Adding User...";
    }

    let createdUser = null;
    let firestoreSaved = false;

    try {
        /* Create the Firebase Authentication account */
        const credential = await createUserWithEmailAndPassword(
            secondaryAuth,
            email,
            password
        );

        createdUser = credential.user;

        /* Save the user's details using the Authentication UID */
        await setDoc(
            doc(db, "admins", createdUser.uid),
            {
                uid: createdUser.uid,
                name: name,
                email: email,
                role: role,
                status: status,
                active: status === "active",
                isActive: status === "active",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }
        );

        firestoreSaved = true;

        await signOut(secondaryAuth);

        showMessage(
            "Admin account created.",
            "success"
        );

        form.reset();

        window.setTimeout(() => {
            window.location.href = "admin-users.php";
        }, 1000);

    } catch (error) {
        console.error("Add user failed:", error);

        /* Remove the newly created account if saving its Firestore record failed */
        if (createdUser && !firestoreSaved) {
            try {
                await deleteUser(createdUser);
            } catch (cleanupError) {
                console.error(
                    "Could not remove the incomplete account:",
                    cleanupError
                );
            }
        }

        if (error.code === "auth/email-already-in-use") {
            showMessage("This email address is already registered.");
        } else if (error.code === "auth/invalid-email") {
            showMessage("Please enter a valid email address.");
        } else if (error.code === "auth/weak-password") {
            showMessage("Please choose a stronger password.");
        } else if (error.code === "permission-denied") {
            showMessage(
                "Permission denied. Check your Firestore security rules."
            );
        } else {
            showMessage(
                "Unable to add the user. Please check your Firebase configuration and permissions."
            );
        }

    } finally {
        isSubmitting = false;
        submitButton.disabled = false;

        if (buttonText) {
            buttonText.textContent = originalButtonText;
        }
    }
});

