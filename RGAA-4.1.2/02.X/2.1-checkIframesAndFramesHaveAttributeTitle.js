(function checkIframesAndFramesHaveTitle() {
    const iframesAndFrames = document.querySelectorAll('iframe, frame');

    if (iframesAndFrames.length === 0) {
        alert("2.1 et 2.2 NA : pas de cadres dans la page.");
        return true;
    }

    const iframesAndFramesWithoutTitle = (
        Array.from(iframesAndFrames)
             .filter(iframeOrFrame => !iframeOrFrame.hasAttribute('title'))
    );

    if (iframesAndFramesWithoutTitle.length === 0) {
        alert('2.1 C : tous les cadres ont un attribut title.');
        return true;
    }

    let message = (
        '2.1 NC : '
        + iframesAndFramesWithoutTitle.length
        + " cadres n'ont pas d'attribut title"
    );

    if (iframesAndFramesWithoutTitle.length === 1) {
        message = message.replace("cadres n'ont pas", "cadre n'a pas");
    }

    console.log(message + ' :');
    iframesAndFramesWithoutTitle.forEach(
        iframeOrFrame => console.log(iframeOrFrame)
    );
    
    message += '.\nVoir la console pour plus de détails.';
    alert(message);
})();