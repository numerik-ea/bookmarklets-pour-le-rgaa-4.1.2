(function () {
    const elements = document.querySelectorAll('[lang]');

    if (elements.length === 0) {
        alert(
            `Aucun élément avec l'attribut lang trouvé :\n`
            + `8.3 NC, 8.4 NA\n\n`
            + `ATTENTION : Vérifier les potentiels changements de langue dans la page sans l'attribut lang.`
        );
        return;
    }

    if (elements.length === 1 && elements[0].tagName.toLowerCase() === 'html') {
        const lang = elements[0].getAttribute('lang');

        alert(
            `Langue par défaut de la page : <html lang="${lang}">\n\n`
            + `Aucun autre élément avec l'attribut lang trouvé.\n\n`
            + `Vérifier les potentiels changements de langue dans la page sans l'attribut lang.`
        );
        
        return;
    }

    alert(
        `${elements.length} éléments avec l'attribut lang trouvés.\n\n`
        + `ATTENTION : Vérifier les potentiels changements de langue dans la page sans l'attribut lang.\n\n`
        + `Voir la console pour plus de détails.`
    );
    
    console.clear();
    console.log(`${elements.length} éléments avec l'attribut lang trouvés :`);

    elements.forEach((el) => console.log(el));
})();