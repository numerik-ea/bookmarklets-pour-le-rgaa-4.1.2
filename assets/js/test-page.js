document.getElementById("currentYear").textContent = new Date().getFullYear();

// Check if there's history and conditionally show/hide the back link
window.addEventListener("load", function () {
  const backLink = document.getElementById("back-link");

  if (document.referrer.trim() === "") {
    backLink.remove();
  }
});
