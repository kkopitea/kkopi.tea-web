import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const lowStockItems =
    document.getElementById("low-stock-items");


/* Redirect to login */
function redirectToLogin() {

    window.location.replace("admin-login.php");

}


/* Load low stock items */
async function loadLowStockItems() {

    if (!lowStockItems) {

        console.error(
            "Stock Alerts container was not found."
        );

        return;

    }


    try {

        const snapshot =
            await getDocs(
                collection(db, "inventory")
            );


        const inventoryItems =
            snapshot.docs.map((itemDocument) => {

                return {
                    id: itemDocument.id,
                    ...itemDocument.data()
                };

            });


        console.log(
            "Inventory items:",
            inventoryItems
        );


        const lowStock =
            inventoryItems
                .filter((item) => {

                    const stock =
                        Number(item.stock ?? 0);

                    return stock > 0 && stock <= 10;

                })
                .sort((a, b) => {

                    return Number(a.stock ?? 0) -
                        Number(b.stock ?? 0);

                });


        console.log(
            "Low stock items:",
            lowStock
        );


        if (lowStock.length === 0) {

            lowStockItems.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon green-empty">

                        <i class="fa-solid fa-box"></i>

                    </div>

                    <strong>
                        No alerts
                    </strong>

                    <span>
                        Low-stock items will appear here
                    </span>

                </div>

            `;

            return;

        }


        lowStockItems.innerHTML = "";


        lowStock.forEach((item) => {

            const itemName =
                item.name ||
                item.item ||
                "Unnamed Item";


            const stock =
                Number(item.stock ?? 0);


            const unit =
                item.unit ||
                "units";


            const imageUrl =
                item.imageUrl ||
                item.imageURL ||
                item.image ||
                item.photoURL ||
                "";


            const alertItem =
                document.createElement("div");


            alertItem.className =
                "low-stock-item";


            alertItem.innerHTML = `

                <div class="low-stock-product-image">

                    ${
                        imageUrl
                            ? `
                                <img
                                    src="${escapeAttribute(imageUrl)}"
                                    alt="${escapeAttribute(itemName)}"
                                    loading="lazy"
                                >
                            `
                            : `
                                <div class="low-stock-image-placeholder">

                                    <i class="fa-solid fa-box"></i>

                                </div>
                            `
                    }

                </div>


                <div class="low-stock-information">

                    <strong>
                        ${escapeHtml(itemName)}
                    </strong>

                    <span>
                        ${stock} ${escapeHtml(unit)} remaining
                    </span>

                </div>


                <div class="low-stock-status">

                    <span class="low-stock-number">
                        ${stock}
                    </span>

                    <span class="low-stock-label">
                        LOW
                    </span>

                </div>

            `;


            lowStockItems.appendChild(
                alertItem
            );

        });


    } catch (error) {

        console.error(
            "Error loading inventory:",
            error
        );


        lowStockItems.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon green-empty">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>

                <strong>
                    Unable to load alerts
                </strong>

                <span>
                    Please refresh the dashboard.
                </span>

            </div>

        `;

    }

}


/* Escape HTML */
function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* Escape attribute */
function escapeAttribute(value) {

    return escapeHtml(value);

}


/* Check admin authentication */
onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            redirectToLogin();

            return;

        }


        try {

            const adminReference =
                doc(
                    db,
                    "admins",
                    user.uid
                );


            const adminSnapshot =
                await getDoc(
                    adminReference
                );


            if (!adminSnapshot.exists()) {

                console.error(
                    "Admin document was not found:",
                    user.uid
                );

                await signOut(auth);

                redirectToLogin();

                return;

            }


            const adminData =
                adminSnapshot.data();


            console.log(
                "Logged-in admin:",
                adminData
            );


            const role =
                String(
                    adminData.role ||
                    adminData.adminRole ||
                    ""
                ).toLowerCase();


            const status =
                String(
                    adminData.status ||
                    ""
                ).toLowerCase();


            const isAdmin =
                role === "admin" ||
                role === "administrator";


            const isActive =
                adminData.active === true ||
                status === "active" ||
                (
                    adminData.active === undefined &&
                    adminData.status === undefined
                );


            if (!isAdmin || !isActive) {

                console.error(
                    "Admin access rejected."
                );

                await signOut(auth);

                redirectToLogin();

                return;

            }


            await loadLowStockItems();

        } catch (error) {

            console.error(
                "Could not verify admin access:",
                error
            );

        }

    }
);