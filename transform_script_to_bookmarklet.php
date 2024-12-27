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
if (!file_exists($argv[1])) {
    echo "Le fichier n'existe pas.\n";
    exit;
}

if (!is_readable($argv[1])) {
    echo "Le fichier n'est pas lisible.\n";
    exit;
}

$contents = file_get_contents($argv[1]);
$bookmarklet = preg_replace('/\s+/', ' ', $contents);
$bookmarklet = trim($bookmarklet);
$bookmarklet = 'javascript:' . $bookmarklet;

file_put_contents($argv[1] . "-bookmarklet.txt", $bookmarklet);

echo "Le script a bien été transformé en bookmarklet.\n";





