(function () {
  const STYLE_ID = 'bookmarklet-detecter-pseudo-elements';

  // Un second clic retire les bordures.
  const existant = document.getElementById(STYLE_ID);
  if (existant) {
    existant.remove();
    return;
  }

  // Seuls les pseudo-éléments réellement générés affichent une bordure :
  // les déclarations non rendues (éléments remplacés, masqués…) restent
  // invisibles, donc aucun faux positif.
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent =
    '*::before,\n*::after {\n  border: 2px red solid !important;\n}';
  document.head.appendChild(style);

  // Un pseudo-élément n'est généré que si content vaut autre chose que none
  // ou normal.
  function hasGeneratedContent(value) {
    return value && value !== 'none' && value !== 'normal';
  }

  // Éléments remplacés (img, input…) et de métadonnées (script, style…) qui ne
  // génèrent jamais de pseudo-élément, même si une règle CSS le déclare.
  const TAGS_SANS_PSEUDO = new Set([
    'IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BR', 'HR', 'EMBED', 'OBJECT',
    'IFRAME', 'VIDEO', 'AUDIO', 'CANVAS', 'PROGRESS', 'METER', 'AREA',
    'SOURCE', 'TRACK', 'WBR', 'SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD',
    'TITLE', 'BASE', 'NOSCRIPT', 'TEMPLATE',
  ]);

  // On ne liste que les éléments réellement bordés par la règle ci-dessus :
  // mêmes conditions de génération que le rendu CSS.
  function peutGenererUnPseudoElement(el) {
    if (TAGS_SANS_PSEUDO.has(el.tagName)) return false;
    if (el.namespaceURI !== 'http://www.w3.org/1999/xhtml') return false;
    if (el.getClientRects().length === 0) return false;
    return true;
  }

  // La règle est injectée dans le document : on se limite à ce périmètre
  // (le shadow DOM n'est pas affecté par ce <style>).
  const resultats = [];
  document.querySelectorAll('*').forEach((el) => {
    if (!peutGenererUnPseudoElement(el)) return;

    ['::before', '::after'].forEach((pseudo) => {
      const computed = window.getComputedStyle(el, pseudo);
      if (computed.getPropertyValue('display') === 'none') return;

      const content = computed.getPropertyValue('content');
      if (hasGeneratedContent(content)) {
        resultats.push({ element: el, pseudo: pseudo, content: content });
      }
    });
  });

  const message = `${resultats.length} pseudo-élément(s) ::before / ::after généré(s) et bordé(s)`;
  alert(message + '.\nPlus de détails dans la console.');

  console.clear();
  console.log(message + ' :');
  resultats.forEach(({ element, pseudo, content }) => {
    console.log(
      `%c${pseudo}%c content: ${content}`,
      'font-weight: bold; color: red;',
      'font-weight: normal;',
      element
    );
  });
})();
