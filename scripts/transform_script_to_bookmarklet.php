<?php

/**
 * Script permettant de transformer un script javascript en bookmarklet
 * 
 * @param string $argv[1] Chemin vers le script
 * 
 * @return void
 * 
 * @version 1.0
 * 
 * Usage : php transform_script_to_bookmarklet.php script.js
 */

if (count($argv) !== 2) {
    $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
    
    if ($isWindows) {
        echo "Usage : php .\\scripts\\transform_script_to_bookmarklet.php <chemin_vers_le_script>\n";
        echo "Exemple : php .\\scripts\\transform_script_to_bookmarklet.php .\\_includes\\bookmarklets\\contributeurs-de-contenu\\double-br.js\n";
    } else {
        echo "Usage : php ./scripts/transform_script_to_bookmarklet.php <chemin_vers_le_script>\n";
        echo "Exemple : php ./scripts/transform_script_to_bookmarklet.php ./_includes/bookmarklets/contributeurs-de-contenu/double-br.js\n";
    }
    exit;
}

if (!file_exists($argv[1])) {
    echo "Le fichier n'existe pas.\n";
    exit;
}

if (!is_readable($argv[1])) {
    echo "Le fichier n'est pas lisible.\n";
    exit;
}

function remove_javascript_comments($js_code)
{
    $js_code = preg_replace('/\/\*.*?\*\//s', '', $js_code); // remove multi-line comments
    $js_code = preg_replace('/\/\/.*/', '', $js_code); // remove single-line comments
    return $js_code;
}

$js_code = file_get_contents($argv[1]);
$js_code = remove_javascript_comments($js_code);
$js_code = preg_replace('/\s+/', ' ', $js_code); // Replace multiple spaces by a single space
$js_code = trim($js_code);

$bookmarklet = 'javascript:' . $js_code;
file_put_contents(str_replace('.js', '', $argv[1]) . '-bookmarklet.js', $bookmarklet);

echo "Le script a bien été transformé en bookmarklet.\n";
