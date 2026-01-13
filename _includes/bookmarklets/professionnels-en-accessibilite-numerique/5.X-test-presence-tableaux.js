(function checkTableElements() {
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

  // Function to query selector all in a root
  function querySelectorAllInRoot(selector, root) {
    return Array.from(root.querySelectorAll(selector));
  }

  // Get all roots (document + shadow roots)
  const allRoots = [document, ...getAllShadowRoots()];
  const shadowRootCount = allRoots.length - 1;

  // Collect all table elements from all roots
  const allTableElements = [];
  allRoots.forEach((root) => {
    const tables = querySelectorAllInRoot('table', root);
    allTableElements.push(...tables);
  });

  const numberOfTableElements = allTableElements.length;

  if (numberOfTableElements === 0) {
    alert('Pas de tableaux sur la page.');
    return;
  }

  // Count tables in document vs shadow DOM
  const tablesInDocument = querySelectorAllInRoot('table', document);
  const tablesInShadow = allTableElements.filter(
    (table) => !tablesInDocument.includes(table)
  );

  let message = numberOfTableElements + ' tableaux sur la page';

  // Add location information
  const locationParts = [];
  if (tablesInDocument.length > 0) {
    locationParts.push(`${tablesInDocument.length} dans le document`);
  }
  if (tablesInShadow.length > 0) {
    locationParts.push(`${tablesInShadow.length} dans shadow DOM`);
  }
  if (locationParts.length > 0) {
    message += ` (${locationParts.join(', ')})`;
  }

  if (numberOfTableElements === 1) {
    message = message.replace('tableaux', 'tableau');
  }

  if (shadowRootCount > 0) {
    message += `\n${shadowRootCount} shadow root(s) analysé(s).`;
  }

  alert(message + '.\nVoir la console pour plus de détails.');
  console.clear();
  console.log(message + ' :');

  // Log all found elements from all roots
  allRoots.forEach((root, index) => {
    const rootName =
      index === 0 ? 'Document principal' : `Shadow root ${index}`;
    const tables = querySelectorAllInRoot('table', root);
    if (tables.length > 0) {
      console.log(`\n${rootName}:`);
      tables.forEach((table) => console.log(table));
    }
  });

  // Apply styling to all table elements
  allTableElements.forEach((tableElement) => {
    tableElement.style.border = '1px solid yellow';
    tableElement.style.outline = '1px solid blue';
    tableElement.style.outlineOffset = '2px';
    tableElement.style.background = 'red';
    tableElement.style.backgroundColor = 'red';
  });
})();
