(function () {
    function isLink(node) {
        if (
            node.nodeType === Node.ELEMENT_NODE && (
                (
                    node.tagName === "A" &&
                    node.hasAttribute("href")
                ) || (
                    node.hasAttribute("role") &&
                    node.getAttribute("role").toLowerCase() === "link"
                )
            )
            
        ) {
            return true;
        }

        return false;
    }

    function hasParentLink(element) {
        let parent = element.parentElement;

        while (parent) {
            if (isLink(parent)) {
                return true;
            }

            parent = parent.parentElement;
        }

        return false;
    }

    function getImagesNotInALink(parentElement) {
        const images = parentElement.querySelectorAll(
            'img:not([role="presentation"]),' +
            '[role="img"]:not([role="presentation"])'
        );
        const imagesNotInALink = [];

        images.forEach(image => {
            if (hasParentLink(image)) {
                return;
            }

            imagesNotInALink.push(image);
        });

        return imagesNotInALink;
    }

    const imagesNotInALink = getImagesNotInALink(document);
    const numberOfImagesNotInALink = imagesNotInALink.length;

    if (numberOfImagesNotInALink === 0) {
        alert("Aucune image non contenue dans un lien");
        return;
    }

    let message = numberOfImagesNotInALink + " images non contenues dans un lien";

    if (numberOfImagesNotInALink === 1) {
        message = message.replace("images", "image");
    }

    alert(message + ".\nVoir la console pour plus de détails.");
    console.log(message + " :");

    imagesNotInALink.forEach(image => {
        console.log(image);
    });
})();
