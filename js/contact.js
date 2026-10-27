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

/* CONTACT FORM - FORMSPREE */

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("form-status");

if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = contactForm.elements.namedItem("name");
        const email = contactForm.elements.namedItem("email");
        const subject = contactForm.elements.namedItem("subject");
        const message = contactForm.elements.namedItem("message");

        if (
            !name.value.trim() ||
            !email.value.trim() ||
            !message.value.trim()
        ) {
            formStatus.textContent =
                "Please complete your name, email, and message.";
            formStatus.className = "form-status error";
            return;
        }

        if (!email.checkValidity()) {
            email.reportValidity();
            return;
        }

        const submitButton =
            contactForm.querySelector('button[type="submit"], input[type="submit"]');

        const originalText = submitButton
            ? (submitButton.textContent || submitButton.value)
            : "";

        if (submitButton) {
            submitButton.disabled = true;

            if (submitButton.tagName === "INPUT") {
                submitButton.value = "Sending...";
            } else {
                submitButton.textContent = "Sending...";
            }
        }

        formStatus.textContent = "Sending your message...";
        formStatus.className = "form-status sending";

        try {
            // Replace with your KKOPI.TEA Formspree endpoint if different.
            const endpoint = "https://formspree.io/f/mqppqgjq";

            const formData = new FormData(contactForm);
            formData.set("_replyto", email.value.trim());
            formData.set("_subject", subject.value.trim() || "KKOPI.TEA Inquiry");

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json"
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.errors
                        ? result.errors.map(error => error.message).join(" ")
                        : "Failed to send your message."
                );
            }

            formStatus.textContent =
                "Message sent successfully! Thank you for contacting KKOPI.TEA.";
            formStatus.className = "form-status success";

            contactForm.reset();

        } catch (error) {
            console.error("Contact form error:", error);

            formStatus.textContent =
                error.message || "Unable to send your message. Please try again.";
            formStatus.className = "form-status error";

        } finally {
            if (submitButton) {
                submitButton.disabled = false;

                if (submitButton.tagName === "INPUT") {
                    submitButton.value = originalText;
                } else {
                    submitButton.textContent = originalText;
                }
            }
        }
    });
}


/* START */

loadStoreInformation();