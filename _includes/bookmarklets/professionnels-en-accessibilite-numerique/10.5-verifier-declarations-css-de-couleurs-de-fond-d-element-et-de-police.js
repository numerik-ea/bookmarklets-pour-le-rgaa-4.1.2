(function () {
  // Couleurs de test appliquées aux éléments en échec
  const TEST_BACKGROUND_COLOR = `blue`;
  const TEST_TEXT_COLOR = `yellow`;

  // Contours de repérage, une couleur par test
  const OUTLINE_10_5_1 = `3px dashed red`;
  const OUTLINE_10_5_2 = `3px dashed blue`;
  const OUTLINE_10_5_3 = `3px dashed magenta`;

  const HTML_NAMESPACE = document.documentElement.namespaceURI;
  const EXCLUDED_TAGS = [
    `SCRIPT`,
    `STYLE`,
    `NOSCRIPT`,
    `TEMPLATE`,
    `TITLE`,
    `HEAD`,
    `META`,
    `LINK`,
    `BASE`,
  ];

  // Récupère récursivement tous les shadow roots
  function getAllShadowRoots(root = document) {
    const shadowRoots = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.shadowRoot) {
        shadowRoots.push(node.shadowRoot);
        shadowRoots.push(...getAllShadowRoots(node.shadowRoot));
      }
    }
    return shadowRoots;
  }

  function querySelectorAllInAllRoots(selector) {
    const allRoots = [document, ...getAllShadowRoots()];
    const allElements = [];
    allRoots.forEach((root) => {
      allElements.push(...Array.from(root.querySelectorAll(selector)));
    });
    return allElements;
  }

  // Remonte au parent en traversant les frontières de shadow DOM
  function getParentElement(element) {
    const parent = element.parentNode;
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

  // Un élément est susceptible de contenir du texte s'il a au moins
  // un noeud texte enfant direct non vide
  function hasDirectText(element) {
    return Array.from(element.childNodes).some(
      (node) =>
        node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ``
    );
  }

  // Les éléments non rendus sont exclus de l'analyse
  function isRendered(element) {
    if (typeof element.checkVisibility === `function`) {
      return element.checkVisibility({
        visibilityProperty: true,
        checkVisibilityCSS: true,
      });
    }
    // La valeur calculée de visibility est héritée : tester l'élément suffit
    const style = window.getComputedStyle(element);
    if (style.visibility === `hidden` || style.visibility === `collapse`) {
      return false;
    }
    // display n'est pas hérité : remonter la chaîne des ancêtres
    let node = element;
    while (node) {
      if (window.getComputedStyle(node).display === `none`) {
        return false;
      }
      node = getParentElement(node);
    }
    return true;
  }

  // Décompose une valeur calculée de couleur en composantes rgba
  function parseColor(value) {
    if (!value) {
      return null;
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === `transparent`) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    const match = normalized.match(/^rgba?\(([^)]+)\)$/);
    if (!match) {
      return null;
    }
    const parts = match[1]
      .split(/[,\s\/]+/)
      .filter((part) => part !== ``)
      .map((part) => parseFloat(part));
    if (parts.length < 3) {
      return null;
    }
    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: parts.length > 3 ? parts[3] : 1,
    };
  }

  function getAlpha(value) {
    const color = parseColor(value);
    return color === null ? 1 : color.a;
  }

  function isSameColor(firstValue, secondValue) {
    const first = parseColor(firstValue);
    const second = parseColor(secondValue);
    if (first === null || second === null) {
      return firstValue === secondValue;
    }
    return (
      first.r === second.r &&
      first.g === second.g &&
      first.b === second.b &&
      first.a === second.a
    );
  }

  // Les couleurs par défaut du navigateur sont lues dans une iframe vierge,
  // afin de ne pas coder en dur des valeurs propres à un navigateur.
  // Certaines balises ont une couleur de police et/ou de fond par défaut
  // qui ne constitue pas une déclaration CSS d'auteur : mark, button, input...
  function createDefaultColorResolver() {
    const cache = {};
    let iframe = null;
    let probeDocument = null;

    try {
      iframe = document.createElement(`iframe`);
      iframe.setAttribute(`aria-hidden`, `true`);
      iframe.setAttribute(`tabindex`, `-1`);
      iframe.style.cssText = `position:absolute;top:0;left:0;width:0;height:0;border:0;visibility:hidden;`;
      (document.body || document.documentElement).appendChild(iframe);
      probeDocument = iframe.contentDocument;
      if (probeDocument && probeDocument.documentElement) {
        // Reproduire le color-scheme de la page pour obtenir les bonnes valeurs par défaut
        const colorScheme = window.getComputedStyle(
          document.documentElement
        ).colorScheme;
        if (colorScheme) {
          probeDocument.documentElement.style.colorScheme = colorScheme;
        }
      }
    } catch (error) {
      probeDocument = null;
    }

    function fallbackDefaults(isLink) {
      return {
        color: isLink ? `rgb(0, 0, 238)` : `rgb(0, 0, 0)`,
        backgroundColor: `rgba(0, 0, 0, 0)`,
      };
    }

    function get(element) {
      const tagName = element.tagName.toLowerCase();
      const isLink = tagName === `a` && element.hasAttribute(`href`);
      const type = element.getAttribute(`type`);
      let key = tagName;
      if (isLink) {
        key = `a[href]`;
      } else if (type) {
        key = tagName + `[type=` + type.toLowerCase() + `]`;
      }
      if (Object.prototype.hasOwnProperty.call(cache, key)) {
        return cache[key];
      }

      let defaults = fallbackDefaults(isLink);
      if (probeDocument && probeDocument.body) {
        try {
          const probe = probeDocument.createElement(tagName);
          if (isLink) {
            probe.setAttribute(`href`, `#`);
          }
          if (type) {
            probe.setAttribute(`type`, type);
          }
          probe.appendChild(probeDocument.createTextNode(`a`));
          probeDocument.body.appendChild(probe);
          const probeStyle = iframe.contentWindow.getComputedStyle(probe);
          defaults = {
            color: probeStyle.color,
            backgroundColor: probeStyle.backgroundColor,
          };
          probeDocument.body.removeChild(probe);
        } catch (error) {
          defaults = fallbackDefaults(isLink);
        }
      }
      cache[key] = defaults;
      return defaults;
    }

    function destroy() {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }

    return { get: get, destroy: destroy };
  }

  const defaultColors = createDefaultColorResolver();

  // La couleur de police vient-elle d'une déclaration d'auteur, sur l'élément
  // lui-même ou héritée d'un parent ?
  // color étant une propriété héritée, comparer la valeur calculée à la valeur
  // par défaut de la balise ne suffit pas : un span placé dans un lien hérite
  // du bleu par défaut du navigateur sans qu'aucune déclaration ne l'ait posé.
  // On remonte donc la chaîne pour trouver l'élément qui a réellement changé la
  // couleur, et on vérifie que ce changement n'est pas celui du navigateur.
  const authorTextColorCache = new WeakMap();

  function hasDeclaredTextColor(element) {
    const chain = [];
    let node = element;
    let inheritedResult = null;

    while (node) {
      if (authorTextColorCache.has(node)) {
        inheritedResult = authorTextColorCache.get(node);
        break;
      }
      chain.push(node);
      node = getParentElement(node);
    }

    for (let index = chain.length - 1; index >= 0; index--) {
      const current = chain[index];
      const computedColor = window.getComputedStyle(current).color;
      const parent = getParentElement(current);
      let result;

      if (!parent) {
        result = !isSameColor(computedColor, defaultColors.get(current).color);
      } else if (
        isSameColor(computedColor, window.getComputedStyle(parent).color)
      ) {
        // Valeur héritée telle quelle : l'origine est celle du parent
        result = inheritedResult === null ? false : inheritedResult;
      } else {
        // L'élément change la couleur : déclaration d'auteur, sauf si la valeur
        // est exactement celle que le navigateur applique à cette balise
        result = !isSameColor(computedColor, defaultColors.get(current).color);
      }

      authorTextColorCache.set(current, result);
      inheritedResult = result;
    }

    return inheritedResult === null ? false : inheritedResult;
  }

  // La couleur de fond est-elle déclarée, hors couleur de fond par défaut du navigateur ?
  function hasDeclaredBackgroundColor(element) {
    const computedBackgroundColor =
      window.getComputedStyle(element).backgroundColor;
    if (getAlpha(computedBackgroundColor) === 0) {
      return false;
    }
    return !isSameColor(
      computedBackgroundColor,
      defaultColors.get(element).backgroundColor
    );
  }

  // Une couleur de fond opaque est-elle présente sur l'élément ou un de ses ancêtres ?
  function findBackgroundColorSource(element) {
    let node = element;
    while (node) {
      if (getAlpha(window.getComputedStyle(node).backgroundColor) > 0) {
        return node;
      }
      node = getParentElement(node);
    }
    return null;
  }

  function hasBackgroundImage(element) {
    const backgroundImage = window.getComputedStyle(element).backgroundImage;
    return Boolean(backgroundImage) && backgroundImage.includes(`url(`);
  }

  // Phase 1 : analyse, sans aucune modification de la page
  const analysedElements = querySelectorAllInAllRoots(`*`).filter(
    (element) =>
      element.namespaceURI === HTML_NAMESPACE &&
      !EXCLUDED_TAGS.includes(element.tagName) &&
      hasDirectText(element) &&
      isRendered(element)
  );

  const failures1051 = [];
  const failures1052 = [];
  const failures1053 = [];

  analysedElements.forEach((element) => {
    const style = window.getComputedStyle(element);
    const declaredTextColor = hasDeclaredTextColor(element);
    const declaredBackgroundColor = hasDeclaredBackgroundColor(element);
    const backgroundColorSource = findBackgroundColorSource(element);

    // 10.5.1 : couleur de police déclarée sans couleur de fond, même héritée d'un parent
    if (declaredTextColor && backgroundColorSource === null) {
      failures1051.push({
        element: element,
        details:
          `color : ` +
          style.color +
          ` / aucun background-color sur l'élément ni sur ses ancêtres`,
      });
    }

    // 10.5.2 : couleur de fond déclarée sans couleur de police
    if (declaredBackgroundColor && !declaredTextColor) {
      failures1052.push({
        element: element,
        details:
          `background-color : ` +
          style.backgroundColor +
          ` / color à la valeur par défaut du navigateur (` +
          style.color +
          `)`,
      });
    }

    // 10.5.3 : image de fond sans couleur de fond, même héritée d'un parent
    if (hasBackgroundImage(element) && backgroundColorSource === null) {
      failures1053.push({
        element: element,
        details:
          `background-image : ` +
          style.backgroundImage +
          ` / aucun background-color sur l'élément ni sur ses ancêtres`,
      });
    }
  });

  defaultColors.destroy();

  function countMessage(count, testLabel) {
    if (count === 0) {
      return `Aucun élément en échec sur le test ` + testLabel;
    }
    if (count === 1) {
      return `1 élément en échec sur le test ` + testLabel;
    }
    return count + ` éléments en échec sur le test ` + testLabel;
  }

  const analysedMessage =
    analysedElements.length +
    (analysedElements.length === 1
      ? ` élément susceptible de contenir du texte analysé`
      : ` éléments susceptibles de contenir du texte analysés`) +
    ` (les éléments non rendus, display:none et visibility:hidden, sont exclus)`;

  const total = failures1051.length + failures1052.length + failures1053.length;

  console.clear();

  if (total === 0) {
    const message = `Aucun élément en échec sur les tests 10.5.1, 10.5.2 et 10.5.3.`;
    console.log(message);
    console.log(analysedMessage + `.`);
    alert(message + `\n\n` + analysedMessage + `.`);
    return;
  }

  // Phase 2 : application des couleurs de test sur les éléments en échec
  failures1051.forEach((failure) => {
    failure.element.style.setProperty(
      `background-color`,
      TEST_BACKGROUND_COLOR,
      `important`
    );
    failure.element.style.setProperty(`outline`, OUTLINE_10_5_1, `important`);
    failure.element.style.setProperty(`outline-offset`, `2px`, `important`);
  });

  failures1052.forEach((failure) => {
    failure.element.style.setProperty(`color`, TEST_TEXT_COLOR, `important`);
    failure.element.style.setProperty(`outline`, OUTLINE_10_5_2, `important`);
    failure.element.style.setProperty(`outline-offset`, `2px`, `important`);
  });

  failures1053.forEach((failure) => {
    failure.element.style.setProperty(`background-image`, `none`, `important`);
    failure.element.style.setProperty(`outline`, OUTLINE_10_5_3, `important`);
    failure.element.style.setProperty(`outline-offset`, `2px`, `important`);
  });

  function logFailures(failures, testLabel, reason) {
    if (failures.length === 0) {
      console.log(countMessage(failures.length, testLabel) + `.`);
      return;
    }
    console.log(
      countMessage(failures.length, testLabel) + ` (` + reason + `) :`
    );
    failures.forEach((failure) => {
      console.log(failure.element, failure.details);
    });
  }

  logFailures(
    failures1051,
    `10.5.1`,
    `couleur de police déclarée sans couleur de fond`
  );
  logFailures(
    failures1052,
    `10.5.2`,
    `couleur de fond déclarée sans couleur de police`
  );
  logFailures(failures1053, `10.5.3`, `image de fond sans couleur de fond`);
  console.log(analysedMessage + `.`);

  let legend = ``;
  if (failures1051.length > 0) {
    legend +=
      `\n - 10.5.1 : contour rouge, fond forcé en ` + TEST_BACKGROUND_COLOR;
  }
  if (failures1052.length > 0) {
    legend += `\n - 10.5.2 : contour bleu, police forcée en ` + TEST_TEXT_COLOR;
  }
  if (failures1053.length > 0) {
    legend += `\n - 10.5.3 : contour magenta, image de fond retirée`;
  }

  alert(
    countMessage(failures1051.length, `10.5.1`) +
      `.\n` +
      countMessage(failures1052.length, `10.5.2`) +
      `.\n` +
      countMessage(failures1053.length, `10.5.3`) +
      `.\n\nLes éléments en échec sont modifiés :` +
      legend +
      `\n\n` +
      analysedMessage +
      `.\n\nPlus de détails dans la console.`
  );
})();
