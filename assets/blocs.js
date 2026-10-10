/* Raccourcis pour dessiner les blocs MakeCode dans les pages projet.
   Chaque fonction reçoit B (le modèle de blocs fourni par projet.js).
   "lbl" = libellé français non vérifié (pointillés jaunes). "val" = valeur à mesurer. */
(function(){
"use strict";
var K = {};
K.onStart = function(B){ return B.ev("base",["au démarrage"],[].slice.call(arguments,1)); };
K.forever = function(B){ return B.ev("base",["toujours"],[].slice.call(arguments,1)); };
K.onBtn = function(B,b){ return B.ev("input",["lorsque le bouton",B.dd(b),"est pressé"],[].slice.call(arguments,2)); };
K.gesture = function(B,g){ return B.ev("input",["lorsque",B.dd(g)],[].slice.call(arguments,2),"lbl"); };
K.onLogo = function(B){ return B.ev("input",["lorsque le logo est pressé"],[].slice.call(arguments,1),"lbl"); };
K.btnPressed = function(B,b){ return B.bool("input",["bouton",B.dd(b),"est pressé"],"lbl"); };
K.icon = function(B,n){ return B.st("base",["montrer l'icône",B.dd(n)],"lbl"); };
K.text = function(B,t){ return B.st("base",["montrer texte",B.dd('"'+t+'"')],"lbl"); };
K.clear = function(B){ return B.st("base",["effacer l'écran"],"lbl"); };
K.showNum = function(B,r){ return B.st("base",["montrer nombre",r]); };
K.pause = function(B,ms,u){ return B.st("base",["pause (ms)",B.num(ms,u)]); };
K.vr = function(B,n){ return B.rep("vars",[n]); };
K.setVar = function(B,n,r){ return B.st("vars",["définir",B.dd(n),"à",r]); };
K.chg = function(B,n,k){ return B.st("vars",["modifier",B.dd(n),"de",B.num(k)],"lbl"); };
K.cmp = function(B,a,op,b){ return B.bool("logic",[a,B.dd(op),b]); };
K.and = function(B,a,b){ return B.bool("logic",[a,"et",b]); };
K.or = function(B,a,b){ return B.bool("logic",[a,"ou",b]); };
K.TRUE = function(B){ return B.bool("logic",["vrai"]); };
K.si = function(B,cond,body,els){ var arms=[[["si",cond,"alors"],body]]; if(els) arms.push([["sinon"],els]); return B.c("logic",arms); };
K.sis = function(B,list,els){ var arms=list.map(function(x,i){ return [[i?"sinon si":"si",x[0],"alors"],x[1]]; }); if(els) arms.push([["sinon"],els]); return B.c("logic",arms); };
K.repeat = function(B,n){ return B.c("loops",[[["répéter",B.num(n),"fois"],[].slice.call(arguments,2)]]); };
K.random = function(B,a,b){ return B.rep("math",["choisir au hasard de",B.num(a),"à",B.num(b)],"lbl"); };
K.div = function(B,a,b){ return B.rep("math",[a,B.dd("÷"),b]); };
/* Capteurs intégrés */
K.temp = function(B){ return B.rep("input",["température (°C)"],"lbl"); };
K.light = function(B){ return B.rep("input",["niveau d'intensité lumineuse"],"lbl"); };
K.compass = function(B){ return B.rep("input",["direction de la boussole (°)"],"lbl"); };
K.accel = function(B,axe){ return B.rep("input",["accélération (mg)",B.dd(axe)],"lbl"); };
K.runtime = function(B){ return B.rep("input",["temps d'exécution (ms)"],"lbl"); };
K.plot = function(B,x,y){ return B.st("led",["allumer x",x,"y",y],"lbl"); };
/* Musique (haut-parleur de la V2) */
K.melody = function(B,m){ return B.st("music",["jouer mélodie",B.dd(m),B.dd("en arrière-plan")],"lbl"); };
K.tone = function(B,note,beat){ return B.st("music",["jouer tonalité",B.dd(note),"pendant",B.dd(beat||"1 temps")],"lbl"); };
K.sound = function(B,s){ return B.st("music",["jouer son",B.dd(s),B.dd("jusqu'à la fin")],"lbl"); };
/* Radio */
K.radioGroup = function(B,g,u){ return B.st("radio",["radio définir groupe",B.num(g,u)],"lbl"); };
K.radioSend = function(B,n){ return B.st("radio",["radio envoyer nombre",typeof n==="object"?n:B.num(n)],"lbl"); };
K.onRadio = function(B){ return B.ev("radio",["quand une donnée est reçue par radio",B.rep("vars",["receivedNumber"])],[].slice.call(arguments,1),"lbl"); };
K.rn = function(B){ return B.rep("vars",["receivedNumber"]); };
/* Broches */
K.readPin = function(B,p,u){ return B.rep("pins",["lecture numérique broche",B.dd(p,u)],"lbl"); };
K.readAnalog = function(B,p){ return B.rep("pins",["lecture analogique broche",B.dd(p)],"lbl"); };
/* Kit Wonder : extension wuKong (libellés anglais, vérifiés dans le code source) */
K.motor = function(B,m,s){ return B.st("wukong",["Set motor",B.dd(m),"speed to",typeof s==="object"?s:B.num(s)]); };
K.motors = function(B,a,b,u){ return B.st("wukong",["set motor M1 speed",B.num(a,u),"M2 speed",B.num(b,u)]); };
K.stopM = function(B,m){ return B.st("wukong",["Stop motor",B.dd(m)]); };
K.stopAll = function(B){ return B.st("wukong",["Stop all motor"]); };
K.servo = function(B,port,a){ return B.st("wukong",["Set",B.dd("360°"),"servo",B.dd(port),"angle to",typeof a==="object"?a:B.num(a)]); };
K.sonar = function(B,pin,u){ return B.rep("sonar",["Ultrasonic distance in unit",B.dd("cm"),"at pin",B.dd(pin,u)]); };
/* Réglages Wonder : valeur notée par les enfants, sinon celle des programmes officiels ELECFREAKS */
K.cfg = function(v){
  function d(k,def){ var x=v(k); return x===null ? {v:def,u:"val"} : {v:x,u:null}; }
  return {
    av:d("w_av","neg"), m1:d("w_m1","gauche"),
    pf:d("w_porte_f",0), po:d("w_porte_o",276), sonar:d("w_sonar","P1"),
    p1:d("w_p1","droite"), noir:d("w_noir","0"),
    fb:d("w_f_bas",0), fh:d("w_f_haut",60), g:d("w_groupe",1)
  };
};
/* Vitesses voulues pour la roue gauche (L) et droite (R), positives = en avant */
K.drive = function(B,v,L,R){
  var c=K.cfg(v), s=c.av.v==="pos"?1:-1, u=(c.av.u||c.m1.u)?"val":null;
  var m1=(c.m1.v==="gauche"?L:R)*s, m2=(c.m1.v==="gauche"?R:L)*s;
  return K.motors(B, m1===0?0:m1, m2===0?0:m2, u);
};
window.K = K;
})();
