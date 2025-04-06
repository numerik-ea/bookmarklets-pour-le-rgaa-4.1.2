(function () {
    function isLink(node) {
        if (
            node.nodeType === Node.ELEMENT_NODE && (
                (
                    node.tagName === 'A' &&
                    node.hasAttribute('href')
                ) || (
                    node.hasAttribute('role') &&
                    node.getAttribute('role').toLowerCase() === 'link'
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
        const images = parentElement.querySelectorAll([
            'img',
            'area',
            'input[type=\'image\']',
            'svg',
            'object[type=\'image\']',
            'embed[type=\'image\']',
            'canvas',
            '[role=\'img\']',
        ].join(','));
            
        const imagesNotInALink = [];

        images.forEach(image => {
            if (hasParentLink(image)) {
                return;
            }

            imagesNotInALink.push(image);
        });

        return imagesNotInALink;
    }

    const imagesNotInALink = getImagesNotInALink(document.body);
    const numberOfImagesNotInALink = imagesNotInALink.length;

    if (numberOfImagesNotInALink === 0) {
        alert('Aucune image non contenue dans un lien.');
        return;
    }

    let message = numberOfImagesNotInALink + ' images non contenues dans un lien';

    if (numberOfImagesNotInALink === 1) {
        message = message.replace('images', 'image');
    }

    alert(message + '.\nVoir la console pour plus de détails.');
    console.clear();
    console.log(message + ' :');

    imagesNotInALink.forEach(image => {
        image.style.border = '2px solid red';

        // Create a label element
        const label = document.createElement('div');
        label.textContent = 'image non contenue dans un lien';
        label.style.position = 'absolute';
        label.style.top = '0';
        label.style.left = '0';
        label.style.backgroundColor = 'yellow';
        label.style.color = 'black';
        label.style.padding = '2px 5px';
        label.style.fontSize = '12px';
        label.style.zIndex = '9999';
        
        // Position the parent container if not already positioned
        if (image.parentElement.style.position !== 'relative'
            && image.parentElement.style.position !== 'absolute'
            && image.parentElement.style.position !== 'fixed'
        ) {
            image.style.position = 'relative';
        }
        
        // Add the label
        image.parentElement.style.position = 'relative';
        image.parentElement.appendChild(label);
        
        console.log(image);
    });
})();
