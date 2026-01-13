(function checkQuotesElements() {
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
    const allRoots = [document.body, ...getAllShadowRoots()];
    const allElements = [];
    allRoots.forEach((root) => {
      const elements = Array.from(root.querySelectorAll(selector));
      allElements.push(...elements);
    });
    return allElements;
  }

  const quotesElements = querySelectorAllInAllRoots('q, blockquote');
  const numberOfQuotesElements = quotesElements.length;

  if (numberOfQuotesElements === 0) {
    alert("Pas d'éléments de citation sur la page.");
    return;
  }

  let message = numberOfQuotesElements + ' éléments de citation sur la page';

  if (numberOfQuotesElements === 1) {
    message = message.replace('éléments', 'élément');
  }

  alert(message + '.\nVoir la console pour plus de détails.');
  console.clear();
  console.log(message + ' :');

  quotesElements.forEach((quoteElement) => {
    quoteElement.style.border = '1px solid yellow';
    quoteElement.style.outline = '1px solid blue';
    quoteElement.style.outlineOffset = '2px';
    quoteElement.style.background = 'red';
    quoteElement.style.backgroundColor = 'red';

    console.log(quoteElement);
  });
})();
