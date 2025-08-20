(function () {
    // Détecter tous les éléments SVG
    const allSvgElements = document.querySelectorAll('svg');
    const svgWithoutAriaHidden = [];
    const svgWithAriaHiddenFalse = [];

    // Analyser chaque élément SVG
    allSvgElements.forEach(svg => {
        if (!svg.hasAttribute('aria-hidden')) {
            // SVG sans aria-hidden
            svgWithoutAriaHidden.push(svg);
        } else {
            const ariaHiddenValue = svg.getAttribute('aria-hidden');

            if (ariaHiddenValue === 'true') {
                // SVG avec aria-hidden="true"
                return;
            }
            
            if (ariaHiddenValue === 'false') {
                // SVG avec aria-hidden="false"
                svgWithAriaHiddenFalse.push(svg);
            } else {
                // SVG avec aria-hidden avec une valeur invalide
                svgWithoutAriaHidden.push(svg);
            }
        }
    });

    // Créer les styles CSS pour mettre en évidence les SVG sans aria-hidden="true"
    const style = document.createElement("style");
    style.textContent = `
        :root {
            --svg-warning-bg: #ff6b6b;
            --svg-warning-border: #e74c3c;
            --svg-warning-outline: #c0392b;
        }

        svg:not([aria-hidden="true"]) {
            border: 3px solid var(--svg-warning-border) !important;
            outline: 3px solid var(--svg-warning-outline) !important;
            outline-offset: 2px !important;
            background-color: var(--svg-warning-bg) !important;
            position: relative !important;
        }

        svg:not([aria-hidden="true"])::before {
            content: "SVG sans aria-hidden='true'" !important;
            position: absolute !important;
            top: -25px !important;
            left: 0 !important;
            background-color: var(--svg-warning-bg) !important;
            color: white !important;
            padding: 2px 6px !important;
            font-size: 12px !important;
            font-weight: bold !important;
            z-index: 10000 !important;
            border: 1px solid var(--svg-warning-border) !important;
            white-space: nowrap !important;
        }
    `;
    document.head.appendChild(style);

    // Compter les éléments
    const totalSvg = allSvgElements.length;
    const svgWithoutAriaHiddenCount = svgWithoutAriaHidden.length;
    const svgWithAriaHiddenFalseCount = svgWithAriaHiddenFalse.length;

    // Préparer le message
    let message = `Détection des éléments SVG sans aria-hidden="true"\n\n`;
    message += `Total des éléments SVG : ${totalSvg}\n`;
    message += `SVG sans aria-hidden : ${svgWithoutAriaHiddenCount}\n`;
    message += `SVG avec aria-hidden="false" : ${svgWithAriaHiddenFalseCount}\n\n`;

    const totalSvgToCheck = svgWithoutAriaHiddenCount + svgWithAriaHiddenFalseCount;
    
    if (totalSvgToCheck === 0) {
        message += "✅ Tous les éléments SVG ont aria-hidden='true' ou sont correctement configurés.";
    } else {
        message += `⚠️ ${totalSvgToCheck} élément(s) SVG à vérifier détecté(s).\n`;
        message += "Ces éléments sont mis en évidence avec une bordure rouge et un fond rouge.\n";
        message += "Ouvrez la console pour voir la liste détaillée des SVG sans aria-hidden ou avec aria-hidden='false'.";
    }

    // Afficher l'alerte
    alert(message);

    // Log dans la console
    console.clear();
    console.log("=== Détection des éléments SVG sans aria-hidden='true' ===");
    console.log(`Total des éléments SVG : ${totalSvg}`);
    console.log(`SVG sans aria-hidden : ${svgWithoutAriaHiddenCount}`);
    console.log(`SVG avec aria-hidden="false" : ${svgWithAriaHiddenFalseCount}`);
    console.log("");

    // Log uniquement les SVG avec aria-hidden="false" ou sans aria-hidden
    const svgToLog = [...svgWithoutAriaHidden, ...svgWithAriaHiddenFalse];
    
    if (svgToLog.length > 0) {
        console.log("=== Éléments SVG à vérifier (sans aria-hidden ou avec aria-hidden='false') ===");
        svgToLog.forEach((svg, index) => {
            const hasAriaHidden = svg.hasAttribute('aria-hidden');

            if (hasAriaHidden) {
                const ariaHiddenValue = svg.getAttribute('aria-hidden');
                console.log(`${index + 1}. SVG avec aria-hidden="${ariaHiddenValue}" :`);
            } else {
                console.log(`${index + 1}. SVG sans aria-hidden :`);
            }
            console.log(svg);
            console.log("---");
        });
    } else {
        console.log("Aucun SVG sans aria-hidden='true' à vérifier.");
    }
})();
