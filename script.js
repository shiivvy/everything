const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DAYS = Math.floor((Date.now() - new Date(2025, 6, 10)) / 86400000);   // since 10 July 2025

/* ---------- split headline into letters ---------- */
$$('.split').forEach(el => { el.innerHTML = [...el.textContent].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join(''); });

/* ---------- floating hearts (canvas) ---------- */
const cv = $('#hearts'), cx = cv.getContext('2d');
let W, H, hearts = [], dpr = Math.min(devicePixelRatio || 1, 2);
const size = () => { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; };
size(); addEventListener('resize', size);
function spawn(x, y, burst) {
  hearts.push({ x, y, s: (burst ? 10 + Math.random() * 18 : 6 + Math.random() * 8) * dpr,
    vx: (Math.random() - .5) * (burst ? 8 : .6) * dpr, vy: -(burst ? 3 + Math.random() * 8 : .5 + Math.random() * .9) * dpr,
    a: burst ? 1 : .5, r: Math.random() * 6, c: ['#e8467c', '#ff6f61', '#ffb3c7', '#ff8fab', '#fff'][Math.random() * 5 | 0], burst });
}
function drawHeart(h) {
  cx.save(); cx.translate(h.x, h.y); cx.rotate(Math.sin(h.r) * .4); cx.scale(h.s / 30, h.s / 30); cx.globalAlpha = Math.max(h.a, 0);
  cx.fillStyle = h.c; cx.beginPath(); cx.moveTo(0, 10); cx.bezierCurveTo(-18, -4, -10, -20, 0, -8); cx.bezierCurveTo(10, -20, 18, -4, 0, 10); cx.fill(); cx.restore();
}
const burstAt = (el, n = 60) => { const r = el.getBoundingClientRect(); for (let i = 0; i < n; i++) spawn((r.left + r.width / 2) * dpr, (r.top + r.height / 2) * dpr, true); };
let last = 0;
(function loop(t) {
  cx.clearRect(0, 0, W, H);
  if (t - last > 1000 && hearts.length < 12 && !document.body.classList.contains('locked')) { spawn(Math.random() * W, H + 20, false); last = t; }
  hearts = hearts.filter(h => h.a > 0 && h.y > -40);
  hearts.forEach(h => { h.x += h.vx; h.y += h.vy; h.r += .03; if (h.burst) { h.vy += .13 * dpr; h.a -= .011; } else h.a -= .0012; drawHeart(h); });
  requestAnimationFrame(loop);
})(0);

/* ---------- smooth scrolling ---------- */
let lenis = null;
const touch = matchMedia('(pointer: coarse)').matches;
if (typeof Lenis !== 'undefined' && !reduce && !touch) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.stop();
  if (hasGsap) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0); }
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t) : t.scrollIntoView({ behavior: 'smooth' }); } }));

/* ---------- opening screen ---------- */
function openGate() {
  const gate = $('#gate');
  document.body.classList.remove('locked');
  lenis && lenis.start();
  burstAt($('.gate-heart'), 50);
  if (hasGsap && !reduce) {
    gsap.timeline()
      .to('.gate-inner', { scale: 1.15, opacity: 0, duration: .5, ease: 'power2.in' })
      .to(gate, { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '-=.1')
      .set(gate, { display: 'none' })
      .add(heroIn, '-=.55');
  } else { gate.style.display = 'none'; $('#days').textContent = DAYS; }
}
$('#open').addEventListener('click', openGate);
$('#gate').addEventListener('click', e => { if (e.target.id !== 'open') openGate(); }, { once: true });

function heroIn() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.chip', { y: -30, opacity: 0, duration: .6 })
    .from('#t1 .ch', { yPercent: 110, opacity: 0, rotate: 8, stagger: .045, duration: .7 }, '-=.3')
    .from('#t2 .ch', { yPercent: 120, opacity: 0, scale: .4, stagger: .09, duration: .9, ease: 'back.out(2.2)' }, '-=.35')
    .from('.lead', { y: 24, opacity: 0, duration: .7 }, '-=.4')
    .add(() => { const o = { v: 0 }, d = $('#days'); let shownV = -1; gsap.to(o, { v: DAYS, duration: 1.6, ease: 'power2.out', onUpdate: () => { const v = Math.round(o.v); if (v !== shownV) { shownV = v; d.textContent = v; } }, onComplete: () => { d.textContent = DAYS; } }); }, '<')
    .from('.p1', { x: -160, y: 80, rotate: -40, opacity: 0, duration: 1, ease: 'back.out(1.4)' }, '-=.5')
    .from('.p2', { x: 160, y: 80, rotate: 40, opacity: 0, duration: 1, ease: 'back.out(1.4)' }, '-=.85')
    .from('.spark', { scale: 0, opacity: 0, stagger: .12, duration: .5, ease: 'back.out(3)' }, '-=.5')
    .from('.scroll-hint', { opacity: 0, y: -10, duration: .5 }, '-=.2');
}

/* ---------- scroll animations ---------- */
if (hasGsap && !reduce) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .3 } });

  $$('[data-anim]').forEach(el => gsap.from(el, { y: 44, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  $$('[data-speed]').forEach(el => gsap.to(el, { yPercent: 60 * parseFloat(el.dataset.speed), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));
  gsap.to('.hero-photos', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // the road draws itself, stop by stop
  const road = $('#roadpath'), len = road.getTotalLength();
  gsap.set(road, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(road, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.road-wrap', start: 'top 70%', end: 'bottom 75%', scrub: .6 } });
  $$('.road li').forEach((li, i) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 84%' } });
    tl.from($('img', li), { scale: 0, rotate: i % 2 ? 50 : -50, opacity: 0, duration: .8, ease: 'back.out(1.8)' })
      .from($('div', li), { x: 46, opacity: 0, duration: .7, ease: 'power3.out' }, '-=.55');
  });

  // 2000 km -> 0 km, pinned while she scrolls
  const km = $('#km'), dtxt = $('#dtxt'), track = $('.dist-track');
  const lines = ['That far apart. Every single day of it.', 'Calls instead of coffee. Snaps instead of seeing you.', 'A train, a bag, and new shoes you chose on video call.', 'And today — nothing between us at all.'];
  let shown = -1;
  const half = () => track.offsetWidth / 2 - 32 - 18;
  gsap.timeline({ scrollTrigger: { trigger: '#distance', start: 'top top', end: '+=200%', pin: true, pinSpacing: true, anticipatePin: 1, scrub: touch ? true : .5, invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress, v = Math.round(1590 * (1 - Math.min(p / .82, 1)));
        if (km.textContent !== String(v)) km.textContent = v;
        const idx = p < .25 ? 0 : p < .5 ? 1 : p < .8 ? 2 : 3;
        if (idx !== shown) { shown = idx; dtxt.textContent = lines[idx]; gsap.fromTo(dtxt, { opacity: 0 }, { opacity: 1, duration: .4, overwrite: true }); }
      },
      onLeave() { burstAt($('#meet'), 40); } } })
    .to('#me', { x: () => half(), ease: 'none', duration: .82 }, 0)
    .to('#you', { x: () => -half(), ease: 'none', duration: .82 }, 0)
    .to('#dline', { scaleX: 0, ease: 'none', duration: .82 }, 0)
    .to('#meet', { scale: 1, duration: .14, ease: 'back.out(3)' }, .84)
    .to('.who', { scale: .92, duration: .1 }, .84)
    .to('.km', { scale: 1.12, color: '#ff8fab', duration: .14 }, .84);

  // heartbeat line
  const beat = $('#beatline'), bl = beat.getTotalLength();
  gsap.set(beat, { strokeDasharray: bl, strokeDashoffset: bl });
  gsap.to(beat, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.beat', start: 'top 85%', end: 'top 30%', scrub: .5 } });

  ScrollTrigger.batch('[data-card]', { start: 'top 88%', onEnter: els => gsap.from(els, { y: 60, opacity: 0, scale: .92, rotate: () => gsap.utils.random(-5, 5), duration: .9, stagger: .14, ease: 'back.out(1.5)', overwrite: true }) });
  $$('[data-from]').forEach(el => gsap.from(el, { x: el.dataset.from === 'left' ? -70 : 70, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  gsap.from('.strip figure', { y: 80, opacity: 0, stagger: .06, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.strip', start: 'top 85%' }, clearProps: 'transform,opacity' });

} else {
  $('#days').textContent = DAYS;
}

/* ---------- polaroids follow the finger / mouse ---------- */
const tilts = $$('[data-tilt]');
function tilt(x, y) { tilts.forEach((el, i) => { el.style.transform = `rotate(var(--rot)) rotateY(${x * 14}deg) rotateX(${-y * 12}deg) translate(${x * (i ? -10 : 10)}px, ${y * 8}px)`; }); }
addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && scrollY < innerHeight) tilt(e.clientX / innerWidth - .5, e.clientY / innerHeight - .5); }, { passive: true });

/* ---------- gallery: centre card pops, dots follow ---------- */
const strip = $('#strip'), figs = $$('figure', strip), dots = $('#dots');
figs.forEach(() => dots.appendChild(document.createElement('i')));
function centre() {
  const mid = strip.scrollLeft + strip.clientWidth / 2; let best = 0, bd = 1e9;
  figs.forEach((f, i) => { const d = Math.abs(f.offsetLeft + f.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
  figs.forEach((f, i) => f.classList.toggle('on', i === best)); [...dots.children].forEach((d, i) => d.classList.toggle('on', i === best));
}
strip.addEventListener('scroll', () => requestAnimationFrame(centre), { passive: true }); centre();

/* ---------- tap a photo to open it ---------- */
const lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('p', lb);
function openLb(src, cap) { lbImg.src = src; lbCap.textContent = cap || ''; lb.hidden = false; requestAnimationFrame(() => lb.classList.add('show')); lenis && lenis.stop(); }
function closeLb() { lb.classList.remove('show'); setTimeout(() => { lb.hidden = true; }, 300); lenis && lenis.start(); }
document.addEventListener('click', e => {
  const img = e.target.closest('img[data-zoom], .today-grid img');
  if (img) { const f = img.closest('figure, li'); openLb(img.src, f ? (($('figcaption', f) || $('h3', f) || $('p', f) || {}).textContent || '') : ''); }
});
lb.addEventListener('click', closeLb);
addEventListener('keydown', e => e.key === 'Escape' && !lb.hidden && closeLb());

/* ---------- one video at a time ---------- */
const vids = $$('video');
vids.forEach(v => v.addEventListener('play', () => vids.forEach(o => o !== v && o.pause())));

/* ---------- "today": upload today/1.jpg ... today/12.jpg and they appear here ---------- */
const grid = $('#today-grid'), empty = $('#today-empty');
for (let i = 1; i <= 12; i++) {
  const img = new Image();
  img.onload = () => {
    const f = document.createElement('figure'); f.style.order = i; f.appendChild(img); grid.appendChild(f);
    empty.innerHTML = 'Finally — <b>both of us in the same frame.</b>';
    hasGsap && ScrollTrigger.refresh();
  };
  img.src = `today/${i}.jpg?v=${Date.now()}`;
}

/* ---------- press and hold the heart ---------- */
const btn = $('#hold'), fill = $('#hfill'), txt = $('#holdtxt'), promise = $('#promise'), typed = $('#typed');
const LETTER = "I'm not letting go. Not after today, not after two years, not after anything. Thank you for waiting for me, Medhuu ji.";
let p = 0, holding = false, done = false;
btn.addEventListener('pointerdown', e => { e.preventDefault(); if (!done) { holding = true; btn.classList.add('holding'); } });
['pointerup', 'pointercancel'].forEach(ev => addEventListener(ev, () => { holding = false; btn.classList.remove('holding'); }));
btn.addEventListener('contextmenu', e => e.preventDefault());
(function tick() {
  if (!done) {
    p = Math.max(0, Math.min(1, p + (holding ? .011 : -.02)));
    fill.setAttribute('y', 92 - 92 * p);
    btn.classList.toggle('past', p > .55);
    txt.textContent = p > .66 ? "don't let go" : p > .2 ? 'keep holding' : 'hold';
    if (holding && Math.random() < .2) spawn((btn.getBoundingClientRect().left + Math.random() * 210) * dpr, (btn.getBoundingClientRect().top + 60) * dpr, false);
    if (holding && navigator.vibrate && Math.random() < .08) navigator.vibrate(12);
    if (p >= 1) finish();
  }
  requestAnimationFrame(tick);
})();
function finish() {
  done = true; btn.classList.remove('holding', 'past'); btn.classList.add('done'); txt.textContent = 'got you ♥'; promise.hidden = false;
  burstAt(btn, 90); setTimeout(() => burstAt(btn, 50), 350);
  if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
  if (hasGsap && !reduce) gsap.from('.promise h3, .promise .sign', { y: 40, opacity: 0, duration: .9, stagger: .25, ease: 'power3.out' });
  typed.classList.add('caret'); let i = 0;
  const t = setInterval(() => { typed.textContent = LETTER.slice(0, ++i); if (i >= LETTER.length) { clearInterval(t); typed.classList.remove('caret'); } }, 34);
  setTimeout(() => { hasGsap && ScrollTrigger.refresh(); lenis ? lenis.scrollTo(promise, { offset: -innerHeight / 3 }) : promise.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 500);
}
