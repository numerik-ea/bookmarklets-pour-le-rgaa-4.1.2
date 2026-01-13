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

  function findElementsWithBackgroundImage() {
    // Get all elements from document and all shadow roots
    const allElements = querySelectorAllInAllRoots('*');

    return allElements.filter((el) => {
      const styles = window.getComputedStyle(el);
      const bgImage = styles.backgroundImage;
      const bg = styles.background;

      // Check if either property contains a URL
      const hasImage = (value) => value && value.includes('url(');

      return hasImage(bgImage) || hasImage(bg);
    });
  }

  // Example usage:
  const elementsWithBgImage = findElementsWithBackgroundImage();
  let message = `${elementsWithBgImage.length} éléments avec un background image`;

  if (elementsWithBgImage.length === 0) {
    alert('Aucun élément avec un background image.');
    return;
  }

  if (elementsWithBgImage.length === 1) {
    message = message.replace('éléments', 'élément');
  }

  alert(message + '.\nPlus de détails dans la console.');
  console.clear();
  console.log(message + ' :');

  elementsWithBgImage.forEach((element) => {
    element.style.border = '1px solid yellow';
    element.style.outline = '1px solid blue';
    element.style.outlineOffset = '2px';
    element.style.background = 'red';
    element.style.backgroundColor = 'red';

    console.log(element);
  });
})();
