(function checkLandmarks() {
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

  // Function to get count breakdown by location
  function getCountBreakdown(selector) {
    const allRoots = [document, ...getAllShadowRoots()];
    let countInDocument = 0;
    let countInShadow = 0;
    const allElements = [];

    // Count in document
    const docElements = Array.from(document.querySelectorAll(selector));
    countInDocument = docElements.length;
    allElements.push(...docElements);

    // Count in shadow DOMs
    allRoots.slice(1).forEach((shadowRoot) => {
      const shadowElements = Array.from(shadowRoot.querySelectorAll(selector));
      countInShadow += shadowElements.length;
      allElements.push(...shadowElements);
    });

    return {
      total: allElements.length,
      inDocument: countInDocument,
      inShadow: countInShadow,
      elements: allElements,
    };
  }

  let message = '';
  const allRoots = [document, ...getAllShadowRoots()];
  const shadowRootCount = allRoots.length - 1;

  const mapRoleThatMustBeUniqueToTagName = {
    banner: 'header',
    main: 'main',
    contentinfo: 'footer',
  };

  function checkRoleThatMustBeUnique(role) {
    const roleBreakdown = getCountBreakdown(`[role='${role}']`);
    let elements = roleBreakdown.elements;
    const tagName = mapRoleThatMustBeUniqueToTagName[role];

    if (elements.length === 0) {
      message += `Aucun élément avec role="${role}".\n`;

      const tagBreakdown = getCountBreakdown(tagName);
      elements = tagBreakdown.elements;

      if (elements.length === 0) {
        message += `Aucun élément <${tagName}> trouvé.\n`;
      } else if (elements.length > 1) {
        const locationParts = [];
        if (tagBreakdown.inDocument > 0) {
          locationParts.push(`${tagBreakdown.inDocument} dans le document`);
        }
        if (tagBreakdown.inShadow > 0) {
          locationParts.push(`${tagBreakdown.inShadow} dans shadow DOM`);
        }
        const location =
          locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';
        message += `Plusieurs éléments <${tagName}> trouvés : ${elements.length}${location}.\n`;
        message += `Identifier le bon élément et ajouter l'attribut role="${role}" à celui-ci.\n`;
      } else {
        const location =
          tagBreakdown.inShadow > 0 ? ' (trouvé dans shadow DOM)' : '';
        message += `Un élément <${tagName}> trouvé${location}.\n`;
        message += `Vérifier que c'est bien le bon élément <${tagName}> et lui ajouter l'attribut role="${role}".\n`;
      }
    } else if (elements.length > 1) {
      const locationParts = [];
      if (roleBreakdown.inDocument > 0) {
        locationParts.push(`${roleBreakdown.inDocument} dans le document`);
      }
      if (roleBreakdown.inShadow > 0) {
        locationParts.push(`${roleBreakdown.inShadow} dans shadow DOM`);
      }
      const location =
        locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';
      message += `12.6 NC : [role='${role}'] trouvé mais plusieurs éléments avec ce rôle : ${elements.length}${location}\n`;

      elements.forEach((element) => {
        message += `<${element.tagName.toLowerCase()} role="${role}">\n`;
      });

      message += `Le rôle WAI-ARIA ${role} doit être unique sur la page\n`;
    } else {
      const location =
        roleBreakdown.inShadow > 0 ? ' (trouvé dans shadow DOM)' : '';
      message += `Un élément avec role="${role}" trouvé${location} :`;
      message += `<${elements[0].tagName.toLowerCase()} role="${role}">\n`;
    }
  }

  checkRoleThatMustBeUnique('banner', message);
  message += '\n';

  const roleNavigationBreakdown = getCountBreakdown(`[role='navigation']`);
  const roleNavigationElements = roleNavigationBreakdown.elements;

  if (roleNavigationElements.length === 0) {
    message += `Aucun élément avec role='navigation'.\n`;

    const tagName = 'nav';
    const navBreakdown = getCountBreakdown(tagName);
    const navElements = navBreakdown.elements;

    if (navElements.length === 0) {
      message += `Aucun élément <${tagName}> trouvé.\n`;
    } else if (navElements.length > 1) {
      const locationParts = [];
      if (navBreakdown.inDocument > 0) {
        locationParts.push(`${navBreakdown.inDocument} dans le document`);
      }
      if (navBreakdown.inShadow > 0) {
        locationParts.push(`${navBreakdown.inShadow} dans shadow DOM`);
      }
      const location =
        locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';
      message += `Plusieurs éléments <${tagName}> trouvés : ${navElements.length}${location}.\n`;
      message += `Identifier les bons éléments <${tagName}> et ajouter l'attribut role="navigation" à ceux-ci.\n`;
    } else {
      const location =
        navBreakdown.inShadow > 0 ? ' (trouvé dans shadow DOM)' : '';
      message += `Un élément <${tagName}> trouvé${location}.\n`;
      message += `Vérifier que c'est bien le bon élément et lui ajouter l'attribut role="navigation".\n`;
    }
  } else if (roleNavigationElements.length > 1) {
    const locationParts = [];
    if (roleNavigationBreakdown.inDocument > 0) {
      locationParts.push(
        `${roleNavigationBreakdown.inDocument} dans le document`
      );
    }
    if (roleNavigationBreakdown.inShadow > 0) {
      locationParts.push(`${roleNavigationBreakdown.inShadow} dans shadow DOM`);
    }
    const location =
      locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';
    message += `Plusieurs éléments avec role="navigation" trouvés : ${roleNavigationElements.length}${location}.\n`;

    roleNavigationElements.forEach((element) => {
      message += `<${element.tagName.toLowerCase()} role="navigation">\n`;
    });

    message += `Identifier le bon élément et ajouter l'attribut role="navigation" à celui-ci.\n`;
  } else {
    const location =
      roleNavigationBreakdown.inShadow > 0 ? ' (trouvé dans shadow DOM)' : '';
    message += `Un élément avec role="navigation" trouvé${location} :`;
    message += `<${roleNavigationElements[0].tagName.toLowerCase()} role="navigation">\n`;
  }

  message += '\n';

  const roleSearchBreakdown = getCountBreakdown(`[role='search']`);
  const roleSearchElements = roleSearchBreakdown.elements;

  if (roleSearchElements.length === 0) {
    message += `Aucun élément avec role="search".\n`;
  } else if (roleSearchElements.length > 1) {
    const locationParts = [];
    if (roleSearchBreakdown.inDocument > 0) {
      locationParts.push(`${roleSearchBreakdown.inDocument} dans le document`);
    }
    if (roleSearchBreakdown.inShadow > 0) {
      locationParts.push(`${roleSearchBreakdown.inShadow} dans shadow DOM`);
    }
    const location =
      locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';
    message += `Plusieurs éléments avec role="search" trouvés : ${roleSearchElements.length}${location}.\n`;

    roleSearchElements.forEach((element) => {
      message += `<${element.tagName.toLowerCase()} role="search">\n`;
    });

    message += `Identifier le bon élément et ajouter l'attribut role="search" à celui-ci.\n`;
    message += `Le moteur de recherche doit permettre d'effectuer des recherches sur les contenus de l'ensemble du site.\n`;
  } else {
    const location =
      roleSearchBreakdown.inShadow > 0 ? ' (trouvé dans shadow DOM)' : '';
    message += `Un élément avec role="search" trouvé${location} :`;
    message += `<${roleSearchElements[0].tagName.toLowerCase()} role="search">\n`;
  }

  message += '\n';

  checkRoleThatMustBeUnique('main', message);
  message += '\n';

  checkRoleThatMustBeUnique('contentinfo', message);
  message += '\n';

  if (shadowRootCount > 0) {
    message += `${shadowRootCount} shadow root(s) analysé(s).\n`;
  }

  // Truncate message for alert if too long (most browsers limit alert to ~2000 chars)
  // Show instruction at beginning AND end to ensure visibility even if browser truncates
  const consoleInstructionStart =
    '⚠️ Voir la console pour plus de détails.\n\n';
  const consoleInstructionEnd = '\n\nVoir la console pour plus de détails.';
  const maxMessageLength = 1200; // Very conservative limit
  let alertMessage = message;

  if (message.length > maxMessageLength) {
    // Find the last newline before the limit to avoid cutting in the middle of a line
    const truncated = message.substring(0, maxMessageLength);
    const lastNewline = truncated.lastIndexOf('\n');
    alertMessage =
      message.substring(0, lastNewline > 0 ? lastNewline : maxMessageLength) +
      '\n\n[... message tronqué ...]';
  }

  // Build alert with instruction at both start and end
  const fullAlert =
    consoleInstructionStart + alertMessage + consoleInstructionEnd;

  // Final safety check - if still too long, truncate message more
  if (fullAlert.length > 1800) {
    const safeMessageLength =
      1800 - consoleInstructionStart.length - consoleInstructionEnd.length - 50;
    const truncated = message.substring(0, safeMessageLength);
    const lastNewline = truncated.lastIndexOf('\n');
    alertMessage =
      message.substring(0, lastNewline > 0 ? lastNewline : safeMessageLength) +
      '\n\n[... message tronqué ...]';
  }

  alert(consoleInstructionStart + alertMessage + consoleInstructionEnd);
  console.clear();
  console.log(message + ' :');

  // Log all found elements from all roots
  const allSelectors = [
    `[role='banner']`,
    `[role='search']`,
    `[role='navigation']`,
    `[role='main']`,
    `[role='contentinfo']`,
  ].join(',');

  allRoots.forEach((root, index) => {
    const rootName =
      index === 0 ? 'Document principal' : `Shadow root ${index}`;
    const elements = Array.from(root.querySelectorAll(allSelectors));
    if (elements.length > 0) {
      console.log(`\n${rootName}:`);
      elements.forEach((element) => console.log(element));
    }
  });
})();
