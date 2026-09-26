import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const CLOUDINARY_CLOUD_NAME = "c1kodukt";

const CLOUDINARY_UPLOAD_PRESET = "Kkopi.tea";

const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


const form =
    document.getElementById("add-product-form");

const imageUploadBox =
    document.getElementById("image-upload-box");

const imageUploadContent =
    document.getElementById("image-upload-content");

const productImage =
    document.getElementById("product-image");

const uploadButton =
    document.getElementById("upload-button");

const imagePreview =
    document.getElementById("image-preview");

const previewImage =
    document.getElementById("preview-image");

const removeImageButton =
    document.getElementById("remove-image-button");

const itemName =
    document.getElementById("item-name");

const itemCategory =
    document.getElementById("product-category");

const itemUnit =
    document.getElementById("product-unit");

const itemStock =
    document.getElementById("product-stock");

const itemStatus =
    document.getElementById("product-status");

const itemDescription =
    document.getElementById("product-description");

const characterCounter =
    document.getElementById("character-counter");

const formMessage =
    document.getElementById("form-message");

const formMessageText =
    document.getElementById("form-message-text");

const saveItemButton =
    document.getElementById("save-product-button");

const nameError =
    document.getElementById("name-error");

const categoryError =
    document.getElementById("category-error");

const unitError =
    document.getElementById("unit-error");

const stockError =
    document.getElementById("stock-error");

const imageError =
    document.getElementById("image-error");


let selectedImage = null;


/* Open file selector */

uploadButton.addEventListener("click", () => {

    productImage.click();

});


/* Select image */

productImage.addEventListener("change", () => {

    const file =
        productImage.files[0];

    if (!file) {
        return;
    }

    handleImage(file);

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

    const file =
        event.dataTransfer.files[0];

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
        "image/jpg",
        "image/png"
    ];

    const maxSize =
        5 * 1024 * 1024;


    if (!allowedTypes.includes(file.type)) {

        showImageError(
            "Please upload a JPG or PNG image."
        );

        productImage.value = "";

        return;

    }


    if (file.size > maxSize) {

        showImageError(
            "Image size must be 5MB or smaller."
        );

        productImage.value = "";

        return;

    }


    selectedImage = file;


    const reader =
        new FileReader();


    reader.onload = (event) => {

        previewImage.src =
            event.target.result;

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

    const changeButton =
        event.target.closest(".change-image-button");

    if (!changeButton) {
        return;
    }

    productImage.click();

});


/* Character counter */

itemDescription.addEventListener("input", () => {

    const currentLength =
        itemDescription.value.length;

    characterCounter.textContent =
        `${currentLength} / 300`;

});


/* Clear errors */

function clearErrors() {

    nameError.textContent = "";

    categoryError.textContent = "";

    unitError.textContent = "";

    stockError.textContent = "";

    clearImageError();

}


/* Show image error */

function showImageError(message) {

    imageError.textContent =
        message;

}


/* Clear image error */

function clearImageError() {

    imageError.textContent = "";

}


/* Show form message */

function showMessage(message, type) {

    formMessageText.textContent =
        message;

    formMessage.className =
        `form-message ${type}`;

}


/* Hide form message */

function hideMessage() {

    formMessageText.textContent = "";

    formMessage.className =
        "form-message";

}


/* Validate form */

function validateForm() {

    clearErrors();

    let isValid = true;


    const name =
        itemName.value.trim();

    const category =
        itemCategory.value;

    const unit =
        itemUnit.value.trim();

    const stock =
        Number(itemStock.value);


    if (!name) {

        nameError.textContent =
            "Please enter an item name.";

        isValid = false;

    }


    if (!category) {

        categoryError.textContent =
            "Please select a category.";

        isValid = false;

    }


    if (!unit) {

        unitError.textContent =
            "Please enter a unit.";

        isValid = false;

    }


    if (
        itemStock.value === "" ||
        Number.isNaN(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
    ) {

        stockError.textContent =
            "Please enter a valid stock quantity.";

        isValid = false;

    }


    if (!selectedImage) {

        showImageError(
            "Please upload an item image."
        );

        isValid = false;

    }


    return isValid;

}


/* Upload image to Cloudinary */

async function uploadImageToCloudinary(file) {

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const response =
        await fetch(
            CLOUDINARY_UPLOAD_URL,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        const errorData =
            await response
                .json()
                .catch(() => null);


        console.error(
            "Cloudinary error:",
            errorData
        );


        throw new Error(
            "Cloudinary image upload failed."
        );

    }


    const data =
        await response.json();


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


/* Change button loading state */

function setButtonLoading(message) {

    saveItemButton.disabled = true;


    saveItemButton.innerHTML = `
        <span class="button-icon">
            <i class="fa-solid fa-spinner fa-spin"></i>
        </span>

        <span>${message}</span>
    `;

}


/* Restore button */

function restoreButton() {

    saveItemButton.disabled = false;


    saveItemButton.innerHTML = `
        <span class="button-icon">
            <i class="fa-solid fa-plus"></i>
        </span>

        <span>Add Item</span>
    `;

}


/* Submit item */

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    hideMessage();


    if (!validateForm()) {
        return;
    }


    const name =
        itemName.value.trim();

    const category =
        itemCategory.value;

    const unit =
        itemUnit.value.trim();

    const stock =
        Number(itemStock.value);

    const status =
        itemStatus.value;

    const description =
        itemDescription.value.trim();


    try {

        setButtonLoading(
            "Uploading image..."
        );


        const cloudinaryResult =
            await uploadImageToCloudinary(
                selectedImage
            );


        setButtonLoading(
            "Saving item..."
        );


        await addDoc(
            collection(db, "inventory"),
            {
                name: name,

                category: category,

                unit: unit,

                stock: stock,

                status: status,

                description: description,

                imageUrl:
                    cloudinaryResult.imageUrl,

                cloudinaryPublicId:
                    cloudinaryResult.publicId,

                createdAt:
                    serverTimestamp()
            }
        );


        showMessage(
            "Item added successfully!",
            "success"
        );


        setButtonLoading(
            "Item added!"
        );


        setTimeout(() => {

            window.location.href =
                "admin-inventory.php";

        }, 1000);


    } catch (error) {

        console.error(
            "Add item error:",
            error
        );


        showMessage(
            "Something went wrong while adding the item. Please try again.",
            "error"
        );


        restoreButton();

    }

});