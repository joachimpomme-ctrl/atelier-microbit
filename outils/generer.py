#!/usr/bin/env python3
"""Génère les pages de la banque de projets.

Entrées :
  contenu/projets/<id>.html   un fichier par projet : un en-tête <!-- clé: valeur --> puis le corps HTML
  contenu/externes.json       missions des parcours robot et IA (pages déjà existantes)
Sorties :
  projets/<id>/index.html     une page par projet
  assets/catalogue.js         le catalogue lu par l'accueil, la banque et les parcours

Lancer depuis la racine du dépôt :  python3 outils/generer.py
"""
import html, json, os, re, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, "contenu", "projets")

MATERIELS = {
    "microbit": {"nom": "micro:bit seule", "court": "micro:bit", "desc": "La carte toute seule : écran, boutons, capteurs, radio, son."},
    "minicar":  {"nom": "Robot MiniCar", "court": "MiniCar", "desc": "Le robot à deux roues avec radar et suivi de ligne."},
    "wonder":   {"nom": "Kit Wonder", "court": "Wonder", "desc": "Les briques, moteurs, servos et capteurs du kit Wonder 32 en 1."},
    "createai": {"nom": "IA CreateAI", "court": "IA", "desc": "Apprendre à la carte à reconnaître des mouvements."},
}
NIVEAUX = {1: "Découverte", 2: "Apprenti", 3: "Ingénieur"}
AIDES = {"l3": "Tout est expliqué", "l2": "Juste le plan", "l1": "Juste l'objectif"}
PARCOURS = {
    "microbit": {"titre": "Premiers pas micro:bit", "url": "projets/#parcours=microbit"},
    "robot":  {"titre": "Parcours robot", "url": "robot/"},
    "wonder": {"titre": "Parcours Wonder", "url": "wonder/", "fiche": "Machine", "fiches": "toutes les machines"},
    "ia":     {"titre": "Parcours IA", "url": "ia/"},
}
ICONES = {
    "face": ".....,.#.#.,.....,#...#,.###.", "robot": ".###.,#.#.#,#####,.#.#.,##.##",
    "engrenage": ".#.#.,#####,##.##,#####,.#.#.", "ia": "..#..,.#.#.,#...#,.#.#.,..#..",
    "helice": "#...#,.#.#.,..#..,.#.#.,#...#", "moto": "...#.,..##.,#####,##.##,.#.#.",
    "essuie": "#....,.#...,..#..,...#.,#####", "crayon": "...##,..###,.###.,###..,#....",
    "porte": "####.,#..#.,#..##,#..#.,####.", "stop": "..#..,..#..,..#..,.....,..#..",
    "ligne": "..##.,.#...,..#..,...#.,.##..", "radio": "..#..,#.#.#,.###.,..#..,..#..",
    "etoile": "..#..,#####,.###.,.#.#.,#...#", "carnet": "####.,#..#.,####.,#..#.,####.",
    "outil": "##...,###..,.###.,..###,...##", "toupie": "#####,.###.,..#..,..#..,..#..",
    "roue": ".###.,#.#.#,#####,#.#.#,.###.", "pied": ".##..,.##..,.##..,.####,.####",
    "panier": "#...#,#####,.#.#.,..#..,.....", "bras": "##...,.#...,.####,....#,...##",
    "bateau": "..#..,..##.,..#..,#####,.###.", "bascule": "....#,..##.,.###.,##...,..#..",
    "note": "..##.,..#.#,..#..,###..,###..", "marche": ".#...,###..,.#.#.,.#..#,#...#",
    "balai": "..#..,..#..,..#..,.###.,#.#.#", "chariot": "#....,#..##,#####,#####,.#.#.",
    "echelle": "#...#,#####,#...#,#####,#...#", "chenille": ".....,#####,#.#.#,#####,.....",
    "pluie": "..#..,.###.,#####,..#..,.##..", "araignee": "#...#,.#.#.,#####,.#.#.,#...#",
    "train": "#....,####.,#####,#####,.#.#.", "fouet": "..#..,..#..,.###.,#.#.#,.###.",
    "pirate": "..#..,.##..,..#..,#####,.###.", "poubelle": "#####,.###.,.#.#.,.#.#.,.###.",
    "catapulte": "....#,...#.,..#..,####.,#..#.", "lumiere": "..#..,#.#.#,.###.,#.#.#,..#..",
    "chien": "#....,####.,.####,.#..#,.#..#", "gyro": "..#..,.###.,#####,.###.,..#..",
    "chaise": "#####,#.#.#,..#..,..#..,#####", "monstre": ".#.#.,#####,#.#.#,#####,#...#",
    "nom": "#...#,##..#,#.#.#,#..##,#...#", "de": "#...#,.....,..#..,.....,#...#",
    "ciseaux": "##..#,##.#.,..#..,##.#.,##..#", "pas": "..#..,.##..,..#..,..#..,.###.",
    "thermo": "..#..,..#..,..#..,.###.,.###.", "lune": "..##.,.##..,.##..,.##..,..##.",
    "boussole": "..#..,.###.,..#..,..#..,..#..", "message": "#####,##.##,#.#.#,#...#,#####",
    "eclair": "...#.,..#..,.###.,..#..,.#...", "musique": ".####,.#..#,.#..#,##.##,##.##",
    "coeur": ".#.#.,#####,#####,.###.,..#..",
}
DEFAUT_ICONE = "face"


def led(nom, cls="led5", style=""):
    pat = ICONES.get(nom, ICONES[DEFAUT_ICONE]).replace(",", "")
    spans = "".join('<span class="on"></span>' if c == "#" else "<span></span>" for c in pat)
    st = f' style="{style}"' if style else ""
    return f'<div class="{cls}" aria-hidden="true"{st}>{spans}</div>'


def lire_projet(chemin):
    texte = open(chemin, encoding="utf-8").read()
    m = re.match(r"\s*<!--(.*?)-->\s*", texte, re.S)
    if not m:
        sys.exit(f"En-tête manquant : {chemin}")
    meta = {}
    for ligne in m.group(1).strip().splitlines():
        if ":" in ligne:
            k, v = ligne.split(":", 1)
            meta[k.strip()] = v.strip()
    corps = texte[m.end():]
    for obligatoire in ("id", "titre", "resume", "materiel", "niveau", "notions"):
        if obligatoire not in meta:
            sys.exit(f"{chemin} : champ « {obligatoire} » manquant")
    attendu = os.path.splitext(os.path.basename(chemin))[0]
    if meta["id"] != attendu:
        sys.exit(f"{chemin} : l'id doit être « {attendu} »")
    if meta["materiel"] not in MATERIELS:
        sys.exit(f"{chemin} : matériel inconnu « {meta['materiel']} »")
    meta["niveau"] = int(meta["niveau"])
    if meta["niveau"] not in NIVEAUX:
        sys.exit(f"{chemin} : niveau 1, 2 ou 3 attendu")
    if meta.get("aide") and meta["aide"] not in AIDES:
        sys.exit(f"{chemin} : aide l1, l2 ou l3 attendue")
    if meta.get("parcours") and meta["parcours"] not in PARCOURS:
        sys.exit(f"{chemin} : parcours inconnu « {meta['parcours']} »")
    if meta.get("icone") and meta["icone"] not in ICONES:
        sys.exit(f"{chemin} : icône inconnue « {meta['icone']} » (voir ICONES dans ce script)")
    meta["notions"] = [n.strip() for n in meta["notions"].split(",") if n.strip()]
    meta["ordre"] = int(meta.get("ordre", "999"))
    meta["corps"] = corps
    return meta


def remplir_icones(corps):
    """<span class="led5" data-icon="nom" ...></span> : on dessine l'icône dans la page."""
    def rempl(m):
        balise, nom, reste = m.group(1), m.group(2), m.group(3)
        pat = ICONES.get(nom, ICONES[DEFAUT_ICONE]).replace(",", "")
        spans = "".join('<span class="on"></span>' if c == "#" else "<span></span>" for c in pat)
        return f'<{balise} class="led5" data-icon="{nom}"{reste}>{spans}</{balise}>'
    return re.sub(r'<(span|div) class="led5" data-icon="([a-z-]+)"([^>]*)></\1>', rempl, corps)


def typographie(corps):
    """Espaces insécables avant ? ! : ; » et après « dans le texte (pas dans les balises ni les scripts)."""
    morceaux = re.split(r"(<script.*?</script>)", corps, flags=re.S)
    def texte(m):
        t = m.group(1)
        t = re.sub(r" ([?!:;»])", "\u00a0\\1", t)
        t = re.sub(r"« ", "«\u00a0", t)
        return ">" + t + "<"
    return "".join(x if x.startswith("<script") else re.sub(r">([^<>]+)<", texte, x) for x in morceaux)


def page_projet(p, tous):
    i = p["id"]
    corps = remplir_icones(p["corps"]).replace('data-k="@', f'data-k="{i}_').replace('data-apres="@', f'data-apres="{i}_')
    # Titres du corps : h2 (la page a un seul h1), avec l'apparence d'un h3
    corps = corps.replace("<h3>", '<h2 class="h3">').replace("</h3>", "</h2>")
    corps = typographie(corps)
    mat = MATERIELS[p["materiel"]]
    eyebrow = [mat["nom"], f'niveau {p["niveau"]} · {NIVEAUX[p["niveau"]]}']
    if p.get("duree"): eyebrow.append(p["duree"])
    if p.get("modele"): eyebrow.append(f'modèle {p["modele"]}')
    aide = p.get("aide")
    crumbs = ['<a href="../../">Accueil</a>', '<a href="../">Banque de projets</a>']
    par = p.get("parcours")
    if par in PARCOURS:
        crumbs.append(f'<a href="../../{PARCOURS[par]["url"]}">{html.escape(PARCOURS[par]["titre"])}</a>')
    v2 = ""
    if p.get("v2") == "oui":
        v2 = '<p class="tip">Ce projet a besoin d\'une carte <b>micro:bit V2</b> (logo doré sur la face avant).</p>'
    notions = "".join(f"<li>{html.escape(n)}</li>" for n in p["notions"] if n != "construire")
    # Précédent / suivant dans le parcours
    nav, nxt = "", None
    fin_parcours = ""
    if par:
        # ordre < 100 : les étapes du parcours ; 100 à 899 : les fiches libres (machines du kit…)
        etape = p["ordre"] < 100
        suite = sorted([q for q in tous if q.get("parcours") == par and (q["ordre"] < 100) == etape and q["ordre"] < 900], key=lambda q: q["ordre"])
        ids = [q["id"] for q in suite]
        if i in ids:
            k = ids.index(i)
            prev = suite[k - 1] if k > 0 else None
            nxt = suite[k + 1] if k + 1 < len(suite) else None
            cells = []
            mot = "Étape" if etape else PARCOURS[par].get("fiche", "Projet")
            fem = "e" if mot.endswith("e") else ""
            if prev: cells.append(f'<a class="p-link" href="../{prev["id"]}/"><span class="eyebrow">← {mot} précédent{fem}</span><b>{html.escape(prev["titre"])}</b></a>')
            if nxt: cells.append(f'<a class="p-link next" href="../{nxt["id"]}/"><span class="eyebrow">{mot} suivant{fem} →</span><b>{html.escape(nxt["titre"])}</b></a>')
            if cells:
                quoi = f'étape {k + 1} sur {len(suite)}' if etape else f'{PARCOURS[par].get("fiches", "autres projets")} · {k + 1} sur {len(suite)}'
                nav += f'<div class="p-seq"><p class="eyebrow">{html.escape(PARCOURS[par]["titre"])} · {html.escape(quoi)}</p><div class="p-links">{"".join(cells)}</div></div>'
            if not nxt:
                fin_parcours = f'../../{PARCOURS[par]["url"]}'
    # Projets proches : même matériel, niveau égal ou voisin, notions en commun
    proches = []
    for q in tous:
        if q["id"] == i or q["materiel"] != p["materiel"] or abs(q["niveau"] - p["niveau"]) > 1: continue
        if nxt and q["id"] == nxt["id"]: continue
        commun = len(set(q["notions"]) & set(p["notions"]) - {"construire"})
        if commun: proches.append((-commun, abs(q["niveau"] - p["niveau"]), q["ordre"], q))
    proches.sort(key=lambda t: t[:3])
    if proches:
        cards = "".join(
            f'<a class="mini-card" href="../{q["id"]}/">{led(q.get("icone", DEFAUT_ICONE))}<span><b>{html.escape(q["titre"])}</b><small>{html.escape(MATERIELS[q["materiel"]]["court"])} · niveau {q["niveau"]}{" · " + AIDES[q["aide"]] if q.get("aide") in AIDES else ""}</small></span></a>'
            for *_, q in proches[:3])
        nav += f'<div class="p-related"><p class="eyebrow">Projets proches</p><div class="mini-cards">{cards}</div></div>'
    # Fin de page : marquer réussi et passer au suivant en un seul geste
    if nxt:
        suivant = f'data-suivant="../{nxt["id"]}/" data-suivant-titre="{html.escape(nxt["titre"])}"'
    elif fin_parcours:
        suivant = f'data-fin="{fin_parcours}" data-fin-titre="{html.escape(PARCOURS[par]["titre"])}"'
    else:
        suivant = 'data-fin="../" data-fin-titre="la banque de projets"'
    titre = html.escape(p["titre"])
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="description" content="{html.escape(p["resume"])}">
<title>{titre} · Banque de projets micro:bit</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap">
<link rel="stylesheet" href="../../assets/atelier.css">
<script>window.PROJET={{id:{json.dumps(i)},progs:{{}},needs:{{}}}};</script>
</head>
<body data-racine="../../">
<!-- Page générée par outils/generer.py à partir de contenu/projets/{i}.html : modifier la source, pas cette page. -->
<main class="page proj">
  <nav class="crumbs" aria-label="Fil d'Ariane">{' <span aria-hidden="true">›</span> '.join(crumbs)}</nav>
  <header class="p-head">
    {led(p.get("icone", DEFAUT_ICONE), "led5 p-icon")}
    <div>
      <p class="eyebrow">{html.escape(" · ".join(eyebrow))}</p>
      <h1>{titre}</h1>
      <ul class="learn"><li class="lbl">Notions</li>{notions}</ul>
    </div>
  </header>
  <div class="p-bar">
    <div class="crew-pick" id="crew">
      <span>Pilote :</span>
      <span class="seg" role="radiogroup" aria-label="Qui pilote ce projet ?">
        <label><input type="radio" name="pilot" value="1"><span data-pilot="1">Équipier 1</span></label>
        <label><input type="radio" name="pilot" value="2"><span data-pilot="2">Équipier 2</span></label>
      </span>
      <span class="small">Copilote : <b id="copilot">Équipier 2</b></span>
    </div>
    <div class="p-bar-r">
      {f'<span class="lvl {aide}">{AIDES[aide]}</span>' if aide in AIDES else ""}
      <span class="etat" data-etat>À faire</span>
      <a class="btn mk" href="https://makecode.microbit.org/" target="_blank" rel="noopener">Ouvrir MakeCode <span aria-hidden="true">↗</span></a>
    </div>
  </div>
  {v2}
  <div class="p-main">
{corps}
  </div>
  <section class="p-finish" aria-label="Fin du projet" {suivant}></section>
  <nav class="p-nav" aria-label="Et après ?">{nav}</nav>
  <footer class="p-foot small">Les prénoms se règlent sur l'<a href="../../">accueil</a>. Code parent, sécurité et sauvegarde : <a href="../../parents/">page des parents</a>.</footer>
</main>
<script src="../../assets/progression.js"></script>
<script src="../../assets/blocs.js"></script>
<script src="../../assets/projet.js"></script>
</body>
</html>
'''


def main():
    projets = []
    for nom in sorted(os.listdir(SRC)):
        if nom.endswith(".html"):
            projets.append(lire_projet(os.path.join(SRC, nom)))
    ids = [p["id"] for p in projets]
    if len(ids) != len(set(ids)):
        sys.exit("Deux projets ont le même id.")
    # Le script d'un projet doit venir après window.PROJET (en-tête) : il est dans le corps, c'est le cas.
    for p in projets:
        dossier = os.path.join(RACINE, "projets", p["id"])
        os.makedirs(dossier, exist_ok=True)
        with open(os.path.join(dossier, "index.html"), "w", encoding="utf-8") as f:
            f.write(page_projet(p, projets))
    # Supprimer les pages générées dont la source a disparu
    gen = os.path.join(RACINE, "projets")
    for nom in os.listdir(gen):
        chemin = os.path.join(gen, nom)
        if os.path.isdir(chemin) and nom not in ids:
            index = os.path.join(chemin, "index.html")
            if os.path.exists(index) and "generer.py" in open(index, encoding="utf-8").read(3000):
                os.remove(index); os.rmdir(chemin)
    externes = json.load(open(os.path.join(RACINE, "contenu", "externes.json"), encoding="utf-8"))
    entrees = []
    for p in projets:
        entrees.append({k: p[k] for k in ("id", "titre", "resume", "materiel", "niveau", "notions", "ordre")} | {
            "duree": p.get("duree", ""), "parcours": p.get("parcours", ""), "url": f'projets/{p["id"]}/',
            "icone": ICONES.get(p.get("icone", DEFAUT_ICONE), ICONES[DEFAUT_ICONE]), "stockage": "banque",
            "modele": p.get("modele", ""), "v2": p.get("v2") == "oui", "type": p.get("type", "projet"), "aide": p.get("aide", "")})
    for e in externes:
        e = dict(e)
        e["icone"] = ICONES.get(e.get("icone", DEFAUT_ICONE), ICONES[DEFAUT_ICONE])
        entrees.append(e)
    compte = {}
    for e in entrees:
        for n in e["notions"]:
            compte[n] = compte.get(n, 0) + 1
    notions = sorted(compte, key=lambda n: (-compte[n], n))
    catalogue = {"materiels": MATERIELS, "niveaux": NIVEAUX, "aides": AIDES, "parcours": PARCOURS, "notions": notions, "projets": entrees}
    with open(os.path.join(RACINE, "assets", "catalogue.js"), "w", encoding="utf-8") as f:
        f.write("/* Généré par outils/generer.py : ne pas modifier à la main. */\nwindow.CATALOGUE = ")
        json.dump(catalogue, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print(f"{len(projets)} pages projet, {len(entrees)} entrées au catalogue, {len(notions)} notions.")


if __name__ == "__main__":
    main()
