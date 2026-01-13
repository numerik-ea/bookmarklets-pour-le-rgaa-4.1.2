(function getAnchorsWithoutHref() {
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

  const anchorsWithoutHref = querySelectorAllInAllRoots('a:not([href])');

  if (anchorsWithoutHref.length === 0) {
    alert("Il n'y a pas d'ancre sans attribut href sur la page.");
    return;
  }

  let message =
    'Il y a ' +
    anchorsWithoutHref.length +
    ' ancres sans attribut href sur la page';

  if (anchorsWithoutHref.length === 1) {
    message = message.replace('ancres', 'ancre');
  }

  // Clear console before showing alert to ensure it works reliably
  console.clear();

  // Add separator and message
  console.log('========================================');
  console.log(message + ' :');
  console.log('========================================');

  anchorsWithoutHref.forEach((element) => {
    // Add visual highlighting
    element.style.border = '2px solid yellow';
    element.style.outline = '2px solid blue';
    element.style.outlineOffset = '2px';
    element.style.background = 'red';
    element.style.backgroundColor = 'red';

    // Create a label element to show text
    const label = document.createElement('div');
    label.textContent = 'Lien sans href';
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
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }

    element.appendChild(label);

    console.log(element);
  });

  alert(message + '.\nVoir la console pour plus de détails.');
})();
