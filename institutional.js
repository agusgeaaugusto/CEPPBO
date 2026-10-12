// Accesibilidad y optimización progresiva CEPPBO
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reducedMotion)document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
document.querySelectorAll('img').forEach(img=>{if(!img.closest('.brand,.hero'))img.loading='lazy';img.decoding='async'});

// Filtros de galería sin eliminar contenidos de Drive.
document.querySelectorAll('[data-gallery-filter]').forEach(button=>button.addEventListener('click',()=>{
 const selected=button.dataset.galleryFilter;
 document.querySelectorAll('[data-gallery-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 ['actividades','eventos'].forEach(type=>{const section=document.getElementById(type);if(section)section.classList.toggle('gallery-hidden',selected!=='all'&&selected!==type);});
}));
// Lightbox accesible con cierre por Escape y retorno del foco.
const lightbox=document.getElementById('galleryLightbox'),closeLightbox=document.getElementById('lightboxClose');
let previousFocus=null;
function dismissLightbox(){if(!lightbox)return;lightbox.hidden=true;document.body.style.overflow='';previousFocus?.focus();}
document.querySelectorAll('#drive-actividades,#drive-eventos').forEach(grid=>grid.addEventListener('click',event=>{
 const img=event.target.closest('.drive-image img');if(!img||!img.src||!lightbox)return;
 previousFocus=document.activeElement;lightbox.querySelector('img').src=img.currentSrc||img.src;lightbox.querySelector('img').alt=img.alt;lightbox.querySelector('p').textContent=img.alt;lightbox.hidden=false;document.body.style.overflow='hidden';closeLightbox?.focus();
}));
closeLightbox?.addEventListener('click',dismissLightbox);
lightbox?.addEventListener('click',event=>{if(event.target===lightbox)dismissLightbox();});
document.addEventListener('keydown',event=>{if(!lightbox?.hidden&&event.key==='Escape')dismissLightbox();});
// Formulario sin servidor: el visitante decide enviar desde WhatsApp.
document.getElementById('contactForm')?.addEventListener('submit',event=>{
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const data=new FormData(form);const message=encodeURIComponent('Consulta CEPPBO\nNombre: '+data.get('nombre')+'\nMotivo: '+data.get('motivo')+'\nMensaje: '+data.get('mensaje'));
 window.open('https://wa.me/595982119598?text='+message,'_blank','noopener,noreferrer');
});

document.querySelectorAll('#drive-actividades,#drive-eventos').forEach(grid=>{
 grid.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const target=event.target.closest('.drive-image');if(!target)return;
  event.preventDefault();target.querySelector('img')?.click();
 });
 const observer=new MutationObserver(()=>grid.querySelectorAll('.drive-image').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Ampliar fotografía');}));
 observer.observe(grid,{childList:true,subtree:true});
});
