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
var UT = {lbl:"Libellé à confirmer dans ton MakeCode : fie-toi à la couleur et à la forme.", val:"Valeur du fabricant : mesure-la sur ta machine et note-la sur cette page."};
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
  el.innerHTML=(hasU(nodes)?'<p class="unsure-note">Pointillés jaunes : un mot qui peut varier dans ton MakeCode, ou une valeur à mesurer sur ta machine.</p>':'')+'<div class="ws">'+nodes.map(nodeH).join("")+'</div>';
  marquerDefilement(el.querySelector(".ws"));
}
/* Un programme plus large que l'écran défile : on le rend atteignable au clavier */
function marquerDefilement(ws){
  if(!ws || ws.offsetParent===null) return;
  if(ws.scrollWidth>ws.clientWidth+2){ ws.setAttribute("tabindex","0"); ws.setAttribute("role","region"); ws.setAttribute("aria-label","Programme (défile sur le côté)"); ws.classList.add("defile"); }
}
function renderNeeds(){
  document.querySelectorAll("[data-need]").forEach(function(el){
    var f=(P.needs||{})[el.getAttribute("data-need")]; if(!f) return;
    var nodes=f(B,val);
    el.innerHTML=nodes.map(function(n){ return '<figure>'+nodeH(n)+'<figcaption class="drawer" style="--cat:var(--c-'+n.cat+')">tiroir '+esc(DRAWER[n.cat]||n.cat)+'</figcaption></figure>'; }).join("")
      +(hasU(nodes)?'<p class="unsure-note" style="flex-basis:100%">Pointillés jaunes : un mot qui peut varier dans ton MakeCode. Fie-toi à la couleur et à la forme.</p>':'');
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

/* ---------- Réussi : un état en haut, un seul geste en bas ---------- */
function esc2(s){ return esc(s); }
function renderDone(){
  var on=!!S.done[P.id];
  document.querySelectorAll("[data-etat]").forEach(function(e){ e.textContent=on?"Réussi ✓":"À faire"; e.classList.toggle("ok",on); });
  var fin=document.querySelector(".p-finish"); if(!fin) return;
  var nx=fin.getAttribute("data-suivant"), nxt=fin.getAttribute("data-suivant-titre"), end=fin.getAttribute("data-fin"), endt=fin.getAttribute("data-fin-titre");
  if(!on){
    fin.innerHTML='<p class="pt">Fini ?</p><p>Quand la machine fait ce que demande la mission, et que tu as écrit ta phrase de résumé :</p>'
      +'<div class="fin-btns"><button class="btn solid big" type="button" data-fini>'+(nx?'On a réussi ! Projet suivant →':'On a réussi !')+'</button></div>';
  } else {
    fin.innerHTML='<p class="pt ok">Projet réussi ✓</p>'
      +'<div class="fin-btns">'+(nx?'<a class="btn solid big" href="'+esc2(nx)+'">Projet suivant : '+esc2(nxt)+' →</a>':'<a class="btn solid big" href="'+esc2(end)+'">Retour : '+esc2(endt)+'</a>')
      +'<button class="linkish" type="button" data-annule>Pas encore réussi ? Annuler</button></div>';
  }
}
document.addEventListener("click",function(e){
  if(e.target.closest("[data-fini]")){
    S.done[P.id]=true; save();
    var nx=document.querySelector(".p-finish").getAttribute("data-suivant");
    if(nx){ location.href=nx; return; }
    renderDone(); return;
  }
  if(e.target.closest("[data-annule]")){ delete S.done[P.id]; save(); renderDone(); }
});

/* ---------- Ce qui attend la prédiction (data-apres) ---------- */
function renderApres(){
  document.querySelectorAll("[data-apres]").forEach(function(el){
    var v=S.c[el.getAttribute("data-apres")]; el.hidden=(v===undefined||v===null||String(v).trim()==="");
  });
}

/* ---------- Au résumé : rappeler la prédiction ---------- */
var PREDK=P.id+"_pred", VERK=P.id+"_verdict";
function renderRappel(){
  var box=document.querySelector(".resume"); if(!box || !document.querySelector('[data-k="'+PREDK+'"]')) return;
  var r=box.querySelector(".rappel");
  if(!r){ r=document.createElement("div"); r.className="rappel"; box.insertBefore(r, box.querySelector("textarea")); }
  var v=S.c[PREDK];
  if(v===undefined||v===null||String(v).trim()===""){ r.innerHTML='<p class="small">Tu n\'avais pas noté de prédiction. La prochaine fois, prédis avant d\'essayer : c\'est en comparant qu\'on apprend.</p>'; return; }
  var cur=S.c[VERK]||"";
  r.innerHTML='<p>Ta prédiction : <q>'+esc(String(v))+'</q></p><p class="small">Elle était…</p>'
    +'<span class="seg" role="radiogroup" aria-label="Ta prédiction était">'
    +["juste","en partie","fausse"].map(function(o){ return '<label><input type="radio" name="verdict" value="'+o+'"'+(cur===o?' checked':'')+'><span>'+o+'</span></label>'; }).join("")+'</span>';
  r.querySelectorAll("input").forEach(function(inp){ inp.addEventListener("change",function(){ S.c[VERK]=inp.value; save(); }); });
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
      save(); if(el.type==="radio") syncFields(); renderAllProgs(); renderSaved(el); renderApres(); if(k===PREDK) renderRappel();
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

/* ---------- Indices : on les ouvre dans l'ordre, la solution vient après ---------- */
var hints=[].slice.call(document.querySelectorAll(".p-main details.hint"));
var INDK=P.id+"_ind";
function opened(){ var a=S.c[INDK]; return Array.isArray(a)?a:[]; }
function allOpened(){ return hints.length===0 || hints.every(function(h,i){ return opened().indexOf(i)>=0; }); }
hints.forEach(function(h,i){
  h.addEventListener("toggle",function(){
    if(!h.open) return;
    var a=opened(); if(a.indexOf(i)<0){ a.push(i); S.c[INDK]=a; save(); }
    renderLocks();
  });
});

/* ---------- Verrou parent ---------- */
function getCode(){ try{ return localStorage.getItem(CODEKEY)||""; }catch(e){ return ""; } }
var unlocked=false, locks=[];
function renderLocks(){
  var ok=allOpened();
  locks.forEach(function(L){
    if(!L.body.hidden) return;
    L.btn.disabled=!ok;
    L.btn.textContent=ok?L.label:("Solution : ouvre d'abord les "+hints.length+" indices");
  });
}
function bindLocks(){
  document.querySelectorAll(".lockbox").forEach(function(box){
    var btn=box.querySelector("[data-unlock]"), body=box.querySelector(".sol-body");
    if(!btn||!body) return;
    var L={btn:btn, body:body, label:btn.textContent}; locks.push(L);
    var form=document.createElement("div"); form.className="lockform"; form.hidden=true;
    form.innerHTML='<input class="textin short" type="password" autocomplete="off" aria-label="Code parent" placeholder="Code parent"><button class="btn solid" type="button">Ouvrir</button><span class="lockmsg" role="status"></span>';
    box.insertBefore(form, body);
    var input=form.querySelector("input"), go=form.querySelector("button"), msg=form.querySelector(".lockmsg");
    function show(){ body.hidden=false; form.hidden=true; btn.disabled=false; btn.textContent="Cacher la solution"; renderAllProgs(); }
    function tryOpen(){ if(input.value && input.value===getCode()){ unlocked=true; input.value=""; msg.textContent=""; show(); } else msg.textContent="Ce n'est pas le bon code."; }
    btn.addEventListener("click",function(){
      if(!body.hidden){ body.hidden=true; renderLocks(); return; }
      if(!allOpened()) return;
      if(unlocked){ show(); return; }
      if(!getCode()){ form.hidden=false; input.hidden=true; go.hidden=true; msg.textContent="Demande à un adulte : la solution s'ouvre avec le code parent."; return; }
      input.hidden=false; go.hidden=false; msg.textContent="Un adulte tape le code parent."; form.hidden=!form.hidden; if(!form.hidden) input.focus();
    });
    go.addEventListener("click",tryOpen);
    input.addEventListener("keydown",function(e){ if(e.key==="Enter") tryOpen(); });
  });
  renderLocks();
}

renderAllProgs();
bindCrew(); renderCrew();
renderDone();
syncFields(); bindFields(); renderApres(); renderRappel();
bindLocks();
})();
