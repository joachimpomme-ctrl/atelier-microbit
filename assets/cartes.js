/* Cartes de projet communes : banque, parcours, accueil. */
(function(){
"use strict";
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
function led(pat){ return String(pat).replace(/,/g,"").split("").map(function(c){ return '<span'+(c==="#"?' class="on"':'')+'></span>'; }).join(""); }
function lvl(n){ var s=""; for(var i=1;i<=3;i++) s+='<i'+(i<=n?' class="on"':'')+'></i>'; return '<span class="lv" aria-hidden="true">'+s+'</span>'; }
/* racine : chemin vers la racine du site depuis la page ("../", "../../" ou "") */
function card(p, racine, opts){
  opts=opts||{};
  var C=window.CATALOGUE, MAT=C.materiels, NIV=C.niveaux;
  var meta=[MAT[p.materiel].court, NIV[String(p.niveau)]]; if(p.duree) meta.push(p.duree);
  if(opts.modele && p.modele) meta.unshift("modèle "+p.modele);
  var badge=p._done?'<span class="badge ok">Réussi ✓</span>':(p.v2?'<span class="badge v2">V2</span>':'');
  var tags=p.notions.filter(function(n){return n!=="construire";}).slice(0,4).map(function(n){ return '<li>'+esc(n)+'</li>'; }).join("");
  var kind=p.type==="mission"?' · mission':(p.type==="guide"?' · guide':'');
  var step=opts.etape?'<p class="eyebrow">Étape '+opts.etape+'</p>':'';
  var AIDES=C.aides||{}, aide=p.aide&&AIDES[p.aide]?'<p class="aide">Aide : '+esc(AIDES[p.aide])+'</p>':'';
  return '<a class="pcard'+(badge?' has-badge':'')+'" href="'+esc(racine+p.url)+'">'+badge
    +'<div class="top"><div class="led5" aria-hidden="true">'+led(p.icone)+'</div><div>'+step+'<h3>'+esc(p.titre)+'</h3><p class="meta">'+esc(meta.join(" · "))+kind+' '+lvl(p.niveau)+'</p></div></div>'
    +'<div class="res"><p>'+esc(p.resume)+'</p>'+aide+'</div>'
    +(opts.sansTags?'':'<ul class="tags">'+tags+'</ul>')
    +'</a>';
}
/* Marque chaque entrée du catalogue réussie ou non (_done) */
function marquer(){
  var S=window.BANQUE_STORE.load();
  window.CATALOGUE.projets.forEach(function(p){ p._done=window.BANQUE_STORE.estReussi(p,S); });
  return S;
}
window.CARTES={esc:esc,led:led,lvl:lvl,card:card,marquer:marquer};
})();
