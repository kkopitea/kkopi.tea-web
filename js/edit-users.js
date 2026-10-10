import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const form = document.getElementById("edit-admin-form");
const nameInput = document.getElementById("admin-name");
const roleInput = document.getElementById("admin-role");
const statusInput = document.getElementById("admin-status");
const idInput = document.getElementById("admin-id");
const message = document.getElementById("edit-message");
const saveButton = document.getElementById("save-admin");

const adminId = new URLSearchParams(window.location.search).get("id");

function showMessage(text, type) {
    message.textContent = text;
    message.className = `form-message ${type}`;
    message.hidden = false;
}

function hideMessage() {
    message.hidden = true;
    message.textContent = "";
}

function normalizeRole(role) {
    const roles = ["Administrator", "Manager", "Cashier", "Inventory"];

    return roles.find(
        item => item.toLowerCase() === String(role || "").toLowerCase()
    ) || "Administrator";
}

function normalizeStatus(status) {
    return status === false ||
        String(status).toLowerCase() === "inactive"
        ? "inactive"
        : "active";
}

/* Display the signed-in administrator's name and role */
onAuthStateChanged(auth, async (user) => {
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

        const isActive =
            adminData.active === true ||
            adminData.isActive === true ||
            String(adminData.status || "").toLowerCase() === "active";

        const role = String(adminData.role || "")
            .trim()
            .toLowerCase();

        if (
            !isActive ||
            !["admin", "administrator", "manager", "staff"].includes(role)
        ) {
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
    } catch (error) {
        console.error("Admin profile verification failed:", error);
    }
});
function restoreSaveButton() {
    saveButton.disabled = false;
    saveButton.innerHTML = '<i class="fa-solid fa-check"></i> Save Changes';
}

async function loadUser() {
    if (!adminId) {
        showMessage("No user ID was provided.", "error");
        saveButton.disabled = true;
        return;
    }

    try {
        const userRef = doc(db, "admins", adminId);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            showMessage("User account was not found.", "error");
            saveButton.disabled = true;
            return;
        }

        const user = userSnapshot.data();

        nameInput.value =
            user.name ||
            user.fullName ||
            user.displayName ||
            user.adminName ||
            "";

        roleInput.value = normalizeRole(user.role || user.adminRole);
        statusInput.value = normalizeStatus(user.status);

        idInput.value =
            user.adminId ||
            user.userId ||
            user.accountId ||
            adminId;
    } catch (error) {
        console.error("Error loading user:", error);
        showMessage("Unable to load user information.", "error");
        saveButton.disabled = true;
    }
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideMessage();

    const name = nameInput.value.trim();
    const role = roleInput.value;
    const status = statusInput.value;

    if (!name) {
        showMessage("Please enter the user's full name.", "error");
        return;
    }

    if (!adminId) {
        showMessage("No user ID was provided.", "error");
        return;
    }

    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        const userRef = doc(db, "admins", adminId);

        await updateDoc(userRef, {
            name,
            role,
            status
        });

        showMessage("User information updated successfully.", "success");
        saveButton.innerHTML = '<i class="fa-solid fa-check"></i> Saved';

        window.setTimeout(() => {
            window.location.href = "admin-users.php";
        }, 1000);
    } catch (error) {
        console.error("Error updating user:", error);
        showMessage("Unable to save changes. Please try again.", "error");
        restoreSaveButton();
    }
});

loadUser();