(function checkTitleAttributes() {
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

  const titleElements = querySelectorAllInAllRoots('[title]');
  const numberOfTitleElements = titleElements.length;

  if (numberOfTitleElements === 0) {
    alert('Pas d\'éléments avec attribut title sur la page.');
    return;
  }

  let message =
    numberOfTitleElements + ' éléments avec attribut title sur la page';

  if (numberOfTitleElements === 1) {
    message = message.replace('éléments', 'élément');
  }

  alert(message + '.\nAppuyer sur OK pour voir les éléments mis en évidence.');

  titleElements.forEach((element) => {
    element.style.border = '2px solid red';

    // Create a yellow label element
    const label = document.createElement('span');
    const tagName = element.tagName.toLowerCase();
    const titleValue = element.getAttribute('title') || '';
    label.textContent = '<' + tagName + '> title=\x22' + titleValue + '\x22';
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

    element.parentNode.insertBefore(label, element);
  });
})();
