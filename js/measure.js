
import { auth, db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const categorySelect = document.getElementById("menu-category");
const productSelect = document.getElementById("menu-product");
const measurementItems = document.getElementById("measurement-items");
const saveButton = document.getElementById("save-measurements");

let menuProducts = [];
let inventoryItems = [];
let selectedProduct = null;
let isSaving = false;
let recipeLoadToken = 0;

const categoryNames = {
    milktea: "Milk Tea",
    coffee: "Coffee",
    snacks: "Snacks",
    frappe: "Frappe",
    "fruit-tea": "Fruit Tea"
};

function normalizeCategory(value) {
    return String(value ?? "")
        .toLowerCase()
        .replace(/[\s_-]/g, "");
}

function getProductCategory(product) {
    return product.category ||
        product.categoryName ||
        product.categoryId ||
        "";
}

function getRecipeUnit(unit) {
    const originalUnit = String(unit ?? "").trim();
    const normalized = originalUnit.toLowerCase();

    if (["l", "liter", "liters", "litre", "litres"].includes(normalized)) {
        return { unit: "mL", multiplier: 1000 };
    }

    if (["kg", "kilogram", "kilograms"].includes(normalized)) {
        return { unit: "g", multiplier: 1000 };
    }

    if (["g", "gram", "grams"].includes(normalized)) {
        return { unit: "g", multiplier: 1 };
    }

    if (["ml", "milliliter", "milliliters", "millilitre", "millilitres"].includes(normalized)) {
        return { unit: "mL", multiplier: 1 };
    }

    if (["pcs", "pc", "piece", "pieces"].includes(normalized)) {
        return { unit: "pcs", multiplier: 1 };
    }

    return {
        unit: originalUnit || "unit",
        multiplier: 1
    };
}

function showEmptyState(message) {
    measurementItems.replaceChildren();

    const state = document.createElement("div");
    state.className = "empty-measurement-state";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-list-check";

    const text = document.createElement("p");
    text.textContent = message;

    state.append(icon, text);
    measurementItems.appendChild(state);
}

/* LOAD PRODUCTS AND INVENTORY */

async function loadMeasurementData() {
    categorySelect.disabled = true;
    productSelect.disabled = true;
    saveButton.disabled = true;

    showEmptyState("Loading products and inventory...");

    try {
        const [productsSnapshot, inventorySnapshot] = await Promise.all([
            getDocs(collection(db, "products")),
            getDocs(collection(db, "inventory"))
        ]);

        menuProducts = productsSnapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));

        inventoryItems = inventorySnapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));

        inventoryItems.sort((a, b) =>
            String(a.category || "Other").localeCompare(
                String(b.category || "Other")
            ) ||
            String(a.name || "").localeCompare(String(b.name || ""))
        );

        categorySelect.disabled = false;

        productSelect.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a category first";
        productSelect.appendChild(defaultOption);

        showEmptyState("Select a menu product to start adding ingredients.");

    } catch (error) {
        console.error("Could not load products or inventory:", error);

        showEmptyState(
            "Could not load products or inventory. Check the browser console and Firestore permissions."
        );
    }
}

/* PRODUCT CATEGORY SELECTION */

categorySelect.addEventListener("change", () => {
    recipeLoadToken++;
    selectedProduct = null;

    productSelect.disabled = true;
    saveButton.disabled = true;

    productSelect.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a product";
    productSelect.appendChild(defaultOption);

    showEmptyState("Select a product to start adding ingredients.");

    const selectedCategory = categorySelect.value;

    if (!selectedCategory) {
        defaultOption.textContent = "Select a category first";
        return;
    }

    const products = menuProducts.filter(product =>
        normalizeCategory(getProductCategory(product)) ===
        normalizeCategory(selectedCategory)
    );

    if (products.length === 0) {
        defaultOption.textContent = "No products found";
        return;
    }

    products.forEach(product => {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = product.name || "Unnamed Product";
        productSelect.appendChild(option);
    });

    productSelect.disabled = false;
});

/* PRODUCT SELECTION AND EXISTING RECIPE LOADING */

productSelect.addEventListener("change", async () => {
    const productId = productSelect.value;

    selectedProduct = menuProducts.find(
        product => product.id === productId
    ) || null;

    const currentToken = ++recipeLoadToken;

    saveButton.disabled = true;

    if (!selectedProduct) {
        showEmptyState("Select a product to start adding ingredients.");
        return;
    }

    showEmptyState("Loading existing recipe...");

    try {
        const recipeSnapshot = await getDoc(
            doc(db, "productMeasurements", selectedProduct.id)
        );

        if (
            currentToken !== recipeLoadToken ||
            !selectedProduct ||
            selectedProduct.id !== productId
        ) {
            return;
        }

        const existingMeasurements = recipeSnapshot.exists()
            ? recipeSnapshot.data().measurements || {}
            : {};

        renderIngredientCategories(existingMeasurements);

    } catch (error) {
        console.error("Could not load existing recipe:", error);

        if (currentToken === recipeLoadToken) {
            showEmptyState(
                "Could not load this product's recipe. Please try selecting it again."
            );
        }
    }
});

/* INVENTORY CATEGORIES */

function getInventoryGroups() {
    const groups = new Map();

    inventoryItems.forEach(item => {
        const category = String(item.category || "Other").trim();

        if (!groups.has(category)) {
            groups.set(category, []);
        }

        groups.get(category).push(item);
    });

    return groups;
}

/* GET SAVED QUANTITY */

function getSavedRecipeQuantity(savedMeasurement, size, multiplier) {
    if (!savedMeasurement) return "";

    if (size === "both") {
        if (savedMeasurement.recipeQuantity !== undefined) {
            return savedMeasurement.recipeQuantity === null
                ? ""
                : String(savedMeasurement.recipeQuantity);
        }

        if (savedMeasurement.quantity !== undefined) {
            return String(
                Number(savedMeasurement.quantity) * multiplier
            );
        }

        return "";
    }

    const recipeKey = `recipeQuantity${size}`;
    const quantityKey = `quantity${size}`;

    if (savedMeasurement[recipeKey] !== undefined) {
        return savedMeasurement[recipeKey] === null
            ? ""
            : String(savedMeasurement[recipeKey]);
    }

    if (savedMeasurement[quantityKey] !== undefined) {
        return savedMeasurement[quantityKey] === null
            ? ""
            : String(
                Number(savedMeasurement[quantityKey]) * multiplier
            );
    }

    // Support older recipes with size: "16oz" or "22oz".
    if (savedMeasurement.size === size) {
        if (savedMeasurement.recipeQuantity !== undefined) {
            return String(savedMeasurement.recipeQuantity);
        }

        if (savedMeasurement.quantity !== undefined) {
            return String(
                Number(savedMeasurement.quantity) * multiplier
            );
        }
    }

    return "";
}

/* RENDER INGREDIENT CATEGORIES */

function renderIngredientCategories(existingMeasurements = {}) {
    measurementItems.replaceChildren();
    saveButton.disabled = true;

    if (!selectedProduct) {
        showEmptyState("Select a product to start adding ingredients.");
        return;
    }

    if (inventoryItems.length === 0) {
        showEmptyState(
            "No inventory items found. Add inventory items first."
        );
        return;
    }

    const groups = getInventoryGroups();

    groups.forEach((items, category) => {
        const section = document.createElement("section");
        section.className = "measurement-category";

        /* CATEGORY HEADER */

        const header = document.createElement("div");
        header.className = "measurement-category-header";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "measurement-category-toggle";
        toggle.setAttribute("aria-expanded", "true");

        const categoryIcon = document.createElement("i");
        categoryIcon.className = "fa-solid fa-box-open";

        const title = document.createElement("span");
        title.className = "measurement-category-title";
        title.textContent = category;

        const count = document.createElement("span");
        count.className = "measurement-category-count";
        count.textContent = "(0 selected)";

        title.appendChild(count);

        const chevron = document.createElement("i");
        chevron.className =
            "fa-solid fa-chevron-down measurement-category-chevron";

        toggle.append(categoryIcon, title, chevron);

        const body = document.createElement("div");
        body.className = "measurement-category-body";

        const rows = document.createElement("div");
        rows.className = "measurement-rows";

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "add-ingredient-button";

        const plusIcon = document.createElement("i");
        plusIcon.className = "fa-solid fa-plus";

        const addText = document.createElement("span");
        addText.textContent = "Add Ingredient";

        addButton.append(plusIcon, addText);

        toggle.addEventListener("click", () => {
            const collapsed = section.classList.toggle("is-collapsed");
            toggle.setAttribute("aria-expanded", String(!collapsed));
        });

        function updateCategory() {
            const selectedCount = [
                ...rows.querySelectorAll(".measurement-ingredient-select")
            ].filter(select => select.value !== "").length;

            count.textContent = `(${selectedCount} selected)`;

            const usedIds = new Set(
                [...rows.querySelectorAll(".measurement-ingredient-select")]
                    .map(select => select.value)
                    .filter(Boolean)
            );

            addButton.disabled = items.every(item => usedIds.has(item.id));

            addText.textContent = addButton.disabled
                ? "All Ingredients Added"
                : "Add Ingredient";

            rows.querySelectorAll(".measurement-ingredient-select")
                .forEach(currentSelect => {
                    const currentValue = currentSelect.value;

                    [...currentSelect.options].forEach(option => {
                        if (!option.value) return;

                        option.disabled =
                            usedIds.has(option.value) &&
                            option.value !== currentValue;
                    });
                });
        }

        function addIngredientRow(savedMeasurement = null, savedItemId = "") {
            // Check the selected menu category.
            const isSnackProduct =
                normalizeCategory(categorySelect.value) === "snacks";

            const usedIds = new Set(
                [...rows.querySelectorAll(".measurement-ingredient-select")]
                    .map(select => select.value)
                    .filter(Boolean)
            );

            const availableItems = items.filter(
                item => !usedIds.has(item.id) || item.id === savedItemId
            );

            if (availableItems.length === 0) {
                updateCategory();
                return;
            }

            const row = document.createElement("div");
            row.className = "measurement-item";

            /* INGREDIENT DROPDOWN */

            const ingredientField = document.createElement("div");
            ingredientField.className = "measurement-field";

            const ingredientLabel = document.createElement("label");
            ingredientLabel.textContent = "Inventory Ingredient";

            const ingredientSelect = document.createElement("select");
            ingredientSelect.className = "measurement-ingredient-select";
            ingredientSelect.required = true;

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select an ingredient";
            ingredientSelect.appendChild(placeholder);

            items.forEach(item => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = item.name || "Unnamed Item";
                ingredientSelect.appendChild(option);
            });

            ingredientField.append(ingredientLabel, ingredientSelect);

            /* APPLIES TO SIZE */

            const sizeField = document.createElement("div");
            sizeField.className = "measurement-field";

            const sizeLabel = document.createElement("label");
            sizeLabel.textContent = "Applies to size";

            const sizeSelect = document.createElement("select");
            sizeSelect.className = "measurement-size-select";

            [
                { value: "both", text: "Both sizes" },
                { value: "16oz", text: "16oz" },
                { value: "22oz", text: "22oz" }
            ].forEach(optionData => {
                const option = document.createElement("option");
                option.value = optionData.value;
                option.textContent = optionData.text;
                sizeSelect.appendChild(option);
            });

            sizeField.append(sizeLabel, sizeSelect);

            /* SINGLE QUANTITY INPUT */

            const quantityField = document.createElement("div");
            quantityField.className = "measurement-field";

            const quantityLabel = document.createElement("label");
            quantityLabel.textContent = "Quantity";

            const quantityGroup = document.createElement("div");
            quantityGroup.className = "measurement-quantity-group";

            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.min = "0";
            quantityInput.step = "any";
            quantityInput.placeholder = "Enter amount";
            quantityInput.className = "measurement-quantity";
            quantityInput.disabled = true;

            const unitLabel = document.createElement("span");
            unitLabel.className = "measurement-unit";
            unitLabel.textContent = "—";

            quantityGroup.append(quantityInput, unitLabel);
            quantityField.append(quantityLabel, quantityGroup);

            /* REMOVE BUTTON */

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-measurement-button";
            removeButton.title = "Remove ingredient";
            removeButton.setAttribute("aria-label", "Remove ingredient");

            const removeIcon = document.createElement("i");
            removeIcon.className = "fa-solid fa-trash";
            removeButton.appendChild(removeIcon);

            /*
             * Keep all quantities in memory for this one row.
             * Only one quantity input is displayed at a time.
             */

            const quantityValues = {
                both: "",
                "16oz": "",
                "22oz": ""
            };

            const savedSize = savedMeasurement?.size || "both";

            let currentSize = isSnackProduct
                ? "both"
                : (
                    ["both", "16oz", "22oz"].includes(savedSize)
                        ? savedSize
                        : "both"
                );

            function restoreSavedValues() {
                if (!savedMeasurement) return;

                const item = inventoryItems.find(
                    inventoryItem => inventoryItem.id === savedItemId
                );

                const conversion = getRecipeUnit(item?.unit);

                quantityValues.both = getSavedRecipeQuantity(
                    savedMeasurement,
                    "both",
                    conversion.multiplier
                );

                quantityValues["16oz"] = getSavedRecipeQuantity(
                    savedMeasurement,
                    "16oz",
                    conversion.multiplier
                );

                quantityValues["22oz"] = getSavedRecipeQuantity(
                    savedMeasurement,
                    "22oz",
                    conversion.multiplier
                );
            }

            restoreSavedValues();

            function updateIngredientUnit() {
                const item = items.find(
                    inventoryItem => inventoryItem.id === ingredientSelect.value
                );

                if (!item) {
                    quantityInput.value = "";
                    quantityInput.disabled = true;
                    quantityInput.dataset.itemId = "";
                    unitLabel.textContent = "—";
                    quantityLabel.textContent = "Quantity";
                    return;
                }

                const conversion = getRecipeUnit(item.unit);

                quantityInput.disabled = false;
                quantityInput.dataset.itemId = item.id;
                quantityInput.dataset.multiplier =
                    String(conversion.multiplier);
                quantityInput.dataset.recipeUnit = conversion.unit;

                quantityLabel.textContent =
                    `Quantity (${conversion.unit})`;

                unitLabel.textContent = conversion.unit;
            }

            function showCurrentQuantity() {
                sizeSelect.value = currentSize;
                quantityInput.value = quantityValues[currentSize] ?? "";
            }

            sizeSelect.addEventListener("change", () => {
                // Save the currently displayed value before switching.
                quantityValues[currentSize] = quantityInput.value.trim();

                currentSize = sizeSelect.value;

                // Restore the value previously entered for the new size.
                showCurrentQuantity();
            });

            quantityInput.addEventListener("input", () => {
                quantityValues[currentSize] = quantityInput.value.trim();
            });

            ingredientSelect.addEventListener("change", () => {
                updateIngredientUnit();
                updateCategory();
            });

            removeButton.addEventListener("click", () => {
                row.remove();
                updateCategory();
            });

            // Snacks do not receive the size field in the DOM.
            row.append(
                ingredientField,
                quantityField,
                ...(isSnackProduct ? [] : [sizeField]),
                removeButton
            );

            row._isSnackProduct = isSnackProduct;

            rows.appendChild(row);

            if (savedItemId) {
                ingredientSelect.value = savedItemId;
                updateIngredientUnit();
            }

            showCurrentQuantity();
            updateCategory();

            // Keep values available for saving.
            row._quantityValues = quantityValues;

            row._getCurrentSize = () => currentSize;
            row._getCurrentQuantity = () => quantityInput.value.trim();

            row._setCurrentQuantity = () => {
                quantityValues[currentSize] = quantityInput.value.trim();
            };
        }

        addButton.addEventListener("click", () => {
            addIngredientRow();
        });

        body.append(rows, addButton);
        header.appendChild(toggle);
        header.appendChild(document.createElement("span"));
        section.append(header, body);
        measurementItems.appendChild(section);

        // Restore saved ingredients.
        Object.entries(existingMeasurements).forEach(
            ([itemId, savedMeasurement]) => {
                const matchingItem = items.find(item => item.id === itemId);

                if (matchingItem) {
                    addIngredientRow(savedMeasurement, itemId);
                }
            }
        );

        updateCategory();
    });

    Object.keys(existingMeasurements).forEach(itemId => {
        const stillExists = inventoryItems.some(item => item.id === itemId);

        if (!stillExists) {
            console.warn(
                `Saved recipe ingredient ${itemId} was not found in inventory.`
            );
        }
    });

    saveButton.disabled = false;
}

/* SAVE RECIPE */

saveButton.addEventListener("click", async () => {
    if (isSaving) return;

    if (!selectedProduct) {
        alert("Please select a product first.");
        return;
    }

    const measurements = {};
    const rows = measurementItems.querySelectorAll(".measurement-item");

    for (const row of rows) {
        const ingredientSelect = row.querySelector(
            ".measurement-ingredient-select"
        );

        const sizeSelect = row.querySelector(
            ".measurement-size-select"
        );

        const quantityInput = row.querySelector(
            ".measurement-quantity"
        );

        const itemId = ingredientSelect.value;

        // Capture the currently displayed quantity before saving.
        row._setCurrentQuantity?.();

        if (!itemId) {
            if (quantityInput.value.trim() !== "") {
                alert("Please select an ingredient for the entered quantity.");
                ingredientSelect.focus();
                return;
            }

            continue;
        }

        const item = inventoryItems.find(
            inventoryItem => inventoryItem.id === itemId
        );

        if (!item) {
            alert("Ingredient not found. Please reload the page.");
            return;
        }

        const conversion = getRecipeUnit(item.unit);

        // Snacks always use one universal quantity.
        const size = row._isSnackProduct ? "both" : sizeSelect.value;

        const quantityValues = row._quantityValues || {};

        const selectedQuantity = quantityValues[size] ?? "";

        if (selectedQuantity === "") {
            alert(`Please enter a quantity for ${item.name || "this ingredient"} (${size}).`);
            quantityInput.focus();
            return;
        }

        const recipeQuantity = Number(selectedQuantity);

        if (!Number.isFinite(recipeQuantity) || recipeQuantity <= 0) {
            alert("Quantity must be greater than zero.");
            quantityInput.focus();
            return;
        }

        const measurement = {
            itemId: item.id,
            itemName: item.name || "Unnamed Item",
            category: item.category || "Other",
            unit: item.unit || "unit",
            recipeUnit: conversion.unit,
            size
        };

        if (size === "both") {
            measurement.recipeQuantity = recipeQuantity;
            measurement.quantity =
                recipeQuantity / conversion.multiplier;
        } else {
            const otherSize = size === "16oz" ? "22oz" : "16oz";
            const otherQuantityText = quantityValues[otherSize] ?? "";

            const otherQuantity = otherQuantityText === ""
                ? null
                : Number(otherQuantityText);

            if (
                otherQuantity !== null &&
                (!Number.isFinite(otherQuantity) || otherQuantity <= 0)
            ) {
                alert(`${otherSize} quantity must be greater than zero.`);
                return;
            }

            const quantity16 = size === "16oz"
                ? recipeQuantity
                : otherQuantity;

            const quantity22 = size === "22oz"
                ? recipeQuantity
                : otherQuantity;

            measurement.size = "separate";

            measurement.selectedSize = size;

            measurement.recipeQuantity16oz = quantity16;
            measurement.quantity16oz = quantity16 === null
                ? null
                : quantity16 / conversion.multiplier;

            measurement.recipeQuantity22oz = quantity22;
            measurement.quantity22oz = quantity22 === null
                ? null
                : quantity22 / conversion.multiplier;
        }

        measurements[item.id] = measurement;
    }

    if (Object.keys(measurements).length === 0) {
        alert("Please add at least one ingredient with a quantity.");
        return;
    }

    isSaving = true;
    saveButton.disabled = true;
    saveButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        await setDoc(
            doc(db, "productMeasurements", selectedProduct.id),
            {
                productId: selectedProduct.id,
                productName: selectedProduct.name || "Unnamed Product",
                category:
                    categoryNames[categorySelect.value] ||
                    categorySelect.options[
                        categorySelect.selectedIndex
                    ].text,
                measurements,
                updatedAt: serverTimestamp()
            }
        );

        window.location.assign("./admin-inventory.php");

    } catch (error) {
        console.error("Could not save measurements:", error);

        alert(
            "Could not save measurements.\n\n" +
            error.message
        );

        isSaving = false;
        saveButton.disabled = false;
        saveButton.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Save Measurements';
    }
});

/* LOAD ADMIN PROFILE */

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

loadMeasurementData();
