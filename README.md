# Les ateliers micro:bit

Des projets pour apprendre à programmer, à construire et à comprendre l'IA avec la carte micro:bit et MakeCode.
Le site est publié avec GitHub Pages : https://joachimpomme-ctrl.github.io/atelier-microbit/

## Ce qu'il y a sur le site

| Adresse | Page | Contenu |
|---|---|---|
| `/` | Accueil | recherche, parcours avec l'étape suivante, accès par matériel, prénoms de l'équipe |
| `projets/` | Banque de projets | tous les projets, recherche et filtres (matériel, niveau, notion, état) |
| `projets/<id>/` | Un projet | une page par projet, générée (voir plus bas) |
| `wonder/` | Parcours Wonder | 10 étapes, puis les 24 autres machines du kit, réglages notés |
| `robot/` | Parcours robot | robot Keyestudio MiniCar, 9 missions sur une page |
| `ia/` | Parcours IA | micro:bit V2 et CreateAI, 8 missions sur une page |
| `parents/` | Pour les parents | code des solutions, sécurité, rôle de l'adulte, sauvegarde, remise à zéro |

La banque compte 61 entrées : 44 pages projet, plus les 17 missions des parcours robot et IA (listées dans la banque, elles ouvrent leur page de parcours).

### Le classement

- **Matériel** : `microbit` (la carte seule), `minicar` (robot MiniCar), `wonder` (kit Wonder 32 en 1), `createai` (IA).
- **Niveau** : 1 Découverte, 2 Apprenti, 3 Ingénieur.
- **Notions** : mots libres (`moteurs`, `radio`, `servo`…). Réutiliser les notions existantes avant d'en créer une. La liste est dans `assets/catalogue.js` après génération.
- **Parcours** : `microbit`, `robot`, `wonder`, `ia`. Dans un parcours, `ordre` de 0 à 99 = les étapes dans l'ordre ; de 100 à 899 = les fiches libres (pour Wonder : 100 + numéro du modèle).

## Ajouter un projet

1. Créer `contenu/projets/<id>.html`. L'`id` est en minuscules avec des tirets, préfixé par le matériel : `microbit-…`, `wonder-…`. Le plus simple : copier un projet proche.
2. Écrire l'en-tête, puis le corps (voir ci-dessous).
3. Lancer depuis la racine du dépôt : `python3 outils/generer.py`
4. Ouvrir `projets/<id>/index.html` dans un navigateur et vérifier : la solution s'affiche avec le code parent, aucun texte ne déborde sur téléphone.
5. Commit de la source **et** des fichiers générés (`projets/`, `assets/catalogue.js`).

Ne jamais modifier `projets/<id>/index.html` à la main : il est réécrit à chaque génération.

### L'en-tête

```html
<!--
id: microbit-de
titre: Le dé électronique
resume: Secouez la carte : elle tire un nombre de 1 à 6. Puis une expérience sur le hasard.
materiel: microbit
niveau: 1
aide: l3
duree: 30 min
notions: hasard, accéléromètre, expérience
parcours: microbit
ordre: 2
icone: de
-->
```

| Champ | Obligatoire | Valeurs |
|---|---|---|
| `id` | oui | identique au nom du fichier |
| `titre`, `resume` | oui | une phrase courte, concrète, testable |
| `materiel` | oui | `microbit`, `minicar`, `wonder`, `createai` |
| `niveau` | oui | `1`, `2`, `3` |
| `notions` | oui | séparées par des virgules |
| `aide` | non | `l3` tout est expliqué, `l2` juste le plan, `l1` juste l'objectif |
| `duree`, `modele` | non | texte libre ; `modele` = numéro du modèle Wonder |
| `parcours`, `ordre` | non | voir « Le classement » |
| `icone` | non | un nom du dictionnaire `ICONES` dans `outils/generer.py` (motif 5×5, `#` = allumé) |
| `v2` | non | `oui` si le projet a besoin d'une micro:bit V2 |
| `type` | non | `guide` pour une page de préparation |

### Le corps

Les pages enfant tutoient l'enfant (« Ta mission », « Prédis d'abord », « Résume en une phrase »). Des blocs HTML avec les classes de `assets/atelier.css`, dans cet ordre :

1. `<p class="goal"><b>Ta mission :</b> …</p>` : la mission en une phrase.
2. `<div class="build">` (projets à construire) : lien vers la fiche de montage, branchements dans `<div class="wire">`, consignes de sécurité.
3. `<div class="predict">` : une question de prédiction, avec un champ `data-k="@pred"` (zone de texte ou boutons radio). La réponse ne doit apparaître nulle part sur la page avant que l'enfant ait répondu. Un élément qui la donne porte `data-apres="@pred"` : il reste caché tant que la prédiction est vide.
4. Selon l'aide : `<div class="need" data-need="b">` (les blocs à utiliser), `<ol class="steps">` (le pas à pas ou le plan).
5. `<div class="carnet-form">` si une mesure est utile.
6. **Exactement trois indices**, sur la mission (pas sur le défi), avec ces titres : `Indice 1 · une question`, `Indice 2 · où chercher`, `Indice 3 · un exemple sur un autre cas`. Balise : `<details class="hint"><summary>…</summary><div class="body"><p>…</p></div></details>`. Aucun ne donne la solution complète.
7. `<div class="lockbox">` : la solution, `<div class="prog" data-prog="sol">`. Le bouton ne s'active qu'une fois les indices ouverts, puis il demande le code parent.
8. `<div class="resume">` avec `data-k="@res"`. La page y rappelle automatiquement la prédiction.
9. `<div class="bonus"><h3><span>Défi bonus</span>Titre</h3>…</div>`, après le résumé. Un coup de pouce éventuel : `<details class="hint-defi">`.
10. Un `<script>` qui dessine les programmes.

La page ajoute seule l'en-tête, la barre (pilote, aide, état, « Ouvrir MakeCode »), le bouton de fin « On a réussi ! Projet suivant » et les projets proches.

Les champs `data-k="@nom"` sont enregistrés pour ce projet (`@` devient `<id>_`). Un nom sans `@` est partagé entre projets : les réglages Wonder (`w_av`, `w_m1`, `w_porte_f`, `w_porte_o`, `w_sonar`, `w_p1`, `w_noir`, `w_f_bas`, `w_f_haut`, `w_groupe`) servent à toutes les machines.

### Dessiner les blocs

Les programmes sont dessinés avec les aides de `assets/blocs.js` (objet `K`), dans le script du projet :

```js
Object.assign(PROJET.needs, { "b": function(B){ return [K.onBtn(B,"A"), K.icon(B,"cœur")]; } });
Object.assign(PROJET.progs, { "sol": function(B,v){ return [
  K.onStart(B, K.radioGroup(B,1)),
  K.onBtn(B,"A", K.radioSend(B,1))
]; } });
```

- Événements : `onStart`, `forever`, `onBtn`, `gesture`, `onLogo`, `onRadio`.
- Affichage et son : `icon`, `text`, `showNum`, `clear`, `plot`, `pause`, `melody`, `tone`, `sound`.
- Logique et variables : `si`, `sis` (si… sinon si), `cmp`, `and`, `or`, `repeat`, `vr`, `setVar`, `chg`, `random`, `div`.
- Capteurs : `btnPressed`, `temp`, `light`, `compass`, `accel`, `runtime`, `readPin`, `readAnalog`, `rn` (nombre reçu par radio).
- Wonder : `motor`, `motors`, `stopM`, `stopAll`, `servo`, `sonar`, `drive(B,v,gauche,droite)` (tient compte des réglages notés), `cfg(v)`.
- Bloc absent de la liste : `B.st(cat, [textes et champs])` pour une instruction, `B.rep` pour une valeur ronde, `B.bool` pour une condition. Champs : `B.num(5)`, `B.dd("cm")`.

Un nom de bloc non vérifié dans l'interface française se marque `"lbl"`, une valeur à mesurer `"val"` : le bloc s'affiche en pointillés jaunes. Ne jamais inventer un libellé sans le marquer.

## Règles pédagogiques

- Un projet = une machine ou un objectif concret, testable, en une phrase.
- Chaque projet commence par une prédiction et finit par une phrase de résumé.
- L'aide diminue avec le niveau : tout expliqué, puis le plan, puis l'objectif seul.
- Indices en trois niveaux : une question, où chercher, un exemple sur un autre cas. Jamais la solution dans un indice.
- Solutions derrière le code parent.
- À deux : pilote et copilote, on échange à chaque projet.
- Sécurité : montages à piles ou en USB uniquement, jamais rien relié au secteur. Batteries lithium, découpe, soudure : avec un adulte.

## Stockage dans le navigateur

Rien n'est envoyé. Aucune donnée personnelle dans ce dépôt.

| Clé localStorage | Contenu |
|---|---|
| `banque-v1` | prénoms, pilote par projet, projets réussis, carnet commun (`c`) |
| `atelier-robot-v1`, `atelier-ia-v1` | progression des parcours robot et IA |
| `atelier-wonder-v1` | ancienne page Wonder, reprise automatiquement dans `banque-v1` |
| `ateliers-code-parent` | le code parent (barrière douce, pas une sécurité) |

La page des parents exporte et réimporte toutes ces clés sauf le code.

## Fichiers

- `contenu/projets/*.html` : les sources des projets. `contenu/externes.json` : les missions robot et IA listées dans la banque.
- `outils/generer.py` : fabrique les pages projet et `assets/catalogue.js`. Vérifie les en-têtes.
- `assets/atelier.css` : la charte commune. `assets/progression.js` : stockage partagé. `assets/projet.js` : moteur des pages projet. `assets/blocs.js` : dessin des blocs. `assets/cartes.js` : cartes de projet. `assets/atelier.js` : moteur de la page IA.

## Sources

- MakeCode pour micro:bit, micro:bit CreateAI : guides officiels, traductions de l'interface (`microbit-foundation/ml-trainer`) et de l'extension (`microbit-foundation/pxt-microbit-ml`).
- Kit Wonder : documentation ELECFREAKS (`elecfreaks/learn-en`, wiki ELECFREAKS), extensions `elecfreaks/pxt-wukong` et `elecfreaks/pxt-sonarbit`, programmes MakeCode officiels de chaque modèle.
