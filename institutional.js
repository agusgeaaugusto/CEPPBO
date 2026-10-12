// Accesibilidad y optimización progresiva CEPPBO
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reducedMotion)document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
document.querySelectorAll('img').forEach(img=>{if(!img.closest('.brand,.hero'))img.loading='lazy';img.decoding='async'});

// Filtros de galería sin eliminar contenidos de Drive.
document.querySelectorAll('[data-gallery-filter]').forEach(button=>button.addEventListener('click',()=>{
 const selected=button.dataset.galleryFilter;
 document.querySelectorAll('[data-gallery-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 ['actividades','eventos'].forEach(type=>{const grid=document.getElementById('drive-'+type);const section=grid?.closest('.drive-band');if(section)section.classList.toggle('gallery-hidden',selected!=='all'&&selected!==type);});
}));
// Lightbox accesible con cierre por Escape y retorno del foco.
const lightbox=document.getElementById('galleryLightbox'),closeLightbox=document.getElementById('lightboxClose');
let previousFocus=null;
function dismissLightbox(){if(!lightbox)return;lightbox.hidden=true;document.body.style.overflow='';previousFocus?.focus();}
// Abrir cualquier fotografía de Drive, también desde el botón «Ver».
document.addEventListener('click',event=>{
 const target=event.target.closest('.drive-card .drive-image, .drive-card .view-image, .drive-card [data-view-image], .drive-card .drive-view');
 if(!target||!lightbox)return;
 const card=target.closest('.drive-card');const img=card?.querySelector('.drive-image img');
 if(!img||!img.src||!img.complete||img.naturalWidth===0)return;
 event.preventDefault();previousFocus=document.activeElement;
 const large=lightbox.querySelector('img');large.src=img.currentSrc||img.src;large.alt=img.alt;
 const caption=lightbox.querySelector('p');if(caption)caption.textContent=img.alt;
 lightbox.hidden=false;lightbox.removeAttribute('hidden');document.body.style.overflow='hidden';closeLightbox?.focus();
});
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

// Navegación de imágenes con teclado y trampa de foco sencilla.
document.addEventListener('keydown',event=>{
 if(lightbox?.hidden||!lightbox)return;
 if(event.key==='Tab'){event.preventDefault();closeLightbox?.focus();}
});

// Accesibilidad para todas las galerías, incluidas las imágenes añadidas desde Drive.
document.querySelectorAll('[id^="drive-"]').forEach(grid=>{
 const decorate=()=>grid.querySelectorAll('.drive-image').forEach(el=>{
  el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Ver imagen ampliada');
 });
 grid.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const el=event.target.closest('.drive-image');if(!el)return;
  event.preventDefault();el.click();
 });
 new MutationObserver(decorate).observe(grid,{childList:true,subtree:true});decorate();
});
