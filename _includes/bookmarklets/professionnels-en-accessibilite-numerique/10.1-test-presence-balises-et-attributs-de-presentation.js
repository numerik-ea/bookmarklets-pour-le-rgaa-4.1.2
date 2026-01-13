(function () {
  // Avertissement : si plusieurs attributs sur le même élément, seul le dernier déclaré est révélé

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

  // Function to inject styles into a root (document or shadow root)
  function injectStyles(root, cssText) {
    const style = document.createElement('style');
    style.textContent = cssText;
    if (root === document) {
      root.head.appendChild(style);
    } else {
      // For shadow roots, append to the shadow root itself
      root.appendChild(style);
    }
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

  // Function to get elements by tag name across all roots
  function getElementsByTagNameInAllRoots(tagName) {
    const allRoots = [document, ...getAllShadowRoots()];
    const allElements = [];
    allRoots.forEach((root) => {
      // Use getElementsByTagName for document, querySelectorAll for shadow roots
      const elements =
        root === document
          ? Array.from(root.getElementsByTagName(tagName))
          : Array.from(root.querySelectorAll(tagName));
      allElements.push(...elements);
    });
    return allElements;
  }

  // Vérifier le DOCTYPE pour l'élément <u>
  const isHTML5 = document.doctype && document.doctype.name === 'html';

  // Éléments HTML obsolètes à vérifier (selon RGAA 4.1.2)
  const deprecatedElements = [
    'basefont',
    'blink',
    'big',
    'center',
    'font',
    'marquee',
    's',
    'strike',
    'tt',
  ];

  // Ajouter <u> seulement si pas HTML5
  if (!isHTML5) {
    deprecatedElements.push('u');
  }

  // Attributs obsolètes à vérifier (selon RGAA 4.1.2)
  const deprecatedAttributes = [
    'align',
    'alink',
    'background',
    'bgcolor',
    'border',
    'cellpadding',
    'cellspacing',
    'char',
    'charoff',
    'clear',
    'compact',
    'color',
    'frameborder',
    'hspace',
    'link',
    'marginheight',
    'marginwidth',
    'text',
    'valign',
    'vlink',
    'vspace',
  ];

  // Éléments qui peuvent légitimement avoir des attributs width/height
  const allowedWidthHeightElements = [
    'img',
    'svg',
    'canvas',
    'embed',
    'object',
    'rect',
    'source',
  ];

  // Éléments qui peuvent légitimement avoir l'attribut size
  const allowedSizeElements = ['select'];

  // Vérifier les attributs width/height sur les éléments non autorisés (dans tous les roots)
  const widthElements = querySelectorAllInAllRoots('[width]');
  const heightElements = querySelectorAllInAllRoots('[height]');

  // Vérifier les éléments avec width et height
  const bothElements = querySelectorAllInAllRoots('[width][height]');

  // Vérifier l'attribut size sur les éléments non autorisés
  const sizeElements = querySelectorAllInAllRoots('[size]');

  // CSS styles to inject
  const cssText = `
     /** disclaimer : si plusieurs attributs sur même élément : seul le dernier déclaré est révélé **/
 
 :root {
   --msg-bgcolor: #f2ce09;
   --border-color-test-10-1: red;
 }
 
 * {
     box-sizing: border-box;
 }
 
 
 basefont,
 blink,
 big,
 center,
 font,
 marquee,
 s,
 strike,
 tt,
 ${!isHTML5 ? 'u,' : ''}
 [align],
 [alink],
 [background],
 [bgcolor],
 [border],
 [cellpadding],
 [cellspacing],
 [char],
 [charoff],
 [clear],
 [compact],
 [color],
 [frameborder],
 [hspace],
 [link],
 [marginheight],
 [marginwidth],
 [text],
 [valign],
 [vlink],
 [vspace],
 :not(img, svg, canvas, embed, object, rect, source)[width],
 :not(img, svg, canvas, embed, object, rect, source)[height], 
 :not(img, svg, canvas, embed, object, rect, source)[width][height],
 :not(select)[size] {
     border: 3px solid var(--border-color-test-10-1);
     outline: 3px solid var(--border-color-test-10-1); 
 }
 
 
 basefont::before {
     content: "<basefont>";
     background-color: var(--msg-bgcolor);
 }
 
 blink::before {
     content: "<blink>";
     background-color: var(--msg-bgcolor);
 }
 big::before {
     content: "<big>";
     background-color: var(--msg-bgcolor);
 }
 
 center::before {
     content: "<center>";
     background-color: var(--msg-bgcolor);
 }
 
 font::before {
     content: "<font>";
     background-color: var(--msg-bgcolor);
 }
 
 marquee::before {
     content: "<marquee>";
     background-color: var(--msg-bgcolor);
 }
 
 s::before {
     content: "<s>";
     background-color: var(--msg-bgcolor);
 }
 
 strike::before {
     content: "<strike>";
     background-color: var(--msg-bgcolor);
 }
 
 tt::before {
     content: "<tt>";
     background-color: var(--msg-bgcolor);
 }
 
 ${
   !isHTML5
     ? `
 u::before {
     content: "<u>";
     background-color: var(--msg-bgcolor);
 }
 `
     : ''
 }
 
 [align]::before {
     content: "[attr:align]";
     background-color: var(--msg-bgcolor);
 }
 
 [alink]::before {
     content: "[attr:alink]";
     background-color: var(--msg-bgcolor);
 }
 
 [background]::before {
     content: "[attr:background]";
     background-color: var(--msg-bgcolor);
 }
 
 [bgcolor]::before {
     content: "[attr:bgcolor]";
     background-color: var(--msg-bgcolor);
 }
 
 [border]::before {
     content: "[attr:border]";
     background-color: var(--msg-bgcolor);
 }
 
 [cellpadding]::before {
     content: "[attr:cellpadding]";
     background-color: var(--msg-bgcolor);
 }
 
 [cellspacing]::before {
     content: "[attr:cellspacing]";
     background-color: var(--msg-bgcolor);
 }
 
 [char]::before {
     content: "[attr:char]";
     background-color: var(--msg-bgcolor);
 }
 
 [charoff]::before {
     content: "[attr:charoff]";
     background-color: var(--msg-bgcolor);
 }
 
 [clear]::before {
     content: "[attr:clear]";
     background-color: var(--msg-bgcolor);
 }
 
 [compact]::before {
     content: "[attr:compact]";
     background-color: var(--msg-bgcolor);
 }
 
 [color]::before {
     content: "[attr:color]";
     background-color: var(--msg-bgcolor);
 }
 
 [frameborder]::before {
     content: "[attr:frameborder]";
     background-color: var(--msg-bgcolor);
 }
 
 [hspace]::before {
     content: "[attr:hspace]";
     background-color: var(--msg-bgcolor);
 }
 
 [link]::before {
     content: "[attr:link]";
     background-color: var(--msg-bgcolor);
 }
 
 [marginheight]::before {
     content: "[attr:marginheight]";
     background-color: var(--msg-bgcolor);
 }
 
 [marginwidth]::before {
     content: "[attr:marginwidth]";
     background-color: var(--msg-bgcolor);
 }
 
 [text]::before {
     content: "[attr:text]";
     background-color: var(--msg-bgcolor);
 }
 
 [valign]::before {
     content: "[attr:valign]";
     background-color: var(--msg-bgcolor);
 }
 
 [vlink]::before {
     content: "[attr:vlink]";
     background-color: var(--msg-bgcolor);
 }
 
 [vspace]::before {
     content: "[attr:vspace]";
     background-color: var(--msg-bgcolor);
 }
 
 :not(img, svg, canvas, embed, object, rect, source)[width]::before {
     content: "[attr:width]";
     background-color: var(--msg-bgcolor);
 }
 
 :not(img, svg, canvas, embed, object, rect, source)[height]::before {
     content: "[attr:height]";
     background-color: var(--msg-bgcolor);
 }
 
 :not(img, svg, canvas, embed, object, rect, source)[width][height]::before {
     content: "[attr:height & width]";
     background-color: var(--msg-bgcolor);
 }
 
 :not(select)[size]::before {
     content: "[attr:size]";
     background-color: var(--msg-bgcolor);
 }
     `;

  // Inject styles into document and all shadow roots
  injectStyles(document, cssText);
  getAllShadowRoots().forEach((shadowRoot) => {
    injectStyles(shadowRoot, cssText);
  });

  // Vérifier s'il y a des problèmes
  let hasIssues = false;
  let issueCount = 0;

  // Compter les éléments obsolètes (dans tous les roots)
  deprecatedElements.forEach((tagName) => {
    const count = getElementsByTagNameInAllRoots(tagName).length;
    if (count > 0) {
      hasIssues = true;
      issueCount += count;
    }
  });

  // Compter les attributs obsolètes (dans tous les roots)
  deprecatedAttributes.forEach((attr) => {
    const count = querySelectorAllInAllRoots(`[${attr}]`).length;
    if (count > 0) {
      hasIssues = true;
      issueCount += count;
    }
  });

  // Compter les attributs width/height/size invalides
  const invalidWidthCount = widthElements.filter(
    (el) => !allowedWidthHeightElements.includes(el.tagName.toLowerCase())
  ).length;

  const invalidHeightCount = heightElements.filter(
    (el) => !allowedWidthHeightElements.includes(el.tagName.toLowerCase())
  ).length;

  const invalidSizeCount = sizeElements.filter(
    (el) => !allowedSizeElements.includes(el.tagName.toLowerCase())
  ).length;

  if (invalidWidthCount > 0 || invalidHeightCount > 0 || invalidSizeCount > 0) {
    hasIssues = true;
    issueCount += invalidWidthCount + invalidHeightCount + invalidSizeCount;
  }

  // Afficher le message approprié
  if (hasIssues) {
    // Résumé détaillé si des problèmes sont trouvés
    let summary =
      'RGAA 10.1 - Dépistage des balises et attributs de présentation\n\n';
    summary += `DOCTYPE détecté : ${isHTML5 ? 'HTML5' : 'Non HTML5'}\n\n`;

    deprecatedElements.forEach((tagName) => {
      const count = getElementsByTagNameInAllRoots(tagName).length;
      if (count > 0) {
        summary += `Éléments <${tagName}> : ${count}\n`;
      }
    });

    deprecatedAttributes.forEach((attr) => {
      const count = querySelectorAllInAllRoots(`[${attr}]`).length;
      if (count > 0) {
        summary += `Attributs [${attr}] : ${count}\n`;
      }
    });

    if (invalidWidthCount > 0) {
      summary += `Attributs [width] invalides : ${invalidWidthCount}\n`;
    }

    if (invalidHeightCount > 0) {
      summary += `Attributs [height] invalides : ${invalidHeightCount}\n`;
    }

    if (invalidSizeCount > 0) {
      summary += `Attributs [size] invalides : ${invalidSizeCount}\n`;
    }

    alert(summary + '\n' + 'Voir la console pour plus de détails');

    console.clear();
    console.log(summary);

    // Log des éléments correspondants après le résumé
    console.log('=== Détail des éléments correspondants ===');

    // Vérifier les éléments obsolètes (dans tous les roots)
    deprecatedElements.forEach((tagName) => {
      const elements = getElementsByTagNameInAllRoots(tagName);
      elements.forEach((element) => {
        console.log(`${tagName}::before { content: "<${tagName}>"; }`);
        console.log(element);
      });
    });

    // Vérifier les attributs obsolètes (dans tous les roots)
    deprecatedAttributes.forEach((attr) => {
      const elements = querySelectorAllInAllRoots(`[${attr}]`);
      elements.forEach((element) => {
        console.log(`[${attr}]::before { content: "[attr:${attr}]"; }`);
        console.log(element);
      });
    });

    // Vérifier les attributs width/height sur les éléments non autorisés
    // Vérifier les attributs width (seulement ceux qui n'ont PAS height)
    widthElements.forEach((element) => {
      if (
        !allowedWidthHeightElements.includes(element.tagName.toLowerCase()) &&
        !element.hasAttribute('height')
      ) {
        console.log(
          `:not(img, svg, canvas, embed, object, rect)[width]::before { content: "[attr:width]"; }`
        );
        console.log(element);
      }
    });

    // Vérifier les attributs height (seulement ceux qui n'ont PAS width)
    heightElements.forEach((element) => {
      if (
        !allowedWidthHeightElements.includes(element.tagName.toLowerCase()) &&
        !element.hasAttribute('width')
      ) {
        console.log(
          `:not(img, svg, canvas, embed, object, rect)[height]::before { content: "[attr:height]"; }`
        );
        console.log(element);
      }
    });

    // Vérifier les éléments avec width et height
    bothElements.forEach((element) => {
      if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
        console.log(
          `:not(img, svg, canvas, embed, object, rect)[width][height]::before { content: "[attr:height & width]"; }`
        );
        console.log(element);
      }
    });

    // Vérifier l'attribut size sur les éléments non autorisés
    sizeElements.forEach((element) => {
      if (!allowedSizeElements.includes(element.tagName.toLowerCase())) {
        console.log(`:not(select)[size]::before { content: "[attr:size]"; }`);
        console.log(element);
      }
    });
  } else {
    // Message positif si aucun problème n'est trouvé
    alert(
      `Aucun problème de balises ou d'attributs de présentation de l'information`
    );
  }
})();
