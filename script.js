const header=document.querySelector('.site-header');const menu=document.getElementById('menuToggle');const nav=document.getElementById('mainNav');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>20));
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.innerHTML=`<i class="fa-solid fa-${open?'xmark':'bars'}"></i>`});
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');if(menu)menu.innerHTML='<i class="fa-solid fa-bars"></i>'}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
document.getElementById('year').textContent=new Date().getFullYear();


// Experiencia interactiva CEPPBO
const loader=document.getElementById('pageLoader');
window.addEventListener('load',()=>setTimeout(()=>loader?.classList.add('hide'),550));
const progress=document.getElementById('scrollProgress');
const backTop=document.getElementById('backTop');
function updateExperience(){const max=document.documentElement.scrollHeight-innerHeight;const pct=max>0?(scrollY/max)*100:0;if(progress)progress.style.width=pct+'%';backTop?.classList.toggle('show',scrollY>650)}
window.addEventListener('scroll',updateExperience,{passive:true});updateExperience();
backTop?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
// Parallax muy suave en el escudo: aporta profundidad sin sacrificar legibilidad
const hero=document.querySelector('.hero'), heroLogo=document.querySelector('.hero-logo img');
if(hero&&heroLogo&&matchMedia('(pointer:fine)').matches){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;heroLogo.style.transform=`translate(${x*10}px,${y*10}px) scale(1.01)`});hero.addEventListener('pointerleave',()=>heroLogo.style.transform='');}
