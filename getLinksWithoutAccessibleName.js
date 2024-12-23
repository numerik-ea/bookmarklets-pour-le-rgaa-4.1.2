(function () {
    // Function to get the accessible name of a link
    function getLinkAccessibleName(element) {
        // Check aria-labelledby
        if (element.hasAttribute('aria-labelledby')) {
            const labelledById = element.getAttribute('aria-labelledby');
            const labelledByElement = document.getElementById(labelledById);

            if (labelledByElement) {
                return labelledByElement.textContent.trim();
            }
        }

        // Check aria-label
        if (element.hasAttribute('aria-label')) {
            return element.getAttribute('aria-label').trim();
        }

        // Concatenate <img alt> attributes and text nodes
        let accessibleName = "";

        function getLinkAccessibleNameRecursive(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                accessibleName += node.textContent.trim() + " ";
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "IMG" && node.hasAttribute("alt")) {
                accessibleName += node.getAttribute("alt").trim() + " ";
            } else if (node.hasChildNodes()) {
                node.childNodes.forEach(childNode => getLinkAccessibleNameRecursive(childNode));
            }
        }

        getLinkAccessibleNameRecursive(element);

        // Remove trailing whitespace
        accessibleName = accessibleName.trim();

        if (accessibleName !== "") {
            return accessibleName;
        }

        // Check title
        if (element.hasAttribute('title')) {
            return element.getAttribute('title').trim();
        }

        return null;
    }

    function getLinksWithoutAccessibleName(parentElement) {
        const links = parentElement.querySelectorAll('a');
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

    alert(numberOfLinksWithoutAccessibleName + message + ".\nVoir la console pour plus de détails.");
    console.log(numberOfLinksWithoutAccessibleName + message + " :");
    linksWithoutAccessibleName.forEach(link => {
        console.log(link);
    });
})();
