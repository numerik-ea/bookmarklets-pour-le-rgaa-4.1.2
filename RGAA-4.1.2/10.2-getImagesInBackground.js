(function () {
    function findElementsWithBackgroundImage() {
        return [...document.querySelectorAll('*')].filter(el => {
            const styles = window.getComputedStyle(el);
            const bgImage = styles.backgroundImage;
            const bg = styles.background;

            // Check if either property contains a URL
            const hasImage = (value) => value && value.includes('url(');

            return hasImage(bgImage) || hasImage(bg);
        });
    }

    // Example usage:
    const elementsWithBgImage = findElementsWithBackgroundImage();
    let message = `${elementsWithBgImage.length} éléments avec un background image`;

    if (elementsWithBgImage.length === 0) {
        alert("Aucun élément avec un background image.");
        return;
    }

    if (elementsWithBgImage.length === 1) {
        message = message.replace('éléments', 'élément');
    }

    alert(message);
    elementsWithBgImage.forEach(element => {
        element.style.border = "1px solid yellow";
        element.style.outline = "1px solid blue";
        element.style.outlineOffset = "2px";
        element.style.background = "red";
        element.style.backgroundColor = "red";
        
        console.log(element);
    });
})();
