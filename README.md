# bookmarklets-pour-le-rgaa-4.1.2

Lien pour retrouver les bookmarklets pour le RGAA 4.1.2 :  
https://numerik-ea.github.io/bookmarklets-pour-le-rgaa-4.1.2/

---

Pour ajouter un bookmarklet à votre navigateur :  
1. Aller sur https://numerik-ea.github.io/bookmarklets-pour-le-rgaa-4.1.2/
2. Cliquer sur le lien d'un bookmarklet
3. Copier le code du bookmarklet
4. Faire un clic droit dans la barre des favoris/marque-pages
5. Cliquer sur "Ajouter une page" dans Google Chrome ou "Ajouter un marque-page" dans Firefox
6. Choisir un nom pour le bookmarklet dans le champ Nom
7. Coller le code du bookmarklet dans le champ URL
8. Cliquer sur "Enregistrer" et voilà !
9. NB : Pour utiliser le bookmarklet, il suffit de cliquer dessus


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
php transform_script_to_bookmarklet.php <path_to_script_name>.js
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
bundle exec jekyll serve
```


