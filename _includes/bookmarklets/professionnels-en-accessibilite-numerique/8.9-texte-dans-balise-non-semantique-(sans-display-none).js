(function showTextInNonSemanticTags() {
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

  // Get all roots (document.body + shadow roots)
  const allRoots = [document.body, ...getAllShadowRoots()];
  const shadowRootCount = allRoots.length - 1;

  // Select all text nodes in all roots
  const textNodes = [];
  allRoots.forEach((root) => {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }
  });

  const textNodesInNonSemanticTags = [];
  const semanticTags = [
    'P',
    'LI',
    'A',
    'BUTTON',
    'LABEL',
    'OPTION',
    'TEXTAREA',
    'INPUT',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'FIGCAPTION',
    'LEGEND',
    'CAPTION',
    'TD',
    'TH',
    'DT',
    'DD',
    'BLOCKQUOTE',
    'Q',
    'TIME',
  ];
  const semanticRoles = {
    heading: ['1', '2', '3', '4', '5', '6'],
  };
  const tagsToIgnore = [
    'SCRIPT',
    'STYLE',
    'META',
    'LINK',
    'NOSCRIPT',
    'COMMENT',
  ];

  function hasParentWithDisplayNone(element) {
    let current = element;
    let root = element.getRootNode();
    while (current && current !== document.body && current !== document.documentElement) {
      if (window.getComputedStyle(current).display === 'none') {
        return true;
      }
      const nextParent = current.parentElement;
      if (!nextParent && root instanceof ShadowRoot) {
        const host = root.host;
        if (host) {
          current = host;
          root = host.getRootNode();
          continue;
        }
        break;
      }
      current = nextParent;
    }
    return false;
  }

  function isNonSemanticTextNode(textNode) {
    if (textNode.textContent.trim() === '') return false;

    let parent = textNode.parentElement;
    let root = textNode.getRootNode();

    while (parent) {
      if (semanticTags.includes(parent.tagName)) return false;

      if (
        parent.tagName === 'SUMMARY' &&
        parent.parentElement &&
        parent.parentElement.tagName === 'DETAILS'
      ) return false;

      const role = parent.getAttribute && parent.getAttribute('role');
      if (role === 'heading' && semanticRoles.heading.includes(parent.getAttribute('aria-level'))) return false;
      if (role === 'button') return false;
      if (tagsToIgnore.includes(parent.tagName)) return false;

      const nextParent = parent.parentElement;
      if (!nextParent && root instanceof ShadowRoot) {
        const host = root.host;
        if (host) {
          parent = host;
          root = host.getRootNode();
          continue;
        }
        break;
      }
      parent = nextParent;
    }

    return !hasParentWithDisplayNone(textNode.parentElement);
  }

  textNodes.forEach((textNode) => {
    if (isNonSemanticTextNode(textNode)) {
      textNodesInNonSemanticTags.push(textNode);
    }
  });

  const counttextNodesInNonSemanticTags = textNodesInNonSemanticTags.length;

  if (counttextNodesInNonSemanticTags === 0) {
    alert('Pas de texte dans des balises non sémantiques sans display: none.');
    return;
  }

  const elementsInDocument = textNodesInNonSemanticTags.filter(
    (n) => !(n.getRootNode() instanceof ShadowRoot)
  );
  const elementsInShadow = textNodesInNonSemanticTags.filter(
    (n) => n.getRootNode() instanceof ShadowRoot
  );

  let message =
    counttextNodesInNonSemanticTags +
    ' textes dans des balises non sémantiques sans display: none';

  if (counttextNodesInNonSemanticTags === 1) {
    message = message.replace(
      'textes dans des balises non sémantiques',
      'texte dans une balise non sémantique'
    );
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

  alert(message + '.\nPlus de détails dans la console.');
  console.clear();
  console.log(message + ' :');

  allRoots.forEach((root, index) => {
    const rootName = index === 0 ? 'Document principal' : `Shadow root ${index}`;
    const rootNodes = textNodesInNonSemanticTags.filter((n) =>
      index === 0
        ? !(n.getRootNode() instanceof ShadowRoot)
        : n.getRootNode() === root
    );
    if (rootNodes.length > 0) {
      console.log(`\n${rootName}:`);
      rootNodes.forEach((textNode) => console.log(textNode));
    }
  });

  textNodesInNonSemanticTags.forEach((textNode) => {
    const parentElement = textNode.parentElement;
    if (!parentElement) return;

    parentElement.style.border = '2px solid red';
    parentElement.style.paddingTop = '26px';
    parentElement.style.display = 'block';

    const label = document.createElement('div');
    label.textContent = 'texte non sémantique';
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

    if (window.getComputedStyle(parentElement).position === 'static') {
      parentElement.style.position = 'relative';
    }

    parentElement.appendChild(label);
  });
})();
