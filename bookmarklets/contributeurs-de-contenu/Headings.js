/**
 * Found here: https://pauljadam.com/bookmarklets/index.html
 * source code: https://github.com/pauljadam/bookmarklets/blob/master/headings.js
 */

(function () {
    function main(doc) {
        const headingStyles = 'color:black;font-family:sans-serif;font-weight:bold;font-size:small;background-color:yellow;speak:literal-punctuation;';

        function createSpan(className, content) {
            const span = doc.createElement('strong');

            span.className = className;
            span.style.cssText = headingStyles;
            span.textContent = content;

            return span;
        }

        function processHeadingElements(selector, tagName) {
            doc.querySelectorAll(selector).forEach(heading => {
                heading.insertBefore(createSpan('openSpan', `<${tagName}>`), heading.firstChild);
                heading.appendChild(createSpan('closeSpan', `</${tagName}>`));
            });
        }

        function showMessage(message, duration, isError = false) {
            const element = doc.createElement(isError ? 'strong' : 'div');
            element.id = isError ? 'failure' : 'success';
            element.setAttribute('role', isError ? 'status' : 'alert');

            if (isError) {
                element.style.cssText = `${headingStyles}margin:0 2px; padding:2px;`;
            } else {
                element.style.cssText = 'position:absolute; width:0; height:0; clip: rect(0,0,0,0);';
            }

            element.textContent = message;
            doc.body[isError ? 'insertBefore' : 'appendChild'](element, isError ? doc.body.firstChild : null);
            setTimeout(() => element.remove(), duration);
        }

        function processHeadings() {
            // Remove existing spans
            doc.querySelectorAll('.openSpan, .closeSpan').forEach(el => el.remove());

            // Process h1-h6 elements
            for (let i = 1; i <= 6; i++) {
                processHeadingElements(`h${i}`, `h${i}`);
                processHeadingElements(`[role=heading][aria-level="${i}"]`, `[role=heading][aria-level=${i}]`);
            }

            // Check if any headings exist
            const hasHeadings = doc.querySelector('h1, h2, h3, h4, h5, h6, [role=heading][aria-level="1"], [role=heading][aria-level="2"], [role=heading][aria-level="3"], [role=heading][aria-level="4"], [role=heading][aria-level="5"], [role=heading][aria-level="6"]');
            const message = `${hasHeadings ? 'Success! Headings Found' : 'No Headings Found'} on Page: ${doc.title}`;

            showMessage(message, hasHeadings ? 3000 : 6000, !hasHeadings);
        }

        processHeadings();
    }

    function traverseFrames(doc) {
        main(doc);

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

    traverseFrames(document);
})();
