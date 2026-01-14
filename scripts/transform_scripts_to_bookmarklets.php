<?php

/**
 * Script permettant de transformer des scripts javascript en bookmarklets
 * 
 * @return void
 * 
 * @version 1.2
 * 
 * Usage : php transform_scripts_to_bookmarklets.php
 */

$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
$bookmarkletsDir = $isWindows ? '.\_includes\bookmarklets' : './_includes/bookmarklets';

function remove_javascript_comments($js_code)
{
    $js_code = preg_replace('/\/\*.*?\*\//s', '', $js_code); // remove multi-line comments
    $js_code = preg_replace('/\/\/.*/', '', $js_code); // remove single-line comments
    return $js_code;
}

function transform_script_to_bookmarklet($script_path) {
    if (!file_exists($script_path)) {
        echo "Le fichier $script_path n'existe pas.\n";
        return false;
    }

    if (!is_readable($script_path)) {
        echo "Le fichier $script_path n'est pas lisible.\n";
        return false;
    }

    $js_code = file_get_contents($script_path);
    $js_code = remove_javascript_comments($js_code);
    $js_code = preg_replace('/\s+/', ' ', $js_code); // Replace multiple spaces by a single space
    $js_code = trim($js_code);

    $bookmarklet = 'javascript:' . $js_code;
    $output_path = str_replace('.js', '', $script_path) . '-bookmarklet.js';
    file_put_contents($output_path, $bookmarklet);

    echo "Le script $script_path a bien été transformé en bookmarklet.\n";
    return true;
}

echo "Transformation de tous les scripts dans le dossier $bookmarkletsDir...\n";

if (!is_dir($bookmarkletsDir)) {
    echo "Le dossier $bookmarkletsDir n'existe pas.\n";
    exit;
}

$files = [];
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($bookmarkletsDir));
foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'js' && !str_ends_with($file->getFilename(), '-bookmarklet.js')) {
        $files[] = $file->getPathname();
    }
}

if (empty($files)) {
    echo "Aucun script JavaScript trouvé dans le dossier $bookmarkletsDir.\n";
    exit;
}

$success_count = 0;
foreach ($files as $file) {
    if (transform_script_to_bookmarklet($file)) {
        $success_count++;
    }
}

echo "Transformation terminée. $success_count script(s) transformé(s) sur " . count($files) . ".\n";
