(function findAllChildrenWithDoubleBR() {
    function hasDoubleBR(element) {
        const children = Array.from(element.childNodes);
    
        for (let i = 0; i < children.length - 1; i++) {
            if (children[i].nodeName !== 'BR') {
                continue;
            }

            if (!((i + 1) in children)) {
                break;
            }

            if (children[i + 1].nodeName === 'BR') {
                return true;
            }
    
            let j = i + 1;

            while (
                j < children.length &&
                children[j].nodeType === Node.TEXT_NODE &&
                children[j].textContent.trim() === ''
            ) {
                j++;
            }

            if (
                j < children.length &&
                children[j].nodeName === 'BR'
            ) {
                return true;
            }
        }
    
        return false;
    }
    

    // Recursive function to find all children with double <br> tags
    function recursiveFindAllChildrenWithDoubleBR(element, results) {
        if (hasDoubleBR(element)) {
            results.push(element);
            return;
        }

        const children = Array.from(element.children);

        if (children.length === 0) {
            return;
        }

        for (let child of children) {
            recursiveFindAllChildrenWithDoubleBR(child, results);
        }
    }

    const results = [];
    recursiveFindAllChildrenWithDoubleBR(document.body, results);

    if (results.length > 0) {
        let message = (
            results.length + " éléments avec double <br>.\n" +
            "Plus de détails dans la console."
        );

        if (results.length === 1) {
            message = message.replace("éléments", "élément");
        }

        alert(message);
        results.forEach(element => {            
            // Create a label element to show text
            const label = document.createElement('div');
            label.textContent = "element with double <br>";
            label.style.position = "absolute";
            label.style.top = "0";
            label.style.left = "0";
            label.style.backgroundColor = "yellow";
            label.style.color = "black";
            label.style.padding = "2px 5px";
            label.style.fontSize = "12px";
            label.style.fontWeight = "bold";
            label.style.zIndex = "10000";
            label.style.pointerEvents = "none";
            
            // Make sure the element has position relative for absolute positioning to work
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position === "static") {
                element.style.position = "relative";
            }
            
            element.appendChild(label);
            
            console.log(element);
        });
    } else {
        alert("Pas d'éléments avec double <br>.");
    }
})();