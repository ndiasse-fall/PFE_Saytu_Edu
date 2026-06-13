# Remplacer le logo de Saytu Edu

Le logo utilisé par l'application se trouve ici :

`src/assets/branding/saytu-logo.png`

## Remplacement rapide

1. Préparez une image PNG carrée avec un fond transparent.
2. Utilisez de préférence une taille de `256 x 256 px` ou `512 x 512 px`.
3. Nommez le fichier `saytu-logo.png`.
4. Remplacez le fichier existant dans `src/assets/branding/`.
5. Redémarrez le serveur frontend avec `npm run dev`.

Le composant `src/app/shared/components/branding/BrandLogo.jsx` importe automatiquement ce fichier. Aucun autre changement de code n'est nécessaire si le nom reste identique.

## Utiliser un autre nom ou format

Modifiez l'import au début de `BrandLogo.jsx` :

```jsx
import logoSrc from '../../../../assets/branding/mon-nouveau-logo.webp'
```

Formats recommandés : PNG transparent, WebP transparent ou SVG.

## Affichage dans la barre supérieure

La barre supérieure affiche uniquement l'icône du logo. Le texte « Saytu Edu » est volontairement masqué avec :

```jsx
<BrandLogo size="md" showText={false} />
```
