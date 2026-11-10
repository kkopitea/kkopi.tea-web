
import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const CLOUDINARY_CLOUD_NAME = "c1kodukt";
const CLOUDINARY_UPLOAD_PRESET = "Kkopi.tea";

const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


/* PRODUCT CATEGORIES */

const PRODUCT_CATEGORIES = {
    icedlattes: "Iced Lattes",
    bubbleteas: "Bubble Teas",
    fruitteas: "Fruit Teas",
    noncaffeine: "Non Caffeine",
    amerikano: "Amerikano"
};


/* FORM ELEMENTS */

const form = document.getElementById("add-product-form");


/* IMAGE ELEMENTS */

const imageUploadBox = document.getElementById("image-upload-box");
const imageUploadContent = document.getElementById("image-upload-content");
const productImage = document.getElementById("product-image");
const uploadButton = document.getElementById("upload-button");
const imagePreview = document.getElementById("image-preview");
const previewImage = document.getElementById("preview-image");
const removeImageButton = document.getElementById("remove-image-button");


/* PRODUCT INFORMATION */

const productName = document.getElementById("product-name");
const productCategory = document.getElementById("product-category");
const productPrice = document.getElementById("product-price");
const productStatus = document.getElementById("product-status");
const productDescription = document.getElementById("product-description");
const characterCounter = document.getElementById("character-counter");


/* PRODUCT OPTIONS */

const sizesSection = document.getElementById("sizes-section");
const sugarLevelsSection = document.getElementById("sugar-levels-section");


/* FORM MESSAGES AND BUTTONS */

const formMessage = document.getElementById("form-message");
const formMessageText = document.getElementById("form-message-text");
const saveProductButton = document.getElementById("save-product-button");


/* VALIDATION ERRORS */

const nameError = document.getElementById("name-error");
const categoryError = document.getElementById("category-error");
const priceError = document.getElementById("price-error");
const imageError = document.getElementById("image-error");


/* SIZE CONTROLS */

const size16ozAdditional =
    document.querySelector('input[name="16oz_additional"]');

const size22ozAdditional =
    document.querySelector('input[name="22oz_additional"]');

const sizeCheckboxes =
    document.querySelectorAll('input[name="sizes[]"]');


/* SUGAR LEVEL CONTROLS */

const sugarCheckboxes =
    document.querySelectorAll('input[name="sugar_levels[]"]');


let selectedImage = null;


/* =========================================
   ADD-ONS SECTION
========================================= */

/*
   This creates the Add-ons section through JavaScript.
   You do not need to add the Add-ons HTML manually.
*/

const addonsSection = document.createElement("div");
addonsSection.id = "addons-section";
addonsSection.className = "product-option-group";

addonsSection.innerHTML = `
    <div class="product-option-title">
        <div>
            <span>Add-ons</span>
            <small>
                Add optional extras and their additional prices.
            </small>
        </div>
    </div>

    <div id="addons-list"></div>

    <button type="button" id="add-addon-button">
        <i class="fa-solid fa-plus"></i>
        Add Add-on
    </button>

    <p id="addons-error" class="error-message"></p>
`;

const addonsList = addonsSection.querySelector("#addons-list");
const addAddonButton = addonsSection.querySelector("#add-addon-button");
const addonsError = addonsSection.querySelector("#addons-error");


/* Place Add-ons after the sugar level section */

if (sugarLevelsSection) {
    sugarLevelsSection.insertAdjacentElement(
        "afterend",
        addonsSection
    );
} else {
    const submitButton = form.querySelector('[type="submit"]');

    if (submitButton) {
        submitButton.parentElement.insertAdjacentElement(
            "beforebegin",
            addonsSection
        );
    } else {
        form.appendChild(addonsSection);
    }
}


/* Create an add-on row */

function createAddonRow() {
    const addonRow = document.createElement("div");

    addonRow.className = "addon-row";

    addonRow.innerHTML = `
        <div class="addon-input-group">
            <input
                type="text"
                name="addon-name[]"
                class="addon-name"
                placeholder="Add-on name (e.g. Pearls)"
                maxlength="50"
                aria-label="Add-on name"
            >

            <input
                type="number"
                name="addon-price[]"
                class="addon-price"
                placeholder="Additional price"
                min="0"
                step="0.01"
                aria-label="Add-on price"
            >

            <button
                type="button"
                class="remove-addon-button"
                aria-label="Remove add-on"
                title="Remove add-on"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    addonsList.appendChild(addonRow);

    const nameInput = addonRow.querySelector(".addon-name");

    nameInput.focus();
}


/* Add add-on button */

addAddonButton.addEventListener("click", () => {
    addonsError.textContent = "";
    createAddonRow();
});


/* Remove add-on */

addonsList.addEventListener("click", (event) => {
    const removeButton = event.target.closest(
        ".remove-addon-button"
    );

    if (!removeButton) {
        return;
    }

    const addonRow = removeButton.closest(".addon-row");

    if (addonRow) {
        addonRow.remove();
    }

    addonsError.textContent = "";
});


/* Get add-ons */

function getAddons() {
    const addons = [];

    const addonRows = addonsList.querySelectorAll(".addon-row");

    addonRows.forEach((row) => {
        const nameInput = row.querySelector(".addon-name");
        const priceInput = row.querySelector(".addon-price");

        const name = nameInput.value.trim();
        const priceValue = priceInput.value;

        // Ignore completely empty rows.
        if (!name && priceValue === "") {
            return;
        }

        addons.push({
            name: name,
            price: Number(priceValue)
        });
    });

    return addons;
}


/* Validate add-ons */

function validateAddons() {
    const addonRows = addonsList.querySelectorAll(".addon-row");

    for (const row of addonRows) {
        const nameInput = row.querySelector(".addon-name");
        const priceInput = row.querySelector(".addon-price");

        const name = nameInput.value.trim();
        const priceValue = priceInput.value;
        const price = Number(priceValue);

        // Both fields are empty, so ignore this row.
        if (!name && priceValue === "") {
            continue;
        }

        // Require both name and price.
        if (!name || priceValue === "") {
            addonsError.textContent =
                "Please complete both the add-on name and price.";

            return false;
        }

        if (
            !Number.isFinite(price) ||
            price < 0
        ) {
            addonsError.textContent =
                "Please enter a valid add-on price.";

            return false;
        }
    }

    addonsError.textContent = "";

    return true;
}


/* =========================================
   IMAGE UPLOAD
========================================= */


/* Open file selector */

uploadButton.addEventListener("click", () => {
    productImage.click();
});


/* Select image */

productImage.addEventListener("change", () => {
    const file = productImage.files[0];

    if (!file) {
        return;
    }

    handleImage(file);
});


/* Handle image */

function handleImage(file) {
    clearImageError();

    const allowedTypes = [
        "image/jpeg",
        "image/png"
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        showImageError("Please upload a JPG or PNG image.");
        productImage.value = "";
        return;
    }

    if (file.size > maxSize) {
        showImageError("Image size must be 5MB or smaller.");
        productImage.value = "";
        return;
    }

    selectedImage = file;

    const reader = new FileReader();

    reader.onload = (event) => {
        previewImage.src = event.target.result;

        imageUploadContent.hidden = true;
        imagePreview.hidden = false;
    };

    reader.readAsDataURL(file);
}


/* Remove image */

removeImageButton.addEventListener("click", () => {
    selectedImage = null;
    productImage.value = "";
    previewImage.src = "";

    imagePreview.hidden = true;
    imageUploadContent.hidden = false;

    clearImageError();
});


/* Change image */

imagePreview.addEventListener("click", (event) => {
    const changeButton = event.target.closest(
        ".change-image-button"
    );

    if (!changeButton) {
        return;
    }

    productImage.click();
});


/* Drag over */

imageUploadBox.addEventListener("dragover", (event) => {
    event.preventDefault();

    imageUploadBox.classList.add("dragging");
});


/* Drag leave */

imageUploadBox.addEventListener("dragleave", () => {
    imageUploadBox.classList.remove("dragging");
});


/* Drop image */

imageUploadBox.addEventListener("drop", (event) => {
    event.preventDefault();

    imageUploadBox.classList.remove("dragging");

    const file = event.dataTransfer.files[0];

    if (!file) {
        return;
    }

    handleImage(file);
});


/* =========================================
   ADMIN PROFILE
========================================= */

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        return;
    }

    try {
        const adminSnapshot = await getDoc(
            doc(db, "admins", user.uid)
        );

        if (!adminSnapshot.exists()) {
            console.error("Admin document not found.");
            return;
        }

        const adminData = adminSnapshot.data();

        const greeting = document.getElementById("adminGreeting");
        const role = document.getElementById("adminRole");

        if (greeting) {
            greeting.textContent =
                adminData.name || user.email || "Admin";
        }

        if (role) {
            role.textContent =
                adminData.role || "Administrator";
        }

    } catch (error) {
        console.error("Error loading admin profile:", error);
    }
});


/* =========================================
   CHARACTER COUNTER
========================================= */

productDescription.addEventListener("input", () => {
    const currentLength = productDescription.value.length;

    characterCounter.textContent =
        `${currentLength} / 300`;
});


/* =========================================
   ERROR HANDLING
========================================= */


/* Clear errors */

function clearErrors() {
    nameError.textContent = "";
    categoryError.textContent = "";
    priceError.textContent = "";

    clearImageError();

    addonsError.textContent = "";
}


/* Show image error */

function showImageError(message) {
    imageError.textContent = message;
}


/* Clear image error */

function clearImageError() {
    imageError.textContent = "";
}


/* Show form message */

function showMessage(message, type) {
    formMessageText.textContent = message;
    formMessage.className = `form-message show ${type}`;
}


/* Hide form message */

function hideMessage() {
    formMessageText.textContent = "";
    formMessage.className = "form-message";
}


/* =========================================
   SIZE FUNCTIONS
========================================= */


/* Get additional price */

function getAdditionalPrice(input) {
    if (!input || input.value === "") {
        return 0;
    }

    const value = Number(input.value);

    if (!Number.isFinite(value) || value < 0) {
        return 0;
    }

    return value;
}


/* Get selected sizes */

function getSizes() {
    const sizes = [];

    sizeCheckboxes.forEach((checkbox) => {
        if (!checkbox.checked) {
            return;
        }

        let additionalPrice = 0;

        if (checkbox.value === "16oz") {
            additionalPrice = getAdditionalPrice(
                size16ozAdditional
            );

        } else if (checkbox.value === "22oz") {
            additionalPrice = getAdditionalPrice(
                size22ozAdditional
            );
        }

        sizes.push({
            name: checkbox.value,
            additionalPrice: additionalPrice
        });
    });

    return sizes;
}


/* Validate sizes */

function validateSizes() {
    if (
        !size16ozAdditional ||
        !size22ozAdditional
    ) {
        console.error(
            "Size price inputs are missing from the PHP form."
        );

        return false;
    }

    if (![...sizeCheckboxes].some((checkbox) => checkbox.checked)) {
        return false;
    }

    const sizeInputs = [
        size16ozAdditional,
        size22ozAdditional
    ];

    for (const input of sizeInputs) {
        if (input.value === "") {
            continue;
        }

        const value = Number(input.value);

        if (
            !Number.isFinite(value) ||
            value < 0
        ) {
            return false;
        }
    }

    return true;
}


/* =========================================
   SUGAR LEVEL FUNCTIONS
========================================= */


/* Get selected sugar levels */

function getSelectedSugarLevels() {
    const sugarLevels = [];

    sugarCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            sugarLevels.push(checkbox.value);
        }
    });

    return sugarLevels;
}


/* Validate sugar levels */

function validateSugarLevels() {
    return getSelectedSugarLevels().length > 0;
}


/* =========================================
   CATEGORY FUNCTIONS
========================================= */


/* Validate selected category */

function validateCategory(category) {
    return Object.prototype.hasOwnProperty.call(
        PRODUCT_CATEGORIES,
        category
    );
}


/* =========================================
   FORM VALIDATION
========================================= */

function validateForm() {
    clearErrors();

    let isValid = true;

    const name = productName.value.trim();
    const category = productCategory.value;
    const price = Number(productPrice.value);

    /* Product name */

    if (!name) {
        nameError.textContent =
            "Please enter a product name.";

        isValid = false;
    }


    /* Product category */

    if (!category) {
        categoryError.textContent =
            "Please select a category.";

        isValid = false;

    } else if (!validateCategory(category)) {
        categoryError.textContent =
            "Please select a valid product category.";

        isValid = false;
    }


    /* Product price */

    if (
        productPrice.value === "" ||
        !Number.isFinite(price) ||
        price < 0
    ) {
        priceError.textContent =
            "Please enter a valid price.";

        isValid = false;
    }


    /* Product image */

    if (!selectedImage) {
        showImageError(
            "Please upload a product image."
        );

        isValid = false;
    }


    /* Sizes */

    if (!validateSizes()) {
        isValid = false;
    }


    /* Sugar levels */

    if (!validateSugarLevels()) {
        isValid = false;
    }


    /* Add-ons */

    if (!validateAddons()) {
        isValid = false;
    }

    return isValid;
}


/* =========================================
   CLOUDINARY IMAGE UPLOAD
========================================= */

async function uploadImageToCloudinary(file) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        CLOUDINARY_UPLOAD_URL,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("Cloudinary error:", errorData);

        throw new Error(
            "Cloudinary image upload failed."
        );
    }

    const data = await response.json();

    if (!data.secure_url) {
        throw new Error(
            "Cloudinary did not return an image URL."
        );
    }

    return {
        imageUrl: data.secure_url,
        publicId: data.public_id
    };
}


/* =========================================
   BUTTON LOADING
========================================= */


/* Loading button */

function setButtonLoading(message) {
    saveProductButton.disabled = true;

    saveProductButton.innerHTML = `
        <span class="button-icon">
            <i class="fa-solid fa-spinner fa-spin"></i>
        </span>

        <span>${message}</span>
    `;
}


/* Restore button */

function restoreButton() {
    saveProductButton.disabled = false;

    saveProductButton.innerHTML = `
        <span class="button-icon">
            <i class="fa-solid fa-plus"></i>
        </span>

        <span>Add Product</span>
    `;
}


/* =========================================
   SUBMIT PRODUCT
========================================= */

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    hideMessage();

    if (!validateForm()) {
        return;
    }

    const name = productName.value.trim();
    const categoryId = productCategory.value;
    const basePrice = Number(productPrice.value);
    const isAvailable = productStatus.value === "active";
    const description = productDescription.value.trim();

    const sizes = getSizes();
    const sugarLevels = getSelectedSugarLevels();
    const addons = getAddons();


    console.log("PRODUCT DATA:", {
        name,
        description,
        categoryId,
        categoryName: PRODUCT_CATEGORIES[categoryId],
        basePrice,
        isAvailable,
        sizes,
        sugarLevels,
        addons
    });


    try {
        setButtonLoading("Uploading image...");

        const cloudinaryResult =
            await uploadImageToCloudinary(selectedImage);


        setButtonLoading("Saving product...");


        const productData = {
            name: name,
            description: description,

            categoryId: categoryId,

            basePrice: basePrice,

            imageUrl: cloudinaryResult.imageUrl,
            cloudinaryPublicId: cloudinaryResult.publicId,

            isAvailable: isAvailable,

            sizes: sizes,
            sugarLevels: sugarLevels,
            addons: addons,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };


        console.log(
            "FIRESTORE PRODUCT DATA:",
            productData
        );


        await addDoc(
            collection(db, "products"),
            productData
        );


        showMessage(
            "Product added successfully!",
            "success"
        );


        setButtonLoading("Product added!");


        setTimeout(() => {
            window.location.href = "menu-management.php";
        }, 1000);


    } catch (error) {
        console.error("Add product error:", error);

        showMessage(
            error.message ||
            "Something went wrong while adding the product. Please try again.",
            "error"
        );

        restoreButton();
    }
});
