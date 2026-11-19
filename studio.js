'use strict';
/* MUSICTOOL Estudio: grabadora multipista (PCM, Web Audio). */
window.Studio=(()=>{
const $=s=>document.querySelector(s),COL=['#ff6a00','#ffb020','#35e08a','#4db8ff','#c77dff','#ff5d73','#f2f2f2','#a3e635'];
const St={tracks:[],bpm:100,metro:false,count:true,dev:'',rec:null,counting:false,play:false,t0:0,p0:0,srcs:[],ctx:null,lvl:0,built:false};
const msg=t=>{const e=$('#smsg');if(e)e.textContent=t||''};
const ctx=()=>{if(!St.ctx)St.ctx=new (window.AudioContext||window.webkitAudioContext)();if(St.ctx.resume)St.ctx.resume();return St.ctx};
const dur=t=>t.data.length/t.sr,endT=()=>Math.max(0,...St.tracks.map(t=>t.off+dur(t))),spb=()=>60/St.bpm;
const fmt=s=>{s=Math.max(0,s);return Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0')};
const buf=t=>{if(!t.b){t.b=ctx().createBuffer(1,t.data.length,t.sr);t.b.copyToChannel(t.data,0)}return t.b};
const eff=t=>{const so=St.tracks.some(x=>x.solo);return t.mute||(so&&!t.solo)?0:t.vol};
const applyG=()=>St.tracks.forEach(t=>{if(t.g)t.g.gain.value=eff(t)});
const pos=()=>St.play?Math.max(St.p0,St.p0+ctx().currentTime-St.t0):St.p0;
/* persistencia (IndexedDB) */
const db=()=>new Promise((ok,no)=>{const r=indexedDB.open('musictool',1);r.onupgradeneeded=()=>r.result.createObjectStore('p');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function save(){try{const d=await db();d.transaction('p','readwrite').objectStore('p').put({bpm:St.bpm,tracks:St.tracks.map(({id,name,data,sr,vol,mute,solo,off})=>({id,name,data,sr,vol,mute,solo,off}))},'proj')}catch{}}
async function load(){try{const d=await db(),r=d.transaction('p').objectStore('p').get('proj');await new Promise(x=>{r.onsuccess=x;r.onerror=x});if(r.result){St.tracks=r.result.tracks||[];St.bpm=r.result.bpm||100}}catch{}}
/* metrónomo */
function click(at,acc){const c=ctx(),o=c.createOscillator(),g=c.createGain();o.frequency.value=acc?1600:1100;g.gain.setValueAtTime(.35,at);g.gain.exponentialRampToValueAtTime(.001,at+.05);o.connect(g);g.connect(c.destination);o.start(at);o.stop(at+.06)}
function metroRun(first){let nx=first,k=0;clearInterval(St.mt);St.mt=setInterval(()=>{const c=ctx();while(nx<c.currentTime+.3){if(St.metro)click(nx,k%4===0);nx+=spb();k++}},40)}
/* reproducción */
function play(from){
 const c=ctx();halt();St.t0=c.currentTime+.1;St.p0=from;St.play=true;
 St.srcs=St.tracks.map(t=>{const g=c.createGain();g.gain.value=eff(t);g.connect(c.destination);t.g=g;const s=c.createBufferSource();s.buffer=buf(t);s.connect(g);
  const d=t.off-from;if(d>=0)s.start(St.t0+d);else if(-d<dur(t))s.start(St.t0,-d);return s});
 metroRun(St.t0+((spb()-(from%spb()))%spb()));ui();anim();
}
function halt(){St.srcs.forEach(s=>{try{s.stop()}catch{}});St.srcs=[];clearInterval(St.mt);St.play=false}
function stop(){clearTimeout(St.cd);St.counting=false;if(St.rec)finishRec();halt();St.p0=0;St.lvl=0;ui();anim()}
function anim(){
 cancelAnimationFrame(St.raf);
 const f=()=>{const p=pos(),D=Math.max(5,endT());const tm=$('#time');if(!tm)return;tm.textContent=fmt(p);
  document.querySelectorAll('.ph').forEach(e=>e.style.left=Math.min(100,p/D*100)+'%');
  $('#lvl').style.width=(St.rec?Math.min(100,St.lvl*140):0)+'%';
  if(St.play&&!St.rec&&p>endT()+.3){stop();return}
  if(St.play||St.rec||St.counting)St.raf=requestAnimationFrame(f)};
 f();
}
/* grabación */
async function rec(){
 if(St.rec||St.counting){stop();return}
 if(St.tracks.length>=8){msg('Máximo 8 pistas. Borra alguna para seguir.');return}
 msg('');
 if(!window.isSecureContext||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg('Sin acceso al micrófono: abre la app con HTTPS en Safari o Chrome.');return}
 const c=ctx();let stream;
 try{stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:St.dev?{exact:St.dev}:undefined,echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}
 catch(e){msg(e.name==='NotAllowedError'||e.name==='SecurityError'?'Permiso de micrófono denegado. Actívalo en los ajustes del navegador para este sitio.':(e.name==='NotFoundError'||e.name==='OverconstrainedError')?'No se encontró esa entrada de audio. Elige otra de la lista.':e.name==='NotReadableError'?'El micrófono está siendo usado por otra app.':'No se pudo acceder al micrófono ('+e.name+').');return}
 devs();
 const src=c.createMediaStreamSource(stream),sp=c.createScriptProcessor(1024,1,1),z=c.createGain();z.gain.value=0;
 const r={stream,src,sp,z,ch:[],n:0,began:false,skip:0};
 sp.onaudioprocess=e=>{const d=e.inputBuffer.getChannelData(0);r.ch.push(new Float32Array(d));r.n+=d.length;let m=0;for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>m)m=a}St.lvl=m};
 src.connect(sp);sp.connect(z);z.connect(c.destination);St.rec=r;
 const begin=()=>{St.counting=false;r.began=true;play(0);r.skip=r.n+Math.round((St.t0-c.currentTime)*c.sampleRate);ui();anim()};
 if(St.count){St.counting=true;const t=c.currentTime+.1;for(let k=0;k<4;k++)click(t+k*spb(),k===0);St.cd=setTimeout(begin,(.1+4*spb())*1000);ui();anim()}else begin();
}
function finishRec(){
 const r=St.rec;St.rec=null;clearTimeout(St.cd);r.sp.onaudioprocess=null;
 try{r.src.disconnect();r.sp.disconnect();r.z.disconnect()}catch{}
 r.stream.getTracks().forEach(t=>t.stop());
 if(!r.began)return;
 const c=St.ctx,all=new Float32Array(r.n);let o=0;r.ch.forEach(b=>{all.set(b,o);o+=b.length});
 const lat=Math.round(((c.baseLatency||.01)+(c.outputLatency||.03))*c.sampleRate),data=all.slice(Math.min(r.n,r.skip+lat));
 if(data.length<c.sampleRate*.2){msg('Grabación demasiado corta.');return}
 St.tracks.push({id:Date.now(),name:'Pista '+(St.tracks.length+1),data,sr:c.sampleRate,vol:.9,mute:false,solo:false,off:0});
 save();renderTracks();
}
async function devs(){try{const l=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput'),s=$('#dev');
 s.innerHTML='<option value="">Entrada predeterminada (micrófono del teléfono o cable)</option>'+l.map((d,i)=>`<option value="${d.deviceId}">${d.label||'Entrada '+(i+1)}</option>`).join('');s.value=St.dev}catch{}}
/* dibujo */
function draw(cv,t,col,D){
 const dpr=Math.min(2,window.devicePixelRatio||1),w=Math.round((cv.clientWidth||300)*dpr),h=Math.round(72*dpr);cv.width=w;cv.height=h;
 const g=cv.getContext('2d'),x0=t.off/D*w,x1=(t.off+dur(t))/D*w,len=t.data.length,sp=x1-x0;
 g.fillStyle='#2a2a2e';g.fillRect(0,h/2,w,1);g.fillStyle=col;if(sp<=0)return;
 for(let x=Math.max(0,Math.floor(x0));x<Math.min(w,Math.ceil(x1));x++){
  const i0=Math.floor((x-x0)/sp*len),i1=Math.min(len,Math.max(i0+1,Math.floor((x+1-x0)/sp*len))),st=Math.max(1,Math.floor((i1-i0)/40));let m=0;
  for(let i=Math.max(0,i0);i<i1;i+=st){const a=Math.abs(t.data[i]);if(a>m)m=a}
  const bh=Math.max(1,Math.min(1,m)*h*.95);g.fillRect(x,(h-bh)/2,1,bh)}
}
function renderTracks(){
 const el=$('#tracks');if(!el)return;const D=Math.max(5,endT());
 el.innerHTML=St.tracks.length?St.tracks.map((t,i)=>`<div class="pedal trk" data-i="${i}" style="--c:${COL[i%8]}"><div class="th"><input class="tn" data-s="name" value="${t.name.replace(/"/g,'&quot;')}" maxlength="24" aria-label="Nombre de la pista"><button data-s="m" class="${t.mute?'on':''}" aria-label="Silenciar">M</button><button data-s="s" class="${t.solo?'on':''}" aria-label="Solo">S</button><button data-s="del" aria-label="Borrar pista">✕</button></div><div class="wv" data-s="seek"><canvas></canvas><i class="ph"></i></div><div class="tf"><input type="range" data-s="vol" min="0" max="1.2" step=".01" value="${t.vol}" aria-label="Volumen"><button data-s="nl">−10 ms</button><span>${Math.round(t.off*1000)} ms</span><button data-s="nr">+10 ms</button><button data-s="norm">Normalizar</button></div></div>`).join(''):'<div class="pedal"><p class="dim" style="margin:0">Aún no hay pistas. Pulsa el botón rojo para grabar la primera.</p></div>';
 requestAnimationFrame(()=>el.querySelectorAll('.trk').forEach((e,i)=>draw(e.querySelector('canvas'),St.tracks[i],COL[i%8],D)));
}
function ui(){
 const r=$('#recb');if(!r)return;
 r.classList.toggle('on',!!St.rec||St.counting);$('#playb').textContent=St.play&&!St.rec?'❚❚':'▶';
 $('#metro').classList.toggle('on',St.metro);$('#count').classList.toggle('on',St.count);$('#bpm').textContent=St.bpm;
}
/* exportar */
async function exp(){
 if(!St.tracks.length){msg('Graba una pista primero.');return}
 msg('Preparando mezcla…');
 try{
  const sr=ctx().sampleRate,D=endT()+.3,oc=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(2,Math.ceil(D*sr),sr);
  St.tracks.forEach(t=>{const g=oc.createGain();g.gain.value=eff(t);g.connect(oc.destination);const s=oc.createBufferSource(),b=oc.createBuffer(1,t.data.length,t.sr);b.copyToChannel(t.data,0);s.buffer=b;s.connect(g);t.off>=0?s.start(t.off):s.start(0,-t.off)});
  const r=await oc.startRendering(),L=r.getChannelData(0),R=r.getChannelData(1),n=L.length,a=new DataView(new ArrayBuffer(44+n*4));
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));const k=pk>.98?.98/pk:1;
  const w=(o,s)=>[...s].forEach((c,i)=>a.setUint8(o+i,c.charCodeAt(0))),q=x=>Math.max(-1,Math.min(1,x*k))*32767|0;
  w(0,'RIFF');a.setUint32(4,36+n*4,true);w(8,'WAVEfmt ');a.setUint32(16,16,true);a.setUint16(20,1,true);a.setUint16(22,2,true);a.setUint32(24,sr,true);a.setUint32(28,sr*4,true);a.setUint16(32,4,true);a.setUint16(34,16,true);w(36,'data');a.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){a.setInt16(44+i*4,q(L[i]),true);a.setInt16(46+i*4,q(R[i]),true)}
  const f=new File([a.buffer],'musictool-mezcla.wav',{type:'audio/wav'});msg('');
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]});return}catch(e){if(e.name==='AbortError')return}}
  const u=URL.createObjectURL(f),l=document.createElement('a');l.href=u;l.download=f.name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
 }catch(e){msg('No se pudo exportar la mezcla ('+(e.name||'error')+').')}
}
/* interfaz */
function build(){
 const b=$('#studio-body');
 b.innerHTML=`<div class="pedal"><div class="tbar"><button class="rec" id="recb" data-s="rec" aria-label="Grabar"></button><button class="tbtn" id="playb" data-s="play" aria-label="Reproducir">▶</button><button class="tbtn" data-s="stop" aria-label="Parar">■</button><div class="time" id="time">0:00.0</div></div>
 <div class="meter"><i id="lvl"></i></div>
 <div class="ctl"><span>BPM</span><button data-s="b-">−</button><b id="bpm">100</b><button data-s="b+">+</button><button id="metro" data-s="metro">Metrónomo</button><button id="count" data-s="count">Cuenta</button></div>
 <select id="dev" class="sel" style="margin:0" aria-label="Entrada de audio"></select></div>
 <div id="tracks"></div>
 <button class="cta sm" data-s="export">Exportar mezcla (WAV)</button>
 <p class="msg" id="smsg" role="alert"></p>
 <p class="dim">Usa auriculares al grabar sobre otras pistas para evitar eco. Pulsa sobre una onda para mover el cursor. Ajusta el desfase con −10/+10 ms si una pista queda adelantada o atrasada.</p>`;
 b.addEventListener('click',e=>{
  const el=e.target.closest('[data-s]');if(!el)return;const a=el.dataset.s,tr=el.closest('.trk'),t=tr&&St.tracks[+tr.dataset.i];
  switch(a){
   case 'rec':rec();break;
   case 'play':if(St.rec||St.counting)break;if(St.play){St.p0=pos();halt();ui();anim()}else{const p=St.p0>=endT()?0:St.p0;if(St.tracks.length)play(p);else msg('Primero graba una pista.')}break;
   case 'stop':stop();break;
   case 'b-':case 'b+':St.bpm=Math.max(40,Math.min(220,St.bpm+(a==='b+'?1:-1)));ui();save();break;
   case 'metro':St.metro=!St.metro;ui();break;
   case 'count':St.count=!St.count;ui();break;
   case 'export':exp();break;
   case 'm':t.mute=!t.mute;el.classList.toggle('on',t.mute);applyG();save();break;
   case 's':t.solo=!t.solo;el.classList.toggle('on',t.solo);applyG();save();break;
   case 'del':if(confirm('¿Borrar "'+t.name+'"?')){const was=St.play;St.tracks.splice(+tr.dataset.i,1);save();renderTracks();if(was)play(pos())}break;
   case 'nl':case 'nr':t.off+=a==='nr'?.01:-.01;save();renderTracks();break;
   case 'norm':{let m=0;for(let i=0;i<t.data.length;i++){const v=Math.abs(t.data[i]);if(v>m)m=v}if(m>0){const k=.95/m;for(let i=0;i<t.data.length;i++)t.data[i]*=k;t.b=null;save();renderTracks()}break}
   case 'seek':{const r=el.getBoundingClientRect(),p=(e.clientX-r.left)/r.width*Math.max(5,endT());if(St.play&&!St.rec)play(p);else if(!St.rec){St.p0=p;anim()}break}
  }
 });
 b.addEventListener('input',e=>{if(e.target.dataset.s==='vol'){St.tracks[+e.target.closest('.trk').dataset.i].vol=+e.target.value;applyG()}});
 b.addEventListener('change',e=>{const s=e.target.dataset.s;
  if(s==='vol')save();
  if(s==='name'){St.tracks[+e.target.closest('.trk').dataset.i].name=e.target.value.trim()||'Pista';save()}
  if(e.target.id==='dev')St.dev=e.target.value});
 St.built=true;
}
return{
 async show(){if(!St.loaded){await load();St.loaded=true}if(!St.built)build();devs();renderTracks();ui();anim()},
 leave(){if(St.rec||St.counting||St.play)stop()}
};
})();
