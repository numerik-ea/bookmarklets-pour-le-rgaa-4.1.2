(function () {
    // Sélectionner tous les éléments avec l'attribut aria-live
    const ariaLiveElements = document.querySelectorAll('[aria-live]');
    
    if (ariaLiveElements.length === 0) {
        alert('Aucune zone aria-live trouvée sur cette page.');
        return;
    }
    
    let modifiedCount = 0;
    let eventListenersRemovedCount = 0;
    
    // Fonction pour supprimer tous les event listeners d'un élément
    function removeEventListeners(element) {
        try {
            // Créer un clone de l'élément sans les event listeners
            const newElement = element.cloneNode(true);
            
            // Remplacer l'ancien élément par le nouveau
            element.parentNode.replaceChild(newElement, element);
            
            return newElement;
        } catch (error) {
            console.warn('Impossible de supprimer les event listeners pour:', element, error);
            return element;
        }
    }
    
    // Parcourir chaque élément et modifier l'attribut aria-live
    ariaLiveElements.forEach(element => {
        const currentValue = element.getAttribute('aria-live');
        let processedElement = element;
        
        // Supprimer les event listeners
        try {
            processedElement = removeEventListeners(element);
            eventListenersRemovedCount++;
        } catch (error) {
            console.warn('Erreur lors de la suppression des event listeners:', error);
        }
        
        // Modifier l'attribut aria-live si nécessaire
        if (currentValue !== 'off') {
            processedElement.setAttribute('aria-live', 'off');
            modifiedCount++;
        }
        
        // Ajouter un style visuel temporaire pour indiquer la modification
        const originalBorder = processedElement.style.border;
        const originalBackgroundColor = processedElement.style.backgroundColor;
        
        processedElement.style.border = '2px solid #ff6b6b';
        processedElement.style.backgroundColor = '#ffe0e0';
        
        // Retirer le style après 3 secondes
        setTimeout(() => {
            processedElement.style.border = originalBorder;
            processedElement.style.backgroundColor = originalBackgroundColor;
        }, 3000);
    });
    
    // Afficher le résultat
    const totalElements = ariaLiveElements.length;
    const message = `Zones aria-live trouvées : ${totalElements}\nZones modifiées vers "off" : ${modifiedCount}\nZones déjà à "off" : ${totalElements - modifiedCount}\nEvent listeners supprimés : ${eventListenersRemovedCount}`;
    
    alert(message);
    
    // Logger les informations dans la console pour debug
    console.log('Opération aria-live terminée:', {
        totalElements,
        modifiedCount,
        eventListenersRemovedCount,
        elements: document.querySelectorAll('[aria-live]')
    });
})();
