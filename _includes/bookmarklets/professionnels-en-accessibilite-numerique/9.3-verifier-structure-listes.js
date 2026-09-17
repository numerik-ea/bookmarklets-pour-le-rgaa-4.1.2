(() => {
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
        if (!frameDocument || !frameDocument.body) {
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

  // Analyse of every root, before anything is displayed
  let listCount = 0;
  let errors = 0;
  const errorsByLocation = { document: 0, shadow: 0, iframe: 0 };

  const results = roots.map(({ node: root, name, location }) => {
    const lists = [...root.querySelectorAll('ul, ol')].map((list) => {
      listCount++;
      const directChildren = [...list.children];

      // 1. Vérification des enfants directs
      const invalidChildren = directChildren.filter(
        (child) => child.tagName.toLowerCase() !== 'li'
      );

      // 2. Vérification des listes imbriquées directement
      const nestedLists = directChildren.filter((child) =>
        ['UL', 'OL'].includes(child.tagName)
      );

      if (invalidChildren.length) {
        errors++;
        errorsByLocation[location]++;
      }

      if (nestedLists.length) {
        errors++;
        errorsByLocation[location]++;
      }

      return {
        index: listCount,
        tag: list.tagName.toUpperCase(),
        list,
        invalidChildren,
        nestedLists,
      };
    });

    // 3. Recherche des <li> qui ne sont pas dans une <ul> ou <ol>
    const orphanLi = [...root.querySelectorAll('li')].filter(
      (li) => !li.parentElement?.matches('ul, ol')
    );

    if (orphanLi.length) {
      errors++;
      errorsByLocation[location]++;
    }

    return { name, lists, orphanLi };
  });

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

  // Summary of the anomalies found
  let message;

  if (listCount === 0) {
    message = 'Pas de liste <ul>/<ol> sur la page.';
  } else {
    const listLabel =
      listCount === 1 ? '1 liste analysée' : `${listCount} listes analysées`;

    if (errors === 0) {
      message = `Aucune anomalie de structure détectée (${listLabel}).`;
    } else {
      const errorLabel =
        errors === 1
          ? '1 anomalie de structure détectée'
          : `${errors} anomalies de structure détectées`;

      // Add location information
      const locationParts = [];
      if (errorsByLocation.document > 0) {
        locationParts.push(`${errorsByLocation.document} dans le document`);
      }
      if (errorsByLocation.shadow > 0) {
        locationParts.push(`${errorsByLocation.shadow} dans shadow DOM`);
      }
      if (errorsByLocation.iframe > 0) {
        locationParts.push(`${errorsByLocation.iframe} dans les iframes`);
      }
      const locationSummary =
        locationParts.length > 1 ? ` (${locationParts.join(', ')})` : '';

      message = `${errorLabel}${locationSummary} sur ${listLabel}.`;
    }
  }

  alert(message + analysisSummary + '\nPlus de détails dans la console.');

  // Details in the console
  console.clear();
  console.group('🔎 Audit des listes UL / OL');

  if (analysisParts.length > 0) {
    console.log('ℹ️ ' + analysisParts.join(' '));
  }

  results.forEach(({ name: rootName, lists, orphanLi }) => {
    lists.forEach(({ index, tag, list, invalidChildren, nestedLists }) => {
      if (invalidChildren.length) {
        console.group(`❌ ${tag} n°${index} (${rootName})`);
        console.log('Liste concernée :');
        console.log(list);

        console.warn(
          'Enfants directs qui ne sont pas des <li> :',
          invalidChildren
        );

        console.groupEnd();
      } else {
        console.log(`✅ ${tag} n°${index} (${rootName}) : structure correcte`);
      }

      if (nestedLists.length) {
        console.group(
          `❌ Liste imbriquée incorrectement dans ${tag} n°${index} (${rootName})`
        );
        console.log('Liste concernée :');
        console.log(list);
        console.warn(
          'Une liste <ul>/<ol> ne doit pas être directement enfant d’une autre liste :',
          nestedLists
        );
        console.groupEnd();
      }
    });

    if (orphanLi.length) {
      console.group(`❌ <li> mal rattachés (${rootName})`);
      console.warn(
        'Ces <li> ne sont pas des enfants directs d’un <ul> ou d’un <ol> :',
        orphanLi
      );
      console.groupEnd();
    }
  });

  if (inaccessibleIframes.length > 0) {
    console.group(
      `⚠️ ${inaccessibleIframes.length} iframe(s) non analysable(s) (origine différente)`
    );
    inaccessibleIframes.forEach((frame) => console.log(frame));
    console.groupEnd();
  }

  // Résultat
  console.log('----------------------------------');

  if (errors === 0) {
    console.log(`✅ ${message}`);
  } else {
    console.warn(`⚠️ ${message}`);
  }

  console.groupEnd();
})();
