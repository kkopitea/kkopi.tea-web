import { db } from "./firebase-config.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const editItemForm = document.getElementById("edit-item-form");

const itemName = document.getElementById("item-name");
const itemCategory = document.getElementById("product-category");
const itemUnit = document.getElementById("product-unit");
const itemStock = document.getElementById("product-stock");
const itemStatus = document.getElementById("product-status");
const itemDescription = document.getElementById("product-description");

const imageUploadBox = document.getElementById("image-upload-box");
const imageUploadContent = document.getElementById("image-upload-content");
const imageInput = document.getElementById("product-image");
const uploadButton = document.getElementById("upload-button");

const imagePreview = document.getElementById("image-preview");
const previewImage = document.getElementById("preview-image");
const removeImageButton = document.getElementById("remove-image-button");
const changeImageButton = document.querySelector(".change-image-button");

const nameError = document.getElementById("name-error");
const categoryError = document.getElementById("category-error");
const unitError = document.getElementById("unit-error");
const stockError = document.getElementById("stock-error");
const imageError = document.getElementById("image-error");

const formMessage = document.getElementById("form-message");
const formMessageText = document.getElementById("form-message-text");

const characterCounter = document.getElementById("character-counter");
const saveButton = document.getElementById("save-product-button");


const CLOUDINARY_CLOUD_NAME = "c1kodukt";
const CLOUDINARY_UPLOAD_PRESET = "Kkopi.tea";


const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get("id");


let existingImageUrl = "";
let existingCloudinaryPublicId = "";

let selectedImageFile = null;
let removeExistingImage = false;


/* LOAD ITEM */

async function loadItem() {

    if (!itemId) {

        showMessage(
            "error",
            "No item ID was provided."
        );

        disableForm();

        return;
    }

    try {

        const itemReference = doc(
            db,
            "inventory",
            itemId
        );

        const itemSnapshot = await getDoc(itemReference);

        if (!itemSnapshot.exists()) {

            showMessage(
                "error",
                "The inventory item could not be found."
            );

            disableForm();

            return;
        }

        const item = itemSnapshot.data();


        /* ITEM NAME */

        itemName.value =
            item.name ||
            item.item ||
            "";


        /* CATEGORY */

        itemCategory.value =
            item.category ||
            "other";


        /* UNIT */

        itemUnit.value =
            item.unit ||
            "";


        /* STOCK */

        itemStock.value =
            item.stock !== undefined
                ? item.stock
                : 0;


        /* STATUS */

        if (item.status) {

            itemStatus.value = item.status;

        } else {

            itemStatus.value =
                Number(item.stock || 0) > 0
                    ? "active"
                    : "inactive";

        }


        /* DESCRIPTION */

        itemDescription.value =
            item.description ||
            "";


        /* IMAGE */

        existingImageUrl =
            item.imageUrl ||
            "";

        existingCloudinaryPublicId =
            item.cloudinaryPublicId ||
            "";


        if (existingImageUrl) {

            showExistingImage(
                existingImageUrl
            );

        }


        updateCharacterCounter();

    } catch (error) {

        console.error(
            "Error loading inventory item:",
            error
        );

        showMessage(
            "error",
            "Unable to load the item. Please try again."
        );

        disableForm();
    }
}


/* SHOW EXISTING IMAGE */

function showExistingImage(imageUrl) {

    previewImage.src = imageUrl;

    imagePreview.hidden = false;
    imageUploadContent.hidden = true;

}


/* IMAGE UPLOAD BUTTON */

if (uploadButton) {

    uploadButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            imageInput.click();

        }
    );

}


/* IMAGE BOX CLICK */

if (imageUploadBox) {

    imageUploadBox.addEventListener(
        "click",
        (event) => {

            if (
                event.target.closest(
                    "#remove-image-button"
                )
            ) {
                return;
            }

            if (
                event.target.closest(
                    ".upload-button"
                )
            ) {
                return;
            }

            if (
                event.target.closest(
                    ".change-image-button"
                )
            ) {
                return;
            }

            imageInput.click();

        }
    );

}


/* IMAGE FILE CHANGE */

if (imageInput) {

    imageInput.addEventListener(
        "change",
        () => {

            const file =
                imageInput.files[0];

            if (!file) {
                return;
            }

            handleSelectedImage(file);

        }
    );

}


/* HANDLE SELECTED IMAGE */

function handleSelectedImage(file) {

    clearError(imageError);


    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];


    if (!allowedTypes.includes(file.type)) {

        showFieldError(
            imageError,
            "Please select a JPG or PNG image."
        );

        imageInput.value = "";

        return;
    }


    if (file.size > 5 * 1024 * 1024) {

        showFieldError(
            imageError,
            "Image size must not exceed 5MB."
        );

        imageInput.value = "";

        return;
    }


    selectedImageFile = file;

    removeExistingImage = false;


    const imageUrl =
        URL.createObjectURL(file);


    previewImage.src = imageUrl;

    imagePreview.hidden = false;
    imageUploadContent.hidden = true;

}


/* REMOVE IMAGE */

if (removeImageButton) {

    removeImageButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            selectedImageFile = null;

            removeExistingImage = true;

            imageInput.value = "";

            previewImage.src = "";

            imagePreview.hidden = true;
            imageUploadContent.hidden = false;

        }
    );

}


/* CHANGE IMAGE */

if (changeImageButton) {

    changeImageButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            imageInput.click();

        }
    );

}


/* DRAG AND DROP */

if (imageUploadBox) {

    imageUploadBox.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            imageUploadBox.classList.add(
                "dragging"
            );

        }
    );


    imageUploadBox.addEventListener(
        "dragleave",
        () => {

            imageUploadBox.classList.remove(
                "dragging"
            );

        }
    );


    imageUploadBox.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            imageUploadBox.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer.files[0];

            if (!file) {
                return;
            }


            handleSelectedImage(file);

        }
    );

}


/* DESCRIPTION COUNTER */

if (itemDescription) {

    itemDescription.addEventListener(
        "input",
        updateCharacterCounter
    );

}


function updateCharacterCounter() {

    if (!itemDescription || !characterCounter) {
        return;
    }

    const currentLength =
        itemDescription.value.length;

    characterCounter.textContent =
        `${currentLength} / 300`;

}


/* FORM SUBMIT */

if (editItemForm) {

    editItemForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            clearErrors();

            hideMessage();


            const validationResult =
                validateForm();


            if (!validationResult) {
                return;
            }


            setLoading(true);


            try {

                let imageUrl =
                    existingImageUrl;

                let cloudinaryPublicId =
                    existingCloudinaryPublicId;


                /* UPLOAD NEW IMAGE */

                if (selectedImageFile) {

                    const uploadResult =
                        await uploadToCloudinary(
                            selectedImageFile
                        );


                    imageUrl =
                        uploadResult.secure_url ||
                        "";

                    cloudinaryPublicId =
                        uploadResult.public_id ||
                        "";

                }


                /* REMOVE EXISTING IMAGE */

                if (removeExistingImage) {

                    imageUrl = "";
                    cloudinaryPublicId = "";

                }


                const updatedItem = {

                    name:
                        itemName.value.trim(),

                    category:
                        itemCategory.value,

                    unit:
                        itemUnit.value.trim(),

                    stock:
                        Number(
                            itemStock.value
                        ),

                    status:
                        itemStatus.value,

                    description:
                        itemDescription.value.trim(),

                    imageUrl:
                        imageUrl,

                    cloudinaryPublicId:
                        cloudinaryPublicId,

                    updatedAt:
                        serverTimestamp()

                };


                await updateDoc(
                    doc(
                        db,
                        "inventory",
                        itemId
                    ),
                    updatedItem
                );


                showMessage(
                    "success",
                    "Item updated successfully."
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "admin-inventory.php";

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "Error updating inventory item:",
                    error
                );


                showMessage(
                    "error",
                    "Unable to update the item. Please try again."
                );


                setLoading(false);

            }

        }
    );

}


/* VALIDATE FORM */

function validateForm() {

    let isValid = true;


    const name =
        itemName.value.trim();

    const unit =
        itemUnit.value.trim();

    const stock =
        itemStock.value;


    if (!name) {

        showFieldError(
            nameError,
            "Item name is required."
        );

        isValid = false;

    }


    if (!itemCategory.value) {

        showFieldError(
            categoryError,
            "Please select a category."
        );

        isValid = false;

    }


    if (!unit) {

        showFieldError(
            unitError,
            "Unit is required."
        );

        isValid = false;

    }


    if (
        stock === "" ||
        Number(stock) < 0
    ) {

        showFieldError(
            stockError,
            "Please enter a valid stock quantity."
        );

        isValid = false;

    }


    return isValid;

}


/* CLOUDINARY UPLOAD */

async function uploadToCloudinary(file) {

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
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        throw new Error(
            "Cloudinary upload failed."
        );

    }


    return await response.json();

}


/* FIELD ERROR */

function showFieldError(
    element,
    message
) {

    if (!element) {
        return;
    }

    element.textContent =
        message;

}


/* CLEAR FIELD ERROR */

function clearError(element) {

    if (!element) {
        return;
    }

    element.textContent = "";

}


/* CLEAR ALL ERRORS */

function clearErrors() {

    clearError(nameError);
    clearError(categoryError);
    clearError(unitError);
    clearError(stockError);
    clearError(imageError);

}


/* SHOW MESSAGE */

function showMessage(
    type,
    message
) {

    if (!formMessage || !formMessageText) {
        return;
    }


    formMessage.className =
        `form-message show ${type}`;


    formMessageText.textContent =
        message;

}


/* HIDE MESSAGE */

function hideMessage() {

    if (!formMessage) {
        return;
    }

    formMessage.className =
        "form-message";

}


/* LOADING STATE */

function setLoading(isLoading) {

    if (!saveButton) {
        return;
    }


    saveButton.disabled =
        isLoading;


    if (isLoading) {

        saveButton.innerHTML = `
            <span class="button-icon">
                <i class="fa-solid fa-spinner fa-spin"></i>
            </span>

            <span>
                Saving...
            </span>
        `;

    } else {

        saveButton.innerHTML = `
            <span class="button-icon">
                <i class="fa-solid fa-pen"></i>
            </span>

            <span>
                Save Changes
            </span>
        `;

    }

}


/* DISABLE FORM */

function disableForm() {

    if (!editItemForm) {
        return;
    }


    const formElements =
        editItemForm.querySelectorAll(
            "input, select, textarea, button"
        );


    formElements.forEach(
        (element) => {

            element.disabled = true;

        }
    );

}


/* INITIALIZE */

loadItem();
updateCharacterCounter();