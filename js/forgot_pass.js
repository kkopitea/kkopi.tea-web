
import { auth } from "./firebase-config.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const resetMessage = document.getElementById("resetMessage");
const sendResetButton = document.getElementById("send-reset-button");

function showMessage(message, type) {
    resetMessage.textContent = message;
    resetMessage.className = `reset-message ${type}`;
}

forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        showMessage("Please enter your email address.", "error");
        emailInput.focus();
        return;
    }

    sendResetButton.disabled = true;
    sendResetButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    showMessage("Sending your password reset email...", "info");

    try {
        await sendPasswordResetEmail(auth, email);

        showMessage(
            "If an account exists for that email, a password reset link will be sent. Check your inbox and spam folder.",
            "success"
        );

        forgotPasswordForm.reset();
    } catch (error) {
        console.error("Password reset error:", error);

        if (
            error.code === "auth/invalid-email" ||
            error.code === "auth/missing-email"
        ) {
            showMessage("Please enter a valid email address.", "error");
        } else if (error.code === "auth/too-many-requests") {
            showMessage("Too many attempts. Please wait a while before trying again.", "error");
        } else if (error.code === "auth/operation-not-allowed") {
            showMessage("Email/password authentication is not enabled in Firebase.", "error");
        } else {
            showMessage(
                "We couldn't send the reset email. Check your email address and try again.",
                "error"
            );
        }
    } finally {
        sendResetButton.disabled = false;
        sendResetButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Reset Link';
    }
});