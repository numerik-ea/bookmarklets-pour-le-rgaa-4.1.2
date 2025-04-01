/**
 * source: https://giovanicamara.com/blog/accessibility-testing-favlets-bookmarklets/
 * which is based on:
 * source: https://mraccess77.github.io/favlets/img-alt.js
 */

(function () {
    function traverseFrames(doc) {
        showAlt(doc);

        const frametypes = ['frame', 'iframe'];

        for (let i = 0; i < frametypes.length; i++) {
            const myframes = doc.getElementsByTagName(frametypes[i]);

            for (let z = 0; z < myframes.length; z++) {
                try {
                    traverseFrames(myframes[z].contentWindow.document);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }

    function showAlt(doc) {
        const images = doc.querySelectorAll('img, [role=\'img\']');
        let text;

        for (let i = 0; i < images.length; i++) {
            // TODO: improve the aria-labelledby handling
            // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby
            if (images[i].hasAttribute('aria-labelledby')) {
                const labelledby = images[i].getAttribute('aria-labelledby');
                const labelledbyElements = doc.querySelectorAll(labelledby);

                let text = '';
                
                // get the text content of the labelledby elements
                for (let j = 0; j < labelledbyElements.length; j++) {
                    text += labelledbyElements[j].textContent;
                    // add a space between the text content of the labelledby elements
                    text += ' ';
                }

                // remove the last space
                text = text.trim();
                text = document.createTextNode('aria-labelledby=' + text);
            }
            else if (images[i].hasAttribute('aria-label')) {
                text = document.createTextNode('aria-label=' + images[i].getAttribute('aria-label'));
            }
            else if (images[i].hasAttribute('alt')) {
                text = document.createTextNode('alt=' + images[i].alt);
            }
            else if (images[i].hasAttribute('title')) {
                text = document.createTextNode('title=' + images[i].title);
            }
            else {
                text = document.createTextNode('Pas de alt');
            }

            const node = document.createElement('span');
            node.style.color = 'black';
            node.style.backgroundColor = 'gold';
            node.style.fontSize = 'small';
            node.style.border = 'thin solid black';
            node.style.position = 'absolute';
            node.appendChild(text);
            images[i].parentNode.insertBefore(node, images[i]);
        }
    }

    traverseFrames(document);
})();