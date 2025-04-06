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
        alert('Pas de paragraphes vides.');
        return;
    }

    let message = (
        countEmptyParagraphs
        + ' paragraphes vides'
    );

    if (countEmptyParagraphs === 1) {
        message = message.replace('paragraphes vides', 'paragraphe vide');
    }

    alert(message + '.\nPlus de détails dans la console.');
    console.clear();
    console.log(message + ' :');

    emptyParagraphs.forEach(p => {
        p.style.border = '2px solid red';
        
        // Create a label element to show text
        const label = document.createElement('div');
        label.textContent = 'paragraphe vide';
        label.style.position = 'absolute';
        label.style.top = '0';
        label.style.left = '0';
        label.style.backgroundColor = 'yellow';
        label.style.color = 'black';
        label.style.padding = '2px 5px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.zIndex = '10000';
        label.style.pointerEvents = 'none';
        
        // Make sure the element has position relative for absolute positioning to work
        const computedStyle = window.getComputedStyle(p);
        if (computedStyle.position === 'static') {
            p.style.position = 'relative';
        }
        
        p.appendChild(label);

        console.log(p)
    });
})();


