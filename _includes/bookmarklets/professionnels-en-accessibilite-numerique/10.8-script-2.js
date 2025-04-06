(function () {
  const hiddenElements = document.querySelectorAll(
    [
      `[aria-hidden='true']`,
      `[hidden]`,
      `[style*='display: none']`,
      `[style*='visibility: hidden']`,
      `[style*='font-size: 0']`,
    ].join(`, `)
  );

  hiddenElements.forEach((el) => {
    const isFocusable = el.getAttribute(`tabindex`) === `0`;

    if (isFocusable) {
      el.classList.add(`sr-only-focusable`);
      el.style.display = ``; // Remove display:none
      el.style.visibility = `visible`; // Remove visibility:hidden
      el.style.fontSize = ``; // Remove font-size:0
      el.setAttribute(`aria-hidden`, `false`);
    }
  });

  const styleTag = document.createElement(`style`);

  styleTag.innerHTML = `
    .sr-only {
        border: 0;
        clip: rect(0 0 0 0);
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: absolute;
        width: 1px;
        white-space: nowrap;
    }

    .sr-only-focusable:active, .sr-only-focusable:focus {
        position: static;
        width: auto;
        height: auto;
        overflow: visible;
        clip: auto;
        white-space: normal;
    }
  `;

  document.head.appendChild(styleTag);

  alert(`Accessibilité ajustée pour les éléments cachés.`);
})();
