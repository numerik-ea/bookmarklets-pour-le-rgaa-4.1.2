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
    alert('Pas d\'éléments de citation sur la page.');
    return;
  }

  let message = numberOfQuotesElements + ' éléments de citation sur la page';

  if (numberOfQuotesElements === 1) {
    message = message.replace('éléments', 'élément');
  }

  alert(message + '.\nAppuyer sur OK pour voir les éléments de citation mis en évidence.');

  quotesElements.forEach((quoteElement) => {
        quoteElement.style.border = '2px solid red';

        // Create a label element to show text
        const label = document.createElement('div');

        const tagName = quoteElement.tagName.toLowerCase();
        label.textContent = '<' + tagName + '>';
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

        if (tagName === 'q') {
          // Récupérer les guillemets calculés avant de les désactiver
          const computedStyle = window.getComputedStyle(quoteElement);
          const quotes = computedStyle.quotes;
          let openQuote = '\u00ab\u00a0';
          let closeQuote = '\u00a0\u00bb';
          if (quotes && quotes !== 'none' && quotes !== 'auto') {
            const parts = quotes.match(/\x22([^\x22]*)\x22/g);
            if (parts && parts.length >= 2) {
              openQuote = parts[0].replace(/\x22/g, '');
              closeQuote = parts[1].replace(/\x22/g, '');
            }
          }
          // Désactiver les guillemets automatiques du ::before et ::after
          quoteElement.style.quotes = 'none';
          // Insérer le label puis le guillemet ouvrant avant le contenu
          quoteElement.insertBefore(document.createTextNode(openQuote), quoteElement.firstChild);
          quoteElement.insertBefore(label, quoteElement.firstChild);
          // Ajouter le guillemet fermant à la fin
          quoteElement.appendChild(document.createTextNode(closeQuote));
        } else {
          quoteElement.insertBefore(label, quoteElement.firstChild);
        }
    });
})();
