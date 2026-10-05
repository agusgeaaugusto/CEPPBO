(() => {
  const sections=["avisos","posters","actividades","eventos","horarios","grados_cursos","docentes"];
  const CACHE_KEY="ceppbo-drive-media-v3";
  const pretty=s=>({avisos:"Avisos",posters:"Pósteres",actividades:"Actividades",eventos:"Eventos",horarios:"Horarios",grados_cursos:"Grados y cursos",docentes:"Docentes"}[s]||s);
  const escapeHtml=s=>String(s||"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

  // Para <img>, el endpoint thumbnail de Drive es el más estable.
  // Se usa el ID entregado por Apps Script y un segundo endpoint como respaldo.
  const thumbUrl=item=>item?.id?`https://drive.google.com/thumbnail?id=${encodeURIComponent(item.id)}&sz=w1600`:(item?.imageUrl||item?.thumbnailUrl||"");
  const fallbackUrl=item=>item?.id?`https://lh3.googleusercontent.com/d/${encodeURIComponent(item.id)}=w1600`:"";

  function wireFallback(img,item){
    let tried=false;
    img.addEventListener("error",()=>{
      if(tried) return;
      tried=true;
      const alt=fallbackUrl(item);
      if(alt) img.src=alt;
    });
  }

  function render(section,items){
    const box=document.getElementById(`drive-${section}`);
    if(!box) return;
    if(!items?.length){box.innerHTML="";return;}
    box.innerHTML=items.map((item,index)=>{
      const src=thumbUrl(item);
      const eager=index===0;
      return `<article class="drive-card reveal"><div class="drive-image"><img data-drive-index="${index}" loading="${eager?"eager":"lazy"}" ${eager?'fetchpriority="high"':""} decoding="async" src="${src}" alt="${escapeHtml(item.name||pretty(section))}"></div><div class="drive-caption"><strong>${escapeHtml((item.name||pretty(section)).replace(/\.[^.]+$/,""))}</strong>${item.modifiedTime?`<small>Actualizado: ${new Date(item.modifiedTime).toLocaleDateString("es-PY")}</small>`:""}</div></article>`;
    }).join("");
    box.querySelectorAll("img[data-drive-index]").forEach(img=>wireFallback(img,items[Number(img.dataset.driveIndex)]));
  }

  function applyLogo(items){
    if(!items?.length) return;
    const src=thumbUrl(items[0]);
    if(!src) return;
    document.querySelectorAll('img[src*="ceppbo-logo"], .brand img, .footer-brand img, .contact-visual img, .hero-logo img').forEach(img=>{
      img.src=src;
      img.removeAttribute("srcset");
      wireFallback(img,items[0]);
    });
    const favicon=document.querySelector('link[rel="icon"]');
    if(favicon) favicon.href=src;
  }

  function paint(payload){
    const source=payload?.sections||payload?.data||payload||{};
    sections.forEach(s=>render(s,Array.isArray(source[s])?source[s]:[]));
    applyLogo(Array.isArray(source.logos)?source.logos:[]);
  }

  function readCache(){
    try{
      const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
      if(cached?.data) paint(cached.data);
    }catch(_){}
  }

  async function load(){
    const api=window.CEPPBO_MEDIA_API;
    if(!api) return;
    try{
      const url=api+(api.includes("?")?"&":"?")+"t="+Date.now();
      const res=await fetch(url,{cache:"no-store",redirect:"follow"});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      if(data?.ok===false) throw new Error("La API de Drive devolvió un error");
      paint(data);
      try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),data}));}catch(_){}
    }catch(err){
      console.error("CEPPBO Drive:",err);
    }
  }

  document.addEventListener("DOMContentLoaded",()=>{
    readCache();
    load();
    setInterval(load,window.CEPPBO_MEDIA_REFRESH_MS||15000);
    document.addEventListener("visibilitychange",()=>{if(!document.hidden) load();});
  });
})();