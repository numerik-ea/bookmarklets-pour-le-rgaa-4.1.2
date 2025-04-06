# bookmarklets-pour-le-rgaa-4.1.2

Lien pour retrouver les bookmarklets pour le RGAA 4.1.2 :  
https://numerik-ea.github.io/bookmarklets-pour-le-rgaa-4.1.2/

---
## Générer un bookmarklet ou tester le site en local

### Windows
⚠️ Lancer toutes les commandes ci-dessous dans Powershell en tant qu'administrateur.

1. Pour générer un bookmarklet ou tester le site en local, il vous faut installer Chocolatey :  
https://chocolatey.org/install#individual


2. Générer un bookmarklet à partir d'un script :
```bash
# Installer php avec Chocolatey
choco install php
```

```bash
# Générer le bookmarklet
php .\scripts\transform_script_to_bookmarklet.php <path_to_bookmarklet_script>.js
```
```bash
# Exemple
php .\scripts\transform_script_to_bookmarklet.php .\bookmarklets\contributeurs-de-contenu\double-br.js
# qui va générer le fichier de bookmarklet suivant :
.\bookmarklets\contributeurs-de-contenu\double-br-bookmarklet.js
```

3. Pour tester le site en local :
```bash
# Installer ruby avec Chocolatey
choco install ruby -y
```

```bash
# Installer les dépendances
gem install bundler
gem install jekyll
bundle install
```

```bash
# Lancer le site en local
bundle exec jekyll serve --baseurl / --config _config.yml,_config_dev.yml --trace
```

3. Pour tout ajout de script ou pour tout renommage de script, lancer la commande suivante pour afficher correctement les bookmarklets sur les pages web correspondantes :
```bash
# Générer le fichier de configuration (_data/bookmarklets_order.yml) des noms de bookmarklets dans l'ordre naturel
php .\scripts\create_data_file_to_order_bookmarklets.php
```

