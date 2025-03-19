(function checkHeaderNavMainFooter() {
    let message = "";

    document.querySelector('header') ? message += '<header> trouvé\n' : message += '<header> non trouvé\n';
    document.querySelector('nav') ? message += '<nav> trouvé\n' : message += '<nav> non trouvé\n';
    document.querySelector('main') ? message += '<main> trouvé\n' : message += '<main> non trouvé\n';
    document.querySelector('footer') ? message += '<footer> trouvé\n' : message += '<footer> non trouvé\n';

    alert(message + "\nVoir la console pour plus de détails.");

    document.querySelectorAll(
        'header, nav, main, footer'
    ).forEach(
        element => console.log(element)
    );
})();