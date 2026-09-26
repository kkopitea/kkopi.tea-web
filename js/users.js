import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


/* ELEMENTS */

const tableBody =
    document.getElementById("users-table-body");

const loadingRow =
    document.getElementById("users-loading-row");

const emptyRow =
    document.getElementById("users-empty-row");

const searchInput =
    document.getElementById("user-search");

const roleFilter =
    document.getElementById("role-filter");

const selectAll =
    document.getElementById("select-all-users");

const resultCount =
    document.getElementById("users-result-count");

const prevButton =
    document.getElementById("users-prev");

const nextButton =
    document.getElementById("users-next");

const pageNumbers =
    document.getElementById("users-page-numbers");

const totalUsersElement =
    document.getElementById("total-users");

const activeUsersElement =
    document.getElementById("active-users");


/* STATE */

let allAdmins = [];

let filteredAdmins = [];

let currentPage = 1;

const usersPerPage = 5;


/* LOAD ADMINS */

async function loadAdmins() {

    showLoading();

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "admins"
                )
            );

        allAdmins = [];

        snapshot.forEach(
            function (documentSnapshot) {

                allAdmins.push({
                    id: documentSnapshot.id,
                    ...documentSnapshot.data()
                });

            }
        );

        updateSummary();

        populateRoleFilter();

        applyFilters();

    } catch (error) {

        console.error(
            "Error loading admin records:",
            error
        );

        showEmptyState(
            "Unable to Load Admins",
            "There was a problem retrieving the administrator records."
        );

    }

}


/* SUMMARY */

function updateSummary() {

    const total =
        allAdmins.length;

    const active =
        allAdmins.filter(
            function (admin) {

                return normalizeStatus(
                    getStatus(admin)
                ) === "active";

            }
        ).length;


    totalUsersElement.textContent =
        total;

    activeUsersElement.textContent =
        active;

}


/* ROLE FILTER */

function populateRoleFilter() {

    const roles =
        new Set();


    allAdmins.forEach(
        function (admin) {

            const role =
                getRole(admin);

            if (role) {

                roles.add(role);

            }

        }
    );


    roleFilter.innerHTML = `
        <option value="all">All Roles</option>
    `;


    Array.from(roles)
        .sort()
        .forEach(
            function (role) {

                const option =
                    document.createElement("option");

                option.value =
                    normalizeRole(role);

                option.textContent =
                    role;

                roleFilter.appendChild(
                    option
                );

            }
        );

}


/* FILTERS */

function applyFilters() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedRole =
        roleFilter.value;


    filteredAdmins =
        allAdmins.filter(
            function (admin) {

                const name =
                    getName(admin)
                        .toLowerCase();

                const email =
                    getEmail(admin)
                        .toLowerCase();

                const role =
                    normalizeRole(
                        getRole(admin)
                    );


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    email.includes(search) ||
                    role.includes(search);


                const matchesRole =
                    selectedRole === "all" ||
                    role === selectedRole;


                return (
                    matchesSearch &&
                    matchesRole
                );

            }
        );


    currentPage = 1;

    renderUsers();

}


/* RENDER USERS */

function renderUsers() {

    removeDynamicRows();

    hideLoading();

    emptyRow.hidden = true;


    if (
        filteredAdmins.length === 0
    ) {

        showEmptyState(
            "No Admins Found",
            "No administrator accounts match your current search or filter."
        );

        updateFooter();

        return;

    }


    const startIndex =
        (
            currentPage - 1
        ) * usersPerPage;


    const endIndex =
        startIndex +
        usersPerPage;


    const pageAdmins =
        filteredAdmins.slice(
            startIndex,
            endIndex
        );


    pageAdmins.forEach(
        function (admin) {

            tableBody.appendChild(
                createAdminRow(admin)
            );

        }
    );


    updateFooter();

    updateSelectAll();

}


/* CREATE ADMIN ROW */

function createAdminRow(admin) {

    const row =
        document.createElement("tr");

    row.className =
        "dynamic-user-row";


    const name =
        getName(admin);

    const email =
        getEmail(admin);

    const role =
        getRole(admin);

    const status =
        normalizeStatus(
            getStatus(admin)
        );

    const adminId =
        getAdminId(admin);

    const position =
        getPosition(admin);

    const lastLogin =
        getLastLogin(admin);

    const avatar =
        getInitials(name);


    const roleClass =
        getRoleClass(role);


    const statusClass =
        status === "active"
            ? "active"
            : "inactive";


    row.innerHTML = `

        <td class="checkbox-column">

            <input
                type="checkbox"
                class="user-checkbox"
                data-id="${escapeAttribute(admin.id)}"
            >

        </td>


        <td>

            <span class="user-id">
                ${escapeHtml(adminId)}
            </span>

        </td>


        <td>

            <div class="user-name-wrapper">

                <div
                    class="user-avatar-small ${getAvatarClass(role)}"
                >
                    ${escapeHtml(avatar)}
                </div>


                <div class="user-details">

                    <span class="user-name">
                        ${escapeHtml(name)}
                    </span>

                    <span class="user-position">
                        ${escapeHtml(position)}
                    </span>

                </div>

            </div>

        </td>


        <td>

            <span class="user-email">
                ${escapeHtml(email)}
            </span>

        </td>


        <td>

            <span class="user-role ${roleClass}">
                ${escapeHtml(role)}
            </span>

        </td>


        <td>

            <span class="user-status ${statusClass}">
                ${escapeHtml(
                    formatStatus(status)
                )}
            </span>

        </td>


        <td>

            <div class="user-last-login">

                <strong>
                    ${escapeHtml(
                        lastLogin.date
                    )}
                </strong>

                <span>
                    ${escapeHtml(
                        lastLogin.time
                    )}
                </span>

            </div>

        </td>


        <td>

            <div class="user-actions">

                <button
                    type="button"
                    class="user-action user-edit-action"
                    title="Edit Admin"
                    data-id="${escapeAttribute(admin.id)}"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>


                <button
                    type="button"
                    class="user-action user-delete-action"
                    title="Delete Admin"
                    data-id="${escapeAttribute(admin.id)}"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

        </td>

    `;


    const editButton =
        row.querySelector(
            ".user-edit-action"
        );


    const deleteButton =
        row.querySelector(
            ".user-delete-action"
        );


    /* EDIT ADMIN */

    editButton.addEventListener(
        "click",
        function () {

            const adminId =
                editButton.dataset.id;


            if (!adminId) {
                return;
            }


            window.location.href =
                `edit-users.php?id=${encodeURIComponent(adminId)}`;

        }
    );


    /* DELETE ADMIN */

    deleteButton.addEventListener(
        "click",
        function () {

            const adminId =
                deleteButton.dataset.id;


            if (!adminId) {
                return;
            }


            deleteAdmin(adminId);

        }
    );


    return row;

}


/* DELETE ADMIN */

async function deleteAdmin(adminId) {

    const admin =
        allAdmins.find(
            function (item) {

                return item.id === adminId;

            }
        );


    if (!admin) {
        return;
    }


    const name =
        getName(admin);


    const confirmed =
        window.confirm(
            `Are you sure you want to delete ${name}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "admins",
                adminId
            )
        );


        allAdmins =
            allAdmins.filter(
                function (item) {

                    return item.id !== adminId;

                }
            );


        updateSummary();

        populateRoleFilter();

        applyFilters();


    } catch (error) {

        console.error(
            "Error deleting admin:",
            error
        );

        window.alert(
            "Unable to delete the administrator account."
        );

    }

}


/* SEARCH */

searchInput.addEventListener(
    "input",
    function () {

        applyFilters();

    }
);


/* ROLE FILTER */

roleFilter.addEventListener(
    "change",
    function () {

        applyFilters();

    }
);


/* SELECT ALL */

selectAll.addEventListener(
    "change",
    function () {

        const checkboxes =
            tableBody.querySelectorAll(
                ".user-checkbox"
            );


        checkboxes.forEach(
            function (checkbox) {

                checkbox.checked =
                    selectAll.checked;

            }
        );

    }
);


/* UPDATE SELECT ALL */

function updateSelectAll() {

    const checkboxes =
        tableBody.querySelectorAll(
            ".user-checkbox"
        );


    if (checkboxes.length === 0) {

        selectAll.checked = false;

        return;

    }


    const checkedCount =
        tableBody.querySelectorAll(
            ".user-checkbox:checked"
        ).length;


    selectAll.checked =
        checkedCount === checkboxes.length;

}


/* PREVIOUS PAGE */

prevButton.addEventListener(
    "click",
    function () {

        if (
            currentPage > 1
        ) {

            currentPage--;

            renderUsers();

        }

    }
);


/* NEXT PAGE */

nextButton.addEventListener(
    "click",
    function () {

        const totalPages =
            Math.ceil(
                filteredAdmins.length /
                usersPerPage
            );


        if (
            currentPage < totalPages
        ) {

            currentPage++;

            renderUsers();

        }

    }
);


/* PAGE NUMBERS */

function renderPageNumbers() {

    pageNumbers.innerHTML = "";


    const totalPages =
        Math.ceil(
            filteredAdmins.length /
            usersPerPage
        );


    if (
        totalPages <= 1
    ) {

        return;

    }


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "user-page-number";


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.textContent =
            page;


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;

                renderUsers();

            }
        );


        pageNumbers.appendChild(
            button
        );

    }

}


/* FOOTER */

function updateFooter() {

    const total =
        filteredAdmins.length;


    const start =
        total === 0
            ? 0
            : (
                (
                    currentPage - 1
                ) * usersPerPage
            ) + 1;


    const end =
        Math.min(
            currentPage *
            usersPerPage,
            total
        );


    resultCount.textContent =
        `Showing ${start}-${end} of ${total} admins`;


    const totalPages =
        Math.ceil(
            total /
            usersPerPage
        );


    prevButton.disabled =
        currentPage <= 1;


    nextButton.disabled =
        currentPage >= totalPages ||
        totalPages === 0;


    renderPageNumbers();

}


/* REMOVE ROWS */

function removeDynamicRows() {

    tableBody
        .querySelectorAll(
            ".dynamic-user-row"
        )
        .forEach(
            function (row) {

                row.remove();

            }
        );

}


/* LOADING */

function showLoading() {

    loadingRow.hidden = false;

    emptyRow.hidden = true;

    removeDynamicRows();

}


/* HIDE LOADING */

function hideLoading() {

    loadingRow.hidden = true;

}


/* EMPTY */

function showEmptyState(
    title,
    message
) {

    hideLoading();

    emptyRow.hidden = false;


    const titleElement =
        emptyRow.querySelector("h3");


    const messageElement =
        emptyRow.querySelector("p");


    titleElement.textContent =
        title;


    messageElement.textContent =
        message;

}


/* FIELD HELPERS */

function getName(admin) {

    return (
        admin.name ||
        admin.fullName ||
        admin.displayName ||
        admin.adminName ||
        "Admin"
    );

}


function getEmail(admin) {

    return (
        admin.email ||
        admin.adminEmail ||
        ""
    );

}


function getRole(admin) {

    return (
        admin.role ||
        admin.adminRole ||
        "Administrator"
    );

}


function getPosition(admin) {

    return (
        admin.position ||
        admin.jobTitle ||
        admin.title ||
        "System Administrator"
    );

}


function getStatus(admin) {

    return (
        admin.status ||
        (
            admin.active === false
                ? "Inactive"
                : "Active"
        )
    );

}


function getAdminId(admin) {

    return (
        admin.adminId ||
        admin.userId ||
        admin.accountId ||
        admin.id
    );

}


/* LAST LOGIN */

function getLastLogin(admin) {

    const possibleDate =
        admin.lastLogin ||
        admin.lastLoginAt ||
        admin.updatedAt;


    if (!possibleDate) {

        return {
            date: "No login recorded",
            time: ""
        };

    }


    let date;


    if (
        typeof possibleDate.toDate ===
        "function"
    ) {

        date =
            possibleDate.toDate();

    } else if (
        typeof possibleDate.seconds ===
        "number"
    ) {

        date =
            new Date(
                possibleDate.seconds * 1000
            );

    } else {

        date =
            new Date(
                possibleDate
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return {
            date: "No login recorded",
            time: ""
        };

    }


    return {

        date:
            new Intl.DateTimeFormat(
                undefined,
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            ).format(date),

        time:
            new Intl.DateTimeFormat(
                undefined,
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            ).format(date)

    };

}


/* ROLE CLASS */

function getRoleClass(role) {

    const normalized =
        normalizeRole(role);


    if (
        normalized.includes("administrator") ||
        normalized.includes("admin")
    ) {

        return "administrator";

    }


    if (
        normalized.includes("cashier")
    ) {

        return "cashier";

    }


    if (
        normalized.includes("manager")
    ) {

        return "manager";

    }


    if (
        normalized.includes("inventory")
    ) {

        return "inventory";

    }


    return "administrator";

}


/* AVATAR CLASS */

function getAvatarClass(role) {

    const normalized =
        normalizeRole(role);


    if (
        normalized.includes("cashier")
    ) {

        return "avatar-purple";

    }


    if (
        normalized.includes("manager")
    ) {

        return "avatar-green";

    }


    if (
        normalized.includes("inventory")
    ) {

        return "avatar-blue";

    }


    return "avatar-orange";

}


/* INITIALS */

function getInitials(name) {

    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        parts.length === 0
    ) {

        return "AD";

    }


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


/* NORMALIZE ROLE */

function normalizeRole(role) {

    return String(
        role || ""
    )
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");

}


/* NORMALIZE STATUS */

function normalizeStatus(status) {

    return String(
        status || "active"
    )
        .trim()
        .toLowerCase();

}


/* FORMAT STATUS */

function formatStatus(status) {

    if (
        status === "active"
    ) {

        return "Active";

    }


    if (
        status === "inactive"
    ) {

        return "Inactive";

    }


    return status
        .charAt(0)
        .toUpperCase() +
        status.slice(1);

}


/* ESCAPE HTML */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHtml(value);

}


/* START */

loadAdmins();