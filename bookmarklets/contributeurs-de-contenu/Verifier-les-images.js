/**
 * Found here: https://pauljadam.com/bookmarklets/index.html
 * source code: https://github.com/pauljadam/bookmarklets/blob/master/images.js
 * 
 * What's new in this version:
 * - no more jQuery dependency
 * - texts translated to French
 */

(function () {
    function callback() {
        function l() {
            // Remove existing spans
            document.querySelectorAll('span.altSpan, span.axSpan, span.closeSpan').forEach(span => span.remove());

            // Check elements with alt attribute
            document.querySelectorAll('a[alt], button[alt], label[alt]').forEach(element => {
                const span = document.createElement('span');

                span.className = 'altSpan';
                span.style.cssText = 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;speak:literal-punctuation;';
                span.textContent = ` INVALIDE❌alt='${element.getAttribute('alt')}' sur ${element.tagName}`;

                element.parentNode.insertBefore(span, element);
            });

            // Check images and elements with role='img'
            document.querySelectorAll('img, [role=img]').forEach(element => {
                // Check role attribute
                if (element.hasAttribute('role')) {
                    const span = document.createElement('span');

                    span.className = 'closeSpan';
                    span.style.cssText = 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;outline:orange 2px dashed;margin:0 2px; padding:2px;speak:literal-punctuation;';
                    span.textContent = `❓role='${element.getAttribute('role')}'`;

                    element.parentNode.insertBefore(span, element.nextSibling);
                }

                // Check aria-label
                if (element.hasAttribute('aria-label')) {
                    const span = document.createElement('span');

                    span.className = 'closeSpan';
                    span.style.cssText = 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;outline:orange 2px dashed;margin:0 2px; padding:2px;speak:literal-punctuation;';
                    span.textContent = `❓aria-label='${element.getAttribute('aria-label')}'`;

                    element.parentNode.insertBefore(span, element.nextSibling);
                }

                // Check aria-describedby
                if (element.hasAttribute('aria-describedby')) {
                    const span = document.createElement('span');

                    span.className = 'axSpan';
                    span.style.cssText = 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;outline:orange 2px dashed;margin:0 2px; padding:2px;speak:literal-punctuation;';
                    span.textContent = `aria-describedby='${element.getAttribute('aria-describedby')}'`;

                    element.parentNode.insertBefore(span, element);

                    const describedbyValue = element.getAttribute('aria-describedby');
                    const describedbyArray = describedbyValue.split(' ');

                    describedbyArray.forEach(id => {
                        const describedby = document.getElementById(id);

                        if (describedby) {
                            describedby.style.outline = 'orange 2px dashed';

                            const inputSpan = document.createElement('span');

                            inputSpan.className = 'inputSpan';
                            inputSpan.style.cssText = 'padding:1px;color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;outline:orange 2px dashed;z-index:2147483647;speak:literal-punctuation;';
                            inputSpan.textContent = `id='${id}'`;

                            describedby.insertBefore(inputSpan, describedby.firstChild);
                        }
                    });
                }

                // Check aria-labelledby
                if (element.hasAttribute('aria-labelledby')) {
                    const span = document.createElement('span');

                    span.className = 'closeSpan';
                    span.style.cssText = 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;outline:orange 2px dashed;margin:0 2px; padding:2px;speak:literal-punctuation;';
                    span.textContent = `aria-labelledby='${element.getAttribute('aria-labelledby')}'`;
                    element.parentNode.insertBefore(span, element.nextSibling);

                    const labelledbyValue = element.getAttribute('aria-labelledby');
                    const labelledbyArray = labelledbyValue.split(' ');

                    labelledbyArray.forEach(id => {
                        const labelledby = document.getElementById(id);

                        if (labelledby) {
                            labelledby.style.outline = 'orange 2px dashed';

                            const inputSpan = document.createElement('span');

                            inputSpan.className = 'inputSpan';
                            inputSpan.style.cssText = 'padding:1px;color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;outline:orange 2px dashed;z-index:2147483647;speak:literal-punctuation;';
                            inputSpan.textContent = `id='${id}'`;
                            labelledby.insertBefore(inputSpan, labelledby.firstChild);
                        }
                    });
                }

                element.style.outline = 'green 2px solid';
                element.style.padding = '2px';

                // Check alt attribute
                if (!element.hasAttribute('alt')) {
                    if (element.closest('a')) {
                        if (!element.hasAttribute('aria-label') &&
                            !element.hasAttribute('aria-labelledby') &&
                            !element.hasAttribute('aria-describedby') &&
                            !element.hasAttribute('title')) {

                            const span = document.createElement('span');

                            span.className = 'altSpan';
                            span.style.cssText = 'outline:red 2px solid;padding:1px;color:black;font-family:sans-serif;font-weight:bold;font-size:small;background-color:yellow;position:absolute;line-height:100%;z-index:2147483647;border-bottom:2px solid blue;';
                            span.textContent = 'IMAGE LIEN❌PAS D\'ALT';

                            element.parentNode.insertBefore(span, element);
                        }
                    } else if (!element.hasAttribute('aria-label') &&
                        !element.hasAttribute('aria-labelledby') &&
                        !element.hasAttribute('aria-describedby') &&
                        !element.hasAttribute('title')) {

                        element.style.outline = 'red 2px solid';
                        element.style.padding = '2px';

                        const span = document.createElement('span');

                        span.className = 'altSpan';
                        span.style.cssText = 'outline:red 2px solid;padding:1px;color:black;font-family:sans-serif;font-weight:bold;font-size:small;background-color:yellow;position:absolute;line-height:100%;z-index:2147483647;';
                        span.textContent = 'IMAGE❌PAS D\'ALT';

                        element.parentNode.insertBefore(span, element);
                    }
                } else {
                    element.style.outline = 'green 2px solid';
                    element.style.padding = '2px';

                    if (element.closest('a')) {
                        const span = document.createElement('span');

                        span.className = 'altSpan';
                        span.style.cssText = 'outline:orange 2px dashed;padding:1px;color:black;font-family:sans-serif;font-weight:bold;font-size:small;background-color:yellow;position:absolute;line-height:100%;z-index:2147483647;speak:literal-punctuation;border-bottom:2px solid blue;';

                        if (element.getAttribute('alt') === '') {
                            span.textContent = `IMAGE LIEN❓alt='${element.getAttribute('alt')}'`;
                        } else {
                            span.textContent = `IMAGE LIEN👍alt='${element.getAttribute('alt')}'❓`;
                        }

                        element.parentNode.insertBefore(span, element);
                    } else {
                        const span = document.createElement('span');

                        span.className = 'altSpan';
                        span.style.cssText = 'outline:orange 2px dashed;padding:1px;color:black;font-family:sans-serif;font-weight:bold;font-size:small;background-color:yellow;position:absolute;line-height:100%;z-index:2147483647;speak:literal-punctuation;';
                        span.textContent = `IMAGE👍alt='${element.getAttribute('alt')}'❓`;

                        element.parentNode.insertBefore(span, element);
                    }
                }

                // Check title attribute
                if (element.hasAttribute('title')) {
                    const span = document.createElement('span');

                    span.className = 'axSpan';
                    span.setAttribute('role', 'region');
                    span.setAttribute('aria-label', 'Titre');
                    span.style.cssText = 'outline:orange 2px dashed;padding:1px;color:black;font-family:sans-serif;font-weight:bold;font-size:small;background-color:yellow;position:relative;line-height:100%;z-index:2147483647;';
                    span.textContent = `❓title='${element.getAttribute('title')}'`;

                    element.parentNode.insertBefore(span, element.nextSibling);
                }

                // Check longdesc attribute
                if (element.hasAttribute('longdesc')) {
                    const span = document.createElement('span');

                    span.className = 'axSpan';
                    span.setAttribute('role', 'region');
                    span.setAttribute('aria-label', 'Description longue');
                    span.style.cssText = 'outline:orange 2px dashed;padding:1px;color:black;font-family:sans-serif;font-weight:bold;font-size:small;background-color:yellow;position:relative;line-height:100%;z-index:2147483647;';
                    span.textContent = `❓longdesc='${element.getAttribute('longdesc')}'`;

                    element.parentNode.insertBefore(span, element.nextSibling);
                }
            });

            // Check if any images were found
            const images = document.querySelectorAll('img, [role=img]');

            if (!images.length) {
                const failure = document.createElement('strong');

                failure.id = 'failure';
                failure.setAttribute('role', 'status');
                failure.style.cssText = 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;margin:0 2px; padding:2px;';
                failure.textContent = 'Aucune image trouvée sur la page : ' + document.title;

                document.body.insertBefore(failure, document.body.firstChild);

                setTimeout(() => failure.remove(), 6000);
            } else {
                const success = document.createElement('div');

                success.id = 'success';
                success.setAttribute('role', 'alert');
                success.style.cssText = 'position:absolute; width:0; height:0; clip: rect(0,0,0,0);';
                success.textContent = 'Succès ! Images trouvées sur la page : ' + document.title;

                document.body.appendChild(success);

                setTimeout(() => success.remove(), 3000);
            }
        }

        l();
    }

    callback();
})();
