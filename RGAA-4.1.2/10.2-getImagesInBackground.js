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
alert(`${elementsWithBgImage.length} éléments avec un background image`);
elementsWithBgImage.forEach(el => console.log(el));
