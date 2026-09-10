// Le retour visuel de la copie (icône verte + infobulle) n'est perceptible
// qu'à l'écran : les régions live du gabarit portent le même message vers les
// lecteurs d'écran.

// Index de la prochaine région à écrire. Les deux régions sont utilisées en
// alternance : une technologie d'assistance ne restitue que ce qui change
// dans une région live, donc réécrire le même message au même endroit n'est
// plus annoncé à partir de la deuxième activation du bouton.
let nextLiveRegionIndex = 0;

function announceCopyStatus(message) {
  const liveRegions = document.querySelectorAll('[data-live-region]');

  if (liveRegions.length === 0) return;

  const region = liveRegions[nextLiveRegionIndex];
  const otherRegion =
    liveRegions[(nextLiveRegionIndex + 1) % liveRegions.length];

  nextLiveRegionIndex = (nextLiveRegionIndex + 1) % liveRegions.length;

  // Vider une région n'est pas restitué (aria-relevant vaut "additions text"
  // par défaut) : seul l'ajout du message l'est. La région écrite passe donc
  // toujours de vide au message, ce qui garantit une annonce à chaque appel.
  otherRegion.textContent = '';
  region.textContent = message;
}

// Durée pendant laquelle le bouton affiche l'état « copié » avant de revenir
// à son état de départ.
const COPY_SUCCESS_DURATION = 2000;

// État de départ de chaque bouton (icône « copier » + infobulle « Copier le
// code du bookmarklet dans le presse-papiers »), mémorisé au premier clic.
// Il ne peut pas être relu à chaque clic : réactiver un bouton avant la fin du
// délai mémoriserait l'état « copié » comme état de départ, et l'icône verte
// resterait alors figée définitivement.
const initialButtonMarkup = new WeakMap();

// Minuteur de retour à l'état de départ, par bouton, pour pouvoir l'annuler :
// sans cela, le minuteur d'un premier clic ramènerait l'état de départ en
// plein milieu du retour visuel d'un second clic.
const resetTimers = new WeakMap();

function copyBookmarklet(button) {
  // Get the bookmarklet link - first find the container, then get the link
  const container = button.closest('.bookmarklet-container');
  const bookmarkletLink = container.querySelector('.bookmarklet-link');
  const bookmarkletContent = bookmarkletLink.getAttribute("href");

  if (!initialButtonMarkup.has(button)) {
    initialButtonMarkup.set(button, button.innerHTML);
  }

  navigator.clipboard
    .writeText(bookmarkletContent.replace("%C2%A0", "&nbsp;"))
    .then(() => {
      // Visual feedback
      clearTimeout(resetTimers.get(button));

      button.innerHTML = `
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="tooltip show">Code du bookmarklet copié dans le presse-papiers</span>
        `;
      button.classList.add('success');
      announceCopyStatus('Code du bookmarklet copié dans le presse-papiers');

      resetTimers.set(
        button,
        setTimeout(() => {
          button.innerHTML = initialButtonMarkup.get(button);
          button.classList.remove('success');
          resetTimers.delete(button);
        }, COPY_SUCCESS_DURATION)
      );
    })
    .catch((err) => {
      console.error("Échec de la copie du code du bookmarklet :", err);
      // Sans cette annonce, l'échec est totalement silencieux : ni l'icône
      // verte ni l'infobulle n'apparaissent, et rien n'est restitué
      announceCopyStatus('Échec de la copie du code du bookmarklet');
    });
}
