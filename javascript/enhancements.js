document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('main, header, footer, .card, .hero').forEach(el=>{
    el.style.opacity = 0;
    el.style.transition = 'opacity 600ms ease-out, transform 600ms ease-out';
    el.style.transform = 'translateY(6px)';
  });
  requestAnimationFrame(()=> {
    document.querySelectorAll('main, header, footer, .card, .hero').forEach(el=>{
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if(href === '#' || href === '') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
  const revealElements = Array.from(document.querySelectorAll('.reveal'));
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if(rect.top < windowHeight - 100) el.classList.add('active');
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
  const hero = document.querySelector('.hero');
  if(hero){
    window.addEventListener('scroll', ()=>{
      const offset = Math.max(0, window.scrollY);
      hero.style.backgroundPositionY = (offset * 0.5) + 'px';
      hero.style.opacity = Math.max(0.35, 1 - offset / 900);
    });
  }
  const nav = document.querySelector('nav');
  if(nav){
    window.addEventListener('scroll', ()=> {
      if(window.scrollY > 50) nav.classList.add('nav-active');
      else nav.classList.remove('nav-active');
    });
  }
  document.querySelectorAll('.accordion .accordion-item .accordion-title').forEach(btn=>{
    btn.addEventListener('click', function(){
      const item = btn.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const open = item.classList.toggle('open');
      if(open) content.style.maxHeight = content.scrollHeight + 'px';
      else content.style.maxHeight = null;
    });
  });
  document.querySelectorAll('.tabs').forEach(tabWrap=>{
    const buttons = tabWrap.querySelectorAll('.tab-btn');
    const panels = tabWrap.querySelectorAll('.tab-panel');
    buttons.forEach((b,i)=>{
      b.addEventListener('click', ()=>{
        buttons.forEach(x=>x.classList.remove('active'));
        panels.forEach(p=>p.classList.remove('active'));
        b.classList.add('active');
        if(panels[i]) panels[i].classList.add('active');
      });
    });
  });
  document.querySelectorAll('[data-modal-target]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const sel = btn.getAttribute('data-modal-target');
      const modal = document.querySelector(sel);
      if(modal) modal.classList.add('open');
    });
  });
  document.querySelectorAll('.modal .modal-close, .modal .modal-overlay').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const modal = el.closest('.modal');
      if(modal) modal.classList.remove('open');
    });
  });
  function openLightbox(src, alt){
    let lb = document.getElementById('siteLightbox');
    if(!lb){
      lb = document.createElement('div');
      lb.id = 'siteLightbox';
      lb.className = 'lightbox';
      lb.innerHTML = '<div class="lightbox-inner"><button class="lightbox-close" aria-label="close">✕</button><img src="" alt=""><div class="lightbox-caption"></div></div><div class="lightbox-backdrop"></div>';
      document.body.appendChild(lb);
      lb.querySelector('.lightbox-backdrop').addEventListener('click', ()=>lb.classList.remove('open'));
      lb.querySelector('.lightbox-close').addEventListener('click', ()=>lb.classList.remove('open'));
    }
    lb.querySelector('img').src = src;
    lb.querySelector('img').alt = alt || '';
    lb.querySelector('.lightbox-caption').textContent = alt || '';
    lb.classList.add('open');
  }
  document.querySelectorAll('.lightbox-item').forEach(img=>{
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', ()=> openLightbox(img.getAttribute('data-large') || img.src, img.alt || ''));
  });
  const galleryContainer = document.querySelector('#galleryGrid');
  if(galleryContainer){
    fetch('assets/images.json').then(r=>{
      if(!r.ok) throw new Error('images.json missing');
      return r.json();
    }).then(list=>{
      galleryContainer.innerHTML = '';
      list.forEach(item=>{
        const div = document.createElement('div');
        div.className = 'gallery-card search-item';
        div.setAttribute('data-title', item.alt || '');
        div.setAttribute('data-tags', item.caption || '');
        div.innerHTML = `<img class="lightbox-item" src="${item.thumb}" data-large="${item.src}" alt="${item.alt}"><p>${item.caption||''}</p>`;
        galleryContainer.appendChild(div);
      });
      document.querySelectorAll('.lightbox-item').forEach(img=>{
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', ()=> openLightbox(img.getAttribute('data-large') || img.src, img.alt || ''));
      });
    }).catch(err=>{
      console.warn('Could not load gallery images.json', err);
    });
  }
  const searchInput = document.querySelector('#search');
  if(searchInput){
    searchInput.addEventListener('input', ()=>{
      const q = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.search-item').forEach(it=>{
        const t = (it.getAttribute('data-title')||'').toLowerCase();
        const tags = (it.getAttribute('data-tags')||'').toLowerCase();
        const show = !q || t.includes(q) || tags.includes(q) || it.textContent.toLowerCase().includes(q);
        it.style.display = show ? '' : 'none';
      });
    });
  }
  document.querySelectorAll('img[data-src]').forEach(img=>{
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          img.src = img.dataset.src;
          obs.unobserve(img);
        }
      });
    });
    obs.observe(img);
  });
  document.querySelectorAll('.footer-social a').forEach(link=>{
    link.addEventListener('mouseenter', ()=> link.classList.add('glow'));
    link.addEventListener('mouseleave', ()=> link.classList.remove('glow'));
  });
  if(typeof L !== 'undefined' && document.getElementById('map')){
    try {
      const mapEl = document.getElementById('map');
      const lat = parseFloat(mapEl.getAttribute('data-lat')) || -26.2041;
      const lon = parseFloat(mapEl.getAttribute('data-lon')) || 28.0473;
      const zoom = parseInt(mapEl.getAttribute('data-zoom')||13);
      const map = L.map('map').setView([lat, lon], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      const marker = L.marker([lat, lon]).addTo(map);
      const popupText = mapEl.getAttribute('data-popup') || 'Linthinkdesign';
      marker.bindPopup(popupText).openPopup();
    } catch(e){
      console.warn('Leaflet init failed', e);
    }
  }
});
