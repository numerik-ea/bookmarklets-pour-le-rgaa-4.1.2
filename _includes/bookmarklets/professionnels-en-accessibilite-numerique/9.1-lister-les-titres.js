(function listHeadings() {
  // Vidée dès le lancement, avant même le test sur l'absence de titre :
  // sinon l'arbre d'un lancement précédent resterait affiché sur une page
  // qui n'a aucun titre, et pourrait être pris pour le sien
  console.clear();

  // Niveau d'un titre : aria-level prime sur la balise (c'est une propriété
  // prise en charge par le role heading), puis le chiffre de la balise hN,
  // puis 2, valeur par défaut d'un role=heading sans aria-level
  function getHeadingLevel(element) {
    const ariaLevel = parseInt(element.getAttribute('aria-level'), 10);
    if (ariaLevel > 0) {
      return ariaLevel;
    }

    if (/^H[1-6]$/.test(element.tagName)) {
      return parseInt(element.tagName.substring(1), 10);
    }

    return 2;
  }

  // Un seul querySelectorAll : les titres HTML et ARIA sont ainsi renvoyés
  // dans l'ordre du document, celui dans lequel la hiérarchie se vérifie
  const allHeadings = Array.from(
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]')
  ).map((element) => ({ level: getHeadingLevel(element), element }));

  if (!allHeadings.length) {
    alert('Aucun titre trouvé sur cette page.');
    return;
  }

  // Un saut de niveau ne constitue pas en soi une non-conformité : le
  // critère 9.1 demande une hiérarchie logique, pas une suite de niveaux
  // contigus. Les avertissements sont donc désactivés par défaut et
  // proposés à la demande, annuler la question revenant à s'en passer.
  const showWarnings = confirm(
    'Afficher les avertissements de hiérarchie dans l’arbre des titres ?' +
      '\n\nOK : signaler les sauts de niveau et un premier titre qui n’est ' +
      'pas un H1.' +
      '\nAnnuler : afficher l’arbre seul (comportement par défaut).' +
      '\n\nCes avertissements sont des points à examiner, pas des ' +
      'non-conformités : le critère 9.1 demande une hiérarchie logique, ' +
      'qui peut sauter un niveau sans cesser de l’être.'
  );

  const list = allHeadings
    .map((h) => `H${h.level}: ${h.element.textContent.trim()}`)
    .join('\n');

  alert(list);

  // Arbre des titres dans la console, à la manière de l'extension
  // HeadingsMap : un cran d'indentation par niveau
  console.group(`Arbre des titres (${allHeadings.length})`);

  let previousLevel = 0;

  allHeadings.forEach((h, index) => {
    // Une espace littérale répétée : le générateur de bookmarklets réduit
    // toute suite d'espaces à une seule, une indentation écrite en dur
    // dans la chaîne ne survivrait pas à la minification
    const indent = ' '.repeat(3 * (h.level - 1));
    let warning = '';

    if (showWarnings) {
      if (index === 0 && h.level !== 1) {
        warning = ' ⚠️ le premier titre de la page n’est pas un H1';
      } else if (h.level > previousLevel + 1) {
        warning = ` ⚠️ saut de niveau (H${previousLevel} → H${h.level})`;
      }
    }

    console.log(
      `${indent}H${h.level} ${h.element.textContent.trim()}${warning}`,
      h.element
    );

    previousLevel = h.level;
  });

  console.groupEnd();
})();
