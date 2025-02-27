(function () {
    function getAnchorLabel(element) {
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

        let label = "";

        function getAnchorLabelRecursive(node) {
            // Concatenate <img alt> attributes and text nodes
            if (node.nodeType === Node.TEXT_NODE) {
                label += node.textContent.trim() + " ";
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "IMG" && node.hasAttribute("alt")) {
                label += node.getAttribute("alt").trim() + " ";
            } else if (node.hasChildNodes()) {
                node.childNodes.forEach(childNode => getAnchorLabelRecursive(childNode));
            }
        }

        getAnchorLabelRecursive(element);

        label = label.trim();

        if (label !== "") {
            return label;
        }

        if (element.hasAttribute('title')) {
            return element.getAttribute('title').trim();
        }

        return null;
    }

    function getAnchorsWithoutLabel(parentElement) {
        const anchors = parentElement.querySelectorAll('a');
        const anchorsWithoutLabel = [];

        anchors.forEach(link => {
            const label = getAnchorLabel(link);

            if (label === null) {
                anchorsWithoutLabel.push(link);
            }
        });

        return anchorsWithoutLabel;
    }

    const anchorsWithoutLabel = getAnchorsWithoutLabel(document);
    const numberOfAnchorsWithoutLabel = anchorsWithoutLabel.length;

    if (numberOfAnchorsWithoutLabel === 0) {
        alert("Toutes les ancres ont un intitulé.");
        return;
    }

    let message = numberOfAnchorsWithoutLabel + " ancres sans intitulé";

    if (numberOfAnchorsWithoutLabel === 1) {
        message = message.replace("liens", "lien");
    }

    alert(message + ".\nVoir la console pour plus de détails.");
    console.log(message + " :");

    anchorsWithoutLabel.forEach(link => {
        console.log(link);
    });
})();
