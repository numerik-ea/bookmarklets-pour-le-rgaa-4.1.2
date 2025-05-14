(function getEmptyParagraphs() {
    // Select all <p> elements in the document
    const paragraphs = document.querySelectorAll('p');
    const emptyParagraphs = [];

    // Iterate over the selected elements
    paragraphs.forEach(p => {
        let content = p.innerHTML;
        let hasOnlyBrOrNbsp = true;

        // Check if all child nodes are either BR or text nodes containing only &nbsp;
        for (let node of p.childNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.nodeName !== 'BR') {
                    hasOnlyBrOrNbsp = false;
                    break;
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent.trim() !== '' && node.textContent.trim() !== '&nbsp;') {
                    hasOnlyBrOrNbsp = false;
                    break;
                }
            }
        }

        content = content.replaceAll('&nbsp;', '');
        content = content.trim();

        if (content === '' || hasOnlyBrOrNbsp) {
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
        p.style.paddingTop = '26px';
        p.style.display = 'block';
        
        // Create a label element to show text
        const label = document.createElement('div');
        label.textContent = 'Paragraphe vide';
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

        console.log(p);
    });
})();


