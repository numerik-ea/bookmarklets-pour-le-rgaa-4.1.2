(function checkTableElements() {
    const tableElements = document.body.querySelectorAll('table');
    const numberOfTableElements = tableElements.length;

    if (numberOfTableElements === 0) {
        alert('Pas de tableaux dans la page.');
        return;
    }

    let message = numberOfTableElements + ' tableaux dans la page';

    if (numberOfTableElements === 1) {
        message = message.replace('tableaux', 'tableau');
    }

    alert(message + '.\nVoir la console pour plus de détails.');
    console.log(message + ' :');

    tableElements.forEach(tableElement => {
        tableElement.style.border = '1px solid yellow';
        tableElement.style.outline = '1px solid blue';
        tableElement.style.outlineOffset = '2px';
        tableElement.style.background = 'red';
        tableElement.style.backgroundColor = 'red';

        console.log(tableElement);
    });
})();
