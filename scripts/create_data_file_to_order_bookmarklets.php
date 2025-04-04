<?php

// Définition des chemins
$bookmarkletsDir = __DIR__ . '/../_includes/bookmarklets';
$dataDir = __DIR__ . '/../_data';
$outputFile = $dataDir . '/bookmarklets_order.yml';

// Tableau pour stocker les noms des bookmarklets par répertoire
$bookmarkletsByDir = [];

// Obtenir les sous-répertoires du dossier bookmarklets
$subdirs = array_filter(glob($bookmarkletsDir . '/*'), 'is_dir');

// Parcourir chaque sous-répertoire
foreach ($subdirs as $subdir) {
    $dirName = basename($subdir);
    
    // Ignorer les répertoires cachés
    if (strpos($dirName, '.') === 0) {
        continue;
    }
    
    // Initialiser le tableau pour ce répertoire
    $bookmarkletsByDir[$dirName] = [];
    
    // Obtenir tous les fichiers du répertoire
    $files = glob($subdir . '/*-bookmarklet.js');
    
    // Parcourir chaque fichier bookmarklet
    foreach ($files as $file) {
        $fileName = basename($file);
        
        // Extraire le nom sans -bookmarklet.js
        $name = str_replace('-bookmarklet.js', '', $fileName);
        
        // Ajouter le nom au répertoire correspondant
        $bookmarkletsByDir[$dirName][] = $name;
    }
    
    // Trier les noms de bookmarklets avec un tri naturel
    natsort($bookmarkletsByDir[$dirName]);
    $bookmarkletsByDir[$dirName] = array_values($bookmarkletsByDir[$dirName]);
    
    // Supprimer le répertoire s'il ne contient pas de bookmarklets
    if (empty($bookmarkletsByDir[$dirName])) {
        unset($bookmarkletsByDir[$dirName]);
    }
}

// Créer le contenu YAML
$yamlContent = "# Noms des bookmarklets par répertoire et par ordre alphabétique\n";
foreach ($bookmarkletsByDir as $dir => $names) {
    $yamlContent .= "$dir:\n";
    foreach ($names as $name) {
        $yamlContent .= "  - $name\n";
    }
}

// Écrire dans le fichier
if (file_put_contents($outputFile, $yamlContent)) {
    echo "Fichier $outputFile créé avec succès contenant les noms de bookmarklets organisés par répertoire.\n";
} else {
    echo "Échec de la création du fichier $outputFile\n";
}

// Afficher la liste des noms de bookmarklets pour vérification
echo "\nNoms des bookmarklets trouvés par répertoire :\n";
foreach ($bookmarkletsByDir as $dir => $names) {
    echo "$dir:\n";
    foreach ($names as $name) {
        echo "  - $name\n";
    }
}
