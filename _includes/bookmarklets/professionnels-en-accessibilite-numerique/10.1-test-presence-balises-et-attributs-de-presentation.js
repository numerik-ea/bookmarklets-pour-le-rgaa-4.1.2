 (function () {
     // Avertissement : si plusieurs attributs sur le même élément, seul le dernier déclaré est révélé
 
     // Vérifier le DOCTYPE pour l'élément <u>
     const isHTML5 = document.doctype && document.doctype.name === 'html';
 
     // Éléments HTML obsolètes à vérifier (selon RGAA 4.1.2)
     const deprecatedElements = [
         'basefont', 'blink', 'big', 'center', 'font', 'marquee',
         's', 'strike', 'tt'
     ];
 
     // Ajouter <u> seulement si pas HTML5
     if (!isHTML5) {
         deprecatedElements.push('u');
     }
 
     // Attributs obsolètes à vérifier (selon RGAA 4.1.2)
     const deprecatedAttributes = [
         'align', 'alink', 'background', 'bgcolor', 'border',
         'cellpadding', 'cellspacing', 'char', 'charoff', 'clear',
         'compact', 'color', 'frameborder', 'hspace', 'link',
         'marginheight', 'marginwidth', 'text', 'valign', 'vlink', 'vspace'
     ];
 
     // Éléments qui peuvent légitimement avoir des attributs width/height
     const allowedWidthHeightElements = ['img', 'svg', 'canvas', 'embed', 'object', 'rect'];
 
     // Éléments qui peuvent légitimement avoir l'attribut size
     const allowedSizeElements = ['select'];
 
     // Vérifier les attributs width/height sur les éléments non autorisés
     const widthElements = document.querySelectorAll('[width]');
     const heightElements = document.querySelectorAll('[height]');
 
     // Vérifier les éléments avec width et height
     const bothElements = document.querySelectorAll('[width][height]');
 
     // Vérifier l'attribut size sur les éléments non autorisés
     const sizeElements = document.querySelectorAll('[size]');
 
     const style = document.createElement("style");
     style.textContent = `
     /** disclaimer : si plusieurs attributs sur même élément : seul le dernier déclaré est révélé **/
 
 :root {
   --msg-bgcolor: #f2ce09;
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
 ${!isHTML5 ? 'u,' : ''}
 [align],
 [alink],
 [background],
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
 :not(img, svg, canvas, embed, object, rect)[width],
 :not(img, svg, canvas, embed, object, rect)[height], 
 :not(img, svg, canvas, embed, object, rect)[width][height],
 :not(select)[size] {
     border: 3px solid var(--border-color);
     outline: 3px solid var(--border-color); 
 }
 
 
 basefont::before {
     content: "<basefont>";
     background-color: var(--msg-bgcolor);
 }
 
 blink::before {
     content: "<blink>";
     background-color: var(--msg-bgcolor);
 }
 big::before {
     content: "<big>";
     background-color: var(--msg-bgcolor);
 }
 
 center::before {
     content: "<center>";
     background-color: var(--msg-bgcolor);
 }
 
 font::before {
     content: "<font>";
     background-color: var(--msg-bgcolor);
 }
 
 marquee::before {
     content: "<marquee>";
     background-color: var(--msg-bgcolor);
 }
 
 s::before {
     content: "<s>";
     background-color: var(--msg-bgcolor);
 }
 
 strike::before {
     content: "<strike>";
     background-color: var(--msg-bgcolor);
 }
 
 tt::before {
     content: "<tt>";
     background-color: var(--msg-bgcolor);
 }
 
 ${!isHTML5 ? `
 u::before {
     content: "<u>";
     background-color: var(--msg-bgcolor);
 }
 ` : ''}
 
 [align]::before {
     content: "[attr:align]";
     background-color: var(--msg-bgcolor);
 }
 
 [alink]::before {
     content: "[attr:alink]";
     background-color: var(--msg-bgcolor);
 }
 
 [background]::before {
     content: "[attr:background]";
     background-color: var(--msg-bgcolor);
 }
 
 [bgcolor]::before {
     content: "[attr:bgcolor]";
     background-color: var(--msg-bgcolor);
 }
 
 [border]::before {
     content: "[attr:border]";
     background-color: var(--msg-bgcolor);
 }
 
 [cellpadding]::before {
     content: "[attr:cellpadding]";
     background-color: var(--msg-bgcolor);
 }
 
 [cellspacing]::before {
     content: "[attr:cellspacing]";
     background-color: var(--msg-bgcolor);
 }
 
 [char]::before {
     content: "[attr:char]";
     background-color: var(--msg-bgcolor);
 }
 
 [charoff]::before {
     content: "[attr:charoff]";
     background-color: var(--msg-bgcolor);
 }
 
 [clear]::before {
     content: "[attr:clear]";
     background-color: var(--msg-bgcolor);
 }
 
 [compact]::before {
     content: "[attr:compact]";
     background-color: var(--msg-bgcolor);
 }
 
 [color]::before {
     content: "[attr:color]";
     background-color: var(--msg-bgcolor);
 }
 
 [frameborder]::before {
     content: "[attr:frameborder]";
     background-color: var(--msg-bgcolor);
 }
 
 [hspace]::before {
     content: "[attr:hspace]";
     background-color: var(--msg-bgcolor);
 }
 
 [link]::before {
     content: "[attr:link]";
     background-color: var(--msg-bgcolor);
 }
 
 [marginheight]::before {
     content: "[attr:marginheight]";
     background-color: var(--msg-bgcolor);
 }
 
 [marginwidth]::before {
     content: "[attr:marginwidth]";
     background-color: var(--msg-bgcolor);
 }
 
 [text]::before {
     content: "[attr:text]";
     background-color: var(--msg-bgcolor);
 }
 
 [valign]::before {
     content: "[attr:valign]";
     background-color: var(--msg-bgcolor);
 }
 
 [vlink]::before {
     content: "[attr:vlink]";
     background-color: var(--msg-bgcolor);
 }
 
 [vspace]::before {
     content: "[attr:vspace]";
     background-color: var(--msg-bgcolor);
 }
 
 :not(img, svg, canvas, embed, object, rect)[width]::before {
     content: "[attr:width]";
     background-color: var(--msg-bgcolor);
 }
 
 :not(img, svg, canvas, embed, object, rect)[height]::before {
     content: "[attr:height]";
     background-color: var(--msg-bgcolor);
 }
 
 :not(img, svg, canvas, embed, object, rect)[width][height]::before {
     content: "[attr:height & width]";
     background-color: var(--msg-bgcolor);
 }
 
 :not(select)[size]::before {
     content: "[attr:size]";
     background-color: var(--msg-bgcolor);
 }
     `;
     document.head.appendChild(style);

         // Résumé
     let summary = '== RGAA 10.1 - Dépistage des balises et attributs de présentation ==\n\n';
 
     // Ajouter information sur le DOCTYPE
     summary += `DOCTYPE détecté : ${isHTML5 ? 'HTML5' : 'Non HTML5'}\n\n`;
 
     deprecatedElements.forEach(tagName => {
         const count = document.getElementsByTagName(tagName).length;
         if (count > 0) {
             summary += `Éléments <${tagName}> : ${count}\n`;
         }
     });
 
     deprecatedAttributes.forEach(attr => {
         const count = document.querySelectorAll(`[${attr}]`).length;
         if (count > 0) {
             summary += `Attributs [${attr}] : ${count}\n`;
         }
     });
 
     const invalidWidthCount = Array.from(widthElements).filter(el =>
         !allowedWidthHeightElements.includes(el.tagName.toLowerCase())
     ).length;
 
     const invalidHeightCount = Array.from(heightElements).filter(el =>
         !allowedWidthHeightElements.includes(el.tagName.toLowerCase())
     ).length;
 
     const invalidSizeCount = Array.from(sizeElements).filter(el =>
         !allowedSizeElements.includes(el.tagName.toLowerCase())
     ).length;
 
     if (invalidWidthCount > 0) {
         summary += `Attributs [width] invalides : ${invalidWidthCount}\n`;
     }
 
     if (invalidHeightCount > 0) {
         summary += `Attributs [height] invalides : ${invalidHeightCount}\n`;
     }
 
     if (invalidSizeCount > 0) {
         summary += `Attributs [size] invalides : ${invalidSizeCount}\n`;
     }
 
     alert(summary + '\n' + 'Voir la console pour plus de détails');
 
     console.clear();
     console.log(summary);
 
     // Log des éléments correspondants après le résumé
     console.log('=== Détail des éléments correspondants ===');
 
     // Vérifier les éléments obsolètes
     deprecatedElements.forEach(tagName => {
         const elements = document.getElementsByTagName(tagName);
         Array.from(elements).forEach(element => {
             console.log(`${tagName}::before { content: "<${tagName}>"; }`);
             console.log(element);
         });
     });
 
     // Vérifier les attributs obsolètes
     deprecatedAttributes.forEach(attr => {
         const elements = document.querySelectorAll(`[${attr}]`);
         Array.from(elements).forEach(element => {
             console.log(`[${attr}]::before { content: "[attr:${attr}]"; }`);
             console.log(element);
         });
     });
 
     // Vérifier les attributs width/height sur les éléments non autorisés
     // Vérifier les attributs width (seulement ceux qui n'ont PAS height)
     Array.from(widthElements).forEach(element => {
         if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase()) && !element.hasAttribute('height')) {
             console.log(`:not(img, svg, canvas, embed, object, rect)[width]::before { content: "[attr:width]"; }`);
             console.log(element);
         }
     });
 
     // Vérifier les attributs height (seulement ceux qui n'ont PAS width)
     Array.from(heightElements).forEach(element => {
         if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase()) && !element.hasAttribute('width')) {
             console.log(`:not(img, svg, canvas, embed, object, rect)[height]::before { content: "[attr:height]"; }`);
             console.log(element);
         }
     });
 
     // Vérifier les éléments avec width et height
     Array.from(bothElements).forEach(element => {
         if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
             console.log(`:not(img, svg, canvas, embed, object, rect)[width][height]::before { content: "[attr:height & width]"; }`);
             console.log(element);
         }
     });
 
     // Vérifier l'attribut size sur les éléments non autorisés
     Array.from(sizeElements).forEach(element => {
         if (!allowedSizeElements.includes(element.tagName.toLowerCase())) {
             console.log(`:not(select)[size]::before { content: "[attr:size]"; }`);
             console.log(element);
         }
     });
})();
