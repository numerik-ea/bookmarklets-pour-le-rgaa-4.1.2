javascript:(function () { const STYLES = { base: 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;', outline: 'outline:orange 2px dashed;margin:0 2px; padding:2px;', absolute: 'position:absolute;line-height:100%;z-index:2147483647;', relative: 'position:relative;line-height:100%;z-index:2147483647;', link: 'border-bottom:2px solid blue;' }; function createStyledSpan(className, text, styles = []) { const span = document.createElement('span'); span.className = className; span.style.cssText = styles.map(style => STYLES[style]).join(''); span.textContent = text; return span; } function hasAccessibilityAttributes(element) { return element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby') || element.hasAttribute('aria-describedby') || element.hasAttribute('title'); } function checkInvalidAltAttributes() { document.querySelectorAll('a[alt], button[alt], label[alt]').forEach(element => { const span = createStyledSpan('altSpan', ` INVALIDE❌alt='${element.getAttribute('alt')}' sur ${element.tagName}`, ['base', 'speak:literal-punctuation']); element.parentNode.insertBefore(span, element); }); } function checkRoleAttribute(element) { if (element.hasAttribute('role')) { const span = createStyledSpan('closeSpan', `❓role='${element.getAttribute('role')}'`, ['base', 'outline', 'speak:literal-punctuation']); element.parentNode.insertBefore(span, element.nextSibling); } } function checkAriaAttributes(element) { ['aria-label', 'aria-labelledby', 'aria-describedby'].forEach(attr => { if (element.hasAttribute(attr)) { const span = createStyledSpan('closeSpan', `${attr}='${element.getAttribute(attr)}'`, ['base', 'outline', 'speak:literal-punctuation']); element.parentNode.insertBefore(span, element.nextSibling); if (attr === 'aria-labelledby' || attr === 'aria-describedby') { const ids = element.getAttribute(attr).split(' '); ids.forEach(id => { const referencedElement = document.getElementById(id); if (referencedElement) { referencedElement.style.outline = 'orange 2px dashed'; const inputSpan = createStyledSpan('inputSpan', `id='${id}'`, ['base', 'outline', 'absolute', 'speak:literal-punctuation']); referencedElement.insertBefore(inputSpan, referencedElement.firstChild); } }); } } }); } function checkAltAttribute(element) { element.style.outline = 'green 2px solid'; element.style.padding = '2px'; if (!element.hasAttribute('alt')) { if (!hasAccessibilityAttributes(element)) { const isLink = element.closest('a'); element.style.outline = 'red 2px solid'; element.style.padding = '2px'; const span = createStyledSpan('altSpan', isLink ? 'IMAGE LIEN❌PAS D\'ALT' : 'IMAGE❌PAS D\'ALT', ['base', 'outline', 'absolute', isLink ? 'link' : '']); element.parentNode.insertBefore(span, element); } } else { const isLink = element.closest('a'); const altValue = element.getAttribute('alt'); const span = createStyledSpan('altSpan', isLink ? `IMAGE LIEN${altValue === '' ? '❓' : '👍'}alt='${altValue}'${altValue === '' ? '' : '❓'}` : `IMAGE👍alt='${altValue}'❓`, ['base', 'outline', 'absolute', 'speak:literal-punctuation', isLink ? 'link' : '']); element.parentNode.insertBefore(span, element); } } function checkAdditionalAttributes(element) { ['title', 'longdesc'].forEach(attr => { if (element.hasAttribute(attr)) { const span = createStyledSpan('axSpan', `❓${attr}='${element.getAttribute(attr)}'`, ['base', 'outline', 'relative']); span.setAttribute('role', 'region'); span.setAttribute('aria-label', attr === 'title' ? 'Titre' : 'Description longue'); element.parentNode.insertBefore(span, element.nextSibling); } }); } function showStatusMessage(hasImages) { const message = hasImages ? 'Succès ! Images trouvées sur la page : ' + document.title : 'Aucune image trouvée sur la page : ' + document.title; const element = document.createElement(hasImages ? 'div' : 'strong'); element.id = hasImages ? 'success' : 'failure'; element.setAttribute('role', hasImages ? 'alert' : 'status'); element.style.cssText = hasImages ? 'position:absolute; width:0; height:0; clip: rect(0,0,0,0);' : 'color:black;font-weight:bold;font-family:sans-serif;font-size:small;background-color:yellow;margin:0 2px; padding:2px;'; element.textContent = message; if (hasImages) { document.body.appendChild(element); } else { document.body.insertBefore(element, document.body.firstChild); } setTimeout(() => element.remove(), hasImages ? 3000 : 6000); } function checkImages() { document.querySelectorAll('span.altSpan, span.axSpan, span.closeSpan').forEach(span => span.remove()); checkInvalidAltAttributes(); const images = document.querySelectorAll('img, [role=img]'); images.forEach(element => { checkRoleAttribute(element); checkAriaAttributes(element); checkAltAttribute(element); checkAdditionalAttributes(element); }); showStatusMessage(images.length > 0); } checkImages(); })();