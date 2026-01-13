(function findAllChildrenWithDoubleBR() {
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

  function hasDoubleBR(element) {
    const children = Array.from(element.childNodes);

    for (let i = 0; i < children.length - 1; i++) {
      if (children[i].nodeName !== 'BR') {
        continue;
      }

      if (!(i + 1 in children)) {
        break;
      }

      if (children[i + 1].nodeName === 'BR') {
        return true;
      }

      let j = i + 1;

      while (
        j < children.length &&
        children[j].nodeType === Node.TEXT_NODE &&
        children[j].textContent.trim() === ''
      ) {
        j++;
      }

      if (j < children.length && children[j].nodeName === 'BR') {
        return true;
      }
    }

    return false;
  }

  // Recursive function to find all children with double <br> tags
  function recursiveFindAllChildrenWithDoubleBR(element, results) {
    if (hasDoubleBR(element)) {
      results.push(element);
      return;
    }

    const children = Array.from(element.children);

    if (children.length === 0) {
      return;
    }

    for (let child of children) {
      recursiveFindAllChildrenWithDoubleBR(child, results);
    }
  }

  // Get all roots (document.body + shadow roots)
  const allRoots = [document.body, ...getAllShadowRoots()];
  const shadowRootCount = allRoots.length - 1;

  // Collect all elements with double <br> from all roots
  const allResults = [];
  allRoots.forEach((root) => {
    const rootResults = [];
    recursiveFindAllChildrenWithDoubleBR(root, rootResults);
    allResults.push(...rootResults);
  });

  const results = allResults;

  if (results.length === 0) {
    alert("Pas d'éléments avec double <br>.");
    return;
  }

  // Count elements in document vs shadow DOM
  const elementsInDocument = [];
  recursiveFindAllChildrenWithDoubleBR(document.body, elementsInDocument);
  const elementsInShadow = results.filter(
    (el) => !elementsInDocument.includes(el)
  );

  let message = results.length + ' éléments avec double <br>';

  // Add location information
  const locationParts = [];
  if (elementsInDocument.length > 0) {
    locationParts.push(`${elementsInDocument.length} dans le document`);
  }
  if (elementsInShadow.length > 0) {
    locationParts.push(`${elementsInShadow.length} dans shadow DOM`);
  }
  if (locationParts.length > 0) {
    message += ` (${locationParts.join(', ')})`;
  }

  if (shadowRootCount > 0) {
    message += `\n${shadowRootCount} shadow root(s) analysé(s).`;
  }

  alert(message + '.\nPlus de détails dans la console.');
  console.clear();
  console.log(message + ' :');

  // Function to check if an element or its parents are hidden
  function checkForHiddenParents(element) {
    const hiddenParents = [];
    let currentElement = element;
    let root = element.getRootNode();

    while (
      currentElement &&
      currentElement !== document.body &&
      currentElement !== document.documentElement
    ) {
      const computedStyle = window.getComputedStyle(currentElement);
      const isHidden =
        computedStyle.display === 'none' ||
        computedStyle.visibility === 'hidden' ||
        computedStyle.opacity === '0' ||
        (computedStyle.height === '0px' && computedStyle.width === '0px') ||
        currentElement.getAttribute('aria-hidden') === 'true';

      if (isHidden) {
        hiddenParents.push({
          element: currentElement,
          reason: getHiddenReason(currentElement, computedStyle),
        });
      }

      let parent = currentElement.parentElement;

      // Check if we're crossing a shadow boundary
      if (!parent && root instanceof ShadowRoot) {
        const host = root.host;
        if (host) {
          currentElement = host;
          root = host.getRootNode();
          continue;
        }
        break;
      }

      currentElement = parent;
    }

    return hiddenParents;
  }

  // Function to get the reason why an element is hidden
  function getHiddenReason(element, computedStyle) {
    const reasons = [];

    if (computedStyle.display === 'none') reasons.push('display: none');
    if (computedStyle.visibility === 'hidden')
      reasons.push('visibility: hidden');
    if (computedStyle.opacity === '0') reasons.push('opacity: 0');
    if (computedStyle.height === '0px' && computedStyle.width === '0px')
      reasons.push('height: 0 and width: 0');
    if (element.getAttribute('aria-hidden') === 'true')
      reasons.push('aria-hidden="true"');

    return reasons.join(', ');
  }

  // Log all found elements from all roots
  allRoots.forEach((root, index) => {
    const rootName =
      index === 0 ? 'Document principal' : `Shadow root ${index}`;
    const rootResults = [];
    recursiveFindAllChildrenWithDoubleBR(root, rootResults);
    if (rootResults.length > 0) {
      console.log(`\n${rootName}:`);
      rootResults.forEach((element) => console.log(element));
    }
  });

  results.forEach((element) => {
    element.style.border = '2px solid red';
    element.style.paddingTop = '26px';
    element.style.display = 'block';

    // Create a label element to show text
    const label = document.createElement('div');
    label.textContent = 'Elément avec double <br>';
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

    // Check for hidden parents before logging the element
    const hiddenParents = checkForHiddenParents(element);
    if (hiddenParents.length > 0) {
      console.log('⚠️ Élément avec double <br> ayant des parents cachés :');
      console.log(element);

      hiddenParents.forEach((hiddenParent, index) => {
        console.log(
          `  Parent caché ${index + 1} :`,
          hiddenParent.element,
          `(Raison: ${hiddenParent.reason})`
        );
      });

      return;
    }
  });
})();
