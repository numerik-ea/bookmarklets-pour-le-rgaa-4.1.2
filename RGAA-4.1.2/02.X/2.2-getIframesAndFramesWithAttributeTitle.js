(function checkIframesAndFramesWithAttributeTitle() {
    const iframesAndFrames = document.querySelectorAll('iframe, frame');

    if (iframesAndFrames.length === 0) {
        alert("2.1 et 2.2 NA : pas de cadres dans la page.");
        return true;
    }

    const iframesAndFramesWithTitle = (
        Array.from(iframesAndFrames)
             .filter(iframeOrFrame => iframeOrFrame.hasAttribute('title'))
    );

    if (iframesAndFramesWithTitle.length === 0) {
        alert("2.1 NC : tous les cadres n'ont pas d'attribut title.");
        return true;
    }

    let message = (
        iframesAndFramesWithTitle.length
        + " cadres ont un attribut title"
    );

    if (iframesAndFramesWithTitle.length === 1) {
        message = message.replace("cadres ont", "cadre a");
    }

    console.log(message + ' :');
    iframesAndFramesWithTitle.forEach(
        iframeOrFrame => console.log(iframeOrFrame)
    );
    
    message += '.\nVoir la console pour plus de détails.';
    alert(message);
})();