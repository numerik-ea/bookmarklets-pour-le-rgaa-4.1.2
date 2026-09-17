(() => {
  // Tags autorisés partout, ignorés par les contrôles de structure
  const IGNORED_TAGS = ['SCRIPT', 'TEMPLATE'];

  // Roles qui remplacent la sémantique de liste (cf. notes techniques du 9.3)
  const NON_LIST_ROLES = [
    'presentation',
    'none',
    'tree',
    'tablist',
    'menu',
    'menubar',
    'combobox',
    'listbox',
    'grid',
    'table',
  ];

  // First valid token of the role attribute (role accepts a list of tokens)
  function getRole(element) {
    const role = (element.getAttribute('role') || '').trim().toLowerCase();
    return role.split(/\s+/)[0] || '';
  }

  // <ul>, <ol> or an element with role=list (an explicit role wins over the tag)
  function isListContainer(element) {
    const role = getRole(element);
    if (role) {
      return role === 'list';
    }
    return element.tagName === 'UL' || element.tagName === 'OL';
  }

  // <li> or an element with role=listitem (an explicit role wins over the tag)
  function isListItem(element) {
    const role = getRole(element);
    if (role) {
      return role === 'listitem';
    }
    return element.tagName === 'LI';
  }

  function getElementLabel(element) {
    const tag = element.tagName.toUpperCase();
    const role = getRole(element);
    return role ? `${tag} [role=${role}]` : tag;
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
  let htmlListCount = 0;
  let ariaListCount = 0;
  let descriptionListCount = 0;
  let errors = 0;
  const errorsByLocation = { document: 0, shadow: 0, iframe: 0 };

  const results = roots.map(({ node: root, name, location }) => {
    function countError() {
      errors++;
      errorsByLocation[location]++;
    }

    // Tests 9.3.1 et 9.3.2 : listes <ul> / <ol> et listes ARIA role=list
    const containers = [...root.querySelectorAll('ul, ol, [role=list]')];

    // <ul>/<ol> dont un role remplace la sémantique de liste : à vérifier
    // manuellement, ce n'est pas forcément une erreur
    const replacedSemantics = containers.filter((element) =>
      NON_LIST_ROLES.includes(getRole(element))
    );

    const lists = containers.filter(isListContainer).map((element) => {
      listCount++;

      const isAriaList = element.tagName !== 'UL' && element.tagName !== 'OL';
      if (isAriaList) {
        ariaListCount++;
      } else {
        htmlListCount++;
      }

      // Les éléments de liste peuvent être rattachés par aria-owns : dans ce
      // cas les enfants directs ne sont pas contrôlés
      const usesAriaOwns = element.hasAttribute('aria-owns');
      const directChildren = [...element.children].filter(
        (child) => !IGNORED_TAGS.includes(child.tagName)
      );

      // 1. Vérification des enfants directs
      const invalidChildren = usesAriaOwns
        ? []
        : directChildren.filter((child) => !isListItem(child));

      // 2. Vérification des listes imbriquées directement
      const nestedLists = directChildren.filter(isListContainer);

      if (invalidChildren.length) {
        countError();
      }

      if (nestedLists.length) {
        countError();
      }

      return {
        index: listCount,
        label: getElementLabel(element),
        element,
        isAriaList,
        usesAriaOwns,
        invalidChildren,
        nestedLists,
        isEmpty:
          !usesAriaOwns && directChildren.filter(isListItem).length === 0,
      };
    });

    // 3. Recherche des éléments de liste qui ne sont pas dans un conteneur
    const orphanItems = [...root.querySelectorAll('li, [role=listitem]')]
      .filter(isListItem)
      .filter((item) => {
        const parent = item.parentElement;
        return !parent || !isListContainer(parent);
      });

    const orphanListItems = orphanItems.filter(
      (item) => getRole(item) !== 'listitem'
    );
    const orphanAriaItems = orphanItems.filter(
      (item) => getRole(item) === 'listitem'
    );

    if (orphanListItems.length) {
      countError();
    }

    if (orphanAriaItems.length) {
      countError();
    }

    // Test 9.3.3 : listes de description <dl>
    const descriptionLists = [...root.querySelectorAll('dl')].map((element) => {
      listCount++;
      descriptionListCount++;

      const directChildren = [...element.children].filter(
        (child) => !IGNORED_TAGS.includes(child.tagName)
      );

      // Seuls <dt>, <dd> et <div> (groupe nom/valeur) sont autorisés
      const invalidChildren = directChildren.filter(
        (child) => !['DT', 'DD', 'DIV'].includes(child.tagName)
      );

      const groups = directChildren.filter((child) => child.tagName === 'DIV');
      const invalidGroupChildren = groups.flatMap((group) =>
        [...group.children].filter(
          (child) =>
            !IGNORED_TAGS.includes(child.tagName) &&
            !['DT', 'DD'].includes(child.tagName)
        )
      );

      // Chaque <dt> doit être suivi d'au moins un <dd> dans le même groupe
      const scopes = [
        directChildren,
        ...groups.map((group) => [...group.children]),
      ];
      const termsWithoutDefinition = [];
      const definitionsWithoutTerm = [];

      scopes.forEach((children) => {
        let pendingTerms = [];
        let seenTerm = false;

        children.forEach((child) => {
          if (child.tagName === 'DT') {
            pendingTerms.push(child);
            seenTerm = true;
          } else if (child.tagName === 'DD') {
            if (!seenTerm) {
              definitionsWithoutTerm.push(child);
            }
            pendingTerms = [];
          }
        });

        termsWithoutDefinition.push(...pendingTerms);
      });

      const terms = element.querySelectorAll(':scope > dt, :scope > div > dt');
      const definitions = element.querySelectorAll(
        ':scope > dd, :scope > div > dd'
      );
      const isEmpty = terms.length === 0 && definitions.length === 0;

      if (invalidChildren.length) {
        countError();
      }

      if (invalidGroupChildren.length) {
        countError();
      }

      if (termsWithoutDefinition.length) {
        countError();
      }

      if (definitionsWithoutTerm.length) {
        countError();
      }

      if (isEmpty) {
        countError();
      }

      return {
        index: listCount,
        element,
        invalidChildren,
        invalidGroupChildren,
        termsWithoutDefinition,
        definitionsWithoutTerm,
        isEmpty,
      };
    });

    // <dt> et <dd> en dehors d'une <dl> (ou d'un <div> dans une <dl>)
    const orphanTerms = [...root.querySelectorAll('dt, dd')].filter(
      (element) => {
        const parent = element.parentElement;
        if (!parent) {
          return true;
        }
        if (parent.tagName === 'DL') {
          return false;
        }
        return !(
          parent.tagName === 'DIV' &&
          parent.parentElement &&
          parent.parentElement.tagName === 'DL'
        );
      }
    );

    if (orphanTerms.length) {
      countError();
    }

    return {
      name,
      lists,
      descriptionLists,
      orphanListItems,
      orphanAriaItems,
      orphanTerms,
      replacedSemantics,
    };
  });

  const replacedSemanticsCount = results.reduce(
    (total, result) => total + result.replacedSemantics.length,
    0
  );

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
  if (replacedSemanticsCount > 0) {
    analysisParts.push(
      `${replacedSemanticsCount} liste(s) dont la sémantique est remplacée par un role (à vérifier).`
    );
  }
  const analysisSummary =
    analysisParts.length > 0 ? '\n' + analysisParts.join('\n') : '';

  // Detail of the analysed lists
  const listParts = [];
  if (htmlListCount > 0) {
    listParts.push(`${htmlListCount} <ul>/<ol>`);
  }
  if (ariaListCount > 0) {
    listParts.push(`${ariaListCount} liste(s) ARIA (role=list)`);
  }
  if (descriptionListCount > 0) {
    listParts.push(`${descriptionListCount} liste(s) de description <dl>`);
  }

  // Summary of the anomalies found
  let message;

  if (listCount === 0) {
    message = 'Pas de liste <ul>, <ol>, role=list ou <dl> sur la page.';
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
  console.group('🔎 Audit des listes (critère 9.3)');

  if (listParts.length > 0) {
    console.log(
      `ℹ️ ${listCount} liste(s) analysée(s) : ${listParts.join(', ')}.`
    );
  }

  if (analysisParts.length > 0) {
    console.log('ℹ️ ' + analysisParts.join(' '));
  }

  results.forEach((result) => {
    const rootName = result.name;

    result.lists.forEach((list) => {
      const { index, label, element, isAriaList } = list;

      if (list.invalidChildren.length) {
        console.group(`❌ ${label} n°${index} (${rootName})`);
        console.log('Liste concernée :');
        console.log(element);

        console.warn(
          isAriaList
            ? 'Enfants directs qui ne portent pas role=listitem :'
            : 'Enfants directs qui ne sont pas des <li> :',
          list.invalidChildren
        );

        console.groupEnd();
      } else {
        console.log(
          `✅ ${label} n°${index} (${rootName}) : structure correcte`
        );
      }

      if (list.nestedLists.length) {
        console.group(
          `❌ Liste imbriquée incorrectement dans ${label} n°${index} (${rootName})`
        );
        console.log('Liste concernée :');
        console.log(element);
        console.warn(
          'Une liste ne doit pas être directement enfant d’une autre liste :',
          list.nestedLists
        );
        console.groupEnd();
      }

      if (list.usesAriaOwns) {
        console.log(
          `ℹ️ ${label} n°${index} (${rootName}) : les éléments de liste sont rattachés par aria-owns, à vérifier manuellement`
        );
      } else if (list.isEmpty) {
        console.log(
          `ℹ️ ${label} n°${index} (${rootName}) : aucun élément de liste`
        );
      }
    });

    result.descriptionLists.forEach((descriptionList) => {
      const { index, element } = descriptionList;
      const hasError =
        descriptionList.invalidChildren.length ||
        descriptionList.invalidGroupChildren.length ||
        descriptionList.termsWithoutDefinition.length ||
        descriptionList.definitionsWithoutTerm.length ||
        descriptionList.isEmpty;

      if (!hasError) {
        console.log(`✅ DL n°${index} (${rootName}) : structure correcte`);
        return;
      }

      console.group(`❌ DL n°${index} (${rootName})`);
      console.log('Liste de description concernée :');
      console.log(element);

      if (descriptionList.invalidChildren.length) {
        console.warn(
          'Enfants directs autres que <dt>, <dd> ou <div> :',
          descriptionList.invalidChildren
        );
      }

      if (descriptionList.invalidGroupChildren.length) {
        console.warn(
          'Enfants d’un <div> de groupe autres que <dt> ou <dd> :',
          descriptionList.invalidGroupChildren
        );
      }

      if (descriptionList.termsWithoutDefinition.length) {
        console.warn(
          'Ces <dt> ne sont suivis d’aucun <dd> :',
          descriptionList.termsWithoutDefinition
        );
      }

      if (descriptionList.definitionsWithoutTerm.length) {
        console.warn(
          'Ces <dd> ne sont précédés d’aucun <dt> :',
          descriptionList.definitionsWithoutTerm
        );
      }

      if (descriptionList.isEmpty) {
        console.warn('Cette <dl> ne contient ni <dt> ni <dd>.');
      }

      console.groupEnd();
    });

    if (result.orphanListItems.length) {
      console.group(`❌ <li> mal rattachés (${rootName})`);
      console.warn(
        'Ces <li> ne sont pas des enfants directs d’un <ul>, d’un <ol> ou d’un élément role=list :',
        result.orphanListItems
      );
      console.groupEnd();
    }

    if (result.orphanAriaItems.length) {
      console.group(`❌ Éléments role=listitem mal rattachés (${rootName})`);
      console.warn(
        'Ces éléments role=listitem ne sont pas des enfants directs d’un élément role=list :',
        result.orphanAriaItems
      );
      console.groupEnd();
    }

    if (result.orphanTerms.length) {
      console.group(`❌ <dt> ou <dd> mal rattachés (${rootName})`);
      console.warn(
        'Ces <dt>/<dd> ne sont pas dans une <dl> (directement ou dans un <div> de groupe) :',
        result.orphanTerms
      );
      console.groupEnd();
    }

    if (result.replacedSemantics.length) {
      console.group(
        `⚠️ Sémantique de liste remplacée par un role (${rootName})`
      );
      console.warn(
        'Ces <ul>/<ol> ne sont plus exposés comme des listes, à vérifier manuellement :',
        result.replacedSemantics
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

  console.log(
    'ℹ️ Rappel : le critère 9.3 impose aussi de vérifier que les contenus présentés visuellement sous forme de liste sont bien structurés en liste. Ce contrôle ne peut pas être automatisé.'
  );

  console.groupEnd();
})();
