/* Moteur commun des ateliers v2 : équipe, progression, carnet, blocs, verrou parent.
   La page définit avant ce script : window.ATELIER = {key, missions, icons, progs, needs, log} */
(function(){
"use strict";
var A = window.ATELIER;
var KEY = A.key, CODEKEY = "ateliers-code-parent", NM = A.missions;

function defaults(){ return {first:"1",names:{"1":"","2":""},done:{},prep:{},c:{}}; }
function load(){
  var d = defaults();
  try{
    var raw = localStorage.getItem(KEY);
    if(raw){ var o = JSON.parse(raw);
      if(o && typeof o==="object"){
        if(o.first==="1"||o.first==="2") d.first=o.first;
        if(o.names && typeof o.names==="object") ["1","2"].forEach(function(k){ if(typeof o.names[k]==="string") d.names[k]=o.names[k].slice(0,16); });
        if(o.done && typeof o.done==="object") d.done=o.done;
        if(o.prep && typeof o.prep==="object") d.prep=o.prep;
        if(o.c && typeof o.c==="object") d.c=o.c;
      } }
  }catch(e){}
  return d;
}
var S = load();
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
function flat(a){ var out=[]; (function f(x){ x.forEach(function(y){ if(Array.isArray(y)) f(y); else if(y) out.push(y); }); })(a); return out; }

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
window.ATELIER_BLOCKS = B;
var UT = {lbl:"Libellé à confirmer dans votre MakeCode : fiez-vous à la couleur et à la forme.", val:"Valeur du fabricant : mesurez-la sur votre machine et notez-la dans le carnet."};
var DRAWER = {base:"Base",input:"Entrées",loops:"Boucles",logic:"Logique",vars:"Variables",math:"Maths",ml:"Apprentissage automatique",wukong:"wuKong",sonar:"Sonarbit",radio:"Radio",pins:"Broches",minicar:"MiniCar"};

function uAttr(u){ return u ? ' title="'+esc(UT[u]||u)+'"' : ""; }
function partH(p){
  if(typeof p==="string") return '<span class="t">'+esc(p)+'</span>';
  if(p.f==="dd") return '<span class="dd'+(p.u?' unsure':'')+'"'+uAttr(p.u)+'>'+esc(p.v)+'<i aria-hidden="true">▾</i></span>';
  if(p.f==="num") return '<span class="num'+(p.u?' unsure':'')+'"'+uAttr(p.u)+'>'+esc(p.v)+'</span>';
  return nodeH(p);
}
function row(parts){ return '<div class="row">'+parts.map(partH).join("")+'</div>'; }
function nodeH(n){
  var style = ' style="--cat:var(--c-'+n.cat+')"', uc = n.u?' unsure':'', ut = uAttr(n.u);
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
function renderProg(el){
  var f = A.progs[el.getAttribute("data-prog")]; if(!f) return;
  var nodes = f(B, val);
  el.innerHTML = (hasU(nodes)?'<p class="unsure-note">Pointillés jaunes : un mot qui peut varier dans votre MakeCode, ou une valeur à mesurer sur votre machine.</p>':'')+'<div class="ws">'+nodes.map(nodeH).join("")+'</div>';
}
function renderNeeds(){
  document.querySelectorAll("[data-need]").forEach(function(el){
    var f = (A.needs||{})[el.getAttribute("data-need")]; if(!f) return;
    var nodes = f(B, val);
    el.innerHTML = nodes.map(function(n){ return '<figure>'+nodeH(n)+'<figcaption class="drawer" style="--cat:var(--c-'+n.cat+')">tiroir '+esc(DRAWER[n.cat]||n.cat)+'</figcaption></figure>'; }).join("")
      + (hasU(nodes)?'<p class="unsure-note" style="flex-basis:100%">Pointillés jaunes : un mot qui peut varier dans votre MakeCode. Fiez-vous à la couleur et à la forme.</p>':'');
  });
}

/* ---------- Icônes 5 x 5 ---------- */
function renderIcons(){
  document.querySelectorAll(".led5[data-icon]").forEach(function(el){
    var pat = (A.icons[el.getAttribute("data-icon")]||"").replace(/,/g,"");
    el.innerHTML = pat.split("").map(function(c){ return '<span'+(c==="#"?' class="on"':'')+'></span>'; }).join("");
  });
}

/* ---------- Équipe ---------- */
function crewName(i){ var v=(S.names[i]||"").trim(); return v || ("Équipier "+i); }
function renderCrew(){
  var a = S.first==="2"?"2":"1", b = a==="1"?"2":"1";
  var na = esc(crewName(a)), nb = esc(crewName(b));
  document.querySelectorAll("[data-crew]").forEach(function(el){ var n=+el.getAttribute("data-crew"); var p=n%2?na:nb, c=n%2?nb:na; el.innerHTML='Pilote : <b>'+p+'</b> · Copilote : <b>'+c+'</b>'; });
  var f1=document.getElementById("first-1"), f2=document.getElementById("first-2");
  if(f1){ f1.checked=a==="1"; f2.checked=a==="2"; document.getElementById("first-1-l").textContent=crewName("1"); document.getElementById("first-2-l").textContent=crewName("2"); }
}
function bindCrew(){
  document.querySelectorAll('input[name="first"]').forEach(function(r){ r.addEventListener("change",function(){ S.first=r.value; save(); renderCrew(); }); });
  ["1","2"].forEach(function(i){ var inp=document.getElementById("name-"+i); if(!inp) return; inp.value=S.names[i]||""; inp.addEventListener("input",function(){ S.names[i]=inp.value.slice(0,16); save(); renderCrew(); }); });
}

/* ---------- Progression ---------- */
function renderProgress(){
  var n=0, leds="";
  for(var i=1;i<=NM;i++){ var on=!!S.done["m"+i]; if(on) n++; leds+='<span'+(on?' class="on"':'')+'></span>'; }
  var pl=document.getElementById("progress-leds"); if(pl) pl.innerHTML=leds;
  var pc=document.getElementById("progress-count"); if(pc) pc.textContent=n+" / "+NM;
  document.querySelectorAll("[data-done]").forEach(function(b){ var on=!!S.done[b.getAttribute("data-done")]; b.setAttribute("aria-pressed",on?"true":"false"); b.textContent=on?"Mission réussie ✓":"Mission réussie ?"; });
  document.querySelectorAll("[data-dot]").forEach(function(d){ d.classList.toggle("on", !!S.done[d.getAttribute("data-dot")]); });
}
function bindProgress(){
  document.querySelectorAll("[data-done]").forEach(function(b){ b.addEventListener("click",function(){ var k=b.getAttribute("data-done"); S.done[k]=!S.done[k]; save(); renderProgress(); }); });
  document.querySelectorAll("#prep-list input").forEach(function(c){ c.checked=!!S.prep[c.id]; c.addEventListener("change",function(){ S.prep[c.id]=c.checked; save(); }); });
}

/* ---------- Carnet : champs data-k ---------- */
function syncFields(){
  document.querySelectorAll("[data-k]").forEach(function(el){
    var k=el.getAttribute("data-k"), v=S.c[k];
    if(el.type==="radio") el.checked = (v===el.value);
    else el.value = (v===undefined||v===null) ? "" : v;
  });
}
function bindFields(){
  document.querySelectorAll("[data-k]").forEach(function(el){
    var k=el.getAttribute("data-k");
    var ev = (el.type==="radio") ? "change" : "input";
    el.addEventListener(ev,function(){
      if(el.type==="radio"){ if(el.checked) S.c[k]=el.value; }
      else if(el.type==="number"){ var n=parseInt(el.value,10); var mn=el.min!==""?+el.min:-Infinity, mx=el.max!==""?+el.max:Infinity; S.c[k]=(isNaN(n)||n<mn||n>mx)?null:n; }
      else S.c[k]=el.value.slice(0,400);
      save(); if(el.type==="radio") syncFields(); renderLog(); renderAllProgs();
    });
  });
}
function val(k){ var v=S.c[k]; return (v===undefined||v===null||v==="") ? null : v; }
function renderLog(){
  var el=document.getElementById("log"); if(!el || !A.log) return;
  var rows = A.log(val);
  el.innerHTML = rows.map(function(r){
    var has = r.v!==null && r.v!==undefined && r.v!=="";
    var shown = has ? r.v : (r.def!==undefined ? r.def : "à remplir");
    var src = has ? (r.src||"") : (r.def!==undefined ? (r.defsrc||"valeur du fabricant, à vérifier") : (r.src||""));
    return '<div class="log-row"><span>'+esc(r.label)+'</span><span class="v'+(has?'':' muted')+'">'+esc(shown)+(src?'<span class="src'+(has?' me':'')+'">'+esc(src)+'</span>':'')+'</span></div>';
  }).join("");
  var ph=document.getElementById("phrases");
  if(ph){
    var items=[]; for(var i=1;i<=NM;i++){ var t=val("m"+i+"_res"); if(t) items.push('<li><b>Mission '+i+' :</b> '+esc(t)+'</li>'); }
    ph.innerHTML = items.length ? items.join("") : '<li class="small">Vos phrases de résumé apparaîtront ici.</li>';
  }
}

function renderAllProgs(){ document.querySelectorAll("[data-prog]").forEach(renderProg); renderNeeds(); }

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
function setCode(c){ try{ localStorage.setItem(CODEKEY,c); return true; }catch(e){ return false; } }
var unlocked=false;
function bindLocks(){
  document.querySelectorAll(".lockbox").forEach(function(box){
    var btn=box.querySelector("[data-unlock]"), body=box.querySelector(".sol-body");
    if(!btn||!body) return;
    var label=btn.textContent;
    var form=document.createElement("div"); form.className="lockform"; form.hidden=true;
    form.innerHTML='<input class="textin short" type="password" autocomplete="off" aria-label="Code parent" placeholder="Code parent"><button class="btn solid" type="button">Ouvrir</button><span class="lockmsg" role="status"></span>';
    box.insertBefore(form, body);
    var input=form.querySelector("input"), go=form.querySelector("button"), msg=form.querySelector(".lockmsg");
    function show(){ body.hidden=false; form.hidden=true; btn.textContent="Cacher la solution"; }
    function tryOpen(){
      if(input.value && input.value===getCode()){ unlocked=true; input.value=""; msg.textContent=""; show(); }
      else { msg.textContent="Ce n'est pas le bon code."; }
    }
    btn.addEventListener("click",function(){
      if(!body.hidden){ body.hidden=true; btn.textContent=label; return; }
      if(unlocked){ show(); return; }
      if(!getCode()){ form.hidden=false; input.hidden=true; go.hidden=true; msg.textContent="Pas encore de code parent. Un adulte peut en créer un dans « Pour les parents »."; return; }
      input.hidden=false; go.hidden=false; msg.textContent=""; form.hidden=!form.hidden; if(!form.hidden) input.focus();
    });
    go.addEventListener("click",tryOpen);
    input.addEventListener("keydown",function(e){ if(e.key==="Enter") tryOpen(); });
  });
  var none=document.getElementById("code-none"), some=document.getElementById("code-some"), cmsg=document.getElementById("code-msg");
  function refreshCode(){ if(!none) return; var has=!!getCode(); none.hidden=has; some.hidden=!has; }
  refreshCode();
  var setB=document.getElementById("code-set");
  if(setB) setB.addEventListener("click",function(){ var v=document.getElementById("code-new").value; if(v.length<4){ cmsg.textContent="Choisissez un code d'au moins 4 caractères."; return; } if(setCode(v)){ document.getElementById("code-new").value=""; cmsg.textContent="Code enregistré sur cet ordinateur."; refreshCode(); } else cmsg.textContent="Impossible d'enregistrer le code dans ce navigateur."; });
  var chB=document.getElementById("code-change");
  if(chB) chB.addEventListener("click",function(){ var o=document.getElementById("code-old").value, n=document.getElementById("code-new2").value; if(o!==getCode()){ cmsg.textContent="Le code actuel n'est pas le bon."; return; } if(n.length<4){ cmsg.textContent="Le nouveau code doit avoir au moins 4 caractères."; return; } setCode(n); document.getElementById("code-old").value=""; document.getElementById("code-new2").value=""; cmsg.textContent="Code changé."; });
}

/* ---------- Remise à zéro ---------- */
function bindReset(){
  var rc=document.getElementById("reset-confirm"), r=document.getElementById("reset");
  if(!r) return;
  r.addEventListener("click",function(){ rc.hidden=false; });
  document.getElementById("reset-no").addEventListener("click",function(){ rc.hidden=true; });
  document.getElementById("reset-yes").addEventListener("click",function(){
    var first=S.first, names=S.names; S=defaults(); S.first=first; S.names=names; save(); rc.hidden=true;
    document.querySelectorAll("#prep-list input").forEach(function(c){ c.checked=false; });
    syncFields(); renderProgress(); renderLog(); renderAllProgs();
  });
}

renderIcons();
renderAllProgs();
bindCrew(); renderCrew();
bindProgress(); renderProgress();
syncFields(); bindFields(); renderLog();
bindLocks(); bindReset();
})();
