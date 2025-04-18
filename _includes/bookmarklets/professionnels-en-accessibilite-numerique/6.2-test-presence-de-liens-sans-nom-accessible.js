(function () {
    const HAS_NO_ACCESSIBLE_NAME = 1;

    function getAriaLabel(element) {
        if (element.hasAttribute('aria-labelledby')) {
            // Algorithm to get the text content of the labelledby elements
            // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby#benefits_and_drawbacks
            const labelledByIds = element.getAttribute('aria-labelledby');
            // Split by whitespace and use Set to remove duplicates
            const uniqueIds = [...new Set(labelledByIds.split(/\s+/))];
            const labelledbyElements = uniqueIds.map(id => document.getElementById(id)).filter(Boolean);

            let text = '';

            // get the text content of the labelledby elements
            for (let i = 0; i < labelledbyElements.length; i++) {
                text += labelledbyElements[i].textContent;
                // add a space between the text content of the labelledby elements
                text += ' ';
            }

            // remove the last space
            text = text.trim();
            
            if (text !== '') {
                return text;
            }
        }

        if (element.hasAttribute('aria-label')) {
            return element.getAttribute('aria-label').trim();
        }

        return null;
    }

    function getLinkAccessibleName(element) {
        const ariaLabel = getAriaLabel(element);

        if (ariaLabel !== null) {
            return ariaLabel;
        }

        let accessibleName = '';

        function getLinkAccessibleNameRecursive(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                accessibleName += node.textContent.trim() + ' ';
            } else if (
                node.nodeType === Node.ELEMENT_NODE
                && (
                    node.tagName.toUpperCase() === 'IMG'
                    || node.tagName.toUpperCase() === 'SVG'
                )
            ) {
                const ariaLabel = getAriaLabel(node);

                if (ariaLabel !== null) {
                    accessibleName += ariaLabel;
                    return;
                }

                if (node.tagName.toUpperCase() === 'IMG') {
                    if (node.hasAttribute('alt')) {
                        accessibleName += node.getAttribute('alt').trim() + ' ';
                    } else if (node.hasAttribute('title')) {
                        accessibleName += node.getAttribute('title').trim() + ' ';
                    }
                }
                else if (node.tagName.toUpperCase() === 'SVG') {
                    const titleElement = node.querySelector('title');

                    if (titleElement) {
                        accessibleName += titleElement.textContent.trim() + ' ';
                    } else if (node.hasAttribute('title')) {
                        accessibleName += node.getAttribute('title').trim() + ' ';
                    }
                }
            } else if (node.hasChildNodes()) {
                node.childNodes.forEach(childNode => getLinkAccessibleNameRecursive(childNode));
            }
        }

        getLinkAccessibleNameRecursive(element);

        accessibleName = accessibleName.trim();
        // Remove all multiple spaces and replace with single space
        accessibleName = accessibleName.replace(/ +(?= )/g,'');

        if (accessibleName !== '') {
            return accessibleName;
        }

        if (element.hasAttribute('title')) {
            return element.getAttribute('title').trim();
        }

        return HAS_NO_ACCESSIBLE_NAME;
    }

    function getLinksWithoutAccessibleName(parentElement) {
        const links = parentElement.querySelectorAll(`a[href], [role='link']`);
        const linksWithoutAccessibleName = [];

        links.forEach(link => {
            const accessibleName = getLinkAccessibleName(link);

            if (accessibleName === HAS_NO_ACCESSIBLE_NAME) {
                linksWithoutAccessibleName.push(link);
            }
        });

        return linksWithoutAccessibleName;
    }

    const linksWithoutAccessibleName = getLinksWithoutAccessibleName(document);
    const numberOfLinksWithoutAccessibleName = linksWithoutAccessibleName.length;

    if (numberOfLinksWithoutAccessibleName === 0) {
        alert('Tous les liens ont un nom accessible.');
        return;
    }

    let message = numberOfLinksWithoutAccessibleName + ' liens sans nom accessible';

    if (numberOfLinksWithoutAccessibleName === 1) {
        message = message.replace('liens', 'lien');
    }

    alert(message + '.\nVoir la console pour plus de détails.');
    console.clear();
    console.log(message + ' :');

    linksWithoutAccessibleName.forEach(link => {
        link.style.border = '1px solid yellow';
        link.style.outline = '1px solid blue';
        link.style.outlineOffset = '2px';
        link.style.background = 'red';
        link.style.backgroundColor = 'red';

        console.log(link);
    });
})();
