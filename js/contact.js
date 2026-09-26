import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


/* STORE INFORMATION ELEMENTS */

const storeAddress =
    document.getElementById("store-address");

const storeContact =
    document.getElementById("store-contact");

const storeEmail =
    document.getElementById("store-email");

const storeHours =
    document.getElementById("store-hours");


/* LOAD STORE INFORMATION */

async function loadStoreInformation() {

    try {

        const storeReference =
            doc(
                db,
                "settings",
                "store"
            );


        const storeSnapshot =
            await getDoc(
                storeReference
            );


        if (!storeSnapshot.exists()) {

            storeAddress.textContent =
                "Store information unavailable";

            storeContact.textContent =
                "Store information unavailable";

            storeEmail.textContent =
                "Store information unavailable";

            storeHours.textContent =
                "Store information unavailable";

            return;

        }


        const storeData =
            storeSnapshot.data();


        storeAddress.textContent =
            storeData.address ||
            "Address unavailable";


        storeContact.textContent =
            storeData.contact ||
            "Contact unavailable";


        storeEmail.textContent =
            storeData.email ||
            "Email unavailable";


        storeHours.textContent =
            storeData.hours ||
            "Hours unavailable";


    } catch (error) {

        console.error(
            "Error loading store information:",
            error
        );


        storeAddress.textContent =
            "Unable to load address";

        storeContact.textContent =
            "Unable to load contact";

        storeEmail.textContent =
            "Unable to load email";

        storeHours.textContent =
            "Unable to load store hours";

    }

}


/* START */

loadStoreInformation();