(function () {
    const imagesWithAlt = document.querySelectorAll(`img[alt]`);

    if (imagesWithAlt.length === 0) {
        alert('Aucune image avec un alt.');
        return;
    }

    let message = 'Il y a ' + imagesWithAlt.length + ' images avec un alt.';

    if (imagesWithAlt.length === 1) {
        message = message.replace('images', 'image');
    }

    alert(message + '.\nVoir la console pour plus de détails.');
    console.clear();
    console.log(message + ' :');

    imagesWithAlt.forEach(image => {       
        console.log(image.alt);
    });
})();
