(function () {
    function getLinkAccessibleName(element) {
        if (element.hasAttribute('aria-labelledby')) {
            const labelledById = element.getAttribute('aria-labelledby');
            const labelledByElement = document.getElementById(labelledById);

            if (labelledByElement) {
                return labelledByElement.textContent.trim();
            }
        }

        if (element.hasAttribute('aria-label')) {
            return element.getAttribute('aria-label').trim();
        }

        let accessibleName = "";

        function isElementNodeHidden(node) {
            if (
                node.hasAttribute('aria-hidden') &&
                node.getAttribute('aria-hidden') === 'true'
            ) {
                return true;
            }

            const computedStyle = getComputedStyle(node);

            if (
                computedStyle.display === "none" ||
                computedStyle.visibility === "hidden"
            ) {
                return true;
            }

            return false;
        }

        function getLinkAccessibleNameRecursive(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (isElementNodeHidden(node)) {
                    return;
                }
            }

            // Concatenate <img alt> attributes and text nodes
            if (node.nodeType === Node.TEXT_NODE) {
                accessibleName += node.textContent.trim() + " ";
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "IMG" && node.hasAttribute("alt")) {
                accessibleName += node.getAttribute("alt").trim() + " ";
            } else if (node.hasChildNodes()) {
                node.childNodes.forEach(childNode => getLinkAccessibleNameRecursive(childNode));
            }
        }

        getLinkAccessibleNameRecursive(element);

        accessibleName = accessibleName.trim();

        if (accessibleName !== "") {
            return accessibleName;
        }

        if (element.hasAttribute('title')) {
            return element.getAttribute('title').trim();
        }

        return null;
    }

    function getLinksWithoutAccessibleName(parentElement) {
        const links = parentElement.querySelectorAll('a[href]');
        const linksWithoutAccessibleName = [];

        links.forEach(link => {
            const accessibleName = getLinkAccessibleName(link);

            if (accessibleName === null) {
                linksWithoutAccessibleName.push(link);
            }
        });

        return linksWithoutAccessibleName;
    }

    const linksWithoutAccessibleName = getLinksWithoutAccessibleName(document);
    const numberOfLinksWithoutAccessibleName = linksWithoutAccessibleName.length;

    if (numberOfLinksWithoutAccessibleName === 0) {
        alert("Tous les liens ont un nom accessible.");
        return;
    }

    let message = numberOfLinksWithoutAccessibleName + " liens sans nom accessible";

    if (numberOfLinksWithoutAccessibleName === 1) {
        message = message.replace("liens", "lien");
    }

    alert(message + ".\nVoir la console pour plus de détails.");
    console.log(message + " :");

    linksWithoutAccessibleName.forEach(link => {
        console.log(link);
    });
})();
