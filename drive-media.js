(() => {
  const sections=["avisos","posters","actividades","eventos","horarios","grados_cursos","docentes"];
  const CACHE_KEY="ceppbo-drive-media-v4";
  const LOCAL_LOGO="assets/ceppbo-logo.png";
  const pretty=s=>({avisos:"Avisos",posters:"Pósteres",actividades:"Actividades",eventos:"Eventos",horarios:"Horarios",grados_cursos:"Grados y cursos",docentes:"Docentes"}[s]||s);
  const esc=s=>String(s||"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

  function candidates(item){
    if(!item?.id) return [item?.imageUrl,item?.thumbnailUrl].filter(Boolean);
    const id=encodeURIComponent(item.id);
    return [
      item.imageUrl,
      item.thumbnailUrl,
      `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
      `https://lh3.googleusercontent.com/d/${id}=w1600`,
      `https://drive.google.com/uc?export=view&id=${id}`,
      `https://drive.usercontent.google.com/download?id=${id}&export=view`
    ].filter((v,i,a)=>v&&a.indexOf(v)===i);
  }

  function setImageWithFallback(img,item,finalFallback=""){
    const urls=candidates(item);
    let pos=0;
    const next=()=>{
      if(pos>=urls.length){
        if(finalFallback){img.onerror=null;img.src=finalFallback;}
        else img.closest(".drive-card")?.classList.add("image-error");
        return;
      }
      img.src=urls[pos++];
    };
    img.onerror=next;
    img.onload=()=>img.classList.add("loaded");
    next();
  }

  function render(section,items){
    const box=document.getElementById(`drive-${section}`);
    if(!box) return;
    if(!Array.isArray(items)||!items.length){box.innerHTML="";return;}
    box.innerHTML=items.map((item,index)=>`
      <article class="drive-card reveal visible">
        <div class="drive-image">
          <img data-drive-index="${index}" loading="${index<2?"eager":"lazy"}" ${index===0?'fetchpriority="high"':""} decoding="async" alt="${esc(item.name||pretty(section))}">
        </div>
        <div class="drive-caption">
          <strong>${esc((item.name||pretty(section)).replace(/\.[^.]+$/,""))}</strong>
          ${item.modifiedTime?`<small>Actualizado: ${new Date(item.modifiedTime).toLocaleDateString("es-PY")}</small>`:""}
        </div>
      </article>`).join("");
    box.querySelectorAll("img[data-drive-index]").forEach(img=>setImageWithFallback(img,items[Number(img.dataset.driveIndex)]));
  }

  function applyLogo(items){
    // El logo local de GitHub nunca se rompe. Solo se sustituye si el de Drive carga de verdad.
    document.querySelectorAll(".brand img,.hero-logo img,.contact-visual img,.footer-brand img,.loader-mark img").forEach(img=>{
      if(!img.getAttribute("src")) img.src=LOCAL_LOGO;
    });
    if(!Array.isArray(items)||!items.length) return;
    const probe=new Image();
    let pos=0, urls=candidates(items[0]);
    probe.onload=()=>{
      const good=probe.src;
      document.querySelectorAll(".brand img,.hero-logo img,.contact-visual img,.footer-brand img,.loader-mark img").forEach(img=>{img.src=good;img.removeAttribute("srcset");});
      const fav=document.querySelector('link[rel="icon"]'); if(fav) fav.href=good;
    };
    probe.onerror=()=>{if(pos<urls.length) probe.src=urls[pos++];};
    if(urls.length) probe.src=urls[pos++];
  }

  function paint(payload){
    const source=payload?.sections||payload?.data||payload||{};
    sections.forEach(s=>render(s,source[s]||[]));
    applyLogo(source.logos||[]);
  }

  function readCache(){
    try{const c=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");if(c?.data) paint(c.data);}catch(_){}
  }

  async function load(){
    const api=window.CEPPBO_MEDIA_API;
    if(!api) return;
    try{
      const res=await fetch(api+(api.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store",redirect:"follow"});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      if(!data?.ok||!data?.sections) throw new Error("Respuesta inválida de la API CEPPBO");
      paint(data);
      try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),data}));}catch(_){}
    }catch(err){console.error("CEPPBO Drive:",err);}
  }

  document.addEventListener("DOMContentLoaded",()=>{
    // Garantiza el logo aun cuando Drive o Apps Script estén temporalmente caídos.
    document.querySelectorAll(".brand img,.hero-logo img,.contact-visual img,.footer-brand img,.loader-mark img").forEach(img=>{
      img.onerror=()=>{img.onerror=null;img.src=LOCAL_LOGO;};
    });
    readCache();
    load();
    setInterval(load,window.CEPPBO_MEDIA_REFRESH_MS||15000);
    document.addEventListener("visibilitychange",()=>{if(!document.hidden) load();});
  });
})();