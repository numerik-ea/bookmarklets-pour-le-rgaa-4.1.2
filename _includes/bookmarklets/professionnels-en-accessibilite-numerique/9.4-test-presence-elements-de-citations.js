(function checkQuotesElements() {
    const quotesElements = document.body.querySelectorAll('q, blockquote');
    const numberOfQuotesElements = quotesElements.length;

    if (numberOfQuotesElements === 0) {
        alert('Pas d\'éléments de citation sur la page.');
        return;
    }

    let message = numberOfQuotesElements + ' éléments de citation sur la page';

    if (numberOfQuotesElements === 1) {
        message = message.replace('éléments', 'élément');
    }

    alert(message + '.\nVoir la console pour plus de détails.');
    console.clear();
    console.log(message + ' :');

    quotesElements.forEach(quoteElement => {
        quoteElement.style.border = '1px solid yellow';
        quoteElement.style.outline = '1px solid blue';
        quoteElement.style.outlineOffset = '2px';
        quoteElement.style.background = 'red';
        quoteElement.style.backgroundColor = 'red';

        console.log(quoteElement);
    });
})();
