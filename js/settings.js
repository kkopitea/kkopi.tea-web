import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    updateEmail,
    updatePassword
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    db,
    auth
} from "./firebase-config.js";


/* ELEMENTS */

const storeNameInput =
    document.getElementById("store-name");

const storeContactInput =
    document.getElementById("store-contact");

const storeAddressInput =
    document.getElementById("store-address");

const storeEmailInput =
    document.getElementById("store-email");

const storeHoursInput =
    document.getElementById("store-hours");

const adminEmailInput =
    document.getElementById("admin-email");

const adminPasswordInput =
    document.getElementById("admin-password");

const saveButton =
    document.getElementById("save-settings");

const resetButton =
    document.getElementById("reset-settings");

const saveStatus =
    document.getElementById("settings-save-status");

const saveStatusText =
    document.getElementById("settings-save-text");

const lightThemeButton =
    document.getElementById("light-theme");

const darkThemeButton =
    document.getElementById("dark-theme");


/* FIRESTORE DOCUMENT */

const settingsReference =
    doc(
        db,
        "settings",
        "store"
    );


/* DEFAULT VALUES */

const defaultSettings = {
    storeName: "KKOPI.TEA",
    contact: "0900 123 4567",
    address: "Purok San Jose, Brgy. Pobo, Urdaneta City",
    email: "admin@kkopi.tea",
    hours: "7:00 AM - 9:00 PM"
};


/* LOAD SETTINGS */

async function loadSettings() {

    setLoadingState(
        true,
        "Loading store settings..."
    );


    try {

        const snapshot =
            await getDoc(
                settingsReference
            );


        /* STORE INFORMATION */

        if (!snapshot.exists()) {

            storeNameInput.value =
                defaultSettings.storeName;

            storeContactInput.value =
                defaultSettings.contact;

            storeAddressInput.value =
                defaultSettings.address;

            storeEmailInput.value =
                defaultSettings.email;

            storeHoursInput.value =
                defaultSettings.hours;

        } else {

            const data =
                snapshot.data();


            storeNameInput.value =
                data.storeName ||
                defaultSettings.storeName;


            storeContactInput.value =
                data.contact ||
                defaultSettings.contact;


            storeAddressInput.value =
                data.address ||
                defaultSettings.address;


            storeEmailInput.value =
                data.email ||
                defaultSettings.email;


            storeHoursInput.value =
                data.hours ||
                defaultSettings.hours;

        }


        /* ADMINISTRATOR EMAIL */

        const currentUser =
            auth.currentUser;


        if (currentUser) {

            adminEmailInput.value =
                currentUser.email || "";

        } else {

            adminEmailInput.value =
                "";

        }


        /* PASSWORD */

        adminPasswordInput.value = "";


        setLoadingState(
            false,
            "All settings loaded"
        );


    } catch (error) {

        console.error(
            "Error loading settings:",
            error
        );


        setLoadingState(
            false,
            "Unable to load settings"
        );

    }

}


/* SAVE SETTINGS */

async function saveSettings() {

    saveButton.classList.add(
        "saving"
    );

    saveButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
    `;


    setLoadingState(
        true,
        "Saving changes..."
    );


    try {

        /* STORE SETTINGS */

        const settingsData = {

            storeName:
                storeNameInput.value.trim(),

            contact:
                storeContactInput.value.trim(),

            address:
                storeAddressInput.value.trim(),

            email:
                storeEmailInput.value.trim(),

            hours:
                storeHoursInput.value.trim(),

            updatedAt:
                serverTimestamp()

        };


        await setDoc(
            settingsReference,
            settingsData,
            {
                merge: true
            }
        );


        /* FIREBASE AUTH */

        const currentUser =
            auth.currentUser;


        if (!currentUser) {

            throw new Error(
                "No administrator is currently logged in."
            );

        }


        const newAdminEmail =
            adminEmailInput.value.trim();

        const newAdminPassword =
            adminPasswordInput.value.trim();


        /* UPDATE EMAIL */

        if (
            newAdminEmail &&
            newAdminEmail !== currentUser.email
        ) {

            await updateEmail(
                currentUser,
                newAdminEmail
            );

        }


        /* UPDATE PASSWORD */

        if (newAdminPassword) {

            if (newAdminPassword.length < 6) {

                throw new Error(
                    "Password must contain at least 6 characters."
                );

            }


            await updatePassword(
                currentUser,
                newAdminPassword
            );

        }


        /* CLEAR PASSWORD FIELD */

        adminPasswordInput.value = "";


        /* SUCCESS */

        saveButton.classList.remove(
            "saving"
        );

        saveButton.classList.add(
            "saved"
        );

        saveButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Saved Successfully
        `;


        setLoadingState(
            false,
            "Changes saved successfully"
        );


        setTimeout(
            function () {

                saveButton.classList.remove(
                    "saved"
                );

                saveButton.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Save Changes
                `;

            },
            2200
        );


    } catch (error) {

        console.error(
            "Error saving settings:",
            error
        );


        saveButton.classList.remove(
            "saving"
        );


        saveButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Save Changes
        `;


        let errorMessage =
            "Unable to save changes.";


        if (
            error.code ===
            "auth/requires-recent-login"
        ) {

            errorMessage =
                "Please log in again before changing the administrator email or password.";

        } else if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            errorMessage =
                "That email address is already being used by another account.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            errorMessage =
                "Please enter a valid administrator email.";

        } else if (
            error.code ===
            "auth/weak-password"
        ) {

            errorMessage =
                "The new password is too weak.";

        } else if (error.message) {

            errorMessage =
                error.message;

        }


        setLoadingState(
            false,
            errorMessage
        );


        alert(
            errorMessage
        );

    }

}


/* RESET SETTINGS */

function resetSettings() {

    const confirmed =
        confirm(
            "Reset the settings fields to their default values?"
        );


    if (!confirmed) {
        return;
    }


    storeNameInput.value =
        defaultSettings.storeName;

    storeContactInput.value =
        defaultSettings.contact;

    storeAddressInput.value =
        defaultSettings.address;

    storeEmailInput.value =
        defaultSettings.email;

    storeHoursInput.value =
        defaultSettings.hours;


    /* RESTORE CURRENT ADMIN EMAIL */

    const currentUser =
        auth.currentUser;


    if (currentUser) {

        adminEmailInput.value =
            currentUser.email || "";

    }


    /* PASSWORD MUST REMAIN EMPTY */

    adminPasswordInput.value = "";


    setLoadingState(
        false,
        "Changes have not been saved"
    );

}


/* STATUS */

function setLoadingState(
    loading,
    message
) {

    saveStatusText.textContent =
        message;


    if (loading) {

        saveStatus.classList.add(
            "saving-status"
        );

    } else {

        saveStatus.classList.remove(
            "saving-status"
        );

    }

}


/* THEME */

function setTheme(
    theme
) {

    if (theme === "dark") {

        document.documentElement.classList.add(
            "dark-mode"
        );

        darkThemeButton.classList.add(
            "active"
        );

        lightThemeButton.classList.remove(
            "active"
        );

        localStorage.setItem(
            "kkopi-theme",
            "dark"
        );

    } else {

        document.documentElement.classList.remove(
            "dark-mode"
        );

        lightThemeButton.classList.add(
            "active"
        );

        darkThemeButton.classList.remove(
            "active"
        );

        localStorage.setItem(
            "kkopi-theme",
            "light"
        );

    }

}


/* THEME BUTTONS */

lightThemeButton.addEventListener(
    "click",
    function () {

        setTheme("light");

    }
);


darkThemeButton.addEventListener(
    "click",
    function () {

        setTheme("dark");

    }
);


/* SAVE BUTTON */

saveButton.addEventListener(
    "click",
    saveSettings
);


/* RESET BUTTON */

resetButton.addEventListener(
    "click",
    resetSettings
);


/* INITIALIZE */

const savedTheme =
    localStorage.getItem(
        "kkopi-theme"
    );


setTheme(
    savedTheme === "dark"
        ? "dark"
        : "light"
);


loadSettings();