# bookmarklets-pour-le-rgaa-4.1.2

Lien pour retrouver les bookmarklets pour le RGAA 4.1.2 :  
https://numerik-ea.github.io/bookmarklets-pour-le-rgaa-4.1.2/

---

## Générer un bookmarklet ou tester le site en local

### Windows

1. Pour générer un bookmarklet ou tester le site en local, il vous faut installer Chocolatey :  
   https://chocolatey.org/install#individual

2. Générer un bookmarklet à partir d'un script :

```bash
# Installer php avec Chocolatey
choco install php
```

```bash
# Générer les bookmarklets
php .\scripts\transform_scripts_to_bookmarklets.php
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
bundle exec jekyll serve --config _config.yml,_config_dev.yml --trace
```

Pour voir le site en local, aller sur :  
http://127.0.0.1:4000

4. Pour tout ajout de script ou pour tout renommage de script, lancer la commande suivante pour afficher correctement les bookmarklets sur les pages web correspondantes :

```bash
# Générer le fichier de configuration (_data/bookmarklets_order.yml) des noms de bookmarklets dans l'ordre naturel
php .\scripts\create_data_file_to_order_bookmarklets.php
```

### macOS

Pour tester le site en local sur macOS :

1. Installer les dépendances :

```bash
# Installer les dépendances
gem install bundler
gem install jekyll
bundle install
```

2. Lancer le site en local :

```bash
bundle exec jekyll serve --config _config.yml,_config_dev.yml --trace
```

---

## Déployer le site sur GitHub Pages

### Windows

Pour déployer le site statique sur la branche `gh-pages` de GitHub Pages, utilisez le script PowerShell `deploy.ps1` :

```powershell
.\deploy.ps1
```

Le script effectue automatiquement les opérations suivantes :

1. **Build du site Jekyll** : Compile le site Jekyll dans le dossier `_site`
2. **Vérification de `.nojekyll`** : S'assure que le fichier `.nojekyll` existe pour éviter le traitement Jekyll par GitHub Pages
3. **Création de la branche `gh-pages`** : Crée la branche `gh-pages` si elle n'existe pas encore (en tant que branche orpheline)
4. **Utilisation d'un worktree** : Utilise un worktree Git pour travailler sur la branche `gh-pages` sans changer de branche
5. **Nettoyage** : Supprime les anciens fichiers du worktree
6. **Copie des fichiers** : Copie le contenu de `_site` dans le worktree
7. **Commit et push** : Commite et pousse les changements vers GitHub
8. **Nettoyage** : Supprime le worktree après le déploiement

**Prérequis :**

- Ruby, Bundler et Jekyll doivent être installés (voir la section "Générer un bookmarklet ou tester le site en local")
- Le dépôt Git doit être configuré avec un remote `origin` pointant vers GitHub
- Vous devez avoir les permissions pour pousser vers la branche `gh-pages`

**Note :** Si aucun changement n'est détecté, le script affichera "Nothing to commit (no changes)" mais continuera l'exécution.

### Utilisation du script switch_gemfile.sh

Le script `switch_gemfile.sh` permet de basculer facilement entre les configurations de Gemfile.lock spécifiques à chaque plateforme (macOS ou Windows). Cela est utile lorsque vous travaillez sur différentes plateformes ou lorsque vous rencontrez des problèmes de compatibilité.

Pour utiliser le script :

```bash
# Sur macOS
./switch_gemfile.sh mac

# Sur Windows (dans Powershell)
.\switch_gemfile.ps1 windows
```

Le script effectue les opérations suivantes :

1. Supprime le fichier Gemfile.lock existant (s'il existe)
2. Copie le fichier Gemfile.lock approprié pour votre plateforme (Gemfile.lock.mac ou Gemfile.lock.windows)
3. Exécute `bundle install` pour s'assurer que toutes les dépendances sont correctement installées

Ce script est particulièrement utile pour éviter les problèmes de compatibilité entre les différentes plateformes lors du développement.
