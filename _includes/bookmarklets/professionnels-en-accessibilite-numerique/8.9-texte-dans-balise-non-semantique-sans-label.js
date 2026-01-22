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

  // Function to collect all text nodes from a root (document or shadow root)
  function collectTextNodes(root) {
    const textNodes = [];
    // For document, start from body; for shadow root, start from the root itself
    const startNode = root === document ? root.body : root;

    if (!startNode) {
      return textNodes;
    }

    const walker = document.createTreeWalker(
      startNode,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    return textNodes;
  }

  // Select all text nodes in the document and all shadow roots
  const textNodes = [];

  // Collect text nodes from main document
  textNodes.push(...collectTextNodes(document));

  // Collect text nodes from all shadow roots
  const shadowRoots = getAllShadowRoots();
  shadowRoots.forEach((shadowRoot) => {
    textNodes.push(...collectTextNodes(shadowRoot));
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

  // Iterate over the selected text nodes
  textNodes.forEach((textNode) => {
    let content = textNode.textContent;
    content = content.trim();

    if (content === '') {
      return; // Skip empty text nodes
    }

    // Check if the text node is within a semantic element
    let parent = textNode.parentElement;
    let isInSemanticElement = false;
    let isInIgnoredTag = false;

    while (parent) {
      if (semanticTags.includes(parent.tagName)) {
        isInSemanticElement = true;
        break;
      }

      // <summary> dans <details> est sémantique
      if (
        parent.tagName === 'SUMMARY' &&
        parent.parentElement &&
        parent.parentElement.tagName === 'DETAILS'
      ) {
        isInSemanticElement = true;
        break;
      }

      // Check for semantic role="heading" and valid aria-level
      const role = parent.getAttribute && parent.getAttribute('role');

      if (role === 'heading') {
        const ariaLevel = parent.getAttribute('aria-level');

        if (semanticRoles.heading.includes(ariaLevel)) {
          isInSemanticElement = true;
          break;
        }
      }

      if (role === 'button') {
        isInSemanticElement = true;
        break;
      }

      if (tagsToIgnore.includes(parent.tagName)) {
        isInIgnoredTag = true;
        break;
      }

      // Check if we need to cross Shadow DOM boundary
      const nextParent = parent.parentElement;
      if (!nextParent) {
        const rootNode = parent.getRootNode();
        if (rootNode && rootNode !== document && rootNode.host) {
          // We're crossing a Shadow DOM boundary, check the host element
          parent = rootNode.host;
        } else {
          break;
        }
      } else {
        parent = nextParent;
      }
    }

    if (!isInSemanticElement && !isInIgnoredTag) {
      textNodesInNonSemanticTags.push(textNode);
    }
  });

  const counttextNodesInNonSemanticTags = textNodesInNonSemanticTags.length;

  if (counttextNodesInNonSemanticTags === 0) {
    alert('Pas de texte dans des balises non sémantiques.');
    return;
  }

  let message =
    counttextNodesInNonSemanticTags +
    ' textes dans des balises non sémantiques';

  if (counttextNodesInNonSemanticTags === 1) {
    message = message.replace(
      'textes dans des balises non sémantiques',
      'texte dans une balise non sémantique'
    );
  }

  alert(message + '.\nPlus de détails dans la console.');
  console.clear();
  console.log(message + ' :');

  // Function to check if an element or its parents are hidden
  function checkForHiddenParents(element) {
    const hiddenParents = [];
    let currentElement = element;

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

      // Check if we need to cross Shadow DOM boundary
      const nextParent = currentElement.parentElement;
      if (!nextParent) {
        const rootNode = currentElement.getRootNode();
        if (rootNode && rootNode !== document && rootNode.host) {
          // We're crossing a Shadow DOM boundary, check the host element
          currentElement = rootNode.host;
        } else {
          break;
        }
      } else {
        currentElement = nextParent;
      }
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

  textNodesInNonSemanticTags.forEach((textNode) => {
    // Get the parent element to style it
    const parentElement = textNode.parentElement;

    if (parentElement) {
      parentElement.style.border = '2px solid red';
      parentElement.style.paddingTop = '26px';
      parentElement.style.display = 'block';

      // Make sure the element has position relative for absolute positioning to work
      const computedStyle = window.getComputedStyle(parentElement);

      if (computedStyle.position === 'static') {
        parentElement.style.position = 'relative';
      }

      // Check for hidden parents before logging the element
      const hiddenParents = checkForHiddenParents(parentElement);
      if (hiddenParents.length > 0) {
        console.log(
          '⚠️ Texte dans une balise non sémantique ayant des parents cachés :'
        );
        console.log(textNode);

        hiddenParents.forEach((hiddenParent, index) => {
          console.log(
            `  Parent caché ${index + 1} :`,
            hiddenParent.element,
            `(Raison: ${hiddenParent.reason})`
          );
        });

        return;
      }
    }

    console.log(textNode);
  });
})();
