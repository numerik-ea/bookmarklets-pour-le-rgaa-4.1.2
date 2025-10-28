// prettier-ignore
(function () {
  var id = 'a11y-deprecated-presentation-tags-and-attributes-highlighter';
  var el = document.getElementById(id);

  if (el) {
    el.remove();
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
    [color],
    [link],
    [text],
    [vlink],
    [cellpadding],
    [cellspacing],
    :not(img,svg,canvas,embed,object)[width],
    :not(img,svg,canvas,embed,object)[height],
    :not(img,svg,canvas,embed,object)[width][height] {
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
    }`;

    var s = document.createElement('style');
    s.id = id;
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
    alert('Mise en évidence des balises et attributs dépréciés : ACTIVÉE');
  }
})();
