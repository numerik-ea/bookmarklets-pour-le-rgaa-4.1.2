// prettier-ignore
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

  // Function to find style element by ID in a root
  function findStyleElement(root, id) {
    if (root === document) {
      return document.getElementById(id);
    } else {
      // For shadow roots, use querySelector
      return root.querySelector('style#' + id);
    }
  }

  // Function to inject styles into a root
  function injectStyles(root, cssText, id) {
    const style = document.createElement('style');
    style.id = id;
    style.appendChild(document.createTextNode(cssText));
    if (root === document) {
      root.head.appendChild(style);
    } else {
      // For shadow roots, append to the shadow root itself
      root.appendChild(style);
    }
  }

  // Function to remove styles from a root
  function removeStyles(root, id) {
    const el = findStyleElement(root, id);
    if (el) {
      el.remove();
      return true;
    }
    return false;
  }

  var id = 'a11y-deprecated-presentation-tags-and-attributes-highlighter';
  var el = document.getElementById(id);
  var shadowRoots = getAllShadowRoots();
  var hasShadowStyles = shadowRoots.some(root => findStyleElement(root, id));

  if (el || hasShadowStyles) {
    // Remove from document
    if (el) {
      el.remove();
    }
    // Remove from all shadow roots (check again in case new ones were created)
    getAllShadowRoots().forEach(root => {
      removeStyles(root, id);
    });
    alert('Mise en évidence des balises et attributs dépréciés : DÉSACTIVÉE');
  } else {
    var css = `/** disclaimer : si plusieurs attributs sur même élément : seul le dernier déclaré est révélé **/
    :root {
        --msg-bgcolor: #e8ff1e;
        --border-color: red;
    }
    
    * {
        box-sizing: border-box;
    }
    
    basefont,
    blink,
    big,
    center,
    font,
    marquee,
    s,
    strike,
    tt,
    u,
    [align],
    [alink],
    [background],
    [basefont],
    [bgcolor],
    [border],
    [cellpadding],
    [cellspacing],
    [char],
    [charoff],
    [clear],
    [compact],
    [color],
    [frameborder],
    [hspace],
    [link],
    [marginheight],
    [marginwidth],
    [text],
    [valign],
    [vlink],
    [vspace],
    :not(img,svg,canvas,embed,object,rect,source)[width],
    :not(img,svg,canvas,embed,object,rect,source)[height],
    :not(img,svg,canvas,embed,object,rect,source)[width][height],
    :not(select)[size] {
        border: 3px solid var(--border-color);
        outline: 3px solid var(--border-color);
    }
    
    basefont::before {
        content: '<basefont>';
        background-color: var(--msg-bgcolor);
    }
    
    blink::before {
        content: '<blink>';
        background-color: var(--msg-bgcolor);
    }
    
    big::before {
        content: '<big>';
        background-color: var(--msg-bgcolor);
    }
    
    center::before {
        content: '<center>';
        background-color: var(--msg-bgcolor);
    }
    
    font::before {
        content: '<font>';
        background-color: var(--msg-bgcolor);
    }
    
    marquee::before {
        content: '<marquee>';
        background-color: var(--msg-bgcolor);
    }
    
    s::before {
        content: '<s>';
        background-color: var(--msg-bgcolor);
    }
    
    strike::before {
        content: '<strike>';
        background-color: var(--msg-bgcolor);
    }
    
    tt::before {
        content: '<tt>';
        background-color: var(--msg-bgcolor);
    }
    
    u::before {
        content: '<u>';
        background-color: var(--msg-bgcolor);
    }
    
    [align]::before {
        content: '[attr:align]';
        background-color: var(--msg-bgcolor);
    }
    
    [alink]::before {
        content: '[attr:alink]';
        background-color: var(--msg-bgcolor);
    }
    
    [background]::before {
        content: '[attr:background]';
        background-color: var(--msg-bgcolor);
    }
    
    [basefont]::before {
        content: '[attr:basefont]';
        background-color: var(--msg-bgcolor);
    }
    
    [bgcolor]::before {
        content: '[attr:bgcolor]';
        background-color: var(--msg-bgcolor);
    }
    
    [border]::before {
        content: '[attr:border]';
        background-color: var(--msg-bgcolor);
    }
    
    [color]::before {
        content: '[attr:color]';
        background-color: var(--msg-bgcolor);
    }
    
    [link]::before {
        content: '[attr:link]';
        background-color: var(--msg-bgcolor);
    }
    
    [text]::before {
        content: '[attr:text]';
        background-color: var(--msg-bgcolor);
    }
    
    [vlink]::before {
        content: '[attr:vlink]';
        background-color: var(--msg-bgcolor);
    }
    
    [cellpadding]::before {
        content: '[attr:cellpadding]';
        background-color: var(--msg-bgcolor);
    }
    
    [cellspacing]::before {
        content: '[attr:cellspacing]';
        background-color: var(--msg-bgcolor);
    }
    
    [char]::before {
        content: '[attr:char]';
        background-color: var(--msg-bgcolor);
    }
    
    [charoff]::before {
        content: '[attr:charoff]';
        background-color: var(--msg-bgcolor);
    }
    
    [clear]::before {
        content: '[attr:clear]';
        background-color: var(--msg-bgcolor);
    }
    
    [compact]::before {
        content: '[attr:compact]';
        background-color: var(--msg-bgcolor);
    }
    
    [frameborder]::before {
        content: '[attr:frameborder]';
        background-color: var(--msg-bgcolor);
    }
    
    [hspace]::before {
        content: '[attr:hspace]';
        background-color: var(--msg-bgcolor);
    }
    
    [marginheight]::before {
        content: '[attr:marginheight]';
        background-color: var(--msg-bgcolor);
    }
    
    [marginwidth]::before {
        content: '[attr:marginwidth]';
        background-color: var(--msg-bgcolor);
    }
    
    [valign]::before {
        content: '[attr:valign]';
        background-color: var(--msg-bgcolor);
    }
    
    [vspace]::before {
        content: '[attr:vspace]';
        background-color: var(--msg-bgcolor);
    }
    
    :not(img,svg,canvas,embed,object,rect,source)[width]::before {
        content: '[attr:width]';
        background-color: var(--msg-bgcolor);
    }
    
    :not(img,svg,canvas,embed,object,rect,source)[height]::before {
        content: '[attr:height]';
        background-color: var(--msg-bgcolor);
    }
    
    :not(img,svg,canvas,embed,object,rect,source)[width][height]::before {
        content: '[attr:height & width]';
        background-color: var(--msg-bgcolor);
    }
    
    :not(select)[size]::before {
        content: '[attr:size]';
        background-color: var(--msg-bgcolor);
    }`;

    // Inject styles into document
    injectStyles(document, css, id);
    
    // Inject styles into all shadow roots (check again in case new ones were created)
    getAllShadowRoots().forEach(root => {
      injectStyles(root, css, id);
    });
    
    alert('Mise en évidence des balises et attributs dépréciés : ACTIVÉE');
  }
})();
