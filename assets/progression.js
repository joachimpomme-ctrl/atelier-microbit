/* Progression de la banque de projets, partagée par toutes les pages.
   - "banque-v1" : projets de la banque (prénoms, pilote par projet, projets réussis, carnet commun)
   - les parcours robot et IA gardent leur propre stockage ("atelier-robot-v1", "atelier-ia-v1") */
(function(){
"use strict";
var KEY="banque-v1";
var WONDER_OLD=["wonder-helicoptere","wonder-moto","wonder-essuie-glace","wonder-machine-a-dessiner","wonder-porte-automatique","wonder-voiture-prudente","wonder-suiveur-de-ligne","wonder-chariot-telecommande"];
function defaults(){ return {names:{"1":"","2":""},pilot:{},done:{},c:{}}; }
function read(k){ try{ var r=localStorage.getItem(k); return r?JSON.parse(r):null; }catch(e){ return null; } }
function load(){
  var d=defaults(), o=read(KEY);
  if(!o){
    /* Reprise de l'ancien atelier Wonder (une seule page) */
    var w=read("atelier-wonder-v1");
    if(w && typeof w==="object"){
      if(w.names) d.names=w.names;
      if(w.done) WONDER_OLD.forEach(function(id,i){ if(w.done["m"+(i+1)]){ d.done[id]=true; d.done["wonder-demarrer"]=true; } });
      if(w.c) Object.keys(w.c).forEach(function(k){ if(/^w_/.test(k)) d.c[k]=w.c[k]; });
    }
    var r=read("atelier-robot-v1")||read("atelier-ia-v1");
    if(r && r.names && !d.names["1"] && !d.names["2"]) d.names=r.names;
    return d;
  }
  if(o.names && typeof o.names==="object") ["1","2"].forEach(function(k){ if(typeof o.names[k]==="string") d.names[k]=o.names[k].slice(0,16); });
  ["pilot","done","c"].forEach(function(k){ if(o[k] && typeof o[k]==="object") d[k]=o[k]; });
  return d;
}
function save(S){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
/* Une entrée du catalogue est-elle réussie ? */
function estReussi(entree, S){
  S = S || load();
  if(!entree.stockage || entree.stockage==="banque") return !!S.done[entree.id];
  var o=read(entree.stockage);
  return !!(o && o.done && o.done[entree.mission]);
}
/* Les prénoms valent pour toute l'équipe : banque, parcours robot et parcours IA */
var AUTRES=["atelier-robot-v1","atelier-ia-v1"];
function setNames(n1,n2){
  var names={"1":String(n1||"").slice(0,16),"2":String(n2||"").slice(0,16)};
  var S=load(); S.names=names; save(S);
  AUTRES.forEach(function(k){ var o=read(k); if(!o||typeof o!=="object") o={}; o.names=names; try{ localStorage.setItem(k,JSON.stringify(o)); }catch(e){} });
  return names;
}
/* Toutes les clés à sauvegarder (fichier de sauvegarde sur la page des parents) */
var CLES=["banque-v1","atelier-robot-v1","atelier-ia-v1","atelier-wonder-v1"];
window.BANQUE_STORE={load:load,save:save,estReussi:estReussi,read:read,setNames:setNames,cles:CLES};
})();
