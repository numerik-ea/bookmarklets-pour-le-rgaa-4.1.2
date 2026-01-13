(function getEmptyParagraphs() {
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

  // Get all roots (document + shadow roots)
  const allRoots = [document, ...getAllShadowRoots()];
  const shadowRootCount = allRoots.length - 1;

  // Collect all paragraphs from all roots
  const allParagraphs = [];
  allRoots.forEach((root) => {
    const rootParagraphs = Array.from(root.querySelectorAll('p'));
    allParagraphs.push(...rootParagraphs);
  });

  const emptyParagraphs = [];

  // Iterate over the selected elements
  allParagraphs.forEach((p) => {
    let content = p.innerHTML;
    let hasOnlyBrOrNbsp = true;

    // Check if all child nodes are either BR or text nodes containing only &nbsp;
    for (let node of p.childNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName !== 'BR') {
          hasOnlyBrOrNbsp = false;
          break;
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        if (
          node.textContent.trim() !== '' &&
          node.textContent.trim() !== '&nbsp;'
        ) {
          hasOnlyBrOrNbsp = false;
          break;
        }
      }
    }

    content = content.replaceAll('&nbsp;', '');
    content = content.trim();

    if (content === '' || hasOnlyBrOrNbsp) {
      emptyParagraphs.push(p);
    }
  });

  const countEmptyParagraphs = emptyParagraphs.length;

  if (countEmptyParagraphs === 0) {
    alert('Pas de paragraphes vides.');
    return;
  }

  // Count elements in document vs shadow DOM
  const elementsInDocument = [];
  const docParagraphs = Array.from(document.querySelectorAll('p'));
  docParagraphs.forEach((p) => {
    let content = p.innerHTML;
    let hasOnlyBrOrNbsp = true;

    for (let node of p.childNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.nodeName !== 'BR') {
          hasOnlyBrOrNbsp = false;
          break;
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        if (
          node.textContent.trim() !== '' &&
          node.textContent.trim() !== '&nbsp;'
        ) {
          hasOnlyBrOrNbsp = false;
          break;
        }
      }
    }

    content = content.replaceAll('&nbsp;', '');
    content = content.trim();

    if (content === '' || hasOnlyBrOrNbsp) {
      elementsInDocument.push(p);
    }
  });
  const elementsInShadow = emptyParagraphs.filter(
    (el) => !elementsInDocument.includes(el)
  );

  let message = countEmptyParagraphs + ' paragraphes vides';

  if (countEmptyParagraphs === 1) {
    message = message.replace('paragraphes vides', 'paragraphe vide');
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

  // Log all found paragraphs from all roots
  allRoots.forEach((root, index) => {
    const rootName =
      index === 0 ? 'Document principal' : `Shadow root ${index}`;
    const rootParagraphs = Array.from(root.querySelectorAll('p'));
    const rootEmptyParagraphs = [];

    rootParagraphs.forEach((p) => {
      let content = p.innerHTML;
      let hasOnlyBrOrNbsp = true;

      for (let node of p.childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.nodeName !== 'BR') {
            hasOnlyBrOrNbsp = false;
            break;
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          if (
            node.textContent.trim() !== '' &&
            node.textContent.trim() !== '&nbsp;'
          ) {
            hasOnlyBrOrNbsp = false;
            break;
          }
        }
      }

      content = content.replaceAll('&nbsp;', '');
      content = content.trim();

      if (content === '' || hasOnlyBrOrNbsp) {
        rootEmptyParagraphs.push(p);
      }
    });

    if (rootEmptyParagraphs.length > 0) {
      console.log(`\n${rootName}:`);
      rootEmptyParagraphs.forEach((p) => console.log(p));
    }
  });

  emptyParagraphs.forEach((p) => {
    p.style.border = '2px solid red';
    p.style.paddingTop = '26px';
    p.style.display = 'block';

    // Create a label element to show text
    const label = document.createElement('div');
    label.textContent = 'Paragraphe vide';
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
    const computedStyle = window.getComputedStyle(p);

    if (computedStyle.position === 'static') {
      p.style.position = 'relative';
    }

    p.appendChild(label);

    console.log(p);
  });
})();
