(() => {
  // Vidée dès le lancement : les résultats d'un lancement précédent ne
  // doivent pas pouvoir être pris pour ceux de la page actuelle
  console.clear();

  // Le critère 3.3 ne s'applique pas à l'indicateur de focus natif du
  // navigateur : seuls les éléments dont le focus est stylé par le site
  // (règles :focus, :focus-visible, :focus-within ou outline supprimé)
  // sont à vérifier. Ce bookmarklet les liste à partir des feuilles de
  // style, sans jamais déplacer le focus dans la page.

  // Mise en évidence d'un lancement précédent : retirée avant l'analyse,
  // pour que son bouton ne soit pas lui-même analysé
  const HIGHLIGHT_ID = 'a11y-focus-non-natif-highlight';
  const previousHighlight = document.getElementById(HIGHLIGHT_ID);
  if (previousHighlight) {
    previousHighlight.remove();
  }
  if (window.a11yFocusNonNatifReposition) {
    window.removeEventListener('resize', window.a11yFocusNonNatifReposition);
    delete window.a11yFocusNonNatifReposition;
  }

  // Pseudo-classes de focus. Deux versions : l'une pour tester (sans le
  // drapeau g, dont le lastIndex fausserait les tests successifs), l'autre
  // pour remplacer
  const FOCUS_PSEUDO =
    /:(?:focus-visible|focus-within|focus|-moz-focusring)(?![\w-])/i;
  const FOCUS_PSEUDO_ALL =
    /:(?:focus-visible|focus-within|focus|-moz-focusring)(?![\w-])/gi;
  const FOCUS_ON_SUBJECT = /:(?:focus-visible|focus|-moz-focusring)(?![\w-])/i;

  // :not(:focus) et consorts : remplacés par un sélecteur neutre, sans quoi
  // retirer la seule pseudo-classe laisserait un :not() vide, donc invalide
  const NOT_FOCUS =
    /:not\(\s*:(?:focus-visible|focus-within|focus|-moz-focusring)\s*\)/gi;

  // Pseudo-éléments : un indicateur de focus peut être dessiné par un
  // ::before ou un ::after, mais matches() et querySelectorAll() ne savent
  // pas cibler un pseudo-élément. Ils sont retirés du sélecteur et signalés.
  const PSEUDO_ELEMENT =
    /::[\w-]+(?:\([^)]*\))?|:(?:before|after|first-line|first-letter)(?![\w-])/gi;

  const NEUTRAL = ':where(*)';

  // Éléments qui peuvent recevoir le focus (tabindex="-1" compris : ils
  // peuvent le recevoir par script et afficher alors un indicateur)
  const FOCUSABLE = [
    'a[href]',
    'area[href]',
    'button:not(:disabled)',
    'input:not([type=hidden]):not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    'iframe',
    'summary',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable=false])',
    '[tabindex]',
  ].join(',');

  // Feuille injectée par le bookmarklet "12.8 - Visibilité du focus" : ce
  // n'est pas un style du site, elle ne doit pas fausser le résultat
  const IGNORED_STYLE_IDS = ['a11y-focus-style'];

  const KIND_LABELS = {
    focus: 'Règle de focus',
    'focus-within': 'Règle :focus-within (focus d’un descendant)',
    ancestor: 'Stylé lors du focus d’un ancêtre',
    outline: 'Outline supprimé hors :focus',
    inline: 'Outline supprimé dans l’attribut style',
  };

  function isFocusable(element) {
    return element.matches(FOCUSABLE);
  }

  // Parcourt une chaîne de sélecteur en ignorant ce qui se trouve entre
  // parenthèses, crochets ou guillemets : seuls les caractères de premier
  // niveau sont transmis à onChar
  function scanTopLevel(selector, onChar) {
    let depth = 0;
    let quote = null;

    for (let i = 0; i < selector.length; i++) {
      const char = selector[i];

      if (quote) {
        if (char === '\\') {
          i++;
        } else if (char === quote) {
          quote = null;
        }
        continue;
      }

      if (char === '\\') {
        i++;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '(' || char === '[') {
        depth++;
      } else if (char === ')' || char === ']') {
        depth--;
      } else if (depth === 0) {
        onChar(char, i);
      }
    }
  }

  // "a:focus, .b:is(.c, .d):focus" : découpe sur les seules virgules de
  // premier niveau
  function splitSelectorList(selectorList) {
    const parts = [];
    let start = 0;

    scanTopLevel(selectorList, (char, index) => {
      if (char === ',') {
        parts.push(selectorList.slice(start, index));
        start = index + 1;
      }
    });
    parts.push(selectorList.slice(start));

    return parts.map((part) => part.trim()).filter(Boolean);
  }

  // Index du dernier combinateur de premier niveau (-1 s'il n'y en a pas)
  function lastCombinatorIndex(selector) {
    let lastIndex = -1;

    scanTopLevel(selector, (char, index) => {
      if (/[\s>+~]/.test(char)) {
        lastIndex = index;
      }
    });

    return lastIndex;
  }

  // Sélecteur imbriqué (CSS nesting) résolu en sélecteur complet : "&" est
  // remplacé par le parent, et un sélecteur sans "&" en est un descendant
  function resolveNestedSelector(selectorText, parentSelector) {
    if (!parentSelector) {
      return selectorText;
    }

    return splitSelectorList(selectorText)
      .map((selector) =>
        selector.includes('&')
          ? selector.replace(/&/g, `:is(${parentSelector})`)
          : `:is(${parentSelector}) ${selector}`
      )
      .join(', ');
  }

  // Outline supprimé ou rendu invisible : "outline: none", "outline: 0",
  // ou "outline-color: transparent" (technique courante, reprise par
  // exemple par la classe outline-none de Tailwind)
  function removesOutline(style) {
    const outlineStyle = style.getPropertyValue('outline-style').trim();
    const outlineWidth = style.getPropertyValue('outline-width').trim();
    const outlineColor = style
      .getPropertyValue('outline-color')
      .trim()
      .replace(/\s+/g, '');

    return (
      outlineStyle === 'none' ||
      outlineWidth === '0' ||
      outlineWidth === '0px' ||
      outlineColor === 'transparent' ||
      /^rgba\([^)]*,0\)$/.test(outlineColor)
    );
  }

  // La règle apporte-t-elle autre chose que la suppression de l'outline ?
  function hasOtherDeclarations(style) {
    for (let i = 0; i < style.length; i++) {
      if (!style[i].startsWith('outline')) {
        return true;
      }
    }
    return !removesOutline(style);
  }

  // Racines à analyser : le document, ses shadow roots (ouverts), puis les
  // documents des iframes et frames accessibles (même origine), récursivement
  const roots = []; // { scope, doc, name, location }
  const inaccessibleIframes = [];
  let shadowRootCount = 0;
  let iframeCount = 0;

  function getAllShadowRoots(root) {
    const shadowRoots = [];
    root.querySelectorAll('*').forEach((element) => {
      if (element.shadowRoot) {
        shadowRoots.push(element.shadowRoot);
        shadowRoots.push(...getAllShadowRoots(element.shadowRoot));
      }
    });
    return shadowRoots;
  }

  function collectRoots(doc, docName) {
    const isMainDocument = doc === document;
    const docRoots = [
      {
        scope: doc,
        doc,
        name: docName,
        location: isMainDocument ? 'document' : 'iframe',
      },
    ];

    getAllShadowRoots(doc).forEach((shadowRoot) => {
      shadowRootCount++;
      docRoots.push({
        scope: shadowRoot,
        doc,
        name: `${docName} > Shadow root ${shadowRootCount}`,
        location: isMainDocument ? 'shadow' : 'iframe',
      });
    });

    roots.push(...docRoots);

    docRoots.forEach(({ scope }) => {
      scope.querySelectorAll('iframe, frame').forEach((frame) => {
        let frameDocument = null;
        try {
          frameDocument = frame.contentDocument;
        } catch (error) {
          frameDocument = null;
        }

        // contentDocument vaut null pour une iframe d'une autre origine
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

  // Résultats, par élément : Map élément → Map règle → détail de la règle
  const findings = new Map();
  const inaccessibleSheets = [];
  const invalidSelectors = [];
  let analysedSheetCount = 0;

  function addFinding(element, key, record) {
    if (!findings.has(element)) {
      findings.set(element, new Map());
    }

    const records = findings.get(element);
    if (records.has(key)) {
      const existing = records.get(key);
      if (!existing.selectors.includes(record.selectors[0])) {
        existing.selectors.push(record.selectors[0]);
      }
    } else {
      records.set(key, record);
    }
  }

  // Éléments visés par un sélecteur, une fois les pseudo-classes de focus
  // neutralisées : ce sont ceux qui changent d'apparence à la prise de focus
  function querySubjects(root, selector) {
    const subjects = new Set();

    try {
      root.scope.querySelectorAll(selector).forEach((element) => {
        subjects.add(element);
      });
    } catch (error) {
      invalidSelectors.push(selector);
    }

    // :host(...) dans un shadow root vise l'hôte, que querySelectorAll ne
    // renvoie pas depuis l'intérieur du shadow root
    const isShadowRoot = root.scope !== root.doc;
    if (
      isShadowRoot &&
      /:host(?![\w-])/i.test(selector) &&
      lastCombinatorIndex(selector) === -1
    ) {
      const hostSelector = selector
        .replace(/:host\(/gi, ':is(')
        .replace(/:host(?![\w(-])/gi, NEUTRAL);
      try {
        if (root.scope.host.matches(hostSelector)) {
          subjects.add(root.scope.host);
        }
      } catch (error) {
        invalidSelectors.push(selector);
      }
    }

    return [...subjects];
  }

  function analyseStyleRule(root, rule, fullSelector, style, context) {
    const outlineRemoved = removesOutline(style);

    splitSelectorList(fullSelector).forEach((selector) => {
      const hasFocus = FOCUS_PSEUDO.test(selector);

      if (!hasFocus && !outlineRemoved) {
        return;
      }

      // Nature de la règle, selon la place de la pseudo-classe de focus :
      // sur l'élément visé, sur un ancêtre, ou en :focus-within
      const subjectCompound = selector.slice(lastCombinatorIndex(selector) + 1);
      let kind;
      if (FOCUS_ON_SUBJECT.test(subjectCompound)) {
        kind = 'focus';
      } else if (/:focus-within(?![\w-])/i.test(subjectCompound)) {
        kind = 'focus-within';
      } else if (hasFocus) {
        kind = 'ancestor';
      } else {
        kind = 'outline';
      }

      const pseudoElements = subjectCompound.match(PSEUDO_ELEMENT) || [];
      const cleanSelector = selector
        .replace(NOT_FOCUS, NEUTRAL)
        .replace(FOCUS_PSEUDO_ALL, NEUTRAL)
        .replace(PSEUDO_ELEMENT, '');

      querySubjects(root, cleanSelector)
        .filter((element) => {
          // Un élément qui ne peut pas recevoir le focus n'est jamais
          // :focus ; en :focus-within, il doit contenir un élément qui le
          // peut ; stylé par le focus d'un ancêtre, il est toujours retenu
          if (kind === 'focus' || kind === 'outline') {
            return isFocusable(element);
          }
          if (kind === 'focus-within') {
            return (
              isFocusable(element) ||
              !!element.shadowRoot ||
              !!element.querySelector(FOCUSABLE)
            );
          }
          return true;
        })
        .forEach((element) => {
          addFinding(element, rule, {
            kind,
            selectors: [selector],
            declarations: style.cssText,
            pseudoElements,
            removesOutline: outlineRemoved,
            providesIndicator: hasFocus && hasOtherDeclarations(style),
            source: context.source,
            atRules: context.atRules,
            active: context.active,
          });
        });
    });
  }

  function walkRules(root, rules, context, parentSelector) {
    [...rules].forEach((rule) => {
      // constructor.name plutôt que instanceof : les règles d'une iframe
      // viennent d'un autre contexte JavaScript
      const type = rule.constructor.name;

      if (type === 'CSSStyleRule') {
        const fullSelector = resolveNestedSelector(
          rule.selectorText,
          parentSelector
        );
        analyseStyleRule(root, rule, fullSelector, rule.style, context);

        if (rule.cssRules && rule.cssRules.length) {
          walkRules(root, rule.cssRules, context, fullSelector);
        }
        return;
      }

      // Déclarations placées après une règle imbriquée : elles
      // s'appliquent au sélecteur parent
      if (type === 'CSSNestedDeclarations' && parentSelector) {
        analyseStyleRule(root, rule, parentSelector, rule.style, context);
        return;
      }

      if (type === 'CSSImportRule') {
        analyseSheet(root, rule.styleSheet, rule.href, context);
        return;
      }

      if (!rule.cssRules) {
        return;
      }

      // Règles conditionnelles et de regroupement : @media, @supports,
      // @layer, @container, @scope, @document
      let label = type.replace(/^CSS|Rule$/g, '').toLowerCase();
      let active = context.active;

      if (type === 'CSSMediaRule') {
        label = `@media ${rule.media.mediaText}`;
        active =
          active && root.doc.defaultView.matchMedia(rule.media.mediaText).matches;
      } else if (rule.conditionText !== undefined) {
        label = `@${label} ${rule.conditionText}`;
      } else if (type === 'CSSLayerBlockRule') {
        label = `@layer ${rule.name}`;
      } else {
        label = `@${label}`;
      }

      walkRules(
        root,
        rule.cssRules,
        { ...context, atRules: [...context.atRules, label], active },
        parentSelector
      );
    });
  }

  function analyseSheet(root, sheet, source, parentContext) {
    if (!sheet) {
      return;
    }

    if (sheet.ownerNode && IGNORED_STYLE_IDS.includes(sheet.ownerNode.id)) {
      return;
    }

    let rules;
    try {
      rules = sheet.cssRules;
    } catch (error) {
      // Feuille d'une autre origine sans en-têtes CORS : illisible
      inaccessibleSheets.push({ href: sheet.href || source, name: root.name });
      return;
    }

    analysedSheetCount++;

    // Une feuille liée avec un attribut media ne s'applique que si celui-ci
    // correspond à la fenêtre actuelle
    const mediaText = sheet.media && sheet.media.mediaText;
    const active =
      (parentContext ? parentContext.active : true) &&
      (!mediaText || root.doc.defaultView.matchMedia(mediaText).matches);

    walkRules(
      root,
      rules,
      {
        source: sheet.href || source,
        atRules: parentContext ? parentContext.atRules : [],
        active,
      },
      null
    );
  }

  roots.forEach((root) => {
    const scope = root.scope;
    let styleCount = 0;

    [...scope.styleSheets].forEach((sheet) => {
      let source = sheet.href;
      if (!source) {
        styleCount++;
        source = `<style> n°${styleCount} (${root.name})`;
      }
      analyseSheet(root, sheet, source, null);
    });

    [...(scope.adoptedStyleSheets || [])].forEach((sheet, index) => {
      analyseSheet(
        root,
        sheet,
        `Feuille adoptée n°${index + 1} (${root.name})`,
        null
      );
    });

    // Outline supprimé directement dans l'attribut style
    scope.querySelectorAll('[style]').forEach((element) => {
      if (isFocusable(element) && removesOutline(element.style)) {
        addFinding(element, `inline`, {
          kind: 'inline',
          selectors: [`style="${element.getAttribute('style')}"`],
          declarations: element.style.cssText,
          pseudoElements: [],
          removesOutline: true,
          providesIndicator: false,
          source: 'Attribut style',
          atRules: [],
          active: true,
        });
      }
    });
  });

  // Mise en ordre : racine par racine, dans l'ordre du document
  const orderedResults = [];
  const locationCounts = { document: 0, shadow: 0, iframe: 0 };

  roots.forEach((root) => {
    root.scope.querySelectorAll('*').forEach((element) => {
      if (!findings.has(element)) {
        return;
      }

      const records = [...findings.get(element).values()];
      findings.delete(element);

      // Un élément n'est retenu que s'il est concerné par au moins une
      // règle de focus, ou si son outline est supprimé
      const hasFocusRule = records.some((record) =>
        ['focus', 'focus-within', 'ancestor'].includes(record.kind)
      );
      const outlineRemoved = records.some((record) => record.removesOutline);

      if (!hasFocusRule && !outlineRemoved) {
        return;
      }

      locationCounts[root.location]++;
      orderedResults.push({
        element,
        rootName: root.name,
        records,
        // Outline supprimé sans qu'aucune règle de focus n'apporte un autre
        // indicateur : le focus est vraisemblablement invisible
        noIndicator:
          isFocusable(element) &&
          outlineRemoved &&
          !records.some((record) => record.providesIndicator),
        onlyInactive: records.every((record) => !record.active),
      });
    });
  });

  // Texte court permettant d'identifier l'élément dans la console
  function describe(element) {
    const text =
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.getAttribute('placeholder') ||
      element.textContent ||
      element.getAttribute('value') ||
      '';
    const shortText = text.replace(/\s+/g, ' ').trim();
    const tag = `<${element.tagName.toLowerCase()}>`;

    if (!shortText) {
      return tag;
    }

    return shortText.length > 60
      ? `${tag} « ${shortText.slice(0, 60)}… »`
      : `${tag} « ${shortText} »`;
  }

  const total = orderedResults.length;
  const noIndicatorCount = orderedResults.filter((r) => r.noIndicator).length;
  const onlyInactiveCount = orderedResults.filter(
    (r) => r.onlyInactive
  ).length;

  // Position d'un élément dans la page principale : un élément d'une iframe
  // est décalé de la position de chaque iframe qui le contient
  function getPageRect(element) {
    const rect = element.getBoundingClientRect();
    let left = rect.left;
    let top = rect.top;
    let view = element.ownerDocument.defaultView;

    while (view && view !== window && view.frameElement) {
      const frame = view.frameElement;
      const frameRect = frame.getBoundingClientRect();
      const frameStyle = frame.ownerDocument.defaultView.getComputedStyle(frame);
      left +=
        frameRect.left + frame.clientLeft + parseFloat(frameStyle.paddingLeft);
      top += frameRect.top + frame.clientTop + parseFloat(frameStyle.paddingTop);
      view = frame.ownerDocument.defaultView;
    }

    return {
      left: left + window.scrollX,
      top: top + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  }

  // Mise en évidence : des cadres numérotés comme dans la console, posés
  // par-dessus la page. Les styles des éléments ne sont pas modifiés, car un
  // outline ajouté à l'élément masquerait l'indicateur de focus à vérifier.
  // Les cadres laissent passer les clics (pointer-events: none) : la page
  // reste utilisable au clavier et à la souris pendant la vérification.
  const highlight = document.createElement('div');
  highlight.id = HIGHLIGHT_ID;
  highlight.style.cssText =
    'position:absolute;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647;';

  const boxLayer = document.createElement('div');
  boxLayer.setAttribute('aria-hidden', 'true');
  highlight.appendChild(boxLayer);

  const boxes = [];
  let hiddenCount = 0;

  orderedResults.forEach((result, index) => {
    const rect = getPageRect(result.element);

    // Élément masqué ou sans dimensions : rien à encadrer
    if (rect.width === 0 && rect.height === 0) {
      result.hidden = true;
      hiddenCount++;
      return;
    }

    const color = result.noIndicator ? '#c0392b' : '#0055cc';
    const box = document.createElement('div');
    box.style.cssText =
      `position:absolute;box-sizing:border-box;pointer-events:none;` +
      `border:3px ${result.onlyInactive ? 'dashed' : 'solid'} ${color};`;

    const badge = document.createElement('span');
    badge.textContent = `${index + 1}${result.noIndicator ? ' ⚠️' : ''}`;
    badge.style.cssText =
      `position:absolute;top:-3px;left:-3px;transform:translateY(-100%);` +
      `background:${color};color:#fff;font:bold 12px/1.4 Arial,sans-serif;` +
      `padding:0 4px;white-space:nowrap;`;
    box.appendChild(badge);

    boxLayer.appendChild(box);
    boxes.push({ element: result.element, box, badge });
  });

  function reposition() {
    // Badges déjà placés : un élément et son parent (hôte d'un Shadow DOM
    // et son contenu, par exemple) ont souvent le même coin supérieur
    // gauche, leurs badges se superposeraient sans ce décalage
    const placedBadges = [];

    boxes.forEach(({ element, box, badge }) => {
      const rect = getPageRect(element);
      box.style.left = `${rect.left - 3}px`;
      box.style.top = `${rect.top - 3}px`;
      box.style.width = `${rect.width + 6}px`;
      box.style.height = `${rect.height + 6}px`;

      const width = badge.offsetWidth;
      const height = badge.offsetHeight;
      const top = rect.top - 3 - height;
      let shift = 0;
      let overlapping;

      do {
        const left = rect.left - 3 + shift;
        overlapping = placedBadges.find(
          (placed) =>
            left < placed.left + placed.width &&
            placed.left < left + width &&
            top < placed.top + placed.height &&
            placed.top < top + height
        );
        if (overlapping) {
          shift = overlapping.left + overlapping.width + 2 - (rect.left - 3);
        }
      } while (overlapping);

      badge.style.left = `${shift - 3}px`;
      placedBadges.push({ left: rect.left - 3 + shift, top, width, height });
    });
  }

  if (boxes.length > 0) {
    // Ajoutée avant le premier placement : la taille des badges n'est
    // connue qu'une fois ceux-ci dans la page
    document.body.appendChild(highlight);
    reposition();
    window.a11yFocusNonNatifReposition = reposition;
    window.addEventListener('resize', reposition);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Retirer la mise en évidence (focus non natif)';
    removeButton.style.cssText =
      'position:fixed;right:16px;bottom:16px;padding:8px 12px;' +
      'background:#fff;color:#0055cc;border:2px solid #0055cc;' +
      'font:bold 14px Arial,sans-serif;cursor:pointer;';
    removeButton.addEventListener('click', () => {
      highlight.remove();
      window.removeEventListener('resize', reposition);
      delete window.a11yFocusNonNatifReposition;
    });
    highlight.appendChild(removeButton);
  }

  // Ce qui a été analysé, et ce qui n'a pas pu l'être
  const analysisParts = [`${analysedSheetCount} feuille(s) de style analysée(s).`];
  if (shadowRootCount > 0) {
    analysisParts.push(`${shadowRootCount} shadow root(s) analysé(s).`);
  }
  if (iframeCount > 0) {
    analysisParts.push(`${iframeCount} iframe(s) analysée(s).`);
  }
  if (inaccessibleSheets.length > 0) {
    analysisParts.push(
      `${inaccessibleSheets.length} feuille(s) de style non analysable(s) (origine différente) : résultat incomplet.`
    );
  }
  if (inaccessibleIframes.length > 0) {
    analysisParts.push(
      `${inaccessibleIframes.length} iframe(s) non analysable(s) (origine différente).`
    );
  }

  let message;

  if (total === 0) {
    message =
      'Aucun élément avec un focus non natif détecté.\n' +
      'Le focus natif du navigateur n’est pas concerné par le critère 3.3.';
  } else {
    const locationParts = [];
    if (locationCounts.document > 0) {
      locationParts.push(`${locationCounts.document} dans le document`);
    }
    if (locationCounts.shadow > 0) {
      locationParts.push(`${locationCounts.shadow} dans shadow DOM`);
    }
    if (locationCounts.iframe > 0) {
      locationParts.push(`${locationCounts.iframe} dans les iframes`);
    }
    const locationSummary =
      locationParts.length > 1 ? ` (${locationParts.join(', ')})` : '';

    message =
      `${total} élément(s) avec un focus non natif${locationSummary}.\n` +
      'Vérifier que leur indicateur de focus a un contraste d’au moins 3:1 ' +
      'avec les couleurs adjacentes (critère 3.3).';

    if (noIndicatorCount > 0) {
      message += `\n⚠️ ${noIndicatorCount} élément(s) dont l’outline est supprimé sans autre style de focus : focus probablement invisible (voir aussi le critère 10.7).`;
    }
    if (onlyInactiveCount > 0) {
      message += `\n${onlyInactiveCount} élément(s) concerné(s) uniquement par des règles @media inactives à cette taille de fenêtre.`;
    }
  }

  // Mise en évidence : mentionnée dans l'alerte seulement, le message étant
  // repris tel quel en conclusion de la console
  let highlightSummary = '';
  if (boxes.length > 0) {
    highlightSummary =
      `\n\n${boxes.length} élément(s) encadré(s) sur la page, numérotés comme dans la console ` +
      '(bleu : focus non natif ; rouge : focus probablement invisible ; ' +
      'pointillés : règles @media inactives).';
  }
  if (hiddenCount > 0) {
    highlightSummary += `\n${hiddenCount} élément(s) masqué(s) ou sans dimensions, non encadré(s).`;
  }

  alert(
    `${message}${highlightSummary}\n\n${analysisParts.join('\n')}\nPlus de détails dans la console.`
  );

  // Détails dans la console
  console.group('🔎 Éléments avec un focus non natif (critère 3.3)');
  console.log('ℹ️ ' + analysisParts.join(' '));

  orderedResults.forEach((result, index) => {
    const icon = result.noIndicator ? '⚠️' : '🎯';
    console.group(
      `${icon} n°${index + 1} ${describe(result.element)} (${result.rootName})`
    );
    console.log(result.element);

    if (result.hidden) {
      console.log(
        'ℹ️ Élément masqué ou sans dimensions : il n’est pas encadré sur la page.'
      );
    }

    if (result.noIndicator) {
      console.warn(
        'Outline supprimé sans autre style de focus : le focus est probablement invisible (voir aussi le critère 10.7).'
      );
    }

    result.records.forEach((record) => {
      const details = [`Source : ${record.source}`];
      if (record.atRules.length) {
        details.push(`Dans : ${record.atRules.join(' > ')}`);
      }
      if (!record.active) {
        details.push('Règle inactive à cette taille de fenêtre');
      }
      if (record.pseudoElements.length) {
        details.push(
          `Indicateur porté par le pseudo-élément ${record.pseudoElements.join(', ')}`
        );
      }

      console.log(
        `${KIND_LABELS[record.kind]} : ${record.selectors.join(', ')} { ${record.declarations} }\n` +
          details.map((detail) => ` • ${detail}`).join('\n')
      );
    });

    console.groupEnd();
  });

  if (inaccessibleSheets.length > 0) {
    console.group(
      `⚠️ ${inaccessibleSheets.length} feuille(s) de style non analysable(s) (origine différente)`
    );
    inaccessibleSheets.forEach((sheet) =>
      console.log(`${sheet.href} (${sheet.name})`)
    );
    console.groupEnd();
  }

  if (inaccessibleIframes.length > 0) {
    console.group(
      `⚠️ ${inaccessibleIframes.length} iframe(s) non analysable(s) (origine différente)`
    );
    inaccessibleIframes.forEach((frame) => console.log(frame));
    console.groupEnd();
  }

  if (invalidSelectors.length > 0) {
    console.group(
      `ℹ️ ${invalidSelectors.length} sélecteur(s) non évaluable(s) par ce navigateur`
    );
    invalidSelectors.forEach((selector) => console.log(selector));
    console.groupEnd();
  }

  console.log('----------------------------------');

  if (total === 0) {
    console.log(`✅ ${message}`);
  } else {
    console.warn(`⚠️ ${message}`);
  }

  console.log(
    'ℹ️ Rappel : les styles de focus ajoutés par JavaScript (classe posée à l’événement focus, par exemple) ne sont pas détectés, seules les feuilles de style et les attributs style sont analysés. Les feuilles d’une autre origine ne peuvent pas être lues.'
  );

  console.groupEnd();
})();
