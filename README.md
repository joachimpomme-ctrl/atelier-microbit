# Les ateliers micro:bit

Des missions pour apprendre à programmer, à construire et à comprendre l'IA avec la carte micro:bit et MakeCode.
Le site est publié avec GitHub Pages.

## Ateliers

| Dossier | Atelier | Missions | Matériel |
|---|---|---|---|
| `robot/` | L'atelier robot | 9 | robot Keyestudio MiniCar |
| `wonder/` | L'atelier Wonder | 8 | kit ELECFREAKS Wonder 32 en 1, une deuxième micro:bit pour la mission 8 |
| `ia/` | L'atelier IA | 8 | micro:bit V2, micro:bit CreateAI |

## Structure

- `index.html` : le hub. La liste des ateliers est le tableau `ATELIERS` dans son script.
- `assets/atelier.css` : la charte commune (carnet d'ingénieur sur papier millimétré).
- `assets/atelier.js` : le moteur commun des ateliers v2 (équipe, progression, carnet, blocs MakeCode dessinés, verrou parent).
- `ia/index.html`, `wonder/index.html` : contenu de l'atelier + un objet `window.ATELIER` (clé de stockage, icônes, programmes, carnet).
- `robot/index.html` : premier atelier, page autonome (styles et script inclus).

### Ajouter un atelier

1. Créer `nom/index.html` en partant de `wonder/index.html` (en-tête, sections, missions).
2. Dans son script `window.ATELIER` : une clé `atelier-nom-v1`, le nombre de missions, les programmes.
3. Ajouter une entrée au tableau `ATELIERS` de `index.html`.

## Pédagogie commune (ateliers v2)

- Une mission = un objectif concret, testable, en une phrase.
- Chaque mission commence par une prédiction et finit par une phrase de résumé.
- L'aide diminue : tout expliqué, puis le plan, puis l'objectif seul.
- Indices en trois niveaux : une question, où chercher, un exemple sur un autre cas.
- Solutions derrière un code parent (stocké dans le navigateur, partagé entre ateliers).
- Montages à piles ou en USB uniquement. Batteries lithium : charge avec un adulte.

## Données

Aucune donnée personnelle dans ce dépôt.
La progression, les carnets, les prénoms et le code parent restent dans le navigateur (localStorage).

## Sources

- micro:bit CreateAI : guide officiel, fichiers de traduction de l'interface (`microbit-foundation/ml-trainer`) et de l'extension MakeCode (`microbit-foundation/pxt-microbit-ml`).
- Kit Wonder : documentation ELECFREAKS (`elecfreaks/learn-en`), extensions `elecfreaks/pxt-wukong` et `elecfreaks/pxt-sonarbit`.
