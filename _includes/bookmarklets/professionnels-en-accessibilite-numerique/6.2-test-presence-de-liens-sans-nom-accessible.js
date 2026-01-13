(function () {
  const HAS_NO_ACCESSIBLE_NAME = 1;

  function getAriaLabel(element) {
    if (element.hasAttribute('aria-labelledby')) {
      // Algorithm to get the text content of the labelledby elements
      // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby#benefits_and_drawbacks
      const labelledByIds = element.getAttribute('aria-labelledby');
      // Split by whitespace and use Set to remove duplicates
      const uniqueIds = [...new Set(labelledByIds.split(/\s+/))];
      const labelledbyElements = uniqueIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      let text = '';

      // get the text content of the labelledby elements
      for (let i = 0; i < labelledbyElements.length; i++) {
        text += labelledbyElements[i].textContent;
        // add a space between the text content of the labelledby elements
        text += ' ';
      }

      // remove the last space
      text = text.trim();

      if (text !== '') {
        return text;
      }
    }

    if (element.hasAttribute('aria-label')) {
      return element.getAttribute('aria-label').trim();
    }

    return null;
  }

  function getLinkAccessibleName(element) {
    const ariaLabel = getAriaLabel(element);

    if (ariaLabel !== null) {
      return ariaLabel;
    }

    let accessibleName = '';

    function getLinkAccessibleNameRecursive(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        accessibleName += node.textContent.trim() + ' ';
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node.tagName.toUpperCase() === 'IMG' ||
          node.tagName.toUpperCase() === 'SVG')
      ) {
        const ariaLabel = getAriaLabel(node);

        if (ariaLabel !== null) {
          accessibleName += ariaLabel;
          return;
        }

        if (node.tagName.toUpperCase() === 'IMG') {
          if (node.hasAttribute('alt')) {
            accessibleName += node.getAttribute('alt').trim() + ' ';
          } else if (node.hasAttribute('title')) {
            accessibleName += node.getAttribute('title').trim() + ' ';
          }
        } else if (node.tagName.toUpperCase() === 'SVG') {
          const titleElement = node.querySelector('title');

          if (titleElement) {
            accessibleName += titleElement.textContent.trim() + ' ';
          } else if (node.hasAttribute('title')) {
            accessibleName += node.getAttribute('title').trim() + ' ';
          }
        }
      } else if (node.hasChildNodes()) {
        node.childNodes.forEach((childNode) =>
          getLinkAccessibleNameRecursive(childNode)
        );
      }
    }

    getLinkAccessibleNameRecursive(element);

    accessibleName = accessibleName.trim();
    // Remove all multiple spaces and replace with single space
    accessibleName = accessibleName.replace(/ +(?= )/g, '');

    if (accessibleName !== '') {
      return accessibleName;
    }

    if (element.hasAttribute('title')) {
      return element.getAttribute('title').trim();
    }

    return HAS_NO_ACCESSIBLE_NAME;
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

  function findAllLinks(element) {
    const links = new Set();
    const linkSelector = `a[href], [role='link']`;

    // Find links in regular DOM
    const regularLinks = element.querySelectorAll(linkSelector);
    regularLinks.forEach((link) => links.add(link));

    // Recursively search Shadow DOM
    function searchShadowDOM(root) {
      // Find links in this shadow root
      const shadowLinks = root.querySelectorAll(linkSelector);
      shadowLinks.forEach((link) => links.add(link));

      // Find all elements with shadow roots and search recursively
      const allElements = root.querySelectorAll('*');
      allElements.forEach((el) => {
        if (el.shadowRoot) {
          searchShadowDOM(el.shadowRoot);
        }
      });
    }

    // Find all custom elements (or any elements) with shadow roots
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      if (el.shadowRoot) {
        searchShadowDOM(el.shadowRoot);
      }
    });

    return Array.from(links);
  }

  function getLinksWithoutAccessibleName(parentElement) {
    const links = findAllLinks(parentElement);
    const linksWithoutAccessibleName = [];

    links.forEach((link) => {
      const accessibleName = getLinkAccessibleName(link);

      if (accessibleName === HAS_NO_ACCESSIBLE_NAME) {
        linksWithoutAccessibleName.push(link);
      }
    });

    return linksWithoutAccessibleName;
  }

  // Get all roots (document + shadow roots)
  const allRoots = [document, ...getAllShadowRoots()];
  const shadowRootCount = allRoots.length - 1;

  const linksWithoutAccessibleName = getLinksWithoutAccessibleName(document);
  const numberOfLinksWithoutAccessibleName = linksWithoutAccessibleName.length;

  if (numberOfLinksWithoutAccessibleName === 0) {
    alert('Tous les liens ont un nom accessible.');
    return;
  }

  // Count elements in document vs shadow DOM
  const elementsInDocument = [];
  const docLinks = Array.from(
    document.querySelectorAll(`a[href], [role='link']`)
  );
  docLinks.forEach((link) => {
    const accessibleName = getLinkAccessibleName(link);
    if (accessibleName === HAS_NO_ACCESSIBLE_NAME) {
      elementsInDocument.push(link);
    }
  });
  const elementsInShadow = linksWithoutAccessibleName.filter(
    (el) => !elementsInDocument.includes(el)
  );

  let message =
    numberOfLinksWithoutAccessibleName + ' liens sans nom accessible';

  if (numberOfLinksWithoutAccessibleName === 1) {
    message = message.replace('liens', 'lien');
  }

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

  alert(message + '.\nVoir la console pour plus de détails.');
  console.clear();
  console.log(message + ' :');

  // Log all found links from all roots
  allRoots.forEach((root, index) => {
    const rootName =
      index === 0 ? 'Document principal' : `Shadow root ${index}`;
    const rootLinks = Array.from(
      root.querySelectorAll(`a[href], [role='link']`)
    );
    const rootLinksWithoutAccessibleName = [];

    rootLinks.forEach((link) => {
      const accessibleName = getLinkAccessibleName(link);
      if (accessibleName === HAS_NO_ACCESSIBLE_NAME) {
        rootLinksWithoutAccessibleName.push(link);
      }
    });

    if (rootLinksWithoutAccessibleName.length > 0) {
      console.log(`\n${rootName}:`);
      rootLinksWithoutAccessibleName.forEach((link) => console.log(link));
    }
  });

  linksWithoutAccessibleName.forEach((link) => {
    link.style.border = '1px solid yellow';
    link.style.outline = '1px solid blue';
    link.style.outlineOffset = '2px';
    link.style.background = 'red';
    link.style.backgroundColor = 'red';
  });
})();
