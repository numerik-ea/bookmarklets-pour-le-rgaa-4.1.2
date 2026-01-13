(function checkHeaderNavMainFooter() {
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

  // Function to query selector in a root (document or shadow root)
  function querySelectorInRoot(selector, root) {
    return root.querySelector(selector);
  }

  // Function to query selector all in a root
  function querySelectorAllInRoot(selector, root) {
    return Array.from(root.querySelectorAll(selector));
  }

  let message = '';
  const allRoots = [document, ...getAllShadowRoots()];
  const shadowRootCount = allRoots.length - 1;

  // Check each element type across all roots
  const elements = ['header', 'nav', 'main', 'footer'];

  elements.forEach((tagName) => {
    let count = 0;
    let countInDocument = 0;
    let countInShadow = 0;

    // Count in document
    countInDocument = querySelectorAllInRoot(tagName, document).length;
    count += countInDocument;

    // Count in shadow DOMs
    allRoots.slice(1).forEach((shadowRoot) => {
      const shadowCount = querySelectorAllInRoot(tagName, shadowRoot).length;
      countInShadow += shadowCount;
      count += shadowCount;
    });

    if (count > 0) {
      const locationParts = [];
      if (countInDocument > 0) {
        locationParts.push(`${countInDocument} dans le document`);
      }
      if (countInShadow > 0) {
        locationParts.push(`${countInShadow} dans shadow DOM`);
      }
      const location =
        locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';
      message += `<${tagName}> trouvé : ${count}${location}\n`;
    } else {
      message += `<${tagName}> non trouvé\n`;
    }
  });

  if (shadowRootCount > 0) {
    message += `\n${shadowRootCount} shadow root(s) analysé(s).\n`;
  }

  alert(message + '\nVoir la console pour plus de détails.');

  console.clear();
  console.log(message + ' :');

  // Log all found elements from all roots
  allRoots.forEach((root, index) => {
    const rootName =
      index === 0 ? 'Document principal' : `Shadow root ${index}`;
    const elements = querySelectorAllInRoot('header, nav, main, footer', root);
    if (elements.length > 0) {
      console.log(`\n${rootName}:`);
      elements.forEach((element) => console.log(element));
    }
  });
})();
