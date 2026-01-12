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
          accessibleName += ariaLabel + ' ';
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

  function getLinksAccessibleNames(parentElement) {
    const links = findAllLinks(parentElement);
    const linksAccessibleNamesMap = [];

    links.forEach((link) => {
      const accessibleName = getLinkAccessibleName(link);

      if (accessibleName !== HAS_NO_ACCESSIBLE_NAME) {
        linksAccessibleNamesMap.push({
          link,
          accessibleName,
        });
      }
    });

    return linksAccessibleNamesMap;
  }

  function getParentElementToBeTested() {
    let parentElementToBeTestedSelector = null;
    let parentElement = null;

    while (!parentElementToBeTestedSelector || !parentElement) {
      parentElementToBeTestedSelector = prompt(
        `Entrez le sélecteur CSS de l'élément parent à tester :`
      );

      if (parentElementToBeTestedSelector === null) {
        break;
      }

      parentElementToBeTestedSelector = parentElementToBeTestedSelector.trim();

      if (parentElementToBeTestedSelector === '') {
        alert('Veuillez entrer un sélecteur CSS valide.');
        continue;
      }

      parentElement = document.querySelector(parentElementToBeTestedSelector);

      if (!parentElement) {
        alert('Elément de page non trouvé.');
      }
    }

    return [parentElementToBeTestedSelector, parentElement];
  }

  const [parentElementToBeTestedSelector, parentElement] =
    getParentElementToBeTested();

  const linksAccessibleNamesMap = getLinksAccessibleNames(parentElement);
  const numberOfLinksWithAccessibleNames = linksAccessibleNamesMap.length;

  if (numberOfLinksWithAccessibleNames === 0) {
    alert(
      `Pas de liens avec un nom accessible dans l'élément de page ` +
        parentElementToBeTestedSelector +
        '.'
    );
    return;
  }

  let message =
    numberOfLinksWithAccessibleNames +
    ` liens avec un nom accessible dans l'élément de page ` +
    parentElementToBeTestedSelector;

  if (numberOfLinksWithAccessibleNames === 1) {
    message = message.replace('liens', 'lien');
  }

  alert(message + '.\nVoir la console pour plus de détails.');
  console.clear();
  console.log(message + ' :');

  linksAccessibleNamesMap.forEach((item) => {
    console.log(item.link);
    console.log(item.accessibleName);
  });
})();
