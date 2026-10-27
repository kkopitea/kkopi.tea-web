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



const form = document.getElementById("add-product-form");

// IMAGE ELEMENTS
const imageUploadBox = document.getElementById("image-upload-box");
const imageUploadContent = document.getElementById("image-upload-content");
const productImage = document.getElementById("product-image");
const uploadButton = document.getElementById("upload-button");
const imagePreview = document.getElementById("image-preview");
const previewImage = document.getElementById("preview-image");
const removeImageButton = document.getElementById("remove-image-button");

// PRODUCT INFORMATION
const productName = document.getElementById("product-name");
const productCategory = document.getElementById("product-category");
// PRODUCT OPTIONS
const sizesSection = document.getElementById("sizes-section");
const sugarLevelsSection = document.getElementById("sugar-levels-section");

function toggleProductOptions() {
    const isSnack = productCategory.value === "snacks";

    if (sizesSection) {
        sizesSection.hidden = isSnack;
    }

    if (sugarLevelsSection) {
        sugarLevelsSection.hidden = isSnack;
    }
}

productCategory.addEventListener("change", toggleProductOptions);
toggleProductOptions();
const productPrice = document.getElementById("product-price");
const productStatus = document.getElementById("product-status");
const productDescription = document.getElementById("product-description");
const characterCounter = document.getElementById("character-counter");

// FORM MESSAGES AND BUTTONS
const formMessage = document.getElementById("form-message");
const formMessageText = document.getElementById("form-message-text");
const saveProductButton = document.getElementById("save-product-button");

// VALIDATION ERRORS
const nameError = document.getElementById("name-error");
const categoryError = document.getElementById("category-error");
const priceError = document.getElementById("price-error");
const imageError = document.getElementById("image-error");


/* Size controls */

const size16ozAdditional =
    document.querySelector('input[name="16oz_additional"]');

const size22ozAdditional =
    document.querySelector('input[name="22oz_additional"]');

const sizeCheckboxes =
    document.querySelectorAll('input[name="sizes[]"]');


/* Sugar level controls */

const sugarCheckboxes =
    document.querySelectorAll('input[name="sugar_levels[]"]');


let selectedImage = null;


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


/* Load admin profile */

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
    const changeButton = event.target.closest(".change-image-button");

    if (!changeButton) {
        return;
    }

    productImage.click();
});


/* Character counter */

productDescription.addEventListener("input", () => {
    const currentLength = productDescription.value.length;

    characterCounter.textContent =
        `${currentLength} / 300`;
});


/* Clear errors */

function clearErrors() {
    nameError.textContent = "";
    categoryError.textContent = "";
    priceError.textContent = "";

    clearImageError();
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
            additionalPrice = getAdditionalPrice(size16ozAdditional);
        } else if (checkbox.value === "22oz") {
            additionalPrice = getAdditionalPrice(size22ozAdditional);
        }

        sizes.push({
            name: checkbox.value,
            additionalPrice: additionalPrice
        });
    });

    return sizes;
}


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


/* Validate sizes */

function validateSizes() {
    if (
        !size16ozAdditional ||
        !size22ozAdditional
    ) {
        console.error("Size price inputs are missing from the PHP form.");
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

        if (!Number.isFinite(value) || value < 0) {
            return false;
        }
    }

    return true;
}


/* Validate sugar levels */

function validateSugarLevels() {
    return getSelectedSugarLevels().length > 0;
}

function isSnackCategory() {
    return productCategory.value === "snacks";
}

/* Validate form */

function validateForm() {
    clearErrors();

    let isValid = true;

    const name = productName.value.trim();
    const category = productCategory.value;
    const price = Number(productPrice.value);

    if (!name) {
        nameError.textContent = "Please enter a product name.";
        isValid = false;
    }

    if (!category) {
        categoryError.textContent = "Please select a category.";
        isValid = false;
    }

    if (
        productPrice.value === "" ||
        !Number.isFinite(price) ||
        price < 0
    ) {
        priceError.textContent = "Please enter a valid price.";
        isValid = false;
    }

    if (!selectedImage) {
        showImageError("Please upload a product image.");
        isValid = false;
    }

    // Drinks require sizes and sugar levels.
    // Snacks can be added without these options.
    if (!isSnackCategory()) {
        if (!validateSizes()) {
            isValid = false;
        }

        if (!validateSugarLevels()) {
            isValid = false;
        }
    }

    return isValid;
}


/* Upload image to Cloudinary */

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

        throw new Error("Cloudinary image upload failed.");
    }

    const data = await response.json();

    if (!data.secure_url) {
        throw new Error("Cloudinary did not return an image URL.");
    }

    return {
        imageUrl: data.secure_url,
        publicId: data.public_id
    };
}


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


/* Submit product */

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

    const sizes = isSnackCategory() ? [] : getSizes();

    const sugarLevels = isSnackCategory()
    ? []
    : getSelectedSugarLevels();

    console.log("PRODUCT DATA:", {
        name,
        description,
        categoryId,
        basePrice,
        isAvailable,
        sizes,
        sugarLevels
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

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        console.log("FIRESTORE PRODUCT DATA:", productData);

        await addDoc(
            collection(db, "products"),
            productData
        );

        showMessage("Product added successfully!", "success");

        setButtonLoading("Product added!");

        setTimeout(() => {
            window.location.href = "menu-management.php";
        }, 1000);

    } catch (error) {
        console.error("Add product error:", error);

        showMessage(
            error.message || "Something went wrong while adding the product. Please try again.",
            "error"
        );

        restoreButton();
    }
});