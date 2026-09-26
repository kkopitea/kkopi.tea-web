import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


/* FORM ELEMENTS */

const form = document.getElementById("edit-admin-form");

const nameInput = document.getElementById("admin-name");
const emailInput = document.getElementById("admin-email");
const positionInput = document.getElementById("admin-position");
const roleInput = document.getElementById("admin-role");
const statusInput = document.getElementById("admin-status");
const idInput = document.getElementById("admin-id");

const message = document.getElementById("edit-message");
const saveButton = document.getElementById("save-admin");


/* GET USER ID FROM URL */

const urlParams = new URLSearchParams(window.location.search);
const adminId = urlParams.get("id");


/* SHOW MESSAGE */

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        `form-message ${type}`;

    message.hidden = false;
}


/* HIDE MESSAGE */

function hideMessage() {

    message.hidden = true;
    message.textContent = "";
}


/* NORMALIZE ROLE */

function normalizeRole(role) {

    const roles = [
        "Administrator",
        "Manager",
        "Cashier",
        "Inventory"
    ];

    if (!role) {
        return "Administrator";
    }

    const matchedRole = roles.find(
        item =>
            item.toLowerCase() ===
            String(role).toLowerCase()
    );

    return matchedRole || "Administrator";
}


/* NORMALIZE STATUS */

function normalizeStatus(status) {

    if (
        status === false ||
        String(status).toLowerCase() === "inactive"
    ) {
        return "inactive";
    }

    return "active";
}


/* LOAD USER */

async function loadUser() {

    if (!adminId) {

        showMessage(
            "No user ID was provided.",
            "error"
        );

        saveButton.disabled = true;

        return;
    }

    try {

        const userRef = doc(
            db,
            "admins",
            adminId
        );

        const userSnapshot =
            await getDoc(userRef);

        if (!userSnapshot.exists()) {

            showMessage(
                "User account was not found.",
                "error"
            );

            saveButton.disabled = true;

            return;
        }

        const user = userSnapshot.data();


        /* GET USER INFORMATION */

        const name =
            user.name ||
            user.fullName ||
            user.displayName ||
            user.adminName ||
            "";

        const email =
            user.email ||
            user.adminEmail ||
            "";

        const position =
            user.position ||
            user.jobTitle ||
            user.title ||
            user.job_position ||
            "";

        const role =
            normalizeRole(
                user.role ||
                user.adminRole
            );

        const status =
            normalizeStatus(
                user.status
            );


        /* FILL FORM */

        nameInput.value = name;
        emailInput.value = email;
        positionInput.value = position;
        roleInput.value = role;
        statusInput.value = status;
        idInput.value =
            user.adminId ||
            user.userId ||
            user.accountId ||
            adminId;

    } catch (error) {

        console.error(
            "Error loading user:",
            error
        );

        showMessage(
            "Unable to load user information.",
            "error"
        );
    }
}


/* SAVE USER */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideMessage();


        /* GET FORM VALUES */

        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const position =
            positionInput.value.trim();

        const role =
            roleInput.value;

        const status =
            statusInput.value;


        /* VALIDATION */

        if (
            !name ||
            !email ||
            !position
        ) {

            showMessage(
                "Please fill in all required fields.",
                "error"
            );

            return;
        }


        /* DISABLE BUTTON */

        saveButton.disabled = true;

        saveButton.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i>
             Saving...`;


        try {

            const userRef = doc(
                db,
                "admins",
                adminId
            );


            /* UPDATE FIRESTORE */

            await updateDoc(
                userRef,
                {
                    name: name,
                    email: email,
                    position: position,
                    role: role,
                    status: status
                }
            );


            /* SUCCESS */

            showMessage(
                "User information updated successfully.",
                "success"
            );


            saveButton.innerHTML =
                `<i class="fa-solid fa-check"></i>
                 Saved`;


            /* RESTORE BUTTON */

            setTimeout(
                function () {

                    saveButton.disabled = false;

                    saveButton.innerHTML =
                        `<i class="fa-solid fa-check"></i>
                         Save Changes`;

                },
                1500
            );

        } catch (error) {

            console.error(
                "Error updating user:",
                error
            );

            showMessage(
                "Unable to save changes. Please try again.",
                "error"
            );


            /* RESTORE BUTTON */

            saveButton.disabled = false;

            saveButton.innerHTML =
                `<i class="fa-solid fa-check"></i>
                 Save Changes`;
        }

    }
);


/* LOAD USER WHEN PAGE OPENS */

loadUser();