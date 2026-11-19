'use strict';
/* MUSICTOOL · Biblioteca de partituras. Visor local sin subir documentos a servidores. */
window.PDFStudy=(()=>{
 let currentURL=null, currentName='', mode='score';
 const $=s=>document.querySelector(s);
 const note=m=>{const e=$('#pdfmsg');if(e)e.textContent=m||''};
 function render(){
  const host=$('#pdf-body'); if(!host)return;
  host.innerHTML=`<div class="pedal pdf-import"><b>Importar partitura en PDF</b><p class="dim">El archivo se abre localmente en tu dispositivo; no se envía a ningún servidor.</p><label class="cta sm pdf-pick" for="pdf-file">Seleccionar PDF</label><input id="pdf-file" type="file" accept="application/pdf,.pdf" hidden><p id="pdfname" class="dim">Ningún documento seleccionado</p></div>
  <div class="seg pdf-tabs"><button data-pdfmode="score" class="on">Partitura original</button><button data-pdfmode="tab">Tablatura</button></div>
  <div id="pdf-score" class="pedal pdf-frame"><div class="pdf-empty">Importa un PDF para visualizar aquí tus ejercicios.</div></div>
  <div id="pdf-tab" class="pedal pdf-tabview" hidden><b>Tablatura del ejercicio</b><p class="dim">Puedes escribir o pegar aquí una tablatura. La conversión automática de partitura a tablatura mediante IA todavía no está conectada.</p><textarea id="tab-editor" spellcheck="false" aria-label="Editor de tablatura" placeholder="e|----------------|\nB|----------------|\nG|----------------|\nD|----------------|\nA|----------------|\nE|----------------|" rows="12"></textarea><button class="cta sm" id="tab-copy">Copiar tablatura</button></div>
  <p class="msg" id="pdfmsg" role="status"></p>
  <p class="dim">Consejo: los PDF escaneados pueden requerir reconocimiento óptico de notas (OMR). La vista original funciona sin conexión; la conversión automática será una fase posterior.</p>`;
  host.addEventListener('change',e=>{if(e.target.id==='pdf-file')openFile(e.target.files?.[0])});
  host.addEventListener('click',e=>{
   const tab=e.target.closest('[data-pdfmode]');if(tab){mode=tab.dataset.pdfmode;$('#pdf-score').hidden=mode!=='score';$('#pdf-tab').hidden=mode!=='tab';host.querySelectorAll('[data-pdfmode]').forEach(x=>x.classList.toggle('on',x===tab));}
   if(e.target.id==='tab-copy'){const v=$('#tab-editor').value;navigator.clipboard?.writeText(v).then(()=>note('Tablatura copiada.')).catch(()=>note('No se pudo copiar automáticamente; selecciona el texto y cópialo.'));}
  });
 }
 function openFile(file){
  if(!file)return;
  if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){note('Selecciona un archivo PDF válido.');return;}
  if(currentURL)URL.revokeObjectURL(currentURL);
  currentURL=URL.createObjectURL(file);currentName=file.name;
  $('#pdfname').textContent=currentName;
  const frame=$('#pdf-score');frame.innerHTML='';
  const iframe=document.createElement('iframe');iframe.src=currentURL+'#toolbar=1&navpanes=0';iframe.title='Vista previa de '+currentName;iframe.className='pdf-embed';
  frame.appendChild(iframe);note('PDF cargado localmente. Cambia a «Tablatura» para escribir o consultar la transcripción.');
 }
 return {show:render,leave(){}};
})();
