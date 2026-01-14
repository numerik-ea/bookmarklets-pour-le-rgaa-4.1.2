function copyBookmarklet(button) {
  // Get the bookmarklet link - first find the container, then get the link
  const container = button.closest('.bookmarklet-container');
  const bookmarkletLink = container.querySelector('.bookmarklet-link');
  const bookmarkletContent = bookmarkletLink.getAttribute("href");

  // Create tooltip if it doesn't exist
  if (!button.querySelector('.tooltip')) {
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = 'Bookmarklet copié dans le presse-papiers';
    button.appendChild(tooltip);
  }

  navigator.clipboard
    .writeText(bookmarkletContent.replace("%C2%A0", "&nbsp;"))
    .then(() => {
      // Visual feedback
      const originalHTML = button.innerHTML;
      button.innerHTML = `
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="tooltip show">Bookmarklet copié dans le presse-papiers</span>
        `;
      button.classList.add('success');

      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('success');
      }, 2000);
    })
    .catch((err) => {
      console.error("Échec de la copie du bookmarklet :", err);
    });
}
