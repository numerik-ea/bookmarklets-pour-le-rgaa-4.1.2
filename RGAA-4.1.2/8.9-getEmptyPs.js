(function getEmptyPs() {
    // Select all <p> elements in the document
    const paragraphs = document.querySelectorAll('p');
    const emptyPs = [];

    // Iterate over the selected elements
    paragraphs.forEach(p => {
        // Check if the content is exactly &nbsp;
        const content = p.innerHTML.trim();

        if (content === '&nbsp;' || content == '') {
            emptyPs.push(p);
        }
    });

    const countEmptyPs = emptyPs.length;

    if (countEmptyPs === 0) {
        alert("Pas de paragraphes vides");
        return;
    }

    let message = countEmptyPs + " paragraphes vides";

    if (countEmptyPs === 1) {
        message = message.replace('vides', 'vide');
    }

    alert(message);
    emptyPs.forEach(p => console.log(p));
})();


