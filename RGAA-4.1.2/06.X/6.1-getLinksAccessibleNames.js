(function () {
    const IS_HIDDEN = 1;
    const HAS_NO_ACCESSIBLE_NAME = 2;

    function isElementHidden(element) {
        if (
            element.hasAttribute('aria-hidden') &&
            element.getAttribute('aria-hidden') === 'true'
        ) {
            return true;
        }

        if (element.hasAttribute('hidden')) {
            return true;
        }

        const computedStyle = getComputedStyle(element);

        if (
            computedStyle.display === "none" ||
            computedStyle.visibility === "hidden" ||
            // Elements with font-size: 0 are not rendered on mobile
            computedStyle.fontSize === "0px"
        ) {
            return true;
        }

        return false;
    }

    function getAriaLabel(element) {
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

        return null;
    }

    function getLinkAccessibleName(element) {
        const ariaLabel = getAriaLabel(element);

        if (ariaLabel !== null) {
            return ariaLabel;
        }

        let accessibleName = "";

        function getLinkAccessibleNameRecursive(node) {
            if (
                node.nodeType === Node.ELEMENT_NODE
                && isElementHidden(node)
            ) {
                return null;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                accessibleName += node.textContent.trim() + " ";
            } else if (
                node.nodeType === Node.ELEMENT_NODE
                && (
                    node.tagName.toUpperCase() === "IMG"
                    || node.tagName.toUpperCase() === "SVG"
                )
            ) {
                const ariaLabel = getAriaLabel(node);

                if (ariaLabel !== null) {
                    accessibleName += ariaLabel + " ";
                    return;
                }

                if (node.tagName.toUpperCase() === "IMG") {
                    if (node.hasAttribute("alt")) {
                        accessibleName += node.getAttribute("alt").trim() + " ";
                    } else if (node.hasAttribute("title")) {
                        accessibleName += node.getAttribute("title").trim() + " ";
                    }
                }
                else if (node.tagName.toUpperCase() === "SVG") {
                    const titleElement = node.querySelector("title");

                    if (titleElement) {
                        accessibleName += titleElement.textContent.trim() + " ";
                    } else if (node.hasAttribute("title")) {
                        accessibleName += node.getAttribute("title").trim() + " ";
                    }
                }
            } else if (node.hasChildNodes()) {
                node.childNodes.forEach(childNode => getLinkAccessibleNameRecursive(childNode));
            }
        }

        if (null === getLinkAccessibleNameRecursive(element)) {
            return IS_HIDDEN;
        }

        accessibleName = accessibleName.trim();
        // Remove all multiple spaces and replace with single space
        accessibleName = accessibleName.replace(/ +(?= )/g, '');

        if (accessibleName !== "") {
            return accessibleName;
        }

        if (element.hasAttribute('title')) {
            return element.getAttribute('title').trim();
        }

        return HAS_NO_ACCESSIBLE_NAME;
    }

    function getLinksAccessibleNames(parentElement) {
        const links = parentElement.querySelectorAll('a[href], [role="link"]');
        const linksAccessibleNamesMap = [];

        links.forEach(link => {
            const accessibleName = getLinkAccessibleName(link);

            if (
                accessibleName !== HAS_NO_ACCESSIBLE_NAME
                && accessibleName !== IS_HIDDEN
            ) {
                linksAccessibleNamesMap.push({
                    link,
                    accessibleName
                });
            }
        });

        return linksAccessibleNamesMap;
    }

    function getParentElementToBeTested() {
        let parentElementToBeTestedSelector = null;
        let parentElement = null;

        while (!parentElementToBeTestedSelector || !parentElement) {
            parentElementToBeTestedSelector = prompt("Entrez le sélecteur CSS de l'élément parent à tester :");

            if (parentElementToBeTestedSelector === null) {
                break;
            }

            parentElementToBeTestedSelector = parentElementToBeTestedSelector.trim();

            if (parentElementToBeTestedSelector === "") {
                alert("Veuillez entrer un sélecteur CSS valide.");
                continue;
            }

            parentElement = document.querySelector(parentElementToBeTestedSelector);

            if (!parentElement) {
                alert("Elément de page non trouvé.");
            }
        }

        return [
            parentElementToBeTestedSelector,
            parentElement
        ];
    }

    const [
        parentElementToBeTestedSelector,
        parentElement
    ] = getParentElementToBeTested();

    const linksAccessibleNamesMap = getLinksAccessibleNames(parentElement);
    const numberOfLinksWithAccessibleNames = linksAccessibleNamesMap.length;

    if (numberOfLinksWithAccessibleNames === 0) {
        alert(
            "Pas de liens avec un nom accessible dans l'élément de page "
            + parentElementToBeTestedSelector
            + "."
        );
        return;
    }

    let message = (
        numberOfLinksWithAccessibleNames
        + " liens avec un nom accessible dans l'élément de page "
        + parentElementToBeTestedSelector
    );

    if (numberOfLinksWithAccessibleNames === 1) {
        message = message.replace("liens", "lien");
    }

    alert(message + ".\nVoir la console pour plus de détails.");
    console.log(message + " :");

    linksAccessibleNamesMap.forEach(item => {
        console.log(item.link);
        console.log(item.accessibleName);
    });
})();
