javascript:(function getEmptyParagraphs() { const paragraphs = document.querySelectorAll('p'); const emptyParagraphs = []; paragraphs.forEach(p => { let content = p.innerHTML; content = content.replaceAll('&nbsp;', ''); content = content.trim(); if (content === '') { emptyParagraphs.push(p); } }); const countEmptyParagraphs = emptyParagraphs.length; if (countEmptyParagraphs === 0) { alert('Pas de paragraphes vides.'); return; } let message = ( countEmptyParagraphs + ' paragraphes vides' ); if (countEmptyParagraphs === 1) { message = message.replace('paragraphes vides', 'paragraphe vide'); } alert(message + '.'); emptyParagraphs.forEach(p => { p.style.border = '2px solid red'; const label = document.createElement('div'); label.textContent = 'paragraphe vide'; label.style.position = 'absolute'; label.style.top = '0'; label.style.left = '0'; label.style.backgroundColor = 'yellow'; label.style.color = 'black'; label.style.padding = '2px 5px'; label.style.fontSize = '12px'; label.style.fontWeight = 'bold'; label.style.zIndex = '10000'; label.style.pointerEvents = 'none'; const computedStyle = window.getComputedStyle(p); if (computedStyle.position === 'static') { p.style.position = 'relative'; } p.appendChild(label); }); })();