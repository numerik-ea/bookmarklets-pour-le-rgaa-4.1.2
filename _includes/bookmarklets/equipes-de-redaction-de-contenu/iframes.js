(function checkIframes() {
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

  // Function to query selector all across all roots (document + Shadow DOM)
  function querySelectorAllInAllRoots(selector) {
    const allRoots = [document.body, ...getAllShadowRoots()];
    const allElements = [];
    allRoots.forEach((root) => {
      const elements = Array.from(root.querySelectorAll(selector));
      allElements.push(...elements);
    });
    return allElements;
  }

  const iframes = querySelectorAllInAllRoots('iframe');
  const numberOfIframes = iframes.length;

  if (numberOfIframes === 0) {
    alert('Pas d\'iframes sur la page.');
    return;
  }

  let message = numberOfIframes + ' iframes sur la page';

  if (numberOfIframes === 1) {
    message = numberOfIframes + ' iframe sur la page';
  }

  alert(message + '.\nAppuyer sur OK pour voir les iframes mises en évidence.');

  iframes.forEach((iframe) => {
    iframe.style.border = '2px solid red';

    // Create a yellow label element
    const label = document.createElement('span');
    label.textContent = '<iframe>';
    label.style.backgroundColor = 'yellow';
    label.style.color = 'black';
    label.style.padding = '2px 5px';
    label.style.fontSize = '12px';
    label.style.fontWeight = 'bold';
    label.style.zIndex = '10000';
    label.style.pointerEvents = 'none';
    label.style.display = 'inline-block';
    label.style.verticalAlign = 'middle';
    label.style.marginRight = '4px';

    iframe.parentNode.insertBefore(label, iframe);
  });
})();
