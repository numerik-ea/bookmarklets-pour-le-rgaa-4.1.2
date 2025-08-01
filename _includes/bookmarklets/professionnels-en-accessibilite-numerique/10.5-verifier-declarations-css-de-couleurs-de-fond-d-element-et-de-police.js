(function () {
    function addColorsToHtml() {
        const htmlElement = document.documentElement;
        
        // Prompt user for background color
        const backgroundColor = prompt('Entrez la couleur de fond (ex: #f0f8ff, lightblue, rgb(240,248,255))', 'blue') || 'blue';
        
        // Prompt user for text color
        const textColor = prompt('Entrez la couleur de police (ex: #2c3e50, darkblue, rgb(44,62,80))', 'yellow') || 'yellow';
        
        // Apply background and text colors to HTML element
        htmlElement.style.backgroundColor = backgroundColor;
        htmlElement.style.color = textColor;
        htmlElement.style.transition = 'all 0.3s ease'; // Smooth transition
        
        return { htmlElement, backgroundColor, textColor };
    }

    // Apply colors to HTML element
    const result = addColorsToHtml();
    const { htmlElement, backgroundColor, textColor } = result;
    
    let message = 'Couleurs de fond et de police ajoutées à la balise HTML';

    alert(message + '.\nCouleur de fond: ' + backgroundColor + '\nCouleur de police: ' + textColor + '\nPlus de détails dans la console.');
    console.clear();
    console.log(message + ' :');
    console.log('Élément HTML modifié :', htmlElement);
    console.log('Couleur de fond appliquée: ' + backgroundColor);
    console.log('Couleur de police appliquée: ' + textColor);
    console.log('Styles appliqués:', {
        backgroundColor: htmlElement.style.backgroundColor,
        color: htmlElement.style.color,
        transition: htmlElement.style.transition
    });
})();