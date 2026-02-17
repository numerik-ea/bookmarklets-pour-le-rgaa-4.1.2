(function () {
  // Traversée récursive des Shadow DOM
  function getAllShadowRoots(root) {
    if (!root) root = document;
    var shadowRoots = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.shadowRoot) {
        shadowRoots.push(node.shadowRoot);
        shadowRoots.push.apply(shadowRoots, getAllShadowRoots(node.shadowRoot));
      }
    }
    return shadowRoots;
  }

  function querySelectorAllInAllRoots(selector) {
    var allRoots = [document.body].concat(getAllShadowRoots());
    var allElements = [];
    allRoots.forEach(function (root) {
      var elements = Array.prototype.slice.call(root.querySelectorAll(selector));
      allElements.push.apply(allElements, elements);
    });
    return allElements;
  }

  // Supprimer les vues précédentes et restaurer les tableaux cachés
  querySelectorAllInAllRoots('.table-structure-view').forEach(function (el) { el.remove(); });
  querySelectorAllInAllRoots('table[data-structure-hidden]').forEach(function (table) {
    table.style.display = '';
    table.removeAttribute('data-structure-hidden');
  });

  var tables = querySelectorAllInAllRoots('table');

  if (!tables.length) {
    alert('Aucun tableau trouvé sur la page.');
    return;
  }

  alert(tables.length + ' tableau(x) trouvé(s) sur la page.');

  var labelStyle = 'background-color:yellow;color:black;font-weight:bold;font-size:small;padding:1px 3px;font-family:sans-serif;speak:literal-punctuation;';

  function createLabel(text) {
    var strong = document.createElement('strong');
    strong.style.cssText = labelStyle;
    strong.textContent = text;
    return strong;
  }

  function createLine(indent) {
    var div = document.createElement('div');
    div.style.paddingLeft = (indent * 20) + 'px';
    div.style.minHeight = '20px';
    div.style.lineHeight = '20px';
    return div;
  }

  function addCellsLine(container, row, indent) {
    var line = createLine(indent);
    var cells = row.querySelectorAll(':scope > th, :scope > td');
    cells.forEach(function (cell, idx) {
      var cellTag = cell.tagName.toLowerCase();
      if (idx > 0) line.appendChild(document.createTextNode('  '));
      line.appendChild(createLabel('<' + cellTag + '>'));
      line.appendChild(document.createTextNode(cell.textContent));
      line.appendChild(createLabel('</' + cellTag + '>'));
    });
    container.appendChild(line);
  }

  function addRows(container, section, indent) {
    var rows = section.querySelectorAll(':scope > tr');
    rows.forEach(function (row) {
      var line = createLine(indent);
      line.appendChild(createLabel('<tr>'));
      container.appendChild(line);

      addCellsLine(container, row, indent + 1);

      var closeTr = createLine(indent);
      closeTr.appendChild(createLabel('</tr>'));
      container.appendChild(closeTr);
    });
  }

  tables.forEach(function (table) {
    var container = document.createElement('div');
    container.className = 'table-structure-view';
    container.style.cssText = 'outline:2px solid green;padding:8px;margin:10px 0;font-family:sans-serif;font-size:small;background:white;';

    // <table>
    var line = createLine(0);
    line.appendChild(createLabel('<table>'));
    container.appendChild(line);

    // <caption>
    var caption = table.querySelector(':scope > caption');
    if (caption) {
      line = createLine(1);
      line.appendChild(createLabel('<caption>'));
      line.appendChild(document.createTextNode(caption.textContent));
      line.appendChild(createLabel('</caption>'));
      container.appendChild(line);
    }

    // Parcourir les enfants directs du tableau
    var children = table.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var tag = child.tagName.toLowerCase();

      if (tag === 'caption' || tag === 'colgroup') continue;

      if (tag === 'thead' || tag === 'tbody' || tag === 'tfoot') {
        // Balise ouvrante de la section
        line = createLine(1);
        line.appendChild(createLabel('<' + tag + '>'));
        container.appendChild(line);

        // Lignes du tableau
        addRows(container, child, 2);

        // Balise fermante de la section
        line = createLine(1);
        line.appendChild(createLabel('</' + tag + '>'));
        container.appendChild(line);
      } else if (tag === 'tr') {
        // <tr> directement dans <table> (sans thead/tbody/tfoot)
        line = createLine(1);
        line.appendChild(createLabel('<tr>'));
        container.appendChild(line);

        addCellsLine(container, child, 2);

        line = createLine(1);
        line.appendChild(createLabel('</tr>'));
        container.appendChild(line);
      }
    }

    // </table>
    line = createLine(0);
    line.appendChild(createLabel('</table>'));
    container.appendChild(line);

    // Insérer la vue et masquer le tableau original
    table.parentNode.insertBefore(container, table);
    table.style.display = 'none';
    table.setAttribute('data-structure-hidden', '');
  });
})();
