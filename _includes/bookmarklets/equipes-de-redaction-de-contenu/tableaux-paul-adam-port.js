(function() {
    var BASE_STYLE = 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;';
    var LITERAL = 'speak:literal-punctuation;';
    var STYLE_LABEL = BASE_STYLE + 'margin:0 2px; padding:2px;' + LITERAL;
    var STYLE_LABELLEDBY = BASE_STYLE + 'outline:orange 2px dashed;margin:0 2px; padding:2px;' + LITERAL;
    var STYLE_INLINE = BASE_STYLE + LITERAL;
    var STYLE_OPEN = 'padding:1px;' + BASE_STYLE + 'z-index:2147483647;' + LITERAL;
    var STYLE_INPUT = 'padding:1px;' + BASE_STYLE + 'outline:orange 2px dashed;z-index:2147483647;' + LITERAL;

    function getAllShadowRoots(root) {
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

    var roots = [document].concat(getAllShadowRoots(document));

    function all(selector) {
        return roots.reduce(function(elements, root) {
            return elements.concat(Array.prototype.slice.call(root.querySelectorAll(selector)));
        }, []);
    }

    function attr(el, name) {
        return el.getAttribute(name);
    }

    function span(className, style, text) {
        var el = document.createElement('span');
        el.className = className;
        el.setAttribute('style', style);
        el.textContent = text;
        return el;
    }

    function label(text) {
        return span('closeSpan', STYLE_LABEL, text);
    }

    all('span.openSpan, span.closeSpan, span.inputSpan').forEach(function(el) {
        el.remove();
    });

    all('table, [role=grid]').forEach(function(el) {
        el.setAttribute('style', 'outline:2px solid olive;');
    });

    all('caption').forEach(function(el) {
        el.setAttribute('style', 'outline:green 2px solid;padding:2px;');
        el.prepend(span('openSpan', STYLE_OPEN, '<caption>🎓'));
        el.append(span('closeSpan', STYLE_INLINE, '</caption>'));
    });

    all('th').forEach(function(el) {
        var scope = attr(el, 'scope');
        var headers = attr(el, 'headers');
        var id = attr(el, 'id');
        var role = attr(el, 'role');

        el.setAttribute('style', 'outline:green 2px solid;padding:2px;');

        if (scope) {
            var mark = scope === 'row' ? '🚣' : scope === 'col' ? '👇' : '';
            if (mark) {
                var suffix = id ? ' id="' + id + '"' : role ? ' ♿role="' + role + '"' : '';
                el.prepend(label('<th♿scope="' + scope + '"' + mark + suffix + '>'));
            }
        } else if (headers) {
            el.prepend(label('<th♿headers="' + headers + '"' + (id ? ' id="' + id + '"' : '') + '>'));
        } else if (id) {
            el.prepend(label('<th id="' + id + '">♿'));
        } else if (role) {
            el.prepend(label('<th♿role="' + role + '">'));
        } else {
            el.prepend(label('<th>♿'));
        }
    });

    all('td').forEach(function(el) {
        var headers = attr(el, 'headers');
        var role = attr(el, 'role');

        el.setAttribute('style', 'outline:orange 2px dashed;padding:2px;');

        if (headers) {
            el.prepend(label('<td♿headers="' + headers + '"' + (role ? '♿role="' + role + '"' : '') + '>'));
        } else if (role) {
            el.prepend(label('<td♿role="' + role + '">'));
        } else {
            el.prepend(label('<td>'));
        }
    });

    all('table').forEach(function(el) {
        var summary = attr(el, 'summary');
        var ariaLabel = attr(el, 'aria-label');
        var labelledby = attr(el, 'aria-labelledby');

        if (summary) {
            el.before(label('<table♿summary="' + summary + '">'));
        } else if (ariaLabel) {
            el.before(label('<table♿aria-label="' + ariaLabel + '">'));
        } else if (labelledby) {
            el.before(span('closeSpan', STYLE_LABELLEDBY, '<table♿aria-labelledby="' + labelledby + '">'));
            labelledby.split(' ').forEach(function(id) {
                el.getRootNode().querySelectorAll('[id="' + CSS.escape(id) + '"]').forEach(function(target) {
                    target.setAttribute('style', 'outline:orange 2px dashed;');
                    target.prepend(span('inputSpan', STYLE_INPUT, 'id="' + id + '"'));
                });
            });
        } else if (attr(el, 'role') === 'presentation') {
            el.before(label('<table♿role="presentation">'));
        } else {
            el.before(label('<table>'));
        }
    });

    all('[role=grid]').forEach(function(el) {
        var role = attr(el, 'role');
        var readonly = attr(el, 'aria-readonly');
        var labelledby = attr(el, 'aria-labelledby');
        var ariaLabel = attr(el, 'aria-label');

        if (readonly) {
            el.before(label('♿role="' + role + '"♿aria-readonly="' + readonly + '"'));
        } else if (labelledby && readonly) {
            el.before(label('♿role="' + role + '"♿aria-labelledby="' + labelledby + '"♿aria-readonly="' + readonly + '"'));
        } else if (ariaLabel && readonly) {
            el.before(label('♿role="' + role + '"♿aria-label="' + ariaLabel + '"♿aria-readonly="' + readonly + '"'));
        } else {
            el.before(label('♿role="' + role + '"'));
        }
    });

    all('tr[role]').forEach(function(el) {
        el.before(label('<tr♿role="' + attr(el, 'role') + '">'));
    });

    all('td[headers], th[headers]').forEach(function(el) {
        attr(el, 'headers').split(' ').forEach(function(id) {
            if (!el.getRootNode().getElementById(id)) {
                el.setAttribute('style', 'outline:red 2px dotted;padding:2px;');
                el.append(span('closeSpan', STYLE_INLINE, '❌NO ID MATCH'));
            }
        });
    });

    if (!all('table').length) {
        var failure = document.createElement('strong');
        failure.setAttribute('style', 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;margin:0 2px; padding:2px;');
        failure.id = 'failure';
        failure.setAttribute('role', 'status');
        failure.textContent = 'No Tables Found on Page: ' + document.title;
        document.body.prepend(failure);
        setTimeout(function() { failure.remove(); }, 6000);
    } else {
        var success = document.createElement('div');
        success.id = 'success';
        success.setAttribute('role', 'alert');
        success.setAttribute('style', 'position:absolute; width:0; height:0; clip: rect(0,0,0,0);');
        success.textContent = 'Success! Tables Found on Page: ' + document.title;
        document.body.append(success);
        setTimeout(function() { success.remove(); }, 3000);
    }

    all("script[src$='tables.js']").forEach(function(el) {
        el.remove();
    });
})();
