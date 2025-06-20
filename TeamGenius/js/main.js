//Start aos
AOS.init({
    duration: 800,
    once: true
});
//End aos

//Start progress-bar
const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    progressBar.style.width = `${progress}%`;
});
//End progress-bar

// Start dark mode
function toggleDarkMode() {
    const body = document.body;
    const icon = document.querySelector("#darkToggleBtn i");
    body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
    if (body.classList.contains("dark-mode")) {
        icon.classList.replace("fa-sun", "fa-moon");
    } else {
        icon.classList.replace("fa-moon", "fa-sun");
    }
}
// تحميل حالة الوضع المظلم عند فتح الصفحة
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.querySelector("#darkToggleBtn i").classList.replace("fa-sun", "fa-moon");
}
//End dark mode

//Start scrool to top button
const scrollBtn = document.querySelector(".scrollToTopBtn");
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        scrollBtn.style.display = "block";
    } else {
        scrollBtn.style.display = "none";
    }
});
scrollBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
//End scrool to top button