(function () {
    // Avertissement : si plusieurs attributs sur le même élément, seul le dernier déclaré est révélé

    // Équivalent des variables CSS
    const msgBgColor = '#f2ce09';
    const borderColor = 'red';

    // Éléments HTML obsolètes à vérifier
    const deprecatedElements = [
        'basefont', 'blink', 'big', 'center', 'font', 'marquee',
        's', 'strike', 'tt', 'u'
    ];

    // Attributs obsolètes à vérifier
    const deprecatedAttributes = [
        'align', 'alink', 'background', 'basefont', 'bgcolor', 'border',
        'color', 'link', 'text', 'vlink', 'cellpadding', 'cellspacing'
    ];

    // Éléments qui peuvent légitimement avoir des attributs width/height
    const allowedWidthHeightElements = ['img', 'svg', 'canvas', 'embed', 'object', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'];

    // Fonction pour ajouter des indicateurs visuels
    function addVisualIndicator(element, message) {
        element.style.border = `3px solid ${borderColor}`;
        element.style.outline = `3px solid ${borderColor}`;

        // Créer l'élément d'étiquette
        const label = document.createElement('span');
        label.textContent = message;
        label.style.backgroundColor = msgBgColor;
        label.style.position = 'absolute';
        label.style.zIndex = '9999';
        label.style.padding = '2px 4px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.border = '1px solid #000';
        label.style.pointerEvents = 'none';

        // Positionner l'étiquette près de l'élément
        const rect = element.getBoundingClientRect();
        label.style.left = rect.left + 'px';
        label.style.top = (rect.top - 20) + 'px';

        document.body.appendChild(label);
    }

    // Vérifier les éléments obsolètes
    deprecatedElements.forEach(tagName => {
        const elements = document.getElementsByTagName(tagName);
        Array.from(elements).forEach(element => {
            addVisualIndicator(element, `<${tagName}>`);
        });
    });

    // Vérifier les attributs obsolètes
    deprecatedAttributes.forEach(attr => {
        const elements = document.querySelectorAll(`[${attr}]`);
        Array.from(elements).forEach(element => {
            addVisualIndicator(element, `[attr:${attr}]`);
        });
    });

    // Vérifier les attributs width/height sur les éléments non autorisés
    const widthElements = document.querySelectorAll('[width]');
    const heightElements = document.querySelectorAll('[height]');

    // Vérifier les attributs width
    Array.from(widthElements).forEach(element => {
        if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
            addVisualIndicator(element, '[attr:width]');
        }
    });

    // Vérifier les attributs height
    Array.from(heightElements).forEach(element => {
        if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
            addVisualIndicator(element, '[attr:height]');
        }
    });

    // Vérifier les éléments avec width et height
    const bothElements = document.querySelectorAll('[width][height]');
    Array.from(bothElements).forEach(element => {
        if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
            addVisualIndicator(element, '[attr:height & width]');
        }
    });

    // Résumé
    let summary = '== RGAA 10.1 - Dépistage des balises et attributs de présentation ==\n\n';

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

    if (invalidWidthCount > 0) {
        summary += `Attributs [width] invalides : ${invalidWidthCount}\n`;
    }

    if (invalidHeightCount > 0) {
        summary += `Attributs [height] invalides : ${invalidHeightCount}\n`;
    }

    alert(summary + '\n\n' + 'Voir la console pour plus de détails');

    console.clear();
    console.log(summary);

    // Log des éléments correspondants après le résumé
    console.log('=== Détail des éléments correspondants ===');

    // Vérifier les éléments obsolètes
    deprecatedElements.forEach(tagName => {
        const elements = document.getElementsByTagName(tagName);
        Array.from(elements).forEach(element => {
            console.log(`Règle correspondante : <${tagName}>`);
            console.log(element);
        });
    });

    // Vérifier les attributs obsolètes
    deprecatedAttributes.forEach(attr => {
        const elements = document.querySelectorAll(`[${attr}]`);
        Array.from(elements).forEach(element => {
            console.log(`Règle correspondante : [attr:${attr}]`);
            console.log(element);
        });
    });

    // Vérifier les attributs width/height sur les éléments non autorisés
    // Vérifier les attributs width
    Array.from(widthElements).forEach(element => {
        if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
            console.log(`Règle correspondante : [attr:width] sur un élément non-média`);
            console.log(element);
        }
    });

    // Vérifier les attributs height
    Array.from(heightElements).forEach(element => {
        if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
            console.log(`Règle correspondante : [attr:height] sur un élément non-média`);
            console.log(element);
        }
    });

    // Vérifier les éléments avec width et height
    Array.from(bothElements).forEach(element => {
        if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
            console.log(`Règle correspondante : [attr:height] et [attr:width] sur un élément non-média`);
            console.log(element);
        }
    });
})();
