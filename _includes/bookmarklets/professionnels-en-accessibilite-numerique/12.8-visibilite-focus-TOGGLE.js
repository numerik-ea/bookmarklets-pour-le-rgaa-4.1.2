// prettier-ignore
(function () {
  var id = 'a11y-focus-style';
  var el = document.getElementById(id);
  if (el) {
    el.remove();
  } else {
    var css = `*:focus{outline:2px solid red !important;outline-offset:2px !important;background:yellow !important;}`;
    var s = document.createElement('style');
    s.id = id;
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }
})();
