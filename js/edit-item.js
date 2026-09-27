import { db } from "./firebase-config.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


/* CLOUDINARY */

const CLOUDINARY_CLOUD_NAME = "c1kodukt";
const CLOUDINARY_UPLOAD_PRESET = "Kkopi.tea";


/* FORM */

const editItemForm =
    document.getElementById("edit-product-form");


/* INPUTS */

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


/* IMAGE */

const imageUploadBox =
    document.getElementById("image-upload-box");

const imageUploadContent =
    document.getElementById("image-upload-content");

const imageInput =
    document.getElementById("product-image");

const uploadButton =
    document.getElementById("upload-button");

const imagePreview =
    document.getElementById("image-preview");

const previewImage =
    document.getElementById("preview-image");

const removeImageButton =
    document.getElementById("remove-image-button");

const changeImageButton =
    document.querySelector(".change-image-button");


/* ERRORS */

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


/* MESSAGE */

const formMessage =
    document.getElementById("form-message");

const formMessageText =
    document.getElementById("form-message-text");


/* OTHER */

const characterCounter =
    document.getElementById("character-counter");

const saveButton =
    document.getElementById("save-product-button");


/* GET ITEM ID */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const itemId =
    urlParams.get("id");


/* IMAGE STATE */

let existingImageUrl = "";

let existingCloudinaryPublicId = "";

let selectedImageFile = null;

let removeExistingImage = false;


/* DEBUG */

console.log(
    "================================="
);

console.log(
    "EDIT ITEM JS LOADED"
);

console.log(
    "Current URL:",
    window.location.href
);

console.log(
    "Item ID:",
    itemId
);

console.log(
    "================================="
);


/* INITIAL CHECK */

if (!editItemForm) {

    console.error(
        "Edit form was not found."
    );

}


/* LOAD ITEM */

async function loadItem() {

    if (!itemId) {

        showMessage(
            "error",
            "No item ID was provided. Please open this page using the Edit button in Inventory."
        );

        disableForm();

        return;

    }


    try {

        console.log(
            "Loading inventory item:",
            itemId
        );


        const itemReference =
            doc(
                db,
                "inventory",
                itemId
            );


        const itemSnapshot =
            await getDoc(
                itemReference
            );


        if (!itemSnapshot.exists()) {

            console.error(
                "Inventory item does not exist:",
                itemId
            );

            showMessage(
                "error",
                "The inventory item could not be found."
            );

            disableForm();

            return;

        }


        const item =
            itemSnapshot.data();


        console.log(
            "Inventory item loaded:",
            item
        );


        /* NAME */

        if (itemName) {

            itemName.value =
                item.name ||
                item.item ||
                "";

        }


        /* CATEGORY */

        if (itemCategory) {

            const category =
                item.category ||
                "other";


            const categoryExists =
                Array.from(
                    itemCategory.options
                ).some(
                    option =>
                        option.value ===
                        category
                );


            if (categoryExists) {

                itemCategory.value =
                    category;

            } else {

                itemCategory.value =
                    "tea";

            }

        }


        /* UNIT */

        if (itemUnit) {

            itemUnit.value =
                item.unit ||
                "";

        }


        /* STOCK */

        if (itemStock) {

            itemStock.value =
                item.stock !== undefined
                    ? item.stock
                    : 0;

        }


        /* STATUS */

        if (itemStatus) {

            let status =
                item.status;


            if (
                status !== "active" &&
                status !== "inactive"
            ) {

                status =
                    Number(
                        item.stock || 0
                    ) > 0
                        ? "active"
                        : "inactive";

            }


            itemStatus.value =
                status;

        }


        /* DESCRIPTION */

        if (itemDescription) {

            itemDescription.value =
                item.description ||
                "";

        }


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

        } else {

            showUploadArea();

        }


        updateCharacterCounter();


        console.log(
            "Item loaded successfully."
        );


    } catch (error) {

        console.error(
            "ERROR LOADING ITEM:",
            error
        );


        showMessage(
            "error",
            `Unable to load item: ${error.message}`
        );


        disableForm();

    }

}


/* SHOW EXISTING IMAGE */

function showExistingImage(
    imageUrl
) {

    if (previewImage) {

        previewImage.src =
            imageUrl;

    }


    if (imagePreview) {

        imagePreview.hidden =
            false;

    }


    if (imageUploadContent) {

        imageUploadContent.hidden =
            true;

    }

}


/* SHOW UPLOAD AREA */

function showUploadArea() {

    if (imagePreview) {

        imagePreview.hidden =
            true;

    }


    if (imageUploadContent) {

        imageUploadContent.hidden =
            false;

    }

}


/* OPEN FILE SELECTOR */

function openImageSelector() {

    if (!imageInput) {

        return;

    }


    imageInput.click();

}


/* UPLOAD BUTTON */

if (uploadButton) {

    uploadButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openImageSelector();

        }
    );

}


/* IMAGE BOX */

if (imageUploadBox) {

    imageUploadBox.addEventListener(
        "click",
        function (event) {

            if (
                event.target.closest(
                    "#remove-image-button"
                )
            ) {

                return;

            }


            if (
                event.target.closest(
                    "#upload-button"
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


            openImageSelector();

        }
    );

}


/* IMAGE INPUT */

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function () {

            const file =
                imageInput.files[0];


            if (!file) {

                return;

            }


            handleSelectedImage(
                file
            );

        }
    );

}


/* HANDLE SELECTED IMAGE */

function handleSelectedImage(
    file
) {

    clearError(
        imageError
    );


    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        showFieldError(
            imageError,
            "Please select a JPG or PNG image."
        );

        imageInput.value =
            "";

        return;

    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        showFieldError(
            imageError,
            "Image size must not exceed 5MB."
        );

        imageInput.value =
            "";

        return;

    }


    selectedImageFile =
        file;


    removeExistingImage =
        false;


    const imageUrl =
        URL.createObjectURL(
            file
        );


    if (previewImage) {

        previewImage.src =
            imageUrl;

    }


    if (imagePreview) {

        imagePreview.hidden =
            false;

    }


    if (imageUploadContent) {

        imageUploadContent.hidden =
            true;

    }


    console.log(
        "New image selected:",
        file.name
    );

}


/* REMOVE IMAGE */

if (removeImageButton) {

    removeImageButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            selectedImageFile =
                null;


            removeExistingImage =
                true;


            if (imageInput) {

                imageInput.value =
                    "";

            }


            if (previewImage) {

                previewImage.src =
                    "";

            }


            showUploadArea();


            console.log(
                "Image marked for removal."
            );

        }
    );

}


/* CHANGE IMAGE */

if (changeImageButton) {

    changeImageButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openImageSelector();

        }
    );

}


/* DRAG AND DROP */

if (imageUploadBox) {

    imageUploadBox.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            imageUploadBox.classList.add(
                "dragging"
            );

        }
    );


    imageUploadBox.addEventListener(
        "dragleave",
        function () {

            imageUploadBox.classList.remove(
                "dragging"
            );

        }
    );


    imageUploadBox.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();


            imageUploadBox.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer.files[0];


            if (!file) {

                return;

            }


            handleSelectedImage(
                file
            );

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

    if (
        !itemDescription ||
        !characterCounter
    ) {

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
        async function (event) {

            event.preventDefault();


            console.log(
                "================================="
            );

            console.log(
                "SAVE CHANGES CLICKED"
            );

            console.log(
                "Item ID:",
                itemId
            );

            console.log(
                "================================="
            );


            clearErrors();

            hideMessage();


            if (!itemId) {

                showMessage(
                    "error",
                    "No item ID was provided. Please return to Inventory and click Edit."
                );

                return;

            }


            const isValid =
                validateForm();


            if (!isValid) {

                console.log(
                    "Validation failed."
                );

                return;

            }


            setLoading(
                true
            );


            try {

                let imageUrl =
                    existingImageUrl;


                let cloudinaryPublicId =
                    existingCloudinaryPublicId;


                /* UPLOAD NEW IMAGE */

                if (selectedImageFile) {

                    console.log(
                        "Uploading new image..."
                    );


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


                /* REMOVE IMAGE */

                if (removeExistingImage) {

                    imageUrl =
                        "";

                    cloudinaryPublicId =
                        "";

                }


                /* UPDATED DATA */

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


                console.log(
                    "Data being saved:",
                    updatedItem
                );


                /* FIRESTORE REFERENCE */

                const itemReference =
                    doc(
                        db,
                        "inventory",
                        itemId
                    );


                /* UPDATE FIRESTORE */

                await updateDoc(
                    itemReference,
                    updatedItem
                );


                console.log(
                    "Firestore update successful."
                );


                showMessage(
                    "success",
                    "Item updated successfully."
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "admin-inventory.php";

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "================================="
                );

                console.error(
                    "UPDATE FAILED"
                );

                console.error(
                    error
                );

                console.error(
                    "================================="
                );


                showMessage(
                    "error",
                    `Unable to update item: ${error.message}`
                );


                setLoading(
                    false
                );

            }

        }
    );

}


/* VALIDATE FORM */

function validateForm() {

    let isValid =
        true;


    const name =
        itemName
            ? itemName.value.trim()
            : "";


    const unit =
        itemUnit
            ? itemUnit.value.trim()
            : "";


    const stock =
        itemStock
            ? itemStock.value
            : "";


    /* NAME */

    if (!name) {

        showFieldError(
            nameError,
            "Item name is required."
        );

        isValid =
            false;

    }


    /* CATEGORY */

    if (
        !itemCategory ||
        !itemCategory.value
    ) {

        showFieldError(
            categoryError,
            "Please select a category."
        );

        isValid =
            false;

    }


    /* UNIT */

    if (!unit) {

        showFieldError(
            unitError,
            "Unit is required."
        );

        isValid =
            false;

    }


    /* STOCK */

    const stockNumber =
        Number(stock);


    if (
        stock === "" ||
        Number.isNaN(stockNumber) ||
        stockNumber < 0
    ) {

        showFieldError(
            stockError,
            "Please enter a valid stock quantity."
        );

        isValid =
            false;

    }


    return isValid;

}


/* CLOUDINARY UPLOAD */

async function uploadToCloudinary(
    file
) {

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

        const errorText =
            await response.text();


        throw new Error(
            `Cloudinary upload failed: ${errorText}`
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

function clearError(
    element
) {

    if (!element) {

        return;

    }


    element.textContent =
        "";

}


/* CLEAR ERRORS */

function clearErrors() {

    clearError(
        nameError
    );

    clearError(
        categoryError
    );

    clearError(
        unitError
    );

    clearError(
        stockError
    );

    clearError(
        imageError
    );

}


/* SHOW MESSAGE */

function showMessage(
    type,
    message
) {

    if (
        !formMessage ||
        !formMessageText
    ) {

        return;

    }


    formMessage.className =
        `form-message show ${type}`;


    formMessageText.textContent =
        message;

}


/* HIDE MESSAGE */

function hideMessage() {

    if (
        !formMessage ||
        !formMessageText
    ) {

        return;

    }


    formMessage.className =
        "form-message";


    formMessageText.textContent =
        "";

}


/* LOADING */

function setLoading(
    isLoading
) {

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
        function (element) {

            element.disabled =
                true;

        }
    );

}


/* INITIALIZE */

loadItem();

updateCharacterCounter();