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
        'FIGCAPTION', 'LEGEND', 'CAPTION',
        'TD', 'TH', 'DT', 'DD',
        'BLOCKQUOTE', 'Q'
    ];
    const semanticRoles = {
        'heading': ['1', '2', '3', '4', '5', '6']
    };
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

            // Check for semantic role="heading" and valid aria-level
            const role = parent.getAttribute && parent.getAttribute('role');
            
            if (role === 'heading') {
                const ariaLevel = parent.getAttribute('aria-level');
                
                if (semanticRoles.heading.includes(ariaLevel)) {
                    isInSemanticElement = true;
                    break;
                }
            }

            if (role === 'button') {
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

    // Function to check if an element or its parents are hidden
    function checkForHiddenParents(element) {
        const hiddenParents = [];
        let currentElement = element;

        while (currentElement && currentElement !== document.body && currentElement !== document.documentElement) {
            const computedStyle = window.getComputedStyle(currentElement);
            const isHidden = 
                computedStyle.display === 'none' ||
                computedStyle.visibility === 'hidden' ||
                computedStyle.opacity === '0' ||
                (computedStyle.height === '0px' && computedStyle.width === '0px') ||
                currentElement.getAttribute('aria-hidden') === 'true';

            if (isHidden) {
                hiddenParents.push({
                    element: currentElement,
                    reason: getHiddenReason(currentElement, computedStyle)
                });
            }

            currentElement = currentElement.parentElement;
        }

        return hiddenParents;
    }

    // Function to get the reason why an element is hidden
    function getHiddenReason(element, computedStyle) {
        const reasons = [];
        
        if (computedStyle.display === 'none') reasons.push('display: none');
        if (computedStyle.visibility === 'hidden') reasons.push('visibility: hidden');
        if (computedStyle.opacity === '0') reasons.push('opacity: 0');
        if (computedStyle.height === '0px' && computedStyle.width === '0px') reasons.push('height: 0 and width: 0');
        if (element.getAttribute('aria-hidden') === 'true') reasons.push('aria-hidden="true"');
        
        return reasons.join(', ');
    }

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

            // Check for hidden parents before logging the element
            const hiddenParents = checkForHiddenParents(parentElement);
            if (hiddenParents.length > 0) {
                console.log('⚠️ Texte dans une balise non sémantique ayant des parents cachés :');
                console.log(textNode);
                
                hiddenParents.forEach((hiddenParent, index) => {
                    console.log(`  Parent caché ${index + 1} :`, hiddenParent.element, `(Raison: ${hiddenParent.reason})`);
                });

                return;
            }
        }

        console.log(textNode);
    });
})();


