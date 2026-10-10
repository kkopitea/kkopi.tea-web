import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    verifyBeforeUpdateEmail,
    updatePassword,
    reload,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    db,
    auth
} from "./firebase-config.js";



/* ELEMENTS */

const storeNameInput = document.getElementById("store-name");
const storeContactInput = document.getElementById("store-contact");
const storeAddressInput = document.getElementById("store-address");
const storeEmailInput = document.getElementById("store-email");
const storeHoursInput = document.getElementById("store-hours");
const adminEmailInput = document.getElementById("admin-email");
const adminPasswordInput = document.getElementById("admin-password");
const saveButton = document.getElementById("save-settings");
const resetButton = document.getElementById("reset-settings");
const saveStatus = document.getElementById("settings-save-status");
const saveStatusText = document.getElementById("settings-save-text");
const lightThemeButton = document.getElementById("light-theme");
const darkThemeButton = document.getElementById("dark-theme");

/* FIRESTORE DOCUMENT */

const settingsReference = doc(db, "settings", "store");

/* DEFAULT VALUES */

const defaultSettings = {
    storeName: "KKOPI.TEA",
    contact: "0900 123 4567",
    address: "Purok San Jose, Brgy. Pobo, Urdaneta City",
    email: "admin@kkopi.tea",
    hours: "7:00 AM - 9:00 PM"
};

/* GET CURRENT ADMIN DOCUMENT */

function getCurrentAdminReference() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("No administrator is currently logged in.");
    }

    return doc(db, "admins", currentUser.uid);
}

/* PENDING EMAIL STORAGE */

const pendingEmailKey = "kkopi-pending-admin-email";

function setPendingEmail(email) {
    localStorage.setItem(pendingEmailKey, email);
}

function getPendingEmail() {
    return localStorage.getItem(pendingEmailKey);
}

function clearPendingEmail() {
    localStorage.removeItem(pendingEmailKey);
}

/* SYNCHRONIZE VERIFIED EMAIL */

async function synchronizeAdminEmail(currentUser) {
    await reload(currentUser);

    const pendingEmail = getPendingEmail();

    if (
        !pendingEmail ||
        !currentUser.email ||
        currentUser.email.toLowerCase() !== pendingEmail.toLowerCase()
    ) {
        return false;
    }

    const adminReference = getCurrentAdminReference();
    const adminSnapshot = await getDoc(adminReference);

    if (!adminSnapshot.exists()) {
        throw new Error(
            "Your admin profile was not found in Firestore."
        );
    }

    await updateDoc(adminReference, {
        email: currentUser.email,
        updatedAt: serverTimestamp()
    });

    clearPendingEmail();

    return true;
}

/* LOAD SETTINGS */

async function loadSettings() {
    setLoadingState(true, "Loading store settings...");

    try {
        const snapshot = await getDoc(settingsReference);

        if (!snapshot.exists()) {
            storeNameInput.value = defaultSettings.storeName;
            storeContactInput.value = defaultSettings.contact;
            storeAddressInput.value = defaultSettings.address;
            storeEmailInput.value = defaultSettings.email;
            storeHoursInput.value = defaultSettings.hours;
        } else {
            const data = snapshot.data();

            storeNameInput.value =
                data.storeName || defaultSettings.storeName;

            storeContactInput.value =
                data.contact || defaultSettings.contact;

            storeAddressInput.value =
                data.address || defaultSettings.address;

            storeEmailInput.value =
                data.email || defaultSettings.email;

            storeHoursInput.value =
                data.hours || defaultSettings.hours;
        }

        const currentUser = auth.currentUser;

        if (!currentUser) {
            adminEmailInput.value = "";
            setLoadingState(false, "All settings loaded");
            return;
        }

        await currentUser.reload();

        adminEmailInput.value = currentUser.email || "";

        const emailSynced =
            await synchronizeAdminEmail(currentUser);

        if (emailSynced) {
            setLoadingState(
                false,
                "Verified email synchronized with admin profile."
            );
            return;
        }

        const pendingEmail = getPendingEmail();

        if (pendingEmail) {
            setLoadingState(
                false,
                `Pending email verification for ${pendingEmail}.`
            );
        } else {
            setLoadingState(false, "All settings loaded");
        }

        adminPasswordInput.value = "";

    } catch (error) {
        console.error("Error loading settings:", error);
        setLoadingState(false, "Unable to load settings");
    }
}

/* SAVE SETTINGS */

async function saveSettings() {
    saveButton.disabled = true;
    saveButton.classList.add("saving");

    saveButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
    `;

    setLoadingState(true, "Saving changes...");

    try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            throw new Error("No administrator is currently logged in.");
        }

        await currentUser.reload();

        const newAdminEmail = adminEmailInput.value.trim();
        const newAdminPassword = adminPasswordInput.value;

        /* VALIDATE PASSWORD */

        if (
            newAdminPassword &&
            newAdminPassword.length < 6
        ) {
            throw new Error(
                "Password must contain at least 6 characters."
            );
        }

        /* SAVE STORE SETTINGS */

        const settingsData = {
            storeName: storeNameInput.value.trim(),
            contact: storeContactInput.value.trim(),
            address: storeAddressInput.value.trim(),
            email: storeEmailInput.value.trim(),
            hours: storeHoursInput.value.trim(),
            updatedAt: serverTimestamp()
        };

        await setDoc(
            settingsReference,
            settingsData,
            { merge: true }
        );

        /* REQUEST EMAIL VERIFICATION */

        let emailVerificationRequested = false;

        if (
            newAdminEmail &&
            newAdminEmail.toLowerCase() !==
                (currentUser.email || "").toLowerCase()
        ) {
            await verifyBeforeUpdateEmail(
                currentUser,
                newAdminEmail
            );

            setPendingEmail(newAdminEmail);
            emailVerificationRequested = true;
        }

        /* UPDATE AUTHENTICATION PASSWORD */

        if (newAdminPassword) {
            await updatePassword(
                currentUser,
                newAdminPassword
            );
        }

        /* CLEAR PASSWORD INPUT */

        adminPasswordInput.value = "";

        /* SHOW RESULT */

        saveButton.classList.remove("saving");
        saveButton.classList.add("saved");

        if (emailVerificationRequested) {
            saveButton.innerHTML = `
                <i class="fa-solid fa-clock"></i>
                Verification Pending
            `;

            setLoadingState(
                false,
                `Pending email verification for ${newAdminEmail}.`
            );

            alert(
                `Store settings and any password change were saved. ` +
                `A verification email was requested for ${newAdminEmail}. ` +
                `After completing verification, return to Settings to synchronize the admin email.`
            );
        } else {
            saveButton.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Saved Successfully
            `;

            setLoadingState(
                false,
                "Changes saved successfully"
            );
        }

    } catch (error) {
        console.error("Error saving settings:", error);

        let errorMessage = "Unable to save changes.";

        if (error.code === "auth/requires-recent-login") {
            errorMessage =
                "Please sign in again before changing the email or password.";
        } else if (error.code === "auth/email-already-in-use") {
            errorMessage =
                "That email address is already being used by another account.";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "Please enter a valid administrator email.";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "The new password is too weak.";
        } else if (error.code === "auth/operation-not-allowed") {
            errorMessage =
                "Firebase rejected the email change. Check your Authentication configuration.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        setLoadingState(false, errorMessage);
        alert(errorMessage);

    } finally {
        saveButton.classList.remove("saving");
        saveButton.disabled = false;

        setTimeout(() => {
            saveButton.classList.remove("saved");

            saveButton.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Save Changes
            `;
        }, 2500);
    }
}

/* RESET SETTINGS */

function resetSettings() {
    const confirmed = confirm(
        "Reset the settings fields to their default values?"
    );

    if (!confirmed) {
        return;
    }

    storeNameInput.value = defaultSettings.storeName;
    storeContactInput.value = defaultSettings.contact;
    storeAddressInput.value = defaultSettings.address;
    storeEmailInput.value = defaultSettings.email;
    storeHoursInput.value = defaultSettings.hours;

    const currentUser = auth.currentUser;

    if (currentUser) {
        adminEmailInput.value = currentUser.email || "";
    }

    adminPasswordInput.value = "";

    setLoadingState(false, "Changes have not been saved");
}

/* STATUS */

function setLoadingState(loading, message) {
    saveStatusText.textContent = message;

    if (loading) {
        saveStatus.classList.add("saving-status");
    } else {
        saveStatus.classList.remove("saving-status");
    }
}

/* THEME */

function setTheme(theme) {
    if (theme === "dark") {
        document.documentElement.classList.add("dark-mode");
        darkThemeButton.classList.add("active");
        lightThemeButton.classList.remove("active");

        localStorage.setItem("kkopi-theme", "dark");
    } else {
        document.documentElement.classList.remove("dark-mode");
        lightThemeButton.classList.add("active");
        darkThemeButton.classList.remove("active");

        localStorage.setItem("kkopi-theme", "light");
    }
}

/* THEME BUTTONS */

lightThemeButton.addEventListener("click", () => setTheme("light"));
darkThemeButton.addEventListener("click", () => setTheme("dark"));

/* SAVE AND RESET BUTTONS */

saveButton.addEventListener("click", saveSettings);
resetButton.addEventListener("click", resetSettings);

/* INITIALIZE */

const savedTheme = localStorage.getItem("kkopi-theme");

setTheme(savedTheme === "dark" ? "dark" : "light");

/* Display the signed-in administrator's profile */
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

loadSettings();