/* GLOBAL THEME */

const savedTheme =
    localStorage.getItem("kkopi-theme");


if (savedTheme === "dark") {

    document.documentElement.classList.add(
        "dark-mode"
    );

} else {

    document.documentElement.classList.remove(
        "dark-mode"
    );

}