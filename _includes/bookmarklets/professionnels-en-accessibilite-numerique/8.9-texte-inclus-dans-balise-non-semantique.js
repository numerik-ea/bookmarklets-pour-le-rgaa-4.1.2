(function showTextInNonSemanticTags() {
    // Select all text nodes in the document
    const textNodes = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    const textNodesInNonSemanticTags = [];
    const semanticTags = [
        'P', 'LI', 'A', 'BUTTON', 'LABEL',
        'OPTION', 'TEXTAREA', 'INPUT',
        'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'FIGCAPTION'
    ];
    const tagsToIgnore = [
        'SCRIPT',
        'STYLE',
        'META',
        'LINK',
        'NOSCRIPT',
        'COMMENT'
    ];

    // Iterate over the selected text nodes
    textNodes.forEach(textNode => {
        let content = textNode.textContent;
        content = content.trim();

        if (content === '') {
            return; // Skip empty text nodes
        }

        // Check if the text node is within a semantic element
        let parent = textNode.parentElement;
        let isInSemanticElement = false;
        let isInIgnoredTag = false;

        while (parent) {
            if (semanticTags.includes(parent.tagName)) {
                isInSemanticElement = true;
                break;
            }

            if (tagsToIgnore.includes(parent.tagName)) {
                isInIgnoredTag = true;
                break;
            }

            parent = parent.parentElement;
        }

        if (!isInSemanticElement && !isInIgnoredTag) {
            textNodesInNonSemanticTags.push(textNode);
        }
    });

    const counttextNodesInNonSemanticTags = textNodesInNonSemanticTags.length;

    if (counttextNodesInNonSemanticTags === 0) {
        alert('Pas de texte dans des balises non sémantiques.');
        return;
    }

    let message = (
        counttextNodesInNonSemanticTags
        + ' textes dans des balises non sémantiques'
    );

    if (counttextNodesInNonSemanticTags === 1) {
        message = message.replace('textes dans des balises non sémantiques', 'texte dans une balise non sémantique');
    }

    alert(message + '.\nPlus de détails dans la console.');
    console.clear();
    console.log(message + ' :');

    textNodesInNonSemanticTags.forEach(textNode => {
        // Get the parent element to style it
        const parentElement = textNode.parentElement;
        if (parentElement) {
            parentElement.style.border = '2px solid red';
            parentElement.style.paddingTop = '26px';
            parentElement.style.display = 'block';

            // Create a label element to show text
            const label = document.createElement('div');
            label.textContent = 'texte non sémantique';
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
            const computedStyle = window.getComputedStyle(parentElement);

            if (computedStyle.position === 'static') {
                parentElement.style.position = 'relative';
            }

            parentElement.appendChild(label);
        }

        console.log(textNode);
    });
})();


