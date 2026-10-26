import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const productTableBody =
    document.getElementById("product-table-body");

const productSearch =
    document.getElementById("product-search");

const categoryFilter =
    document.getElementById("category-filter");

const visibleProductCount =
    document.getElementById("visible-product-count");

const productCount =
    document.getElementById("product-count");

const previousPage =
    document.getElementById("previous-page");

const currentPage =
    document.getElementById("current-page");

const nextPage =
    document.getElementById("next-page");

const advertisementDropdown =
    document.getElementById("advertisement-dropdown");

const advertisementMenuButton =
    document.getElementById("advertisement-menu-button");

const advertisementDropdownMenu =
    document.getElementById("advertisement-dropdown-menu");

const advertisementManagerCard =
    document.getElementById("advertisement-manager-card");

const advertisementList =
    document.getElementById("advertisement-list");

const advertisementCount =
    document.getElementById("advertisement-count");

const advertisementModalBackdrop =
    document.getElementById("advertisement-modal-backdrop");

const advertisementForm =
    document.getElementById("advertisement-form");

const advertisementId =
    document.getElementById("advertisement-id");

const advertisementTitle =
    document.getElementById("advertisement-title");

const advertisementImageInput =
    document.getElementById("advertisement-images");

const advertisementImagePreviews =
    document.getElementById("advertisement-image-previews");

const advertisementImageCount =
    document.getElementById("advertisement-image-count");

const advertisementProductList =
    document.getElementById("advertisement-product-list");

const advertisementProductSearch =
    document.getElementById("advertisement-product-search");

const advertisementProductCount =
    document.getElementById("advertisement-product-count");

const advertisementBogo =
    document.getElementById("advertisement-bogo");

const advertisementActive =
    document.getElementById("advertisement-active");

const advertisementFormTitle =
    document.getElementById("advertisement-form-title");

const advertisementFormMessage =
    document.getElementById("advertisement-form-message");

const saveAdvertisementButton =
    document.getElementById("save-advertisement-button");

const CLOUDINARY_CLOUD_NAME = "c1kodukt";
const CLOUDINARY_UPLOAD_PRESET = "Kkopi.tea";
const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

let products = [];

let filteredProducts = [];

let advertisements = [];

let advertisementImages = [];

let selectedAdvertisementProductIds = new Set();

let currentPageNumber = 1;

const productsPerPage = 8;

const maxAdvertisementImages = 5;

advertisementMenuButton.addEventListener("click", () => {
        const isOpen = !advertisementDropdownMenu.hidden;
        advertisementDropdownMenu.hidden = isOpen;
        advertisementMenuButton.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );
    });

document
    .getElementById("manage-advertisements-button")
    .addEventListener("click", () => {
        closeAdvertisementDropdown();
        advertisementManagerCard.hidden = false;
        advertisementManagerCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        loadAdvertisements();
    });

document
    .getElementById("new-advertisement-button")
    .addEventListener("click", () => {
        closeAdvertisementDropdown();
        advertisementManagerCard.hidden = false;
        advertisementManagerCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        openAdvertisementForm();
    });

document
    .getElementById("create-advertisement-button")
    .addEventListener("click", () => openAdvertisementForm());

document
    .getElementById("close-advertisements-button")
    .addEventListener("click", () => {
        advertisementManagerCard.hidden = true;
    });

document
    .getElementById("cancel-advertisement-button")
    .addEventListener("click", closeAdvertisementForm);

document
    .getElementById("dismiss-advertisement-form-button")
    .addEventListener("click", closeAdvertisementForm);

advertisementModalBackdrop.addEventListener("click", (event) => {
    if (event.target === advertisementModalBackdrop) {
        closeAdvertisementForm();
    }
});

advertisementImageInput.addEventListener("change", () => {
    const files = [...advertisementImageInput.files];
    const remainingSlots = maxAdvertisementImages - advertisementImages.length;

    if (files.length > remainingSlots) {
        showAdvertisementFormMessage(
            `Only ${remainingSlots} selected image${remainingSlots === 1 ? "" : "s"} fit. A campaign can contain at most five.`,
            "error"
        );
    }

    files.slice(0, Math.max(0, remainingSlots)).forEach((file) => {
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            showAdvertisementFormMessage(
                "Please choose JPG or PNG images only.",
                "error"
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showAdvertisementFormMessage(
                `${file.name} is larger than 5MB.`,
                "error"
            );
            return;
        }

        advertisementImages.push({
            file,
            url: URL.createObjectURL(file)
        });
    });

    advertisementImageInput.value = "";
    renderAdvertisementImages();
});

advertisementProductSearch.addEventListener("input", () => {
    renderAdvertisementProducts(getSelectedAdvertisementProductIds());
});

advertisementForm.addEventListener("submit", saveAdvertisement);

document.addEventListener("click", (event) => {
    if (!advertisementDropdown.contains(event.target)) {
        closeAdvertisementDropdown();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeAdvertisementDropdown();
        closeAdvertisementForm();
    }
});

function closeAdvertisementDropdown() {
    advertisementDropdownMenu.hidden = true;
    advertisementMenuButton.setAttribute("aria-expanded", "false");
}

function showAdvertisementFormMessage(message, type = "") {
    advertisementFormMessage.textContent = message;
    advertisementFormMessage.className =
        `advertisement-form-message ${type}`.trim();
}

function clearAdvertisementFormMessage() {
    showAdvertisementFormMessage("");
}

function getSelectedAdvertisementProductIds() {
    return new Set(selectedAdvertisementProductIds);
}

function renderAdvertisementProducts(selectedIds = new Set()) {
    const searchValue = advertisementProductSearch.value.trim().toLowerCase();
    const activeProducts = products.filter(
        (product) => product.isAvailable !== false
    );
    const matchingProducts = activeProducts.filter((product) =>
        String(product.name || "").toLowerCase().includes(searchValue)
    );

    advertisementProductCount.textContent =
        `${selectedIds.size} selected`;

    if (activeProducts.length === 0) {
        advertisementProductList.innerHTML = `
            <p class="advertisement-list-message">
                Add an available product before creating an advertisement.
            </p>
        `;
        return;
    }

    if (matchingProducts.length === 0) {
        advertisementProductList.innerHTML = `
            <p class="advertisement-list-message">No matching products.</p>
        `;
        return;
    }

    advertisementProductList.innerHTML = matchingProducts.map((product) => `
        <label class="advertisement-product-option">
            <input
                type="checkbox"
                value="${escapeAttribute(product.id)}"
                ${selectedIds.has(product.id) ? "checked" : ""}
            >
            <span class="advertisement-option-check"></span>
            <span class="advertisement-product-option-name">
                ${escapeHtml(product.name || "Unnamed Product")}
            </span>
            <span class="advertisement-product-option-price">
                ₱${formatPrice(Number(product.basePrice || 0))}
            </span>
        </label>
    `).join("");

    advertisementProductList
        .querySelectorAll('input[type="checkbox"]')
        .forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    selectedAdvertisementProductIds.add(checkbox.value);
                } else {
                    selectedAdvertisementProductIds.delete(checkbox.value);
                }
                advertisementProductCount.textContent =
                    `${selectedAdvertisementProductIds.size} selected`;
            });
        });
}

function renderAdvertisementImages() {
    advertisementImageCount.textContent =
        `${advertisementImages.length} / ${maxAdvertisementImages}`;

    advertisementImagePreviews.innerHTML =
        advertisementImages.map((image, index) => `
            <div class="advertisement-image-preview">
                <img src="${escapeAttribute(image.url)}" alt="${escapeAttribute(image.name || `Advertisement image ${index + 1}`)}">
                <span>${index === 0 ? "Main image" : `Image ${index + 1}`}</span>
                <button
                    type="button"
                    data-image-index="${index}"
                    aria-label="Remove image ${index + 1}"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `).join("");

    advertisementImagePreviews
        .querySelectorAll("[data-image-index]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.imageIndex);
                const [removedImage] = advertisementImages.splice(index, 1);
                if (removedImage?.file) {
                    URL.revokeObjectURL(removedImage.url);
                }
                renderAdvertisementImages();
            });
        });
}

function resetAdvertisementForm() {
    advertisementForm.reset();
    advertisementId.value = "";
    advertisementTitle.value = "";
    advertisementActive.checked = true;
    advertisementBogo.checked = false;
    advertisementProductSearch.value = "";
    selectedAdvertisementProductIds = new Set();
    advertisementImages.forEach((image) => {
        if (image.file) {
            URL.revokeObjectURL(image.url);
        }
    });
    advertisementImages = [];
    renderAdvertisementImages();
    renderAdvertisementProducts();
    clearAdvertisementFormMessage();
}

function openAdvertisementForm(advertisement = null) {
    resetAdvertisementForm();
    advertisementFormTitle.textContent = advertisement
        ? "Edit Advertisement"
        : "Create Advertisement";

    if (advertisement) {
        advertisementId.value = advertisement.id;
        advertisementTitle.value = advertisement.title || "";
        advertisementActive.checked = advertisement.isActive !== false;
        advertisementBogo.checked =
            advertisement.isBuyOneTakeOne === true;

        const imageUrls = Array.isArray(advertisement.imageUrls)
            ? advertisement.imageUrls.filter(
                (imageUrl) => typeof imageUrl === "string" && imageUrl
            )
            : advertisement.imageUrl
                ? [advertisement.imageUrl]
                : [];
        advertisementImages = imageUrls
            .slice(0, maxAdvertisementImages)
            .map((url, index) => ({
                url,
                name: `Saved image ${index + 1}`
            }));

        const productIds = Array.isArray(advertisement.productIds)
            ? advertisement.productIds
            : advertisement.productId
                ? [advertisement.productId]
                : [];
        selectedAdvertisementProductIds = new Set(productIds);
    }

    renderAdvertisementImages();
    renderAdvertisementProducts(selectedAdvertisementProductIds);
    advertisementModalBackdrop.hidden = false;
    document.body.classList.add("advertisement-modal-open");
    advertisementTitle.focus();
}

function closeAdvertisementForm() {
    if (advertisementModalBackdrop.hidden) {
        return;
    }
    advertisementModalBackdrop.hidden = true;
    document.body.classList.remove("advertisement-modal-open");
    resetAdvertisementForm();
}

async function uploadAdvertisementImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData
    });
    const result = await response.json();

    if (!response.ok || typeof result.secure_url !== "string") {
        console.error("Advertisement image upload failed:", result);
        throw new Error("An advertisement image could not be uploaded.");
    }

    return result.secure_url;
}

async function saveAdvertisement(event) {
    event.preventDefault();
    clearAdvertisementFormMessage();

    const title = advertisementTitle.value.trim();
    const productIds = [...selectedAdvertisementProductIds];

    if (!title) {
        showAdvertisementFormMessage(
            "Enter a campaign title.",
            "error"
        );
        advertisementTitle.focus();
        return;
    }

    if (productIds.length === 0) {
        showAdvertisementFormMessage(
            "Select at least one available product.",
            "error"
        );
        return;
    }

    if (advertisementImages.length === 0) {
        showAdvertisementFormMessage(
            "Add at least one advertisement image.",
            "error"
        );
        return;
    }

    if (advertisementImages.length > maxAdvertisementImages) {
        showAdvertisementFormMessage(
            "An advertisement can have no more than five images.",
            "error"
        );
        return;
    }

    saveAdvertisementButton.disabled = true;

    try {
        const imageUrls = [];
        for (const [index, image] of advertisementImages.entries()) {
            if (image.file) {
                showAdvertisementFormMessage(
                    `Uploading image ${index + 1} of ${advertisementImages.length}...`
                );
                const uploadedUrl = await uploadAdvertisementImage(image.file);
                URL.revokeObjectURL(image.url);
                advertisementImages[index] = {
                    url: uploadedUrl,
                    name: image.file.name
                };
                imageUrls.push(uploadedUrl);
            } else {
                imageUrls.push(image.url);
            }
        }

        const selectedProducts = productIds
            .map((productId) =>
                products.find((product) => product.id === productId)
            )
            .filter(Boolean);
        const categoryId = selectedProducts[0]?.categoryId || "";
        const categoryName = getCategoryName(categoryId);
        const isBuyOneTakeOne = advertisementBogo.checked;
        const advertisementData = {
            title,
            eyebrow: isBuyOneTakeOne
                ? "BUY ONE, TAKE ONE"
                : categoryName.toUpperCase(),
            description: isBuyOneTakeOne
                ? `${title} - Buy One, Take One!`
                : title,
            buttonLabel: "Order now",
            imageUrl: imageUrls[0],
            imageUrls,
            productId: productIds[0],
            productIds,
            isBuyOneTakeOne,
            isActive: advertisementActive.checked,
            sortOrder: advertisementId.value
                ? advertisements.find(
                    (item) => item.id === advertisementId.value
                )?.sortOrder ?? Date.now()
                : Date.now(),
            updatedAt: serverTimestamp()
        };

        showAdvertisementFormMessage("Saving advertisement...");

        if (advertisementId.value) {
            await updateDoc(
                doc(db, "advertisements", advertisementId.value),
                advertisementData
            );
        } else {
            await addDoc(collection(db, "advertisements"), {
                ...advertisementData,
                createdAt: serverTimestamp()
            });
        }

        closeAdvertisementForm();
        await loadAdvertisements();
    } catch (error) {
        console.error("Unable to save advertisement:", error);
        showAdvertisementFormMessage(
            error.message || "Unable to save the advertisement. Please try again.",
            "error"
        );
    } finally {
        saveAdvertisementButton.disabled = false;
    }
}

async function loadAdvertisements() {
    advertisementList.innerHTML = `
        <div class="advertisement-list-message">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading advertisements...
        </div>
    `;
    advertisementCount.textContent = "Loading advertisements...";

    try {
        const snapshot = await getDocs(collection(db, "advertisements"));
        advertisements = snapshot.docs
            .map((advertisementDocument) => ({
                id: advertisementDocument.id,
                ...advertisementDocument.data()
            }))
            .sort((first, second) =>
                Number(first.sortOrder || 0) - Number(second.sortOrder || 0)
            );
        renderAdvertisements();
    } catch (error) {
        console.error("Unable to load advertisements:", error);
        advertisementCount.textContent = "Unable to load advertisements.";
        advertisementList.innerHTML = `
            <div class="advertisement-list-message error">
                Unable to load campaigns. Check your connection and try again.
            </div>
        `;
    }
}

function renderAdvertisements() {
    advertisementCount.textContent =
        `${advertisements.length} advertisement${advertisements.length === 1 ? "" : "s"}`;

    if (advertisements.length === 0) {
        advertisementList.innerHTML = `
            <div class="advertisement-list-message">
                No advertisements yet. Create a campaign to get started.
            </div>
        `;
        return;
    }

    advertisementList.innerHTML = advertisements.map((advertisement) => {
        const imageUrls = Array.isArray(advertisement.imageUrls)
            ? advertisement.imageUrls
            : advertisement.imageUrl
                ? [advertisement.imageUrl]
                : [];
        const productIds = Array.isArray(advertisement.productIds)
            ? advertisement.productIds
            : advertisement.productId
                ? [advertisement.productId]
                : [];
        const productNames = productIds
            .map((productId) =>
                products.find((product) => product.id === productId)?.name
            )
            .filter(Boolean);
        const active = advertisement.isActive !== false;

        return `
            <article class="advertisement-campaign">
                <div class="advertisement-campaign-image">
                    ${imageUrls[0]
                        ? `<img src="${escapeAttribute(imageUrls[0])}" alt="">`
                        : `<i class="fa-solid fa-image"></i>`
                    }
                    ${imageUrls.length > 1
                        ? `<span>+${imageUrls.length - 1} images</span>`
                        : ""
                    }
                </div>
                <div class="advertisement-campaign-details">
                    <div class="advertisement-campaign-title-row">
                        <h3>${escapeHtml(advertisement.title || "Untitled campaign")}</h3>
                        <span class="advertisement-status ${active ? "active" : "inactive"}">
                            ${active ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <p>${escapeHtml(productNames.join(", ") || "No linked products")}</p>
                    <div class="advertisement-campaign-tags">
                        <span>${imageUrls.length} / ${maxAdvertisementImages} images</span>
                        <span>${productIds.length} product${productIds.length === 1 ? "" : "s"}</span>
                        ${advertisement.isBuyOneTakeOne === true
                            ? `<span class="bogo-tag">Buy One, Take One</span>`
                            : ""
                        }
                    </div>
                </div>
                <div class="advertisement-campaign-actions">
                    <button
                        type="button"
                        class="advertisement-action-button"
                        data-ad-edit="${escapeAttribute(advertisement.id)}"
                        aria-label="Edit ${escapeAttribute(advertisement.title || "advertisement")}"
                        title="Edit advertisement"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button
                        type="button"
                        class="advertisement-action-button"
                        data-ad-toggle="${escapeAttribute(advertisement.id)}"
                        aria-label="${active ? "Deactivate" : "Activate"} ${escapeAttribute(advertisement.title || "advertisement")}"
                        title="${active ? "Deactivate" : "Activate"} advertisement"
                    >
                        <i class="fa-solid ${active ? "fa-eye-slash" : "fa-eye"}"></i>
                    </button>
                    <button
                        type="button"
                        class="advertisement-action-button delete"
                        data-ad-delete="${escapeAttribute(advertisement.id)}"
                        aria-label="Delete ${escapeAttribute(advertisement.title || "advertisement")}"
                        title="Delete advertisement"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </article>
        `;
    }).join("");

    advertisementList
        .querySelectorAll("[data-ad-edit]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const advertisement = advertisements.find(
                    (item) => item.id === button.dataset.adEdit
                );
                if (advertisement) {
                    openAdvertisementForm(advertisement);
                }
            });
        });

    advertisementList
        .querySelectorAll("[data-ad-toggle]")
        .forEach((button) => {
            button.addEventListener("click", () =>
                toggleAdvertisement(button.dataset.adToggle)
            );
        });

    advertisementList
        .querySelectorAll("[data-ad-delete]")
        .forEach((button) => {
            button.addEventListener("click", () =>
                deleteAdvertisement(button.dataset.adDelete)
            );
        });
}

async function toggleAdvertisement(id) {
    const advertisement = advertisements.find((item) => item.id === id);
    if (!advertisement) {
        return;
    }

    try {
        await updateDoc(doc(db, "advertisements", id), {
            isActive: advertisement.isActive === false,
            updatedAt: serverTimestamp()
        });
        await loadAdvertisements();
    } catch (error) {
        console.error("Unable to update advertisement status:", error);
        alert("Unable to update the advertisement. Please try again.");
    }
}

async function deleteAdvertisement(id) {
    const advertisement = advertisements.find((item) => item.id === id);
    if (!advertisement) {
        return;
    }

    if (!confirm(`Delete "${advertisement.title || "this advertisement"}"?`)) {
        return;
    }

    try {
        await deleteDoc(doc(db, "advertisements", id));
        await loadAdvertisements();
    } catch (error) {
        console.error("Unable to delete advertisement:", error);
        alert("Unable to delete the advertisement. Please try again.");
    }
}


/* Load products */

async function loadProducts() {

    try {

        showLoading();


        const snapshot =
            await getDocs(
                collection(db, "products")
            );


        products =
            snapshot.docs.map(
                (productDocument) => {

                    return {

                        id:
                            productDocument.id,

                        ...productDocument.data()

                    };

                }
            );


        filteredProducts =
            [...products];


        currentPageNumber = 1;


        renderProducts();


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        showError();

    }

}


/* Render products */

function renderProducts() {

    productTableBody.innerHTML = "";


    if (
        filteredProducts.length === 0
    ) {

        showEmptyState();

        updatePagination();

        return;

    }


    const startIndex =
        (currentPageNumber - 1) *
        productsPerPage;


    const endIndex =
        startIndex +
        productsPerPage;


    const pageProducts =
        filteredProducts.slice(
            startIndex,
            endIndex
        );


    pageProducts.forEach(
        (product) => {

            const row =
                createProductRow(product);


            productTableBody.appendChild(
                row
            );

        }
    );


    visibleProductCount.textContent =
        filteredProducts.length;


    const firstProduct =
        startIndex + 1;


    const lastProduct =
        Math.min(
            endIndex,
            filteredProducts.length
        );


    productCount.textContent =
        `Showing ${firstProduct}-${lastProduct} of ${filteredProducts.length} products`;


    updatePagination();

}


/* Create product row */

function createProductRow(product) {

    const row =
        document.createElement("tr");


    const productName =
        product.name ||
        "Unnamed Product";


    const category =
        product.categoryId ||
        "milktea";


    const price =
        Number(
            product.basePrice || 0
        );


    const status =
        product.isAvailable === false
            ? "inactive"
            : "active";


    const description =
        product.description || "";


    const imageUrl =
        product.imageUrl || "";


    const categoryName =
        getCategoryName(
            category
        );


    const statusName =
        getStatusName(
            status
        );


    const statusClass =
        status === "active"
            ? "status-active"
            : "status-inactive";


    row.innerHTML = `

        <td>

            <div class="product-info">

                <div class="product-image">

                    ${
                        imageUrl
                            ? `
                                <img
                                    src="${escapeAttribute(imageUrl)}"
                                    alt="${escapeAttribute(productName)}"
                                    loading="lazy"
                                >
                              `
                            : `
                                <div class="product-image-placeholder">
                                    <i class="fa-solid fa-mug-hot"></i>
                                </div>
                              `
                    }

                </div>


                <div class="product-details">

                    <strong>
                        ${escapeHtml(productName)}
                    </strong>


                    ${
                        description
                            ? `
                                <span>
                                    ${escapeHtml(description)}
                                </span>
                              `
                            : ""
                    }

                </div>

            </div>

        </td>


        <td>

            <span
                class="category-badge category-${escapeAttribute(category)}"
            >
                ${escapeHtml(categoryName)}
            </span>

        </td>


        <td>

            <span class="product-price">

                ₱${formatPrice(price)}

            </span>

        </td>


        <td>

            <span class="status-badge ${statusClass}">

                <span class="status-dot"></span>

                ${escapeHtml(statusName)}

            </span>

        </td>


        <td>

            <div class="product-actions">

                <a
                    href="edit-product.php?id=${encodeURIComponent(product.id)}"
                    class="product-action-button edit-product-button"
                    title="Edit Product"
                    aria-label="Edit ${escapeAttribute(productName)}"
                >

                    <i class="fa-solid fa-pen"></i>

                </a>


                <button
                    type="button"
                    class="product-action-button delete-product-button"
                    data-product-id="${escapeAttribute(product.id)}"
                    data-product-name="${escapeAttribute(productName)}"
                    title="Delete Product"
                    aria-label="Delete ${escapeAttribute(productName)}"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </td>

    `;


    const deleteButton =
        row.querySelector(
            ".delete-product-button"
        );


    deleteButton.addEventListener(
        "click",
        () => {

            deleteProduct(
                product.id,
                productName
            );

        }
    );


    return row;

}


/* Category name */

function getCategoryName(category) {

    if (
        category === "milktea"
    ) {

        return "Milk Tea";

    }


    if (
        category === "coffee"
    ) {

        return "Coffee";

    }


    if (
        category === "snacks"
    ) {

        return "Snacks";

    }


    if (
        category === "frappe"
    ) {

        return "Frappe";

    }


    if (
        category === "fruittea"
    ) {

        return "Fruit Tea";

    }


    return "Unknown";

}


/* Status name */

function getStatusName(status) {

    if (
        status === "active"
    ) {

        return "Available";

    }


    if (
        status === "inactive"
    ) {

        return "Unavailable";

    }


    return "Unknown";

}


/* Format price */

function formatPrice(price) {

    return price.toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* Search */

productSearch.addEventListener(
    "input",
    () => {

        applyFilters();

    }
);


/* Category filter */

categoryFilter.addEventListener(
    "change",
    () => {

        applyFilters();

    }
);


/* Apply filters */

function applyFilters() {

    const searchValue =
        productSearch.value
            .trim()
            .toLowerCase();


    const categoryValue =
        categoryFilter.value;


    filteredProducts =
        products.filter(
            (product) => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();


                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();


                const category =
                    product.categoryId ||
                    "";


                const matchesSearch =
                    name.includes(
                        searchValue
                    ) ||
                    description.includes(
                        searchValue
                    );


                const matchesCategory =
                    categoryValue === "all" ||
                    category === categoryValue;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    currentPageNumber = 1;


    renderProducts();

}


/* Previous page */

previousPage.addEventListener(
    "click",
    () => {

        if (
            currentPageNumber <= 1
        ) {

            return;

        }


        currentPageNumber--;


        renderProducts();

    }
);


/* Next page */

nextPage.addEventListener(
    "click",
    () => {

        const totalPages =
            Math.ceil(
                filteredProducts.length /
                productsPerPage
            );


        if (
            currentPageNumber >=
            totalPages
        ) {

            return;

        }


        currentPageNumber++;


        renderProducts();

    }
);


/* Update pagination */

function updatePagination() {

    const totalPages =
        Math.ceil(
            filteredProducts.length /
            productsPerPage
        );


    previousPage.disabled =
        currentPageNumber <= 1;


    nextPage.disabled =
        currentPageNumber >=
            totalPages ||
        totalPages === 0;


    currentPage.textContent =
        currentPageNumber;

}


/* Loading */

function showLoading() {

    productTableBody.innerHTML = `

        <tr class="table-loading-row">

            <td colspan="5">

                <div class="table-loading">

                    <div class="loading-icon">

                        <i class="fa-solid fa-mug-hot fa-spin"></i>

                    </div>

                    <strong>
                        Loading your menu
                    </strong>

                    <span>
                        Please wait while we load your products.
                    </span>

                </div>

            </td>

        </tr>

    `;

}


/* Error */

function showError() {

    productTableBody.innerHTML = `

        <tr class="table-loading-row">

            <td colspan="5">

                <div class="table-loading">

                    <div class="loading-icon">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                    </div>

                    <strong>
                        Unable to load products
                    </strong>

                    <span>
                        Please refresh the page and try again.
                    </span>

                </div>

            </td>

        </tr>

    `;


    visibleProductCount.textContent =
        "0";


    productCount.textContent =
        "Unable to load products.";

}


/* Empty */

function showEmptyState() {

    productTableBody.innerHTML = `

        <tr class="empty-product-row">

            <td colspan="5">

                <div class="empty-product-state">

                    <div class="empty-product-icon">

                        <i class="fa-solid fa-mug-hot"></i>

                    </div>

                    <strong>
                        No products found
                    </strong>

                    <span>
                        Try changing your search or category filter.
                    </span>

                </div>

            </td>

        </tr>

    `;


    visibleProductCount.textContent =
        "0";


    productCount.textContent =
        "No products found.";

}


/* Delete */

async function deleteProduct(
    productId,
    productName
) {

    const confirmed =
        confirm(
            `Are you sure you want to delete "${productName}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                productId
            )
        );


        products =
            products.filter(
                (product) =>
                    product.id !==
                    productId
            );


        filteredProducts =
            filteredProducts.filter(
                (product) =>
                    product.id !==
                    productId
            );


        const totalPages =
            Math.ceil(
                filteredProducts.length /
                productsPerPage
            );


        if (
            currentPageNumber >
                totalPages &&
            totalPages > 0
        ) {

            currentPageNumber =
                totalPages;

        }


        renderProducts();


    } catch (error) {

        console.error(
            "Error deleting product:",
            error
        );


        alert(
            "Unable to delete the product. Please try again."
        );

    }

}


/* Escape HTML */

function escapeHtml(value) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* Escape attribute */

function escapeAttribute(value) {

    return escapeHtml(value);

}


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

        const adminGreeting =
            document.getElementById("adminGreeting");

        const adminRole =
            document.getElementById("adminRole");

        if (adminGreeting) {
            adminGreeting.textContent =
                adminData.name || user.email || "Admin";
        }

        if (adminRole) {
            adminRole.textContent =
                adminData.role || "Administrator";
        }
    } catch (error) {
        console.error("Error loading admin profile:", error);
    }
});

/* Start */

loadProducts();
loadAdvertisements();