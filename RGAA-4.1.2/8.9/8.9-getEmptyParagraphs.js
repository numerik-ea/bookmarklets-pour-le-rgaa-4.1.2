(function getEmptyParagraphs() {
    // Select all <p> elements in the document
    const paragraphs = document.querySelectorAll('p');
    const emptyParagraphs = [];

    // Iterate over the selected elements
    paragraphs.forEach(p => {
        // Check if the content is exactly &nbsp;
        let content = p.innerHTML;

        content = content.replaceAll('&nbsp;', '');
        content = content.trim();

        if (content === '') {
            emptyParagraphs.push(p);
        }
    });

    const countEmptyParagraphs = emptyParagraphs.length;

    if (countEmptyParagraphs === 0) {
        alert("Pas de paragraphes vides");
        return;
    }

    let message = countEmptyParagraphs + " paragraphes vides";

    if (countEmptyParagraphs === 1) {
        message = message.replace('vides', 'vide');
    }

    alert(message);
    emptyParagraphs.forEach(p => {
        p.style.border = "1px solid yellow";
        p.style.outline = "1px solid blue";
        p.style.outlineOffset = "2px";
        p.style.background = "red";
        p.style.backgroundColor = "red";
        
        console.log(p)
    });
})();


