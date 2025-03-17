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
const message = `${elementsWithBgImage.length} éléments avec un background image`;

if (elementsWithBgImage.length === 0) {
    alert("Aucun élément avec un background image.");
    return;
}

if (elementsWithBgImage.length === 1) {
    alert("1 élément avec un background image.");
}

alert(message);
elementsWithBgImage.forEach(el => console.log(el));
