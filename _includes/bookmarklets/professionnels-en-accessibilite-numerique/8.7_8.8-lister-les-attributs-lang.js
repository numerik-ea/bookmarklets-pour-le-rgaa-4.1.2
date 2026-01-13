(function () {
  // Function to recursively get all shadow roots
  function getAllShadowRoots(root = document) {
    const shadowRoots = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.shadowRoot) {
        shadowRoots.push(node.shadowRoot);
        // Recursively get shadow roots within shadow roots
        shadowRoots.push(...getAllShadowRoots(node.shadowRoot));
      }
    }
    return shadowRoots;
  }

  // Function to query selector all across all roots
  function querySelectorAllInAllRoots(selector) {
    const allRoots = [document, ...getAllShadowRoots()];
    const allElements = [];
    allRoots.forEach((root) => {
      const elements = Array.from(root.querySelectorAll(selector));
      allElements.push(...elements);
    });
    return allElements;
  }

  const elements = querySelectorAllInAllRoots('[lang]');

  if (elements.length === 0) {
    // Clear console
    console.clear();
    console.log("Aucun élément avec l'attribut lang trouvé.");

    alert(
      `Aucun élément avec l'attribut lang trouvé :\n` +
        `8.3 NC, 8.4 NA\n\n` +
        `ATTENTION : Vérifier les potentiels changements de langue dans la page sans l'attribut lang.`
    );
    return;
  }

  if (elements.length === 1 && elements[0].tagName.toLowerCase() === 'html') {
    const lang = elements[0].getAttribute('lang');

    // Clear console
    console.clear();
    console.log('========================================');
    console.log('Langue par défaut de la page :');
    console.log('========================================');
    console.log(elements[0]);

    alert(
      `Langue par défaut de la page : <html lang="${lang}">\n\n` +
        `Aucun autre élément avec l'attribut lang trouvé.\n\n` +
        `Vérifier les potentiels changements de langue dans la page sans l'attribut lang.`
    );

    return;
  }

  // Clear console before showing alert to ensure it works reliably
  console.clear();

  // Add separator and message
  console.log('========================================');
  console.log(`${elements.length} éléments avec l'attribut lang trouvés :`);
  console.log('========================================');

  elements.forEach((el) => {
    // Skip html element for visual highlighting (it's the whole page)
    if (el.tagName.toLowerCase() !== 'html') {
      // Add visual highlighting
      el.style.border = '2px solid yellow';
      el.style.outline = '2px solid blue';
      el.style.outlineOffset = '2px';
      el.style.background = 'red';
      el.style.backgroundColor = 'red';

      // Get the lang attribute value
      const langValue = el.getAttribute('lang') || '';

      // Create a label element to show text
      const label = document.createElement('div');
      label.textContent = `lang="${langValue}"`;
      label.style.position = 'absolute';
      label.style.top = '0';
      label.style.left = '0';
      label.style.backgroundColor = 'yellow';
      label.style.color = 'black';
      label.style.padding = '2px 5px';
      label.style.fontSize = '12px';
      label.style.fontWeight = 'bold';
      label.style.zIndex = '10000';
      label.style.pointerEvents = 'none';

      // Make sure the element has position relative for absolute positioning to work
      const computedStyle = window.getComputedStyle(el);
      if (computedStyle.position === 'static') {
        el.style.position = 'relative';
      }

      el.appendChild(label);
    }

    console.log(el);
  });

  alert(
    `${elements.length} éléments avec l'attribut lang trouvés.\n\n` +
      `ATTENTION : Vérifier les potentiels changements de langue dans la page sans l'attribut lang.\n\n` +
      `Voir la console pour plus de détails.`
  );
})();
