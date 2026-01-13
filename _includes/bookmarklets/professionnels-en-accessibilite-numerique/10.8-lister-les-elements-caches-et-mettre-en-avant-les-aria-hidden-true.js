(function () {
  function isElementHidden(element) {
    if (element.hasAttribute('hidden')) {
      return true;
    }

    const computedStyle = getComputedStyle(element);

    if (
      computedStyle.display === 'none' ||
      computedStyle.visibility === 'hidden'
    ) {
      return true;
    }

    return false;
  }

  function isElementHiddenOnlyToAT(element) {
    if (
      element.hasAttribute('aria-hidden') &&
      element.getAttribute('aria-hidden') === 'true'
    ) {
      return true;
    }

    return false;
  }

  function isExcludedNode(node) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node.tagName === 'STYLE' ||
        node.tagName === 'SCRIPT' ||
        node.tagName === 'NOSCRIPT' ||
        node.tagName === 'LINK')
    ) {
      return true;
    }

    return false;
  }

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

  function getElementsHiddenToAT(parentElement) {
    const elements = parentElement.querySelectorAll('*');
    const elementsHiddenOnlyToAT = [];
    const hiddenElements = [];

    elements.forEach((element) => {
      if (isExcludedNode(element)) {
        return;
      }

      if (isElementHiddenOnlyToAT(element)) {
        element.style.border = '1px solid yellow';
        element.style.outline = '1px solid blue';
        element.style.outlineOffset = '2px';
        element.style.background = 'red';
        element.style.backgroundColor = 'red';

        elementsHiddenOnlyToAT.push(element);
      } else if (isElementHidden(element)) {
        hiddenElements.push(element);
      }
    });

    return [elementsHiddenOnlyToAT, hiddenElements];
  }

  // Get elements from document body and all shadow roots
  const allRoots = [document.body, ...getAllShadowRoots()];
  let elementsHiddenOnlyToAT = [];
  let hiddenElements = [];

  allRoots.forEach((root) => {
    if (root) {
      const [hiddenOnlyToAT, hidden] = getElementsHiddenToAT(root);
      elementsHiddenOnlyToAT.push(...hiddenOnlyToAT);
      hiddenElements.push(...hidden);
    }
  });
  const numberOfElementsHiddenOnlyToAT = elementsHiddenOnlyToAT.length;
  const numberOfHiddenElements = hiddenElements.length;
  const numberOfElementsHiddenToAT =
    numberOfElementsHiddenOnlyToAT + numberOfHiddenElements;

  if (numberOfElementsHiddenToAT === 0) {
    alert('Aucun élément caché aux TA.');
    return;
  }

  let messageNumberOfElementsHiddenOnlyToAT =
    numberOfElementsHiddenOnlyToAT +
    ` éléments cachés aux TA avec aria-hidden='true'`;
  let messageNumberOfHiddenElements =
    numberOfHiddenElements + ' éléments cachés pour tout le monde';

  if (numberOfElementsHiddenOnlyToAT === 0) {
    messageNumberOfElementsHiddenOnlyToAT = `Aucun élément caché aux TA avec aria-hidden='true'`;
  }

  if (numberOfHiddenElements === 0) {
    messageNumberOfHiddenElements = 'Aucun élément caché pour tout le monde';
  }

  if (numberOfElementsHiddenOnlyToAT === 1) {
    messageNumberOfElementsHiddenOnlyToAT =
      messageNumberOfElementsHiddenOnlyToAT.replace(
        'éléments cachés',
        'élément caché'
      );
  }

  if (numberOfHiddenElements === 1) {
    messageNumberOfHiddenElements = messageNumberOfHiddenElements.replace(
      'éléments cachés',
      'élément caché'
    );
  }

  console.clear();

  console.log(
    messageNumberOfElementsHiddenOnlyToAT +
      (numberOfElementsHiddenOnlyToAT === 0 ? '.' : ' :')
  );
  elementsHiddenOnlyToAT.forEach((element) => {
    console.log(element);
  });

  console.log(
    messageNumberOfHiddenElements + (numberOfHiddenElements === 0 ? '.' : ' :')
  );
  hiddenElements.forEach((element) => {
    console.log(element);
  });

  alert(
    messageNumberOfElementsHiddenOnlyToAT +
      '.' +
      '\n' +
      messageNumberOfHiddenElements +
      '.' +
      '\n' +
      (numberOfElementsHiddenOnlyToAT > 0
        ? `\nLes éléments cachés avec aria-hidden='true' vont :` +
          '\n - être entourés de jaune et bleu' +
          '\n - avoir un fond rouge' +
          '\n'
        : '') +
      '\nOuvrir la console pour voir la liste de tous les éléments cachés aux TA.' +
      '\n\nAppuyer sur OK.'
  );
})();
