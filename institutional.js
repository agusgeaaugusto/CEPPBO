// Accesibilidad y optimización progresiva CEPPBO
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reducedMotion)document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
document.querySelectorAll('img').forEach(img=>{if(!img.closest('.brand,.hero'))img.loading='lazy';img.decoding='async'});
