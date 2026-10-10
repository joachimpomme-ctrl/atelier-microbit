/* Moteur des pages projet de la banque.
   La page définit avant ce script : window.PROJET = {id, progs, needs}
   Stockage commun à toute la banque : localStorage "banque-v1". */
(function(){
"use strict";
var P = window.PROJET || {id:"?", progs:{}, needs:{}};
var KEY = "banque-v1", CODEKEY = "ateliers-code-parent";

function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
function flat(a){ var out=[]; (function f(x){ x.forEach(function(y){ if(Array.isArray(y)) f(y); else if(y) out.push(y); }); })(a); return out; }

/* ---------- Stockage ---------- */
var S = window.BANQUE_STORE.load();
function save(){ window.BANQUE_STORE.save(S); }

/* ---------- Modèle de blocs ---------- */
var B = {
  dd:function(v,u){ return {f:"dd",v:v,u:u||null}; },
  num:function(v,u){ return {f:"num",v:v,u:u||null}; },
  st:function(cat,parts,u,note){ return {k:"st",cat:cat,parts:parts,u:u||null,note:note||null}; },
  rep:function(cat,parts,u){ return {k:"rep",cat:cat,parts:parts,u:u||null}; },
  bool:function(cat,parts,u){ return {k:"bool",cat:cat,parts:parts,u:u||null}; },
  ev:function(cat,head,body,u){ return {k:"ev",cat:cat,head:head,body:flat(body||[]),u:u||null}; },
  c:function(cat,arms,u){ return {k:"c",cat:cat,arms:arms.map(function(a){ return {head:a[0],body:flat(a[1]||[])}; }),u:u||null}; },
  flat:flat
};
var UT = {lbl:"Libellé à confirmer dans votre MakeCode : fiez-vous à la couleur et à la forme.", val:"Valeur du fabricant : mesurez-la sur votre machine et notez-la sur cette page."};
var DRAWER = {base:"Base",input:"Entrées",loops:"Boucles",logic:"Logique",vars:"Variables",math:"Maths",ml:"Apprentissage automatique",wukong:"wuKong",sonar:"Sonarbit",radio:"Radio",pins:"Broches",music:"Musique",led:"LED",neo:"NeoPixel",minicar:"MiniCar"};
function uAttr(u){ return u ? ' title="'+esc(UT[u]||u)+'"' : ""; }
function partH(p){
  if(typeof p==="string") return '<span class="t">'+esc(p)+'</span>';
  if(p.f==="dd") return '<span class="dd'+(p.u?' unsure':'')+'"'+uAttr(p.u)+'>'+esc(p.v)+'<i aria-hidden="true">▾</i></span>';
  if(p.f==="num") return '<span class="num'+(p.u?' unsure':'')+'"'+uAttr(p.u)+'>'+esc(p.v)+'</span>';
  return nodeH(p);
}
function row(parts){ return '<div class="row">'+parts.map(partH).join("")+'</div>'; }
function nodeH(n){
  var style=' style="--cat:var(--c-'+n.cat+')"', uc=n.u?' unsure':'', ut=uAttr(n.u);
  if(n.k==="st") return '<div class="line"><div class="blk st'+uc+'"'+style+ut+'>'+row(n.parts)+'</div>'+(n.note?'<span class="note">'+esc(n.note)+'</span>':'')+'</div>';
  if(n.k==="rep") return '<span class="blk rep'+uc+'"'+style+ut+'>'+n.parts.map(partH).join("")+'</span>';
  if(n.k==="bool") return '<span class="blk bool'+uc+'"'+style+ut+'>'+n.parts.map(partH).join("")+'</span>';
  if(n.k==="ev") return '<div class="line"><div class="blk ev'+uc+'"'+style+ut+'>'+row(n.head)+'<div class="mouth">'+n.body.map(nodeH).join("")+'</div><div class="foot"></div></div></div>';
  if(n.k==="c") return '<div class="line"><div class="blk c'+uc+'"'+style+ut+'>'+n.arms.map(function(a){ return row(a.head)+'<div class="mouth">'+a.body.map(nodeH).join("")+'</div>'; }).join("")+'<div class="foot"></div></div></div>';
  return "";
}
function hasU(nodes){
  var found=false;
  (function walk(ns){ ns.forEach(function(n){
    if(!n||typeof n!=="object") return;
    if(n.u) found=true;
    (n.parts||[]).concat(n.head||[]).forEach(function(p){ if(p&&typeof p==="object"){ if(p.f){ if(p.u) found=true; } else walk([p]); } });
    if(n.body) walk(n.body);
    if(n.arms) n.arms.forEach(function(a){ walk(a.head.filter(function(p){return p&&typeof p==="object"&&!p.f;})); walk(a.body); });
  }); })(nodes);
  return found;
}
function val(k){ var v=S.c[k]; return (v===undefined||v===null||v==="") ? null : v; }
function renderProg(el){
  var f=(P.progs||{})[el.getAttribute("data-prog")]; if(!f) return;
  var nodes=f(B,val);
  el.innerHTML=(hasU(nodes)?'<p class="unsure-note">Pointillés jaunes : un mot qui peut varier dans votre MakeCode, ou une valeur à mesurer sur votre machine.</p>':'')+'<div class="ws">'+nodes.map(nodeH).join("")+'</div>';
}
function renderNeeds(){
  document.querySelectorAll("[data-need]").forEach(function(el){
    var f=(P.needs||{})[el.getAttribute("data-need")]; if(!f) return;
    var nodes=f(B,val);
    el.innerHTML=nodes.map(function(n){ return '<figure>'+nodeH(n)+'<figcaption class="drawer" style="--cat:var(--c-'+n.cat+')">tiroir '+esc(DRAWER[n.cat]||n.cat)+'</figcaption></figure>'; }).join("")
      +(hasU(nodes)?'<p class="unsure-note" style="flex-basis:100%">Pointillés jaunes : un mot qui peut varier dans votre MakeCode. Fiez-vous à la couleur et à la forme.</p>':'');
  });
}
function renderAllProgs(){ document.querySelectorAll("[data-prog]").forEach(renderProg); renderNeeds(); }

/* ---------- Équipe : qui pilote ce projet ---------- */
function crewName(i){ var v=(S.names[i]||"").trim(); return v || ("Équipier "+i); }
function renderCrew(){
  var a=(S.pilot[P.id]==="2")?"2":"1", b=a==="1"?"2":"1";
  var el=document.getElementById("crew"); if(!el) return;
  el.querySelector('[data-pilot="1"]').textContent=crewName("1");
  el.querySelector('[data-pilot="2"]').textContent=crewName("2");
  el.querySelectorAll("input[name=pilot]").forEach(function(r){ r.checked=(r.value===a); });
  var cp=document.getElementById("copilot"); if(cp) cp.textContent=crewName(b);
}
function bindCrew(){
  document.querySelectorAll("#crew input[name=pilot]").forEach(function(r){ r.addEventListener("change",function(){ S.pilot[P.id]=r.value; save(); renderCrew(); }); });
}

/* ---------- Réussi ---------- */
function renderDone(){
  var on=!!S.done[P.id];
  document.querySelectorAll("[data-done-projet]").forEach(function(b){ b.setAttribute("aria-pressed",on?"true":"false"); b.textContent=on?"Projet réussi ✓":"Projet réussi ?"; });
}
function bindDone(){
  document.querySelectorAll("[data-done-projet]").forEach(function(b){ b.addEventListener("click",function(){ S.done[P.id]=!S.done[P.id]; if(!S.done[P.id]) delete S.done[P.id]; save(); renderDone(); }); });
}

/* ---------- Champs du carnet ---------- */
function syncFields(){
  document.querySelectorAll("[data-k]").forEach(function(el){
    var k=el.getAttribute("data-k"), v=S.c[k];
    if(el.type==="radio") el.checked=(String(v)===el.value);
    else el.value=(v===undefined||v===null)?"":v;
  });
}
function bindFields(){
  document.querySelectorAll("[data-k]").forEach(function(el){
    var k=el.getAttribute("data-k");
    el.addEventListener(el.type==="radio"?"change":"input",function(){
      if(el.type==="radio"){ if(el.checked) S.c[k]=el.value; }
      else if(el.type==="number"){ var n=parseInt(el.value,10); var mn=el.min!==""?+el.min:-Infinity, mx=el.max!==""?+el.max:Infinity; S.c[k]=(isNaN(n)||n<mn||n>mx)?null:n; }
      else S.c[k]=el.value.slice(0,400);
      save(); if(el.type==="radio") syncFields(); renderAllProgs(); renderSaved(el);
    });
  });
}
function renderSaved(el){
  var box=el.closest(".carnet-form"); if(!box) return;
  var s=box.querySelector(".saved"); if(s){ s.hidden=false; }
}

/* ---------- Copier ---------- */
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-copy]"); if(!b) return;
  var el=document.getElementById(b.getAttribute("data-copy")); if(!el) return;
  var text=el.textContent, label=b.textContent;
  function selectIt(){ try{ var r=document.createRange(); r.selectNodeContents(el); var s=window.getSelection(); s.removeAllRanges(); s.addRange(r); }catch(err){} b.textContent="Sélectionné : Ctrl+C"; setTimeout(function(){ b.textContent=label; },2200); }
  try{ navigator.clipboard.writeText(text).then(function(){ b.textContent="Copié !"; setTimeout(function(){ b.textContent=label; },1800); }, selectIt); }catch(err){ selectIt(); }
});

/* ---------- Verrou parent ---------- */
function getCode(){ try{ return localStorage.getItem(CODEKEY)||""; }catch(e){ return ""; } }
var unlocked=false;
function bindLocks(){
  var parents=document.body.getAttribute("data-racine")+"parents/";
  document.querySelectorAll(".lockbox").forEach(function(box){
    var btn=box.querySelector("[data-unlock]"), body=box.querySelector(".sol-body");
    if(!btn||!body) return;
    var label=btn.textContent;
    var form=document.createElement("div"); form.className="lockform"; form.hidden=true;
    form.innerHTML='<input class="textin short" type="password" autocomplete="off" aria-label="Code parent" placeholder="Code parent"><button class="btn solid" type="button">Ouvrir</button><span class="lockmsg" role="status"></span>';
    box.insertBefore(form, body);
    var input=form.querySelector("input"), go=form.querySelector("button"), msg=form.querySelector(".lockmsg");
    function show(){ body.hidden=false; form.hidden=true; btn.textContent="Cacher la solution"; renderAllProgs(); }
    function tryOpen(){ if(input.value && input.value===getCode()){ unlocked=true; input.value=""; msg.textContent=""; show(); } else msg.textContent="Ce n'est pas le bon code."; }
    btn.addEventListener("click",function(){
      if(!body.hidden){ body.hidden=true; btn.textContent=label; return; }
      if(unlocked){ show(); return; }
      if(!getCode()){ form.hidden=false; input.hidden=true; go.hidden=true; msg.innerHTML='Pas encore de code parent. Un adulte peut en créer un sur la <a href="'+parents+'">page des parents</a>.'; return; }
      input.hidden=false; go.hidden=false; msg.textContent=""; form.hidden=!form.hidden; if(!form.hidden) input.focus();
    });
    go.addEventListener("click",tryOpen);
    input.addEventListener("keydown",function(e){ if(e.key==="Enter") tryOpen(); });
  });
}

renderAllProgs();
bindCrew(); renderCrew();
bindDone(); renderDone();
syncFields(); bindFields();
bindLocks();
})();
