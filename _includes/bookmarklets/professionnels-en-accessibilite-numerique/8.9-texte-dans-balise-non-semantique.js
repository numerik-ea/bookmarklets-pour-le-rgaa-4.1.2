(function showTextInNonSemanticTags() {
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
    'ADDRESS',
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

  // Returns the parent element, crossing shadow DOM boundaries (shadow root -> host)
  function getParentElement(node) {
    const parent = node.parentNode;
    if (!parent) {
      return null;
    }
    if (parent.nodeType === Node.ELEMENT_NODE) {
      return parent;
    }
    if (parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE && parent.host) {
      return parent.host;
    }
    return null;
  }

  // Window owning the node (differs from the main window for nodes inside iframes)
  function getWindow(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) || window;
  }

  // Function to recursively get all shadow roots
  function getAllShadowRoots(root) {
    const shadowRoots = [];
    const walker = root.ownerDocument.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT
    );
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

  function getTextNodes(root) {
    const textNodes = [];
    const walker = root.ownerDocument.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }
    return textNodes;
  }

  // Roots to analyse: document body, shadow roots, then the documents of the
  // accessible (same-origin) iframes and frames, recursively
  const roots = []; // { node, name, location: 'document' | 'shadow' | 'iframe' }
  const inaccessibleIframes = [];
  let shadowRootCount = 0;
  let iframeCount = 0;

  function collectRoots(doc, docName) {
    const isMainDocument = doc === document;
    const docRoots = [
      {
        node: doc.body,
        name: docName,
        location: isMainDocument ? 'document' : 'iframe',
      },
    ];

    getAllShadowRoots(doc.body).forEach((shadowRoot) => {
      shadowRootCount++;
      docRoots.push({
        node: shadowRoot,
        name: isMainDocument
          ? `Shadow root ${shadowRootCount}`
          : `${docName} > Shadow root ${shadowRootCount}`,
        location: isMainDocument ? 'shadow' : 'iframe',
      });
    });

    roots.push(...docRoots);

    docRoots.forEach(({ node }) => {
      node.querySelectorAll('iframe, frame').forEach((frame) => {
        let frameDocument = null;
        try {
          frameDocument = frame.contentDocument;
        } catch (error) {
          frameDocument = null;
        }

        // contentDocument is null for cross-origin iframes
        if (!frameDocument || !frameDocument.body) {
          inaccessibleIframes.push(frame);
          return;
        }

        iframeCount++;
        const title = frame.getAttribute('title');
        collectRoots(
          frameDocument,
          `Iframe ${iframeCount}` + (title ? ` "${title}"` : '')
        );
      });
    });
  }

  collectRoots(document, 'Document principal');

  // Check if the text node is within a semantic element (or an ignored tag)
  function isInNonSemanticTag(textNode) {
    let parent = textNode.parentElement;

    while (parent) {
      if (semanticTags.includes(parent.tagName)) {
        return false;
      }

      // <summary> dans <details> est sémantique
      if (
        parent.tagName === 'SUMMARY' &&
        parent.parentElement &&
        parent.parentElement.tagName === 'DETAILS'
      ) {
        return false;
      }

      // Check for semantic role="heading" and valid aria-level
      const role = parent.getAttribute('role');

      if (
        role === 'heading' &&
        semanticRoles.heading.includes(parent.getAttribute('aria-level'))
      ) {
        return false;
      }

      if (role === 'button') {
        return false;
      }

      if (tagsToIgnore.includes(parent.tagName)) {
        return false;
      }

      parent = getParentElement(parent);
    }

    return true;
  }

  const results = roots.map((root) => ({
    ...root,
    textNodes: getTextNodes(root.node).filter(
      (textNode) =>
        textNode.textContent.trim() !== '' && isInNonSemanticTag(textNode)
    ),
  }));

  const textNodesInNonSemanticTags = results.flatMap(
    (result) => result.textNodes
  );
  const counttextNodesInNonSemanticTags = textNodesInNonSemanticTags.length;

  // Summary of what has been analysed
  const analysisParts = [];
  if (shadowRootCount > 0) {
    analysisParts.push(`${shadowRootCount} shadow root(s) analysé(s).`);
  }
  if (iframeCount > 0) {
    analysisParts.push(`${iframeCount} iframe(s) analysée(s).`);
  }
  if (inaccessibleIframes.length > 0) {
    analysisParts.push(
      `${inaccessibleIframes.length} iframe(s) non analysable(s) (origine différente).`
    );
  }
  const analysisSummary =
    analysisParts.length > 0 ? '\n' + analysisParts.join('\n') : '';

  function logInaccessibleIframes() {
    if (inaccessibleIframes.length === 0) {
      return;
    }
    console.log(
      '\n⚠️ Iframe(s) non analysable(s) (origine différente) :'
    );
    inaccessibleIframes.forEach((frame) => console.log(frame));
  }

  if (counttextNodesInNonSemanticTags === 0) {
    alert('Pas de texte dans des balises non sémantiques.' + analysisSummary);
    if (inaccessibleIframes.length > 0) {
      console.clear();
      logInaccessibleIframes();
    }
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

  // Add location information
  const countByLocation = { document: 0, shadow: 0, iframe: 0 };
  results.forEach((result) => {
    countByLocation[result.location] += result.textNodes.length;
  });

  const locationParts = [];
  if (countByLocation.document > 0) {
    locationParts.push(`${countByLocation.document} dans le document`);
  }
  if (countByLocation.shadow > 0) {
    locationParts.push(`${countByLocation.shadow} dans shadow DOM`);
  }
  if (countByLocation.iframe > 0) {
    locationParts.push(`${countByLocation.iframe} dans les iframes`);
  }
  if (locationParts.length > 0) {
    message += ` (${locationParts.join(', ')})`;
  }

  message += '.' + analysisSummary;

  alert(message + '\nPlus de détails dans la console.');
  console.clear();
  console.log(message);

  // Log all found text nodes from all roots
  results.forEach((result) => {
    if (result.textNodes.length > 0) {
      console.log(`\n${result.name}:`);
      result.textNodes.forEach((textNode) => console.log(textNode));
    }
  });

  logInaccessibleIframes();

  // Function to check if an element or its parents are hidden
  // (crosses shadow DOM boundaries and goes up through the <iframe> elements)
  function checkForHiddenParents(element) {
    const hiddenParents = [];
    let currentElement = element;

    while (currentElement) {
      const doc = currentElement.ownerDocument;

      if (
        currentElement === doc.body ||
        currentElement === doc.documentElement
      ) {
        // Top of this document: continue with the <iframe> element in the parent document
        try {
          currentElement = doc.defaultView && doc.defaultView.frameElement;
        } catch (error) {
          currentElement = null;
        }
        continue;
      }

      const computedStyle =
        getWindow(currentElement).getComputedStyle(currentElement);
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

      currentElement = getParentElement(currentElement);
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

      // Create a label element (in the element's own document) to show text
      const label = parentElement.ownerDocument.createElement('div');
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

      // Make sure the element has position relative for absolute positioning to work
      const computedStyle =
        getWindow(parentElement).getComputedStyle(parentElement);

      if (computedStyle.position === 'static') {
        parentElement.style.position = 'relative';
      }

      parentElement.appendChild(label);

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
