(() => {
  const sections = ["avisos","posters","actividades","eventos","horarios","grados_cursos","docentes"];
  const CACHE_KEY = "ceppbo-drive-media-v2";
  const pretty = s => ({avisos:"Avisos",posters:"Pósteres",actividades:"Actividades",eventos:"Eventos",horarios:"Horarios",grados_cursos:"Grados y cursos",docentes:"Docentes"}[s]||s);
  const escapeHtml = s => String(s||"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  // Google Drive thumbnail puede fallar en sitios externos aunque Apps Script liste el archivo.
  // drive.usercontent.google.com sirve el archivo público directamente.
  const directUrl = item => item?.id ? `https://drive.usercontent.google.com/download?id=${encodeURIComponent(item.id)}&export=view` : "";
  const thumbUrl = item => item?.id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(item.id)}&sz=w1200` : (item?.imageUrl || item?.thumbnailUrl || "");
  const imageUrl = item => directUrl(item) || thumbUrl(item);

  function installFallback(img,item){
    const fallback=thumbUrl(item);
    img.addEventListener("error",()=>{
      if(fallback && img.src!==fallback) img.src=fallback;
    },{once:true});
  }

  function render(section, items){
    const box=document.getElementById(`drive-${section}`); if(!box) return;
    if(!items?.length){box.innerHTML="";return;}
    box.innerHTML=items.map((item,index)=>{
      const eager=index===0;
      return `<article class="drive-card reveal"><div class="drive-image"><img data-drive-index="${index}" loading="${eager?'eager':'lazy'}" ${eager?'fetchpriority="high"':''} decoding="async" referrerpolicy="no-referrer" src="${imageUrl(item)}" alt="${escapeHtml(item.name||pretty(section))}"></div><div class="drive-caption"><strong>${escapeHtml((item.name||pretty(section)).replace(/\.[^.]+$/, ""))}</strong>${item.modifiedTime?`<small>Actualizado: ${new Date(item.modifiedTime).toLocaleDateString('es-PY')}</small>`:""}</div></article>`;
    }).join("");
    box.querySelectorAll("img[data-drive-index]").forEach(img=>installFallback(img,items[Number(img.dataset.driveIndex)]));
  }

  function applyLogo(items){
    if(!items?.length) return;
    const newest=items[0], src=imageUrl(newest); if(!src) return;
    document.querySelectorAll('img[src*="ceppbo-logo"], .brand img, .footer-brand img, .contact-visual img, .hero-logo img').forEach(img=>{img.src=src;img.removeAttribute('srcset');});
    const favicon=document.querySelector('link[rel="icon"]'); if(favicon) favicon.href=src;
  }

  function paint(data){
    const source=data?.sections||data||{};
    sections.forEach(s=>render(s,source[s]||[]));
    applyLogo(source.logos||[]);
  }

  function readCache(){
    try{
      const raw=localStorage.getItem(CACHE_KEY);
      if(raw) paint(JSON.parse(raw).data);
    }catch(_){}
  }

  async function load(){
    const api=window.CEPPBO_MEDIA_API;
    if(!api) return;
    try{
      const url=api+(api.includes('?')?'&':'?')+'t='+Date.now();
      const res=await fetch(url,{cache:'no-store'});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      paint(data);
      try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),data}));}catch(_){}
    }catch(err){console.error('CEPPBO Drive:',err);}
  }

  document.addEventListener('DOMContentLoaded',()=>{
    readCache(); // muestra inmediatamente la última versión guardada
    load();      // actualiza en segundo plano desde Drive
    setInterval(load,window.CEPPBO_MEDIA_REFRESH_MS||15000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden) load();});
  });
})();