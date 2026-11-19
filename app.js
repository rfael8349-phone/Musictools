'use strict';
/* MUSICTOOL — PWA para guitarristas. Sin dependencias, sin servicios externos. */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const N=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const nm=i=>N[((i%12)+12)%12].replace('#','♯');
const IVN=['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const S={sk:0,sc:0,cr:0,cq:0,pr:0,ps:0,pm:0,pi:0,pro:store.get('pro',true),look:store.get('look','pedal'),skin:store.get('skin','pedal')};

/* ---------- DATOS ---------- */
const SG=[
['Básicas',0,[['Mayor','0 2 4 5 7 9 11'],['Menor natural','0 2 3 5 7 8 10'],['Pentatónica mayor','0 2 4 7 9'],['Pentatónica menor','0 3 5 7 10'],['Blues','0 3 5 6 7 10'],['Blues mayor','0 2 3 4 7 9']]],
['Modos griegos',1,[['Jónico','0 2 4 5 7 9 11'],['Dórico','0 2 3 5 7 9 10'],['Frigio','0 1 3 5 7 8 10'],['Lidio','0 2 4 6 7 9 11'],['Mixolidio','0 2 4 5 7 9 10'],['Eolio','0 2 3 5 7 8 10'],['Locrio','0 1 3 5 6 8 10']]],
['Menor armónica y sus modos',1,[['Menor armónica','0 2 3 5 7 8 11'],['Locrio ♮6','0 1 3 5 6 9 10'],['Jónico ♯5','0 2 4 5 8 9 11'],['Dórico ♯4','0 2 3 6 7 9 10'],['Frigio dominante','0 1 4 5 7 8 10'],['Lidio ♯2','0 3 4 6 7 9 11'],['Superlocrio ♭♭7','0 1 3 4 6 8 9']]],
['Menor melódica y sus modos',1,[['Menor melódica','0 2 3 5 7 9 11'],['Dórico ♭2','0 1 3 5 7 9 10'],['Lidio aumentado','0 2 4 6 8 9 11'],['Lidio dominante','0 2 4 6 7 9 10'],['Mixolidio ♭6','0 2 4 5 7 8 10'],['Locrio ♮2','0 2 3 5 6 8 10'],['Alterada','0 1 3 4 6 8 10']]],
['Simétricas',1,[['Cromática','0 1 2 3 4 5 6 7 8 9 10 11'],['Tonos enteros','0 2 4 6 8 10'],['Disminuida T-S','0 2 3 5 6 8 9 11'],['Disminuida S-T','0 1 3 4 6 7 9 10'],['Aumentada','0 3 4 7 8 11']]],
['Otras y exóticas',1,[['Bebop dominante','0 2 4 5 7 9 10 11'],['Bebop mayor','0 2 4 5 7 8 9 11'],['Húngara menor','0 2 3 6 7 8 11'],['Árabe (doble armónica)','0 1 4 5 7 8 11'],['Hirajoshi','0 2 3 7 8'],['In-Sen','0 1 5 7 10'],['Egipcia','0 2 5 7 10'],['Napolitana menor','0 1 3 5 7 8 11'],['Napolitana mayor','0 1 3 5 7 9 11'],['Prometeo','0 2 4 6 9 10'],['Enigmática','0 1 4 6 8 10 11']]]
];
const SCALES=SG.flatMap(([g,pro,l])=>l.map(([n,iv])=>({n,g,pro,iv:iv.split(' ').map(Number)})));
/* Formas móviles de guitarra (cuerdas 6→1, -1 = muteada). Valor = traste relativo a la cejilla. */
const CH=[
 {n:'Mayor',s:'',iv:[0,4,7],E:[0,2,2,1,0,0],A:[-1,0,2,2,2,0]},
 {n:'Menor',s:'m',iv:[0,3,7],E:[0,2,2,0,0,0],A:[-1,0,2,2,1,0]},
 {n:'Séptima (7)',s:'7',iv:[0,4,7,10],E:[0,2,0,1,0,0],A:[-1,0,2,0,2,0]},
 {n:'Mayor 7',s:'maj7',iv:[0,4,7,11],E:[0,2,1,1,0,0],A:[-1,0,2,1,2,0],pro:1},
 {n:'Menor 7',s:'m7',iv:[0,3,7,10],E:[0,2,0,0,0,0],A:[-1,0,2,0,1,0],pro:1},
 {n:'Sus2',s:'sus2',iv:[0,2,7],E:[0,2,4,4,0,0],A:[-1,0,2,2,0,0],pro:1},
 {n:'Sus4',s:'sus4',iv:[0,5,7],E:[0,2,2,2,0,0],A:[-1,0,2,2,3,0],pro:1},
 {n:'Aumentado',s:'aug',iv:[0,4,8],E:[0,3,2,1,1,0],A:[-1,0,3,2,2,1],pro:1},
 {n:'Disminuido',s:'dim',iv:[0,3,6],E:null,A:[-1,0,1,2,1,-1],pro:1}
];
const OPEN=[40,45,50,55,59,64];
const STYLES=[{n:'Rock',k:'rock'},{n:'Metal',k:'metal',pro:1},{n:'Punk',k:'punk',pro:1},{n:'Blues',k:'blues'},{n:'Pop',k:'pop'},{n:'Flamenco',k:'flamenco',pro:1},{n:'Paraguayo',k:'paraguayo',pro:1},{n:'Venezolano',k:'venezolano',pro:1},{n:'Mexicano',k:'mexicano',pro:1}];
const PROG={
 rock:{M:['I IV V I','I bVII IV I','I V vi IV','I IV I V'],m:['i bVII bVI bVII','i bIII bVII IV','i iv bVII i','i bVII bVI V']},
 metal:{M:['I bVII bVI bVII','I bIII IV V','I bVI bVII I'],m:['i bVI bVII i','i bII i bVII','i bVI bIII bVII','i v bVI bVII']},
 punk:{M:['I IV V V','I V vi IV','I vi IV V','I IV I V'],m:['i bVII bVI V','i iv v i','i bIII bVII iv']},
 blues:{M:['I7 I7 I7 I7 IV7 IV7 I7 I7 V7 IV7 I7 V7','I7 IV7 I7 V7'],m:['i7 i7 i7 i7 iv7 iv7 i7 i7 V7 iv7 i7 V7','i7 iv7 i7 V7']},
 pop:{M:['I V vi IV','vi IV I V','I vi IV V','I iii IV V'],m:['i bVI bIII bVII','i bVII bVI bVII','bVI bVII i i','i iv bVI V']},
 flamenco:{M:['I bII I V','I bII bVII bVI'],m:['i bVII bVI V','i bII i V','i bVI bVII V']},
 paraguayo:{M:['I V7 I V7','I IV V7 I','I vi ii V7','I I7 IV V7'],m:['i iv V7 i','i bVII bVI V7','i V7 i V7']},
 venezolano:{M:['I V7 I V7','I IV V7 I','I vi IV V7'],m:['i iv V7 i','i bVII bVI V7']},
 mexicano:{M:['I IV V7 I','I V7 I IV','I vi ii V7','I IV I V7'],m:['i iv V7 i','i bVI iv V7','i bVII bVI V7']}
};
const DEG={I:0,II:2,III:4,IV:5,V:7,VI:9,VII:11};
function parseTok(t,root){
 const m=t.match(/^(b?)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(7?)$/),up=m[2].toUpperCase(),minor=m[2]!==up;
 const r=(DEG[up]-(m[1]?1:0)+root+12)%12,suf=(minor?'m':'')+m[3],q=CH.findIndex(c=>c.s===suf);
 return {roman:t.replace('b','♭'),r,q};
}
const chordName=(r,q)=>nm(r)+CH[q].s, chordNotes=(r,q)=>CH[q].iv.map(i=>nm(r+i));

/* ---------- AUDIO DE REFERENCIA (osciladores) ---------- */
let AC;const ac=()=>{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume();return AC};
function tone(f,d=1.4,v=.25,at=0,type='triangle'){
 try{const c=ac(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+at;
 o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+d);
 o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05)}catch(e){toast('No se pudo reproducir audio.')}
}
const mf=(m,a4=T.a4)=>a4*Math.pow(2,(m-69)/12);
/* Guitarra sintetizada: cuerda pulsada (Karplus-Strong con afinación fraccionaria) */
const PL={};
function pluckBuf(c,f){
 const sr=c.sampleRate,key=Math.round(f*10)+'_'+sr;if(PL[key])return PL[key];
 const len=Math.ceil(sr*2.4),b=c.createBuffer(1,len,sr),y=b.getChannelData(0),D=sr/f-.5,n0=Math.ceil(D)+2;
 let mean=0;for(let i=0;i<n0;i++){y[i]=Math.random()*2-1;mean+=y[i]}mean/=n0;for(let i=0;i<n0;i++)y[i]-=mean;
 for(let k=0;k<2;k++)for(let i=1;i<n0-1;i++)y[i]=(y[i-1]+y[i]*2+y[i+1])/4;
 const T=Math.max(1.2,2.8-f/350),dc=Math.pow(.001,1/(T*f));
 for(let i=n0;i<len;i++){const q=i-D,i0=Math.floor(q),fr=q-i0;y[i]=dc*.5*((y[i0]*(1-fr)+y[i0+1]*fr)+(y[i0-1]*(1-fr)+y[i0]*fr))}
 let m=0;for(let i=0;i<len;i++)m=Math.max(m,Math.abs(y[i]));for(let i=0;i<len;i++)y[i]*=.9/m;
 return PL[key]=b;
}
function out(){const c=ac();if(!c._o){const g=c.createGain();g.gain.value=.9;
 const a=c.createBiquadFilter();a.type='peaking';a.frequency.value=110;a.gain.value=4;a.Q.value=1;
 const b=c.createBiquadFilter();b.type='peaking';b.frequency.value=2800;b.gain.value=2;b.Q.value=.8;
 const l=c.createBiquadFilter();l.type='lowpass';l.frequency.value=6500;
 g.connect(a);a.connect(b);b.connect(l);l.connect(c.destination);c._o=g}return c._o}
function pluck(f,at=0,v=.45){try{const c=ac(),s=c.createBufferSource(),g=c.createGain();s.buffer=pluckBuf(c,f);g.gain.value=v;s.connect(g);g.connect(out());s.start(c.currentTime+at)}catch(e){toast('No se pudo reproducir audio.')}}
function chordMidis(r,q){const c=CH[q],eb=(r-4+12)%12,ab=(r-9+12)%12;let fr,b;if(c.E&&eb<=ab){fr=c.E;b=eb}else{fr=c.A;b=ab}return fr.map((x,i)=>x<0?-1:OPEN[i]+b+x).filter(x=>x>=0)}
function playChord(r,q,at=0){chordMidis(r,q).forEach((m,k)=>pluck(mf(m),at+k*.035,.42-k*.02))}

/* ---------- AFINADOR ---------- */
const INSTG=[
 ['Libre',[['chromatic','Cromático (cualquier nota)',''],['arpa','Arpa paraguaya (nota por cuerda)','','Toca una cuerda del arpa: el afinador muestra su nota. Afina cada cuerda a su nota de la escala de Do mayor.']]],
 ['Guitarras y vihuelas',[['guitar','Guitarra estándar','E2 A2 D3 G3 B3 E4'],['dropd','Guitarra Drop D','D2 A2 D3 G3 B3 E4'],['dadgad','Guitarra DADGAD','D2 A2 D3 G3 A3 D4'],['halfdown','Guitarra medio tono abajo','D#2 G#2 C#3 F#3 A#3 D#4'],['vihuela','Vihuela mexicana','A3 D4 G4 B3 E4'],['guitarron','Guitarrón mexicano','A2 D3 G3 C4 E3 A2']]],
 ['Bajos y contrabajos',[['bass','Bajo 4 cuerdas','E1 A1 D2 G2'],['bass5','Bajo 5 cuerdas','B0 E1 A1 D2 G2'],['tololoche','Tololoche / contrabajo','E1 A1 D2 G2']]],
 ['Cuerda frotada',[['violin','Violín','G3 D4 A4 E5'],['viola','Viola','C3 G3 D4 A4'],['cello','Violonchelo','C2 G2 D3 A3']]],
 ['Latinoamérica y más',[['cuatro','Cuatro venezolano','A3 D4 F#4 B3'],['charango','Charango','G4 C5 E5 A4 E5'],['uke','Ukelele','G4 C4 E4 A4'],['mandolin','Mandolina','G3 D4 A4 E5'],['banjo','Banjo 5 cuerdas','G4 D3 G3 B3 D4']]]
];
const INSTMAP={};INSTG.forEach(([g,l])=>l.forEach(([k,n,s,h])=>INSTMAP[k]={n,s:s?s.split(' '):null,hint:h}));
const T={a4:store.get('a4',440),mode:(k=>INSTMAP[k]?k:'chromatic')(store.get('inst','chromatic')),run:false,hist:[],miss:0,needle:0,target:0,last:0,ok:false};
const midi=n=>{const m=n.match(/^([A-G]#?)(\d)$/);return N.indexOf(m[1])+12*(+m[2]+1)};
const pt=(c,r)=>{const a=c/50*55*Math.PI/180;return[150+r*Math.sin(a),150-r*Math.cos(a)]};
function buildGauge(){
 let h='';const[a,b]=[pt(-50,125),pt(50,125)];
 h+=`<path class="arc" d="M${a[0]} ${a[1]}A125 125 0 0 1 ${b[0]} ${b[1]}"/>`;
 const z1=pt(-5,125),z2=pt(5,125);h+=`<path class="zone" d="M${z1[0]} ${z1[1]}A125 125 0 0 1 ${z2[0]} ${z2[1]}"/>`;
 for(let c=-50;c<=50;c+=10){const big=c===0||Math.abs(c)===50,p=pt(c,big?100:108),q=pt(c,118);h+=`<line class="tk${big?' big':''}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`}
 h+=`<text x="38" y="150" text-anchor="middle">♭</text><text x="262" y="150" text-anchor="middle">♯</text>`;
 h+=`<g id="needle"><line x1="150" y1="150" x2="150" y2="40"/><circle cx="150" cy="150" r="9"/></g>`;
 $('#gauge').innerHTML=h;
}
const tmsg=t=>{$('#tmsg').textContent=t||''};
function buildInst(){
 const e=$('#inst');e.innerHTML=INSTG.map(([g,l])=>`<optgroup label="${g}">${l.map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</optgroup>`).join('');e.value=T.mode;
}
function renderStrings(){
 const el=$('#strings'),I=INSTMAP[T.mode];
 if(!I.s){el.innerHTML=`<small class="dim">${I.hint||'Toca cualquier nota: se detecta sola.'}</small>`;return}
 el.innerHTML=[...new Set(I.s)].map(n=>`<button data-a="str" data-v="${n}">${n.replace(/\d/,'').replace('#','♯')}<small style="color:var(--mut);font-size:11px;margin-left:3px">${n.slice(-1)}</small></button>`).join('');
}
function yin(b,sr){
 let e=0;for(let i=0;i<b.length;i++)e+=b[i]*b[i];
 if(Math.sqrt(e/b.length)<.008)return -1;
 const H=b.length>>1,d=new Float32Array(H);
 for(let t=1;t<H;t++){let s=0;for(let i=0;i<H;i++){const x=b[i]-b[i+t];s+=x*x}d[t]=s}
 let r=0;d[0]=1;for(let t=1;t<H;t++){r+=d[t];d[t]=r?d[t]*t/r:1}
 let t=-1;for(let i=Math.max(2,Math.floor(sr/1200));i<H-1;i++){if(d[i]<.15){while(i+1<H-1&&d[i+1]<d[i])i++;t=i;break}}
 if(t<1)return -1;
 const a=d[t-1],c=d[t],n=d[t+1],den=a-2*c+n;
 return sr/(t+(den?(a-n)/(2*den):0));
}
async function startTuner(){
 if(T.run)return;tmsg('');
 if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){tmsg('Este navegador no permite usar el micrófono aquí. Abre la app con HTTPS en Chrome (Android) o Safari (iPhone).');return}
 try{T.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}
 catch(e){tmsg(e.name==='NotAllowedError'||e.name==='SecurityError'?'Permiso de micrófono denegado. Actívalo en los ajustes del navegador para este sitio y vuelve a intentarlo.':e.name==='NotFoundError'?'No se encontró ningún micrófono en este dispositivo.':e.name==='NotReadableError'?'El micrófono está siendo usado por otra aplicación.':'No se pudo acceder al micrófono ('+e.name+').');return}
 try{
  T.ctx=new (window.AudioContext||window.webkitAudioContext)();await T.ctx.resume();
  const src=T.ctx.createMediaStreamSource(T.stream);T.an=T.ctx.createAnalyser();T.an.fftSize=4096;src.connect(T.an);T.buf=new Float32Array(4096);
 }catch(e){tmsg('No se pudo iniciar el análisis de audio.');stopTuner();return}
 T.run=true;T.hist=[];T.miss=0;T.last=0;
 $('#mic').textContent='Detener';$('#mic').classList.add('off');$('#status').textContent='Toca una cuerda…';
 requestAnimationFrame(loop);
}
function stopTuner(){
 T.run=false;
 if(T.stream)T.stream.getTracks().forEach(t=>t.stop());
 if(T.ctx)T.ctx.close().catch(()=>{});
 T.stream=T.ctx=T.an=null;
 const m=$('#mic');if(m){m.textContent='Activar micrófono';m.classList.remove('off')}
 idle('Pulsa «Activar micrófono»');
}
function loop(ts){
 if(!T.run)return;requestAnimationFrame(loop);
 if(ts-T.last>45){T.last=ts;T.an.getFloatTimeDomainData(T.buf);const f=yin(T.buf,T.ctx.sampleRate);
  if(f>20&&f<1500){T.miss=0;T.hist.push(f);if(T.hist.length>5)T.hist.shift();const s=[...T.hist].sort((x,y)=>x-y);show(s[s.length>>1])}
  else if(++T.miss>10){T.hist=[];idle('Toca una cuerda…')}}
 T.needle+=(T.target-T.needle)*.25;
 $('#needle').setAttribute('transform',`rotate(${T.needle/50*55} 150 150)`);
}
function idle(msg){
 T.target=0;T.ok=false;$('.gauge').classList.remove('ok');
 $('#note').textContent='–';$('#oct').textContent='';$('#hz').textContent='0.0';$('#cents').textContent='';$('#status').textContent=msg;
 $$('#strings button').forEach(b=>b.classList.remove('hit'));
 $('#needle').setAttribute('transform',`rotate(0 150 150)`);T.needle=0;
}
function show(f){
 const m=12*Math.log2(f/T.a4)+69;let tm=Math.round(m);
 if(INSTMAP[T.mode].s){
  const L=INSTMAP[T.mode].s.map(midi);tm=L.reduce((b,x)=>Math.abs(x-m)<Math.abs(b-m)?x:b);
  $$('#strings button').forEach(b=>b.classList.toggle('hit',midi(b.dataset.v)===tm));
 }
 const c=(m-tm)*100,ok=Math.abs(c)<=5;
 T.target=Math.max(-50,Math.min(50,c));
 $('#note').textContent=nm(tm);$('#oct').textContent=Math.floor(tm/12)-1;
 $('#hz').textContent=f.toFixed(1);$('#cents').textContent=(c>0?'+':'')+c.toFixed(0)+' cents';
 $('#status').textContent=ok?'AFINADA':c<0?'BAJA — sube la cuerda':'ALTA — afloja la cuerda';
 $('.gauge').classList.toggle('ok',ok);
}

/* ---------- DIBUJOS ---------- */
function fretboard(pcs,root){
 let h='<svg class="fb" viewBox="0 0 360 132">';
 for(let f=0;f<=12;f++)h+=f?`<line class="f" x1="${18+f*28}" y1="15" x2="${18+f*28}" y2="115"/>`:`<line class="nut" x1="18" y1="15" x2="18" y2="115"/>`;
 [3,5,7,9].forEach(f=>h+=`<circle class="m" cx="${18+(f-.5)*28}" cy="65" r="4"/>`);
 h+=`<circle class="m" cx="${18+11.5*28}" cy="45" r="4"/><circle class="m" cx="${18+11.5*28}" cy="85" r="4"/>`;
 for(let i=0;i<6;i++)h+=`<line class="s" x1="18" y1="${15+(5-i)*20}" x2="354" y2="${15+(5-i)*20}"/>`;
 for(let i=0;i<6;i++)for(let f=0;f<=12;f++){const pc=(OPEN[i]+f)%12;if(!pcs.includes(pc))continue;
  const x=f?18+(f-.5)*28:9,y=15+(5-i)*20;
  h+=`<circle class="${pc===root?'r':'d'}" cx="${x}" cy="${y}" r="8.5"/><text x="${x}" y="${y+3}">${nm(pc)}</text>`}
 for(let f=1;f<=12;f++)if([3,5,7,9,12].includes(f))h+=`<text x="${18+(f-.5)*28}" y="129" style="fill:#777">${f}</text>`;
 return h+'</svg>';
}
function diagram(fr){
 const fretted=fr.filter(x=>x>0),mx=Math.max(0,...fretted),mn=fretted.length?Math.min(...fretted):1,s=mx<=5?1:mn;
 let h='<svg class="cd" viewBox="0 0 120 150">';
 for(let i=0;i<6;i++)h+=`<line class="g" x1="${20+i*16}" y1="30" x2="${20+i*16}" y2="130"/>`;
 for(let j=0;j<=5;j++)h+=`<line class="${j===0&&s===1?'nut':'g'}" x1="20" y1="${30+j*20}" x2="100" y2="${30+j*20}"/>`;
 fr.forEach((f,i)=>{const x=20+i*16;
  if(f<0)h+=`<path class="x" d="M${x-4} 14L${x+4} 22M${x+4} 14L${x-4} 22"/>`;
  else if(f===0)h+=`<circle class="o" cx="${x}" cy="18" r="4"/>`;
  else h+=`<circle class="dot" cx="${x}" cy="${30+(f-s+.5)*20}" r="6.5"/>`});
 if(s>1)h+=`<text x="110" y="45">${s}</text>`;
 return h+'</svg>';
}

/* ---------- RENDER ---------- */
const chip=(a,v,label,on,pro)=>`<button data-a="${a}" data-v="${v}" class="${on?'on':''} ${pro&&!S.pro?'lock':''}">${label}${pro?'<i>PRO</i>':''}</button>`;
const keys=(a,sel)=>`<div class="chips">${N.map((_,i)=>chip(a,i,nm(i),i===sel)).join('')}</div>`;
function renderScales(){
 const sc=SCALES[S.sc],pcs=sc.iv.map(i=>(S.sk+i)%12);
 $('#scales-body').innerHTML=keys('sk',S.sk)+
 `<select id="scsel" class="sel" aria-label="Escala">${SG.map(([g,pro,l])=>`<optgroup label="${g}${pro?' · PRO':''}">${l.map(([n])=>{const i=SCALES.findIndex(x=>x.n===n);return `<option value="${i}"${i===S.sc?' selected':''}>${n}</option>`}).join('')}</optgroup>`).join('')}</select>
 <div class="pedal"><h3>${nm(S.sk)} ${sc.n}</h3><div class="notes">${pcs.map((p,i)=>`<div class="note ${i?'':'root'}"><b>${nm(p)}</b><small>${IVN[sc.iv[i]]}</small></div>`).join('')}</div>
 <p class="dim">Mástil: naranja = tónica.</p>${fretboard(pcs,S.sk)}</div>
 <button class="cta sm" data-a="playscale">▶ Escuchar escala</button>`;
}
function renderChords(){
 const c=CH[S.cq],sh=[['Forma de Mi (6ª cuerda)',c.E,(S.cr-4+12)%12],['Forma de La (5ª cuerda)',c.A,(S.cr-9+12)%12]].filter(x=>x[1]);
 $('#chords-body').innerHTML=keys('cr',S.cr)+
 `<div class="chips">${CH.map((q,i)=>chip('cq',i,q.n,i===S.cq,q.pro)).join('')}</div>
 <div class="pedal"><h3>${chordName(S.cr,S.cq)} <small style="color:var(--mut)">${c.n}</small></h3>
 <div class="notes">${chordNotes(S.cr,S.cq).map((n,i)=>`<div class="note ${i?'':'root'}"><b>${n}</b></div>`).join('')}</div></div>
 <div class="diagrams">${sh.map(([t,fr,b])=>`<div class="pedal">${diagram(fr.map(x=>x<0?-1:b+x))}<small>${t}${b?' · cejilla '+b:' · al aire'}</small></div>`).join('')}</div>
 <button class="cta sm" style="margin-top:14px" data-a="playchord">▶ Escuchar acorde</button>`;
}
function genProg(){const L=PROG[STYLES[S.ps].k][S.pm?'m':'M'];let i;do{i=Math.floor(Math.random()*L.length)}while(L.length>1&&i===S.pi);S.pi=i}
function curProg(){const L=PROG[STYLES[S.ps].k][S.pm?'m':'M'];return L[S.pi%L.length].split(' ').map(t=>parseTok(t,S.pr))}
function renderProg(){
 const p=curProg();
 $('#prog-body').innerHTML=keys('pr',S.pr)+
 `<div class="seg"><button data-a="pm" data-v="0" class="${S.pm?'':'on'}">Mayor</button><button data-a="pm" data-v="1" class="${S.pm?'on':''}">Menor</button></div>
 <div class="chips">${STYLES.map((s,i)=>chip('ps',i,s.n,i===S.ps,s.pro)).join('')}</div>
 <button class="cta" data-a="gen">Generar progresión</button>
 <div class="chords">${p.map((c,i)=>`<div class="ch" data-a="pc" data-v="${i}"><small>${c.roman}</small><b>${chordName(c.r,c.q)}</b><small>${chordNotes(c.r,c.q).join(' ')}</small><br><u data-a="open" data-v="${i}">Ver diagrama</u></div>`).join('')}</div>
 <button class="cta sm" data-a="playprog">▶ Reproducir progresión</button>`;
}
const SKINS=[{k:'pedal',n:'Clásico',tag:'Afina. Practica. Compón.'},
 {k:'flamenco',n:'Flamenco',tag:'Duende y compás.',ps:'flamenco',pm:1,sc:'Frigio dominante',sk:4,pr:9},
 {k:'paraguayo',n:'Paraguayo',tag:'Polca, guarania y arpa.',ps:'paraguayo',pm:0,sc:'Mayor'},
 {k:'venezolano',n:'Venezolano',tag:'Joropo, vals y cuatro.',ps:'venezolano',pm:0,sc:'Mayor'},
 {k:'mexicano',n:'Mexicano',tag:'Mariachi, son y ranchera.',ps:'mexicano',pm:0,sc:'Mayor'}];
function setSkin(k,apply){
 const sk=SKINS.find(x=>x.k===k)||SKINS[0];S.skin=sk.k;store.set('skin',sk.k);document.documentElement.dataset.skin=sk.k;$('.tag').textContent=sk.tag;
 if(apply&&sk.ps){S.ps=STYLES.findIndex(x=>x.k===sk.ps);S.pm=sk.pm;S.sc=SCALES.findIndex(x=>x.n===sk.sc);if(sk.sk!=null)S.sk=sk.sk;if(sk.pr!=null)S.pr=sk.pr;genProg();toast('Estilo '+sk.n+': escala y progresiones ajustadas.')}
}
function renderLook(){
 $('#look').innerHTML=`<b>Apariencia</b><div class="chips" style="margin:10px 0">${[['pedal','Pedal'],['aero','Cristal']].map(([k,n])=>chip('look',k,n,k===S.look)).join('')}</div><div class="chips" style="margin:0">${SKINS.map(s=>chip('skin',s.k,s.n,s.k===S.skin,s.k!=='pedal')).join('')}</div>`;
}
function renderHome(){renderLook();
 const it=[['tuner','Afinador','Guitarra, violín, bajo, guitarrón y más'],['scales','Escalas','Más de 40 escalas y modos'],['chords','Acordes','Diagramas en el mástil'],['prog','Progresiones','Rock, metal, punk, blues, pop'],['studio','Estudio','Graba y mezcla hasta 8 pistas']];
 $('#homegrid').innerHTML=it.map(([v,t,d])=>`<button class="pedal card${v==='studio'?' wide':''}" data-a="go" data-v="${v}"><span class="knob">${ICON[v]}</span><span><b>${t}</b><small>${d}</small></span></button>`).join('');
 $('.sw').classList.toggle('on',S.pro);
}
const ICON={
 home:'<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/></svg>',
 tuner:'<svg viewBox="0 0 24 24"><path d="M3.5 18a9 9 0 1117 0M12 18l4-7"/></svg>',
 scales:'<svg viewBox="0 0 24 24"><path d="M3 20h4v-4h4v-4h4V8h4V4h2"/></svg>',
 chords:'<svg viewBox="0 0 24 24"><path d="M6 3v18M12 3v18M18 3v18M4 8h16M4 14h16"/></svg>',
 studio:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
 prog:'<svg viewBox="0 0 24 24"><path d="M2 12h3l2-6 4 12 3-9 2 3h6"/></svg>'
};
const NAV=[['home','Inicio'],['tuner','Afinador'],['scales','Escalas'],['chords','Acordes'],['prog','Progres.'],['studio','Estudio']];
function go(v){
 if(v!=='tuner'&&T.run)stopTuner();
 if(v!=='studio'&&window.Studio)Studio.leave();
 $$('.view').forEach(e=>e.classList.toggle('on',e.id===v));
 $$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
 ({scales:renderScales,chords:renderChords,prog:renderProg,home:renderHome,studio:()=>window.Studio&&Studio.show()}[v]||(()=>{}))();
 window.scrollTo(0,0);
}
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),3200)}

/* ---------- EVENTOS ---------- */
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-a]');if(!b)return;
 const a=b.dataset.a,v=b.dataset.v,n=+v;
 if(b.classList.contains('lock')){toast('Función PRO: se desbloqueará con un pago único de 2,99 €. Para probarla, activa el modo PRO en Inicio.');return}
 const cur=$('.view.on').id;
 switch(a){
  case 'go':go(v);break;
  case 'look':S.look=v;store.set('look',v);document.documentElement.dataset.look=v;renderLook();break;
  case 'skin':setSkin(v,true);renderLook();break;
  case 'pro':S.pro=!S.pro;store.set('pro',S.pro);renderHome();break;
  
  case 'mic':T.run?stopTuner():startTuner();break;
  case 'str':tone(mf(midi(v)),2,.3,0,'sine');break;
  case 'sk':S.sk=n;renderScales();break;
  case 'sc':S.sc=n;renderScales();break;
  case 'playscale':SCALES[S.sc].iv.concat(12).forEach((i,k)=>pluck(mf(60+S.sk+i),k*.35,.5));break;
  case 'cr':S.cr=n;renderChords();break;
  case 'cq':S.cq=n;renderChords();break;
  case 'playchord':playChord(S.cr,S.cq);break;
  case 'pr':S.pr=n;renderProg();break;
  case 'pm':S.pm=n;genProg();renderProg();break;
  case 'ps':S.ps=n;genProg();renderProg();break;
  case 'gen':genProg();renderProg();break;
  case 'pc':{const c=curProg()[n];playChord(c.r,c.q);break}
  case 'open':{e.stopPropagation();const c=curProg()[n];S.cr=c.r;S.cq=c.q;go('chords');break}
  case 'playprog':curProg().forEach((c,i)=>playChord(c.r,c.q,i*1.2));break;
 }
});
document.addEventListener('change',e=>{if(e.target.id==='inst'){T.mode=e.target.value;store.set('inst',T.mode);renderStrings();idle(T.run?'Toca una cuerda…':'Pulsa «Activar micrófono»');return}if(e.target.id!=='scsel')return;const i=+e.target.value;if(SCALES[i].pro&&!S.pro){toast('Escala PRO: se desbloqueará con un pago único de 2,99 €. Para probarla, activa el modo PRO en Inicio.');renderScales();return}S.sc=i;renderScales()});
$('#a4').addEventListener('input',e=>{T.a4=+e.target.value;$('#a4v').textContent=T.a4;store.set('a4',T.a4)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&T.run)stopTuner()});

/* ---------- INICIO ---------- */
$('#nav').innerHTML=NAV.map(([v,t])=>`<button data-a="go" data-v="${v}" aria-label="${t}">${ICON[v]}<span>${t}</span></button>`).join('');
$('#a4').value=T.a4;$('#a4v').textContent=T.a4;
document.documentElement.dataset.look=S.look;setSkin(S.skin,false);buildInst();buildGauge();renderStrings();go('home');
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
