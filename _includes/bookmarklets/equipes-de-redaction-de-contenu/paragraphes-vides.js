(function getEmptyParagraphs() {
    // Reset: remove labels and restore original content from previous runs
    document.querySelectorAll('[data-empty-paragraph-label]').forEach(label => {
        label.remove();
    });
    document.querySelectorAll('[data-empty-paragraph]').forEach(p => {
        p.style.border = '';
        p.style.position = '';
    });

    // Detect if an element is hidden (display:none, visibility:hidden, opacity:0, sr-only)
    function isHidden(el) {
        const style = window.getComputedStyle(el);

        if (style.display === 'none') return true;
        if (style.visibility === 'hidden') return true;
        if (parseFloat(style.opacity) === 0) return true;

        const hasClip = style.clip === 'rect(0px, 0px, 0px, 0px)' || style.clipPath === 'inset(50%)';
        const isTiny = (parseFloat(style.width) <= 1 && parseFloat(style.height) <= 1);
        const isHiddenOverflow = style.overflow === 'hidden';
        if (hasClip || (isTiny && isHiddenOverflow)) return true;

        return false;
    }

    // Check if the element or any ancestor is hidden
    function isElementHidden(el) {
        let current = el;
        while (current && current !== document.body) {
            if (isHidden(current)) return true;
            current = current.parentElement;
        }
        return false;
    }

    // Check if a <p> has only empty content
    function isEmptyParagraph(p) {
        let content = p.innerHTML;
        let hasOnlyBrOrNbsp = true;

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

        return content === '' || hasOnlyBrOrNbsp;
    }

    // Collect only visible empty paragraphs
    const emptyParagraphs = [];

    document.querySelectorAll('p').forEach(p => {
        if (!isEmptyParagraph(p)) return;
        if (isElementHidden(p)) return;
        emptyParagraphs.push(p);
    });

    if (emptyParagraphs.length === 0) {
        alert('Pas de paragraphes vides.');
        return;
    }

    let message = (
        emptyParagraphs.length
        + (emptyParagraphs.length === 1 ? ' paragraphe vide' : ' paragraphes vides')
    );

    alert(message + '.');

    emptyParagraphs.forEach(p => {
        p.setAttribute('data-empty-paragraph', '');
        p.style.border = '2px solid red';

        const label = document.createElement('span');
        label.setAttribute('data-empty-paragraph-label', '');
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

        const computedStyle = window.getComputedStyle(p);
        if (computedStyle.position === 'static') {
            p.style.position = 'relative';
        }
        p.appendChild(label);
    });
})();
