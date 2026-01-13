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

  const imagesWithAlt = querySelectorAllInAllRoots(`img[alt]`);

  if (imagesWithAlt.length === 0) {
    alert('Aucune image avec un alt.');
    return;
  }

  let message = 'Il y a ' + imagesWithAlt.length + ' images avec un alt';

  if (imagesWithAlt.length === 1) {
    message = message.replace('images', 'image');
  }

  alert(message + '.\nVoir la console pour plus de détails.');
  console.clear();
  console.log(message + ' :');

  imagesWithAlt.forEach((image) => {
    // Add visual highlighting
    image.style.border = '2px solid yellow';
    image.style.outline = '2px solid blue';
    image.style.outlineOffset = '2px';
    image.style.backgroundColor = 'red';
    image.style.background = 'red';

    console.log(image);
  });
})();
