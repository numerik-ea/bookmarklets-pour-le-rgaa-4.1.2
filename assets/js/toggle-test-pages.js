// Chaque bookmarklet expose ses pages de test derrière un bouton replié par
// défaut : la liste des bookmarklets reste lisible d'un coup d'œil.
// Délégation d'événement : les <li> sont réordonnés par le tri, mais jamais
// recréés, donc un seul écouteur sur la liste suffit.
document.addEventListener('DOMContentLoaded', function () {
    const bookmarkletsList = document.querySelector('.bookmarklets-list');

    if (!bookmarkletsList) return;

    bookmarkletsList.addEventListener('click', function (event) {
        const toggle = event.target.closest('.test-pages-toggle');

        if (!toggle || !bookmarkletsList.contains(toggle)) return;

        const testPagesList = document.getElementById(
            toggle.getAttribute('aria-controls')
        );

        if (!testPagesList) return;

        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        toggle.setAttribute('aria-expanded', String(!isExpanded));
        testPagesList.hidden = isExpanded;
    });
});
