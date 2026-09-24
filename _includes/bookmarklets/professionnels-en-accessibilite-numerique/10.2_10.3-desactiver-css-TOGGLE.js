(() => {
  // Vidée dès le lancement, pour que la console ne mélange pas cette
  // désactivation à la sortie d'un bookmarklet lancé précédemment
  console.clear();

  // L'état est conservé sur la fenêtre principale : il contient de quoi
  // rétablir exactement ce qui a été désactivé, et rien d'autre
  const STATE_KEY = '__a11yDisabledCss';
  const state = window[STATE_KEY];

  // Second lancement : réactivation de ce qui a été désactivé
  if (state) {
    state.sheets.forEach((sheet) => {
      sheet.disabled = false;
    });
    state.adoptedSheets.forEach(({ root, sheets }) => {
      root.adoptedStyleSheets = sheets;
    });
    state.styleAttributes.forEach(({ element, value }) => {
      element.setAttribute('style', value);
    });

    delete window[STATE_KEY];

    console.group('🎨 Désactivation des CSS (critères 10.2 et 10.3)');
    console.log(
      `✅ CSS réactivés : ${state.sheets.length} feuille(s) de styles, ${state.adoptedCount} feuille(s) adoptée(s), ${state.styleAttributes.length} attribut(s) style.`
    );
    console.groupEnd();

    alert('CSS : RÉACTIVÉS');
    return;
  }

  // Function to recursively get all shadow roots
  function getAllShadowRoots(root) {
    const shadowRoots = [];
    const walker = (root.ownerDocument || root).createTreeWalker(
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

  // Racines à traiter : le document, ses shadow roots, puis les documents des
  // iframes et frames de même origine, récursivement
  const roots = []; // { node, name, location: 'document' | 'shadow' | 'iframe' }
  const inaccessibleIframes = [];
  let shadowRootCount = 0;
  let iframeCount = 0;

  function collectRoots(doc, docName) {
    const isMainDocument = doc === document;
    const docRoots = [
      {
        node: doc,
        name: docName,
        location: isMainDocument ? 'document' : 'iframe',
      },
    ];

    getAllShadowRoots(doc).forEach((shadowRoot) => {
      shadowRootCount++;
      docRoots.push({
        node: shadowRoot,
        name: `${docName} > Shadow root ${shadowRootCount}`,
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
        if (!frameDocument || !frameDocument.documentElement) {
          inaccessibleIframes.push(frame);
          return;
        }

        iframeCount++;
        const title = frame.getAttribute('title');
        collectRoots(
          frameDocument,
          `Iframe ${iframeCount}` + (title ? ` « ${title} »` : '')
        );
      });
    });
  }

  collectRoots(document, 'Document principal');

  // Désactivation, racine par racine. Rien n'est retiré du DOM : les feuilles
  // sont désactivées et les attributs style mis de côté, pour pouvoir tout
  // rétablir au lancement suivant
  const newState = {
    sheets: [],
    adoptedSheets: [],
    adoptedCount: 0,
    styleAttributes: [],
  };

  const results = roots.map(({ node: root, name, location }) => {
    // Feuilles portées par <link rel="stylesheet"> et <style>. Celles déjà
    // désactivées (feuilles alternatives) ne sont pas touchées, pour ne pas
    // les activer à la réactivation
    const sheets = Array.from(root.styleSheets || []).filter(
      (sheet) => !sheet.disabled
    );
    sheets.forEach((sheet) => {
      sheet.disabled = true;
    });
    newState.sheets.push(...sheets);

    // Feuilles adoptées (document.adoptedStyleSheets, shadowRoot.adoptedStyleSheets),
    // qui n'apparaissent pas dans styleSheets
    const adoptedSheets = Array.from(root.adoptedStyleSheets || []);
    if (adoptedSheets.length) {
      newState.adoptedSheets.push({ root, sheets: adoptedSheets });
      newState.adoptedCount += adoptedSheets.length;
      root.adoptedStyleSheets = [];
    }

    // Styles en ligne, que la désactivation des feuilles laisserait en place
    const styledElements = Array.from(root.querySelectorAll('[style]'));
    styledElements.forEach((element) => {
      newState.styleAttributes.push({
        element,
        value: element.getAttribute('style'),
      });
      element.removeAttribute('style');
    });

    return {
      name,
      location,
      sheetCount: sheets.length,
      adoptedCount: adoptedSheets.length,
      styleAttributeCount: styledElements.length,
    };
  });

  window[STATE_KEY] = newState;

  // Summary of what has been processed
  const analysisParts = [];
  if (shadowRootCount > 0) {
    analysisParts.push(`${shadowRootCount} shadow root(s) traité(s).`);
  }
  if (iframeCount > 0) {
    analysisParts.push(`${iframeCount} iframe(s) traitée(s).`);
  }
  if (inaccessibleIframes.length > 0) {
    analysisParts.push(
      `${inaccessibleIframes.length} iframe(s) non traitable(s) (origine différente) : leurs styles restent actifs.`
    );
  }
  const analysisSummary =
    analysisParts.length > 0 ? '\n' + analysisParts.join('\n') : '';

  alert(
    'CSS : DÉSACTIVÉS' +
      analysisSummary +
      '\nRelancer le bookmarklet pour rétablir les styles.' +
      '\nPlus de détails dans la console.'
  );

  // Details in the console
  console.group('🎨 Désactivation des CSS (critères 10.2 et 10.3)');

  results.forEach((result) => {
    const total =
      result.sheetCount + result.adoptedCount + result.styleAttributeCount;
    if (total === 0 && result.location !== 'document') {
      return;
    }
    console.log(
      `ℹ️ ${result.name} : ${result.sheetCount} feuille(s) de styles, ${result.adoptedCount} feuille(s) adoptée(s), ${result.styleAttributeCount} attribut(s) style désactivé(s).`
    );
  });

  if (analysisParts.length > 0) {
    console.log('ℹ️ ' + analysisParts.join(' '));
  }

  if (inaccessibleIframes.length > 0) {
    console.group(
      `⚠️ ${inaccessibleIframes.length} iframe(s) non traitable(s) (origine différente)`
    );
    inaccessibleIframes.forEach((frame) => console.log(frame));
    console.groupEnd();
  }

  console.log('----------------------------------');
  console.log(
    `✅ CSS désactivés : ${newState.sheets.length} feuille(s) de styles, ${newState.adoptedCount} feuille(s) adoptée(s), ${newState.styleAttributes.length} attribut(s) style.`
  );
  console.log(
    'ℹ️ Limites : les shadow roots fermés (mode closed) ne sont pas accessibles, leurs styles restent actifs. Les attributs de présentation HTML (bgcolor, align…) ne sont pas des CSS et ne sont pas désactivés.'
  );
  console.log(
    'ℹ️ Vérifier que le contenu porteur d’information reste présent (10.2) et que l’information reste compréhensible (10.3). Relancer le bookmarklet pour rétablir les styles.'
  );

  console.groupEnd();
})();
