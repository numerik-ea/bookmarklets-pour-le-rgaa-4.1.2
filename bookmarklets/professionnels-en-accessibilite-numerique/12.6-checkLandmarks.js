(function checkLandmarks() {
    let message = '';

    const mapRoleThatMustBeUniqueToTagName = {
        'banner': 'header',
        'main': 'main',
        'contentinfo': 'footer',
    };

    function checkRoleThatMustBeUnique(role) {
        let elements = document.querySelectorAll(`[role='${role}']`);
        const tagName = mapRoleThatMustBeUniqueToTagName[role];

        if (elements.length === 0) {
            message += `Aucun élément avec role='${role}'.\n`;

            elements = document.querySelectorAll(tagName);

            if (elements.length === 0) {
                message += `Aucun élément <${tagName}> trouvé.\n`;
            } else if (elements.length > 1) {
                message += `Plusieurs éléments <${tagName}> trouvés.\n`;
                message += `Identifier le bon élément et ajouter l'attribut role='${role}' à celui-ci.\n`;
            } else {
                message += `Un élément <${tagName}> trouvé.\n`;
                message += `Vérifier que c'est bien le bon élément et lui ajouter l'attribut role='${role}'.\n`;
            }
        } else if (elements.length > 1) {
            message += `12.6 NC : [role='${role}'] trouvé mais plusieurs éléments avec ce rôle :\n`;

            elements.forEach(element => {
                message += `<${element.tagName.toLowerCase()} role='${role}'>\n`;
            });

            message += `Le rôle WAI-ARIA ${role} doit être unique dans la page\n`;
        } else {
            message += `Un élément avec role='${role}' trouvé :`;
            message += `<${elements[0].tagName.toLowerCase()} role='${role}'>\n`;
        }
    }

    checkRoleThatMustBeUnique('banner', message);
    message += '\n';

    const roleSearchElements = document.querySelectorAll(`[role='search']`);

    if (roleSearchElements.length === 0) {
        message += `Aucun élément avec role='search'.\n`;
    } else if (roleSearchElements.length > 1) {
        message += `Plusieurs éléments avec role='search' trouvés.\n`;

        roleSearchElements.forEach(element => {
            message += `<${element.tagName.toLowerCase()} role='search'>\n`;
        });  

        message += `Identifier le bon élément et ajouter l'attribut role='search' à celui-ci.\n`;
        message += `Le moteur de recherche doit permettre d'effectuer des recherches sur les contenus de l'ensemble du site.\n`;
    } else {
        message += `Un élément avec role='search' trouvé :`;
        message += `<${roleSearchElements[0].tagName.toLowerCase()} role='search'>\n`;
    }

    message += '\n';

    const roleNavigationElements = document.querySelectorAll(`[role='navigation']`);

    if (roleNavigationElements.length === 0) {
        message += `Aucun élément avec role='navigation'.\n`;

        const tagName = 'nav';
        const navElements = document.querySelectorAll(tagName);

        if (navElements.length === 0) {
            message += `Aucun élément <${tagName}> trouvé.\n`;
        } else if (navElements.length > 1) {
            message += `Plusieurs éléments <${tagName}> trouvés.\n`;
            message += `Identifier les bons éléments et ajouter l'attribut role='${role}' à ceux-ci.\n`;
        } else {
            message += `Un élément <${tagName}> trouvé.\n`;
            message += `Vérifier que c'est bien le bon élément et lui ajouter l'attribut role='${role}'.\n`;
        }
    } else if (roleNavigationElements.length > 1) {
        message += `Plusieurs éléments avec role='navigation' trouvés.\n`;

        roleNavigationElements.forEach(element => {
            message += `<${element.tagName.toLowerCase()} role='navigation'>\n`;
        });

        message += `Identifier le bon élément et ajouter l'attribut role='navigation' à celui-ci.\n`;
    } else {
        message += `Un élément avec role='navigation' trouvé :`;
        message += `<${roleNavigationElements[0].tagName.toLowerCase()} role='navigation'>\n`;
    }

    message += '\n';

    checkRoleThatMustBeUnique('main', message);
    message += '\n';

    checkRoleThatMustBeUnique('contentinfo', message);
    message += '\n';

    alert(message + 'Voir la console pour plus de détails.');

    document.querySelectorAll([
        `[role='banner']`,
        `[role='search']`, 
        `[role='navigation']`,
        `[role='main']`,
        `[role='contentinfo']`,
    ].join(',')).forEach(
        element => console.log(element)
    );
})();