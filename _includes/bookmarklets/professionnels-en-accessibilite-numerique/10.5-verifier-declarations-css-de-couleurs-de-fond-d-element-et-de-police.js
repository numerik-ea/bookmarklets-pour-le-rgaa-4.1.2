(function () {
  // Convert RGB/RGBA values to color names if possible
  function getColorName(colorValue) {
    if (!colorValue || colorValue === `transparent`) {
      return colorValue;
    }

    // If it's already a named color, return it
    const namedColors = [
      `black`,
      `white`,
      `red`,
      `green`,
      `blue`,
      `yellow`,
      `orange`,
      `purple`,
      `pink`,
      `brown`,
      `gray`,
      `grey`,
      `cyan`,
      `magenta`,
      `lime`,
      `navy`,
      `olive`,
      `maroon`,
      `teal`,
      `aqua`,
      `silver`,
      `gold`,
      `indigo`,
      `violet`,
      `coral`,
      `salmon`,
      `turquoise`,
      `khaki`,
      `plum`,
      `orchid`,
      `tan`,
      `beige`,
      `ivory`,
      `lavender`,
      `crimson`,
      `azure`,
      `bisque`,
      `chocolate`,
      `coral`,
      `darkblue`,
      `darkcyan`,
      `darkgray`,
      `darkgreen`,
      `darkgrey`,
      `darkkhaki`,
      `darkmagenta`,
      `darkolivegreen`,
      `darkorange`,
      `darkorchid`,
      `darkred`,
      `darksalmon`,
      `darkseagreen`,
      `darkslateblue`,
      `darkslategray`,
      `darkslategrey`,
      `darkturquoise`,
      `darkviolet`,
      `deeppink`,
      `deepskyblue`,
      `dimgray`,
      `dimgrey`,
      `dodgerblue`,
      `firebrick`,
      `floralwhite`,
      `forestgreen`,
      `fuchsia`,
      `gainsboro`,
      `ghostwhite`,
      `goldenrod`,
      `greenyellow`,
      `honeydew`,
      `hotpink`,
      `indianred`,
      `lightblue`,
      `lightcoral`,
      `lightcyan`,
      `lightgoldenrodyellow`,
      `lightgray`,
      `lightgreen`,
      `lightgrey`,
      `lightpink`,
      `lightsalmon`,
      `lightseagreen`,
      `lightskyblue`,
      `lightslategray`,
      `lightslategrey`,
      `lightsteelblue`,
      `lightyellow`,
      `limegreen`,
      `linen`,
      `mediumaquamarine`,
      `mediumblue`,
      `mediumorchid`,
      `mediumpurple`,
      `mediumseagreen`,
      `mediumslateblue`,
      `mediumspringgreen`,
      `mediumturquoise`,
      `mediumvioletred`,
      `midnightblue`,
      `mintcream`,
      `mistyrose`,
      `moccasin`,
      `oldlace`,
      `palegoldenrod`,
      `palegreen`,
      `paleturquoise`,
      `palevioletred`,
      `papayawhip`,
      `peachpuff`,
      `peru`,
      `powderblue`,
      `rosybrown`,
      `royalblue`,
      `saddlebrown`,
      `sandybrown`,
      `seagreen`,
      `seashell`,
      `sienna`,
      `skyblue`,
      `slateblue`,
      `slategray`,
      `slategrey`,
      `snow`,
      `springgreen`,
      `steelblue`,
      `thistle`,
      `tomato`,
      `wheat`,
      `whitesmoke`,
      `yellowgreen`,
    ];

    const lowerColor = colorValue.toLowerCase().trim();
    if (namedColors.includes(lowerColor)) {
      return lowerColor;
    }

    // Try to convert RGB/RGBA to color name
    try {
      // Create a temporary element to parse the color
      const tempDiv = document.createElement(`div`);
      tempDiv.style.color = colorValue;
      const computedColor = window.getComputedStyle(tempDiv).color;

      // Parse RGB values - try direct match first if input is already RGB
      let rgbMatch = colorValue.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
      );

      // If not found, try from computed style
      if (!rgbMatch) {
        rgbMatch = computedColor.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
        );
      }

      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);

        // Match against common color names
        const colorMap = {
          'rgb(0, 0, 0)': 'black',
          'rgb(255, 255, 255)': 'white',
          'rgb(255, 0, 0)': 'red',
          'rgb(0, 255, 0)': 'lime',
          'rgb(0, 0, 255)': 'blue',
          'rgb(255, 255, 0)': 'yellow',
          'rgb(255, 165, 0)': 'orange',
          'rgb(128, 0, 128)': 'purple',
          'rgb(255, 192, 203)': 'pink',
          'rgb(165, 42, 42)': 'brown',
          'rgb(128, 128, 128)': 'gray',
          'rgb(0, 255, 255)': 'cyan',
          'rgb(255, 0, 255)': 'magenta',
          'rgb(0, 128, 0)': 'green',
          'rgb(0, 0, 128)': 'navy',
          'rgb(128, 128, 0)': 'olive',
          'rgb(128, 0, 0)': 'maroon',
          'rgb(0, 128, 128)': 'teal',
        };

        // Normalize the RGB key with consistent spacing
        const rgbKey = `rgb(${r}, ${g}, ${b})`;
        if (colorMap[rgbKey]) {
          return colorMap[rgbKey];
        }

        // Try approximate matching for common colors
        const tolerance = 10;
        for (const [key, name] of Object.entries(colorMap)) {
          const keyMatch = key.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (keyMatch) {
            const keyR = parseInt(keyMatch[1]);
            const keyG = parseInt(keyMatch[2]);
            const keyB = parseInt(keyMatch[3]);
            if (
              Math.abs(r - keyR) <= tolerance &&
              Math.abs(g - keyG) <= tolerance &&
              Math.abs(b - keyB) <= tolerance
            ) {
              return name;
            }
          }
        }
      }
    } catch (e) {
      // If conversion fails, return original value
    }

    return colorValue;
  }

  // Check if CSS rules with !important exist for html element
  function hasImportantRule(property) {
    const htmlElement = document.documentElement;
    const stylesheets = Array.from(document.styleSheets);

    for (let stylesheet of stylesheets) {
      try {
        const rules = Array.from(stylesheet.cssRules || []);
        for (let rule of rules) {
          // Check if rule targets html element
          if (
            rule.selectorText &&
            (rule.selectorText.toLowerCase() === `html` ||
              rule.selectorText.toLowerCase() === `:root` ||
              htmlElement.matches(rule.selectorText))
          ) {
            const style = rule.style;
            if (style && style.getPropertyValue(property)) {
              // Check if the property has !important
              const priority = style.getPropertyPriority(property);
              if (priority === `important`) {
                return true;
              }
            }
          }
        }
      } catch (e) {
        // Skip stylesheets that can't be accessed (CORS)
        continue;
      }
    }
    return false;
  }

  function addColorsToHtml() {
    const htmlElement = document.documentElement;

    // Check if colors are already defined (inline styles or CSS)
    const computedStyle = window.getComputedStyle(htmlElement);

    // Check for !important rules
    const hasImportantBackgroundColor = hasImportantRule(`background-color`);
    const hasImportantColor = hasImportantRule(`color`);

    // Check inline styles first
    const inlineBg = htmlElement.style.backgroundColor;
    const inlineColor = htmlElement.style.color;
    const hasInlineBackgroundColor = inlineBg && inlineBg.trim() !== ``;
    const hasInlineTextColor = inlineColor && inlineColor.trim() !== ``;

    // Determine existing colors
    let existingBackgroundColor = null;
    let existingTextColor = null;
    let hasImportantBg = false;
    let hasImportantText = false;

    if (hasInlineBackgroundColor) {
      existingBackgroundColor = inlineBg;
      // Check if inline style is being overridden by !important
      const computedBg = computedStyle.backgroundColor;
      if (hasImportantBackgroundColor && computedBg !== inlineBg) {
        hasImportantBg = true;
        // If overridden, use the computed value instead
        existingBackgroundColor = computedBg;
      }
    } else {
      const computedBg = computedStyle.backgroundColor;
      // Check if it's not transparent (default for html)
      if (
        computedBg &&
        computedBg !== `transparent` &&
        computedBg !== `rgba(0, 0, 0, 0)`
      ) {
        existingBackgroundColor = computedBg;
        hasImportantBg = hasImportantBackgroundColor;
      }
    }

    if (hasInlineTextColor) {
      existingTextColor = inlineColor;
      // Check if inline style is being overridden by !important
      const computedColor = computedStyle.color;
      if (hasImportantColor && computedColor !== inlineColor) {
        hasImportantText = true;
        // If overridden, use the computed value instead
        existingTextColor = computedColor;
      }
    } else {
      // Check computed style from CSS (not inline)
      const computedColor = computedStyle.color;
      // Check if it's not black (common default)
      if (
        computedColor &&
        computedColor !== `rgb(0, 0, 0)` &&
        computedColor !== `rgba(0, 0, 0, 1)` &&
        computedColor !== `#000000` &&
        computedColor !== `black`
      ) {
        existingTextColor = computedColor;
        hasImportantText = hasImportantColor;
      }
    }

    // Determine which colors can be added (only those not already defined)
    const canAddBackground = !existingBackgroundColor;
    const canAddText = !existingTextColor;

    // If both colors are already defined, skip
    if (!canAddBackground && !canAddText) {
      return {
        htmlElement,
        backgroundColor: existingBackgroundColor || `non définie`,
        textColor: existingTextColor || `non définie`,
        skipped: true,
        hasImportantBg: hasImportantBg,
        hasImportantText: hasImportantText,
      };
    }

    let backgroundColor = null;
    let textColor = null;
    let addBackground = false;
    let addText = false;

    if (canAddBackground && canAddText) {
      // Both can be added - prompt both directly
      const bgPrompt = prompt(
        `Entrez la couleur de fond de la balise <html> :\n(ex : #f0f8ff, lightblue, rgb(240,248,255))`,
        `blue`
      );
      if (bgPrompt === null) {
        // User cancelled
        return {
          htmlElement,
          backgroundColor: null,
          textColor: null,
          skipped: true,
          cancelled: true,
        };
      }
      addBackground = true;
      backgroundColor = bgPrompt || `blue`;

      const textPrompt = prompt(
        `Entrez la couleur de police de la balise <html> :\n(ex : #2c3e50, darkblue, rgb(44,62,80))`,
        `yellow`
      );
      if (textPrompt === null) {
        // User cancelled
        return {
          htmlElement,
          backgroundColor: null,
          textColor: null,
          skipped: true,
          cancelled: true,
        };
      }
      addText = true;
      textColor = textPrompt || `yellow`;
    } else if (canAddBackground) {
      // Only background can be added - show message about text color
      const textColorName = getColorName(existingTextColor);
      const bgPrompt = prompt(
        `La couleur de police de la balise <html> est déjà définie :\n${textColorName}\n\nEntrez la couleur de fond de la balise <html> :\n(ex : #f0f8ff, lightblue, rgb(240,248,255))`,
        `blue`
      );
      if (bgPrompt === null) {
        // User cancelled
        return {
          htmlElement,
          backgroundColor: null,
          textColor: null,
          skipped: true,
          cancelled: true,
        };
      }
      addBackground = true;
      backgroundColor = bgPrompt || `blue`;
    } else if (canAddText) {
      // Only text can be added - show message about background color
      const bgColorName = getColorName(existingBackgroundColor);
      const textPrompt = prompt(
        `La couleur de fond de la balise <html> est déjà définie :\n${bgColorName}\n\nEntrez la couleur de police de la balise <html> :\n(ex : #2c3e50, darkblue, rgb(44,62,80))`,
        `yellow`
      );
      if (textPrompt === null) {
        // User cancelled
        return {
          htmlElement,
          backgroundColor: null,
          textColor: null,
          skipped: true,
          cancelled: true,
        };
      }
      addText = true;
      textColor = textPrompt || `yellow`;
    }

    // If user cancelled or invalid choice, exit
    if (!addBackground && !addText) {
      return {
        htmlElement,
        backgroundColor: null,
        textColor: null,
        skipped: true,
        cancelled: true,
      };
    }

    // Check for !important rules before applying (re-check in case styles changed)
    const hasImportantBgCheck = hasImportantRule(`background-color`);
    const hasImportantTextCheck = hasImportantRule(`color`);

    // Apply colors to HTML element
    if (addBackground) {
      htmlElement.style.backgroundColor = backgroundColor;
    }
    if (addText) {
      htmlElement.style.color = textColor;
    }

    // Verify if styles were actually applied (might be overridden by !important)
    const computedStyleAfter = window.getComputedStyle(htmlElement);
    const appliedBg = addBackground ? computedStyleAfter.backgroundColor : null;
    const appliedColor = addText ? computedStyleAfter.color : null;
    const bgWasOverridden =
      addBackground && hasImportantBgCheck && appliedBg !== backgroundColor;
    const colorWasOverridden =
      addText && hasImportantTextCheck && appliedColor !== textColor;

    return {
      htmlElement,
      backgroundColor: addBackground
        ? backgroundColor
        : existingBackgroundColor || null,
      textColor: addText ? textColor : existingTextColor || null,
      skipped: false,
      hasImportantBg: hasImportantBgCheck,
      hasImportantText: hasImportantTextCheck,
      bgWasOverridden: bgWasOverridden,
      colorWasOverridden: colorWasOverridden,
      appliedBg: appliedBg,
      appliedColor: appliedColor,
      addBackground: addBackground,
      addText: addText,
      existingBackgroundColor: existingBackgroundColor,
      existingTextColor: existingTextColor,
    };
  }

  // Apply colors to HTML element
  const result = addColorsToHtml();
  const {
    htmlElement,
    backgroundColor,
    textColor,
    skipped,
    hasImportantBg,
    hasImportantText,
    bgWasOverridden,
    colorWasOverridden,
    appliedBg,
    appliedColor,
    cancelled,
    addBackground,
    addText,
    existingBackgroundColor,
    existingTextColor,
  } = result;

  if (cancelled) {
    // User cancelled the operation
    return;
  }

  if (skipped) {
    const hasBg = backgroundColor && backgroundColor !== `non définie`;
    const hasText = textColor && textColor !== `non définie`;
    let message = ``;
    if (hasBg && hasText) {
      message = `Les couleurs sont déjà définies sur la balise HTML`;
    } else if (hasBg) {
      message = `La couleur de fond est déjà définie sur la balise HTML`;
    } else if (hasText) {
      message = `La couleur de police est déjà définie sur la balise HTML`;
    }
    let importantWarning = ``;
    if (hasImportantBg || hasImportantText) {
      importantWarning = `\n⚠️ Attention : Des règles CSS avec !important sont présentes`;
      if (hasImportantBg) {
        importantWarning += `\n  - background-color avec !important`;
      }
      if (hasImportantText) {
        importantWarning += `\n  - color avec !important`;
      }
    }
    let alertMessage = message + `.`;
    if (hasBg) {
      const bgName = getColorName(backgroundColor);
      alertMessage += `\nCouleur de fond : ` + bgName;
    }
    if (hasText) {
      const textName = getColorName(textColor);
      alertMessage += `\nCouleur de police : ` + textName;
    }
    alert(
      alertMessage + importantWarning + `\nPlus de détails dans la console.`
    );
    console.clear();
    console.log(message + ` :`);
    console.log(`Élément HTML :`, htmlElement);
    if (hasBg) {
      const bgName = getColorName(backgroundColor);
      console.log(`Couleur de fond existante : ` + bgName);
    }
    if (hasText) {
      const textName = getColorName(textColor);
      console.log(`Couleur de police existante : ` + textName);
    }
    if (hasImportantBg || hasImportantText) {
      console.warn(`⚠️ Règles CSS avec !important détectées :`);
      if (hasImportantBg) {
        console.warn(`  - background-color avec !important`);
      }
      if (hasImportantText) {
        console.warn(`  - color avec !important`);
      }
    }
  } else {
    // Build message based on what was added
    let message = ``;
    if (addBackground && addText) {
      message = `Couleurs de fond et de police ajoutées à la balise HTML`;
    } else if (addBackground) {
      message = `Couleur de fond ajoutée à la balise HTML`;
    } else if (addText) {
      message = `Couleur de police ajoutée à la balise HTML`;
    }

    let importantWarning = ``;
    if (bgWasOverridden || colorWasOverridden) {
      importantWarning = `\n⚠️ Attention : Les styles n'ont pas pu être appliqués à cause de règles CSS avec !important`;
      if (bgWasOverridden) {
        const appliedBgName = getColorName(appliedBg);
        const bgName = getColorName(backgroundColor);
        importantWarning +=
          `\n  - background-color : ` +
          appliedBgName +
          ` (au lieu de ` +
          bgName +
          `)`;
      }
      if (colorWasOverridden) {
        const appliedColorName = getColorName(appliedColor);
        const textName = getColorName(textColor);
        importantWarning +=
          `\n  - color : ` +
          appliedColorName +
          ` (au lieu de ` +
          textName +
          `)`;
      }
    } else if (hasImportantBg || hasImportantText) {
      importantWarning = `\n⚠️ Des règles CSS avec !important sont présentes mais n'ont pas empêché l'application`;
    }

    // Build alert message
    let alertMessage = message + `.`;
    if (existingBackgroundColor) {
      const bgName = getColorName(existingBackgroundColor);
      alertMessage += `\nCouleur de fond existante : ` + bgName;
    }
    if (addBackground) {
      const bgName = getColorName(backgroundColor);
      alertMessage += `\nCouleur de fond ajoutée : ` + bgName;
    }
    if (existingTextColor) {
      const textName = getColorName(existingTextColor);
      alertMessage += `\nCouleur de police existante : ` + textName;
    }
    if (addText) {
      const textName = getColorName(textColor);
      alertMessage += `\nCouleur de police ajoutée : ` + textName;
    }
    alertMessage += importantWarning + `\nPlus de détails dans la console.`;

    alert(alertMessage);
    console.clear();
    console.log(message + ` :`);
    console.log(`Élément HTML modifié :`, htmlElement);
    if (existingBackgroundColor) {
      const bgName = getColorName(existingBackgroundColor);
      console.log(`Couleur de fond existante : ` + bgName);
    }
    if (addBackground) {
      const bgName = getColorName(backgroundColor);
      console.log(`Couleur de fond appliquée : ` + bgName);
    }
    if (existingTextColor) {
      const textName = getColorName(existingTextColor);
      console.log(`Couleur de police existante : ` + textName);
    }
    if (addText) {
      const textName = getColorName(textColor);
      console.log(`Couleur de police appliquée : ` + textName);
    }
    if (bgWasOverridden || colorWasOverridden) {
      console.warn(
        `⚠️ Les styles n'ont pas pu être appliqués à cause de règles CSS avec !important :`
      );
      if (bgWasOverridden) {
        const appliedBgName = getColorName(appliedBg);
        const bgName = getColorName(backgroundColor);
        console.warn(
          `  - background-color : ` +
            appliedBgName +
            ` (au lieu de ` +
            bgName +
            `)`
        );
      }
      if (colorWasOverridden) {
        const appliedColorName = getColorName(appliedColor);
        const textName = getColorName(textColor);
        console.warn(
          `  - color : ` + appliedColorName + ` (au lieu de ` + textName + `)`
        );
      }
    } else if (hasImportantBg || hasImportantText) {
      console.warn(
        `⚠️ Des règles CSS avec !important sont présentes mais n'ont pas empêché l'application`
      );
    }
  }
})();
