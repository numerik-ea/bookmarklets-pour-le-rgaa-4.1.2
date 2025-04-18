(function() {
    console.clear();
    console.log('Le focus est sur :', document.activeElement);

    document.addEventListener('focusin', () => {
      console.log('Focus déplacé sur :', document.activeElement);
    });
})();
