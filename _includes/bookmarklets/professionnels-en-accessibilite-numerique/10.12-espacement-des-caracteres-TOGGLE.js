// prettier-ignore
(function () {
  var id = 'a11y-text-spacing-style';
  var el = document.getElementById(id);

  if (el) {
    el.remove();
    alert('Espacement des caractères désactivé');
  } else {
    var css = `html body * {
            line-height: 1.5 !important;
            letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important;
        }
        
        html body p {
            margin-bottom: 2em !important;
        }`;

    var s = document.createElement('style');
    s.id = id;
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
    alert('Espacement des caractères activé');
  }
})();
