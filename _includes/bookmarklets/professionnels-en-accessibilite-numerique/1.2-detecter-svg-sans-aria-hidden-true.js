(function () {
  // Fonction pour trouver tous les SVG dans le DOM et le Shadow DOM
  function findAllSvgElements(root = document) {
    const svgElements = [];

    // Trouver tous les SVG dans le DOM actuel
    const svgs = root.querySelectorAll('svg');
    svgElements.push(...Array.from(svgs));

    // Trouver tous les éléments avec Shadow DOM
    const allElements = root.querySelectorAll('*');
    allElements.forEach((element) => {
      if (element.shadowRoot) {
        // Récursivement chercher dans le Shadow DOM
        const shadowSvgs = findAllSvgElements(element.shadowRoot);
        svgElements.push(...shadowSvgs);
      }
    });

    return svgElements;
  }

  // Fonction pour vérifier si un parent a aria-hidden="true"
  function hasParentWithAriaHiddenTrue(element) {
    let current = element;

    // Parcourir tous les parents jusqu'à la racine
    while (current) {
      // Vérifier le parent actuel
      const parent = current.parentElement;

      if (parent) {
        if (
          parent.hasAttribute('aria-hidden') &&
          parent.getAttribute('aria-hidden') === 'true'
        ) {
          return true;
        }
        current = parent;
      } else {
        // Plus de parent dans le DOM actuel, vérifier si on est dans un Shadow DOM
        const rootNode = current.getRootNode();
        if (rootNode && rootNode !== document && rootNode.host) {
          // On est dans un Shadow DOM, vérifier le host avant de continuer
          const host = rootNode.host;
          if (
            host.hasAttribute('aria-hidden') &&
            host.getAttribute('aria-hidden') === 'true'
          ) {
            return true;
          }
          // Passer au host et continuer dans le DOM parent
          // Continuer à vérifier les parents du host
          current = host;
        } else {
          // On a atteint la racine du document
          break;
        }
      }
    }

    return false;
  }

  // Détecter tous les éléments SVG (DOM + Shadow DOM)
  const allSvgElements = findAllSvgElements();
  const svgWithoutAriaHidden = [];
  const svgWithAriaHiddenFalse = [];

  // Analyser chaque élément SVG
  allSvgElements.forEach((svg) => {
    // Ignorer les SVG qui ont un parent avec aria-hidden="true"
    if (hasParentWithAriaHiddenTrue(svg)) {
      return;
    }

    if (!svg.hasAttribute('aria-hidden')) {
      // SVG sans aria-hidden
      svgWithoutAriaHidden.push(svg);
      highlightSvgElement(svg);
    } else {
      const ariaHiddenValue = svg.getAttribute('aria-hidden');

      if (ariaHiddenValue === 'true') {
        // SVG avec aria-hidden="true"
        return;
      }

      if (ariaHiddenValue === 'false') {
        // SVG avec aria-hidden="false"
        svgWithAriaHiddenFalse.push(svg);
        highlightSvgElement(svg);
      } else {
        // SVG avec aria-hidden avec une valeur invalide
        svgWithoutAriaHidden.push(svg);
        highlightSvgElement(svg);
      }
    }
  });

  // Fonction pour appliquer les styles directement aux éléments SVG
  // (nécessaire pour fonctionner avec Shadow DOM)
  function highlightSvgElement(svg) {
    svg.style.border = '3px solid #e74c3c';
    svg.style.outline = '3px solid #c0392b';
    svg.style.outlineOffset = '2px';
    svg.style.backgroundColor = '#ff6b6b';

    // Vérifier si le SVG a déjà un parent avec position relative/absolute
    const computedStyle = window.getComputedStyle(svg);
    if (computedStyle.position === 'static') {
      svg.style.position = 'relative';
    }

    // Créer un label pour afficher le message
    const label = document.createElement('div');
    label.textContent = "SVG sans aria-hidden='true'";
    label.style.position = 'absolute';
    label.style.top = '-25px';
    label.style.left = '0';
    label.style.backgroundColor = '#ff6b6b';
    label.style.color = 'white';
    label.style.padding = '2px 6px';
    label.style.fontSize = '12px';
    label.style.fontWeight = 'bold';
    label.style.zIndex = '10000';
    label.style.border = '1px solid #e74c3c';
    label.style.whiteSpace = 'nowrap';
    label.style.pointerEvents = 'none';

    // Ajouter le label au parent du SVG s'il existe et a une position non-static
    // Sinon, l'ajouter au SVG lui-même
    const parent = svg.parentElement;
    if (parent) {
      const parentComputedStyle = window.getComputedStyle(parent);
      if (parentComputedStyle.position !== 'static') {
        parent.appendChild(label);
      } else {
        svg.appendChild(label);
      }
    } else {
      svg.appendChild(label);
    }
  }

  // Compter les éléments
  const totalSvg = allSvgElements.length;
  const svgWithoutAriaHiddenCount = svgWithoutAriaHidden.length;
  const svgWithAriaHiddenFalseCount = svgWithAriaHiddenFalse.length;

  // Préparer le message
  let message = `Détection des éléments SVG sans aria-hidden="true"\n\n`;

  if (totalSvg === 0) {
    message += 'Aucun SVG trouvé.';
  } else {
    message += `Total des éléments SVG : ${totalSvg}\n`;
    message += `SVG sans aria-hidden : ${svgWithoutAriaHiddenCount}\n`;
    message += `SVG avec aria-hidden="false" : ${svgWithAriaHiddenFalseCount}\n\n`;

    const totalSvgToCheck =
      svgWithoutAriaHiddenCount + svgWithAriaHiddenFalseCount;

    if (totalSvgToCheck === 0) {
      message +=
        "✅ Tous les éléments SVG ont aria-hidden='true' ou sont correctement configurés.";
    } else {
      message += `⚠️ ${totalSvgToCheck} élément(s) SVG à vérifier détecté(s).\n`;
      message +=
        'Ces éléments sont mis en évidence avec une bordure rouge et un fond rouge.\n';
      message +=
        "Ouvrez la console pour voir la liste détaillée des SVG sans aria-hidden ou avec aria-hidden='false'.";
    }
  }

  // Afficher l'alerte
  alert(message);

  // Log dans la console
  console.clear();
  console.log("=== Détection des éléments SVG sans aria-hidden='true' ===");

  if (totalSvg === 0) {
    console.log('Aucun SVG trouvé.');
  } else {
    console.log(`Total des éléments SVG : ${totalSvg}`);
    console.log(`SVG sans aria-hidden : ${svgWithoutAriaHiddenCount}`);
    console.log(
      `SVG avec aria-hidden="false" : ${svgWithAriaHiddenFalseCount}`
    );
    console.log('');
  }

  // Log uniquement les SVG avec aria-hidden="false" ou sans aria-hidden
  const svgToLog = [...svgWithoutAriaHidden, ...svgWithAriaHiddenFalse];

  if (svgToLog.length > 0) {
    console.log(
      "=== Éléments SVG à vérifier (sans aria-hidden ou avec aria-hidden='false') ==="
    );
    svgToLog.forEach((svg, index) => {
      const hasAriaHidden = svg.hasAttribute('aria-hidden');

      if (hasAriaHidden) {
        const ariaHiddenValue = svg.getAttribute('aria-hidden');
        console.log(
          `${index + 1}. SVG avec aria-hidden="${ariaHiddenValue}" :`
        );
      } else {
        console.log(`${index + 1}. SVG sans aria-hidden :`);
      }
      console.log(svg);
      console.log('---');
    });
  } else {
    console.log("Aucun SVG sans aria-hidden='true' à vérifier.");
  }
})();
