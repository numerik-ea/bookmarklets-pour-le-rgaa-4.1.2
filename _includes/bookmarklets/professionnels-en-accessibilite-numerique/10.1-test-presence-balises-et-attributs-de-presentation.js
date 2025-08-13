(function(){
    // Disclaimer: if multiple attributes on same element, only the last declared is revealed
    
    // CSS variables equivalent
    const msgBgColor = '#f2ce09';
    const borderColor = 'red';
    
    // Deprecated HTML elements to check
    const deprecatedElements = [
        'basefont', 'blink', 'big', 'center', 'font', 'marquee', 
        's', 'strike', 'tt', 'u'
    ];
    
    // Deprecated attributes to check
    const deprecatedAttributes = [
        'align', 'alink', 'background', 'basefont', 'bgcolor', 'border',
        'color', 'link', 'text', 'vlink', 'cellpadding', 'cellspacing'
    ];
    
    // Elements that can legitimately have width/height attributes
    const allowedWidthHeightElements = ['img', 'svg', 'canvas', 'embed', 'object'];
    
    // Function to add visual indicators
    function addVisualIndicator(element, message) {
        element.style.border = `3px solid ${borderColor}`;
        element.style.outline = `3px solid ${borderColor}`;
        
        // Create label element
        const label = document.createElement('span');
        label.textContent = message;
        label.style.backgroundColor = msgBgColor;
        label.style.position = 'absolute';
        label.style.zIndex = '9999';
        label.style.padding = '2px 4px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.border = '1px solid #000';
        label.style.pointerEvents = 'none';
        
        // Position label near the element
        const rect = element.getBoundingClientRect();
        label.style.left = rect.left + 'px';
        label.style.top = (rect.top - 20) + 'px';
        
        document.body.appendChild(label);
    }
    
    // Check for deprecated elements
    deprecatedElements.forEach(tagName => {
        const elements = document.getElementsByTagName(tagName);
        Array.from(elements).forEach(element => {
            addVisualIndicator(element, `<${tagName}>`);
        });
    });
    
    // Check for deprecated attributes
    deprecatedAttributes.forEach(attr => {
        const elements = document.querySelectorAll(`[${attr}]`);
        Array.from(elements).forEach(element => {
            addVisualIndicator(element, `[attr:${attr}]`);
        });
    });
    
    // Check for width/height attributes on non-allowed elements
    const widthElements = document.querySelectorAll('[width]');
    const heightElements = document.querySelectorAll('[height]');
    
    // Check width attributes
    Array.from(widthElements).forEach(element => {
        if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
            addVisualIndicator(element, '[attr:width]');
        }
    });
    
    // Check height attributes
    Array.from(heightElements).forEach(element => {
        if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
            addVisualIndicator(element, '[attr:height]');
        }
    });
    
    // Check elements with both width and height
    const bothElements = document.querySelectorAll('[width][height]');
    Array.from(bothElements).forEach(element => {
        if (!allowedWidthHeightElements.includes(element.tagName.toLowerCase())) {
            addVisualIndicator(element, '[attr:height & width]');
        }
    });
    
    // Summary
    let summary = '== RGAA 10.1 - Dépistage des balises et attributs de présentation ==\n\n';
    
    deprecatedElements.forEach(tagName => {
        const count = document.getElementsByTagName(tagName).length;
        if (count > 0) {
            summary += `Éléments <${tagName}> : ${count}\n`;
        }
    });
    
    deprecatedAttributes.forEach(attr => {
        const count = document.querySelectorAll(`[${attr}]`).length;
        if (count > 0) {
            summary += `Attributs [${attr}] : ${count}\n`;
        }
    });
    
    const invalidWidthCount = Array.from(widthElements).filter(el => 
        !allowedWidthHeightElements.includes(el.tagName.toLowerCase())
    ).length;
    
    const invalidHeightCount = Array.from(heightElements).filter(el => 
        !allowedWidthHeightElements.includes(el.tagName.toLowerCase())
    ).length;
    
    if (invalidWidthCount > 0) {
        summary += `Attributs [width] invalides : ${invalidWidthCount}\n`;
    }
    
    if (invalidHeightCount > 0) {
        summary += `Attributs [height] invalides : ${invalidHeightCount}\n`;
    }
    
    console.log(summary);
    alert(summary);
})();
