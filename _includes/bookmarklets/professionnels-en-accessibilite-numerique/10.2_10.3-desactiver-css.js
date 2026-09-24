(function disableCss() {
  // Vidée dès le lancement, pour que la console ne mélange pas cette
  // désactivation à la sortie d'un bookmarklet lancé précédemment
  console.clear();

  // Retrait des feuilles de styles : c'est le link ou le style qui porte
  // la feuille qui est retiré du document
  Array.from(document.styleSheets).forEach((style) => {
    const node = style.ownerNode;
    node.parentNode.removeChild(node);
  });

  // Retrait des styles en ligne, que le retrait des feuilles laisserait
  // sinon en place
  document.querySelectorAll('[style]').forEach((el) => {
    el.removeAttribute('style');
  });

  alert('Les feuilles de styles CSS ont été désactivées');
})();
