(() => {
  const sections=["avisos","posters","actividades","eventos","horarios","grados_cursos","docentes","directivos","equipo_administrativo","colaboradores","jardin","preescolar","primer_grado","segundo_grado","tercer_grado","cuarto_grado","quinto_grado","sexto_grado","septimo_grado","octavo_grado","noveno_grado","primer_curso","segundo_curso","tercer_curso"];
  const CACHE_KEY="ceppbo-drive-media-v4";
  const LOCAL_LOGO="assets/ceppbo-logo.png";
  const pretty=s=>({avisos:"Avisos",posters:"Pósteres",actividades:"Actividades",eventos:"Eventos",horarios:"Horarios",grados_cursos:"Grados y cursos",docentes:"Docentes"}[s]||s);
  const esc=s=>String(s||"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

  function candidates(item){
    if(!item?.id) return [item?.imageUrl,item?.thumbnailUrl].filter(Boolean);
    const id=encodeURIComponent(item.id);
    return [
      `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
      `https://lh3.googleusercontent.com/d/${id}=w1600`,
      item.imageUrl,
      item.thumbnailUrl
    ].filter((v,i,a)=>v&&a.indexOf(v)===i);
  }

  function setImageWithFallback(img,item,finalFallback=""){
    const urls=candidates(item).filter(u=>!String(u).includes("drive.google.com/uc?"));
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

  function applyHeroBackground(items){
    if(!Array.isArray(items)||!items.length) return;
    const hero=document.querySelector(".hero");
    if(!hero) return;
    const probe=new Image();
    let pos=0, urls=candidates(items[0]);
    probe.onload=()=>{
      const good=probe.src;
      hero.style.backgroundImage=`linear-gradient(90deg,rgba(35,20,105,.88),rgba(57,37,143,.68)),url("${good}")`;
      hero.style.backgroundSize="cover";
      hero.style.backgroundPosition="center";
      hero.style.backgroundRepeat="no-repeat";
    };
    probe.onerror=()=>{if(pos<urls.length) probe.src=urls[pos++];};
    if(urls.length) probe.src=urls[pos++];
  }

  function paint(payload){
    const source=payload?.sections||payload?.data||payload||{};
    sections.forEach(s=>render(s,source[s]||[]));
    applyLogo(source.logos||[]);
    applyHeroBackground(source.fondo_portada||[]);
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