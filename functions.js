// HOME PAGE

const adminButton = document.querySelector(".admin-login");
const learnMoreButton = document.querySelector(".learn-more");

if (adminButton) {
    adminButton.addEventListener("click", function() {

        window.location.href = "admin-login.php";
    });
}
// ABOUT PAGE
if (learnMoreButton) {
    learnMoreButton.addEventListener("click", function() {

        window.location.href = "about.php";
    });
}
