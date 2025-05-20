(function () {
    const imagesWithAlt = document.querySelectorAll(`img[alt]:not([alt=''])`);

    if (imagesWithAlt.length === 0) {
        alert('Aucune image avec un alt rempli trouvée.');
        return;
    }

    let message = 'Il y a ' + imagesWithAlt.length + ' images avec un alt rempli.';

    if (imagesWithAlt.length === 1) {
        message = message.replace('images', 'image');
    }

    alert(message + '.\nVoir la console pour plus de détails.');
    console.clear();
    console.log(message + ' :');

    imagesWithAlt.forEach(image => {       
        console.log(image);
    });
})();
