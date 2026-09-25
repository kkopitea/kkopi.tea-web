import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const dashboardContent = document.getElementById("dashboardContent");
const dashboardMessage = document.getElementById("dashboardMessage");
const adminGreeting = document.getElementById("adminGreeting");
const logoutButton = document.getElementById("logoutButton");

const redirectToLogin = () => {
    window.location.replace("admin-login.php");
};

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        redirectToLogin();
        return;
    }

    try {
        const adminSnapshot = await getDoc(doc(db, "admins", user.uid));
        const adminData = adminSnapshot.exists() ? adminSnapshot.data() : null;

        if (!adminData || adminData.role !== "admin" || adminData.active !== true) {
            await signOut(auth);
            redirectToLogin();
            return;
        }

        adminGreeting.textContent = `Signed in as ${adminData.name || user.email}`;
        dashboardContent.hidden = false;
        dashboardMessage.hidden = true;
    } catch (error) {
        console.error("Could not verify admin access:", error);
        dashboardMessage.textContent = "We could not verify your admin access. Please try again.";
    }
});

logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;

    try {
        await signOut(auth);
        redirectToLogin();
    } catch (error) {
        console.error("Logout failed:", error);
        dashboardMessage.hidden = false;
        dashboardMessage.textContent = "Logout failed. Please try again.";
        logoutButton.disabled = false;
    }
});
