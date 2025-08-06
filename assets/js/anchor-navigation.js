// Fonction pour gérer la navigation par ancre avec offset
function handleAnchorNavigation(delay = 0) {
  // Vérifier si l'URL contient un hash (ancre)
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const scrollToTarget = () => {
        // Calculer la position avec l'offset de 27,2px
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 27.2;
        
        // Scroll vers la position avec offset
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      };
      
      if (delay > 0) {
        setTimeout(scrollToTarget, delay);
      } else {
        scrollToTarget();
      }
    }
  }
}

// Gérer la navigation par ancre au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Utiliser un délai pour s'assurer que les styles sont appliqués
  handleAnchorNavigation(100);
});

// Alternative : utiliser window.load pour s'assurer que tout est chargé
window.addEventListener('load', () => {
  // Vérifier s'il faut encore faire le scroll (au cas où DOMContentLoaded n'aurait pas fonctionné)
  if (window.location.hash && window.pageYOffset === 0) {
    handleAnchorNavigation(50);
  }
});

// Gérer la navigation par ancre lors du changement d'URL
window.addEventListener('hashchange', handleAnchorNavigation);

// Intercepter les clics sur les liens ancre pour appliquer l'offset
document.addEventListener('click', function(event) {
  const link = event.target.closest('a[href^="#"]');
  if (link && link.getAttribute('href') !== '#') {
    event.preventDefault();
    
    const targetId = link.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Mettre à jour l'URL
      history.pushState(null, null, '#' + targetId);
      
      // Calculer la position avec l'offset de 27,2px
      const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 27.2;
      
      // Scroll vers la position avec offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
});