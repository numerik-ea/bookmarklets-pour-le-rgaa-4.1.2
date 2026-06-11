(function () {
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

  // Un pseudo-élément n'est généré que si sa propriété content a une valeur
  // autre que none ou normal.
  function hasGeneratedContent(value) {
    return value && value !== 'none' && value !== 'normal';
  }

  // Le contenu est considéré vide quand il s'agit d'une chaîne de caractères
  // vide ("" ou '').
  function isEmptyContent(value) {
    return value === '""' || value === "''";
  }

  function findPseudoElements() {
    const allElements = querySelectorAllInAllRoots('*');
    const results = [];

    allElements.forEach((el) => {
      ['::before', '::after'].forEach((pseudo) => {
        const content = window
          .getComputedStyle(el, pseudo)
          .getPropertyValue('content');

        if (hasGeneratedContent(content)) {
          results.push({
            element: el,
            pseudo: pseudo,
            content: content,
            empty: isEmptyContent(content),
          });
        }
      });
    });

    return results;
  }

  const results = findPseudoElements();

  if (results.length === 0) {
    alert('Aucun pseudo-élément ::before ou ::after avec une propriété content.');
    return;
  }

  const emptyCount = results.filter((r) => r.empty).length;
  const filledCount = results.length - emptyCount;

  let message = `${results.length} pseudo-élément(s) ::before / ::after avec une propriété content`;
  message += `\n- ${filledCount} avec un contenu rempli (bleu)`;
  message += `\n- ${emptyCount} avec un contenu vide (orange)`;

  alert(message + '.\nPlus de détails dans la console.');
  console.clear();
  console.log(message + ' :');

  results.forEach((result) => {
    const { element, pseudo, content, empty } = result;

    element.style.outline = empty ? '2px dashed #B45309' : '2px solid blue';
    element.style.outlineOffset = '2px';

    console.log(
      `%c${pseudo}%c content: ${content} ${empty ? '(vide)' : '(rempli)'}`,
      `font-weight: bold; color: ${empty ? '#B45309' : 'blue'};`,
      'font-weight: normal;',
      element
    );
  });
})();
