// days since it began (10 July 2025)
const start = new Date(2025, 6, 10);
document.getElementById('days').textContent = Math.floor((Date.now() - start) / 86400000);

// reveal on scroll
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });

// only one video plays at a time
const vids = [...document.querySelectorAll('video')];
vids.forEach(v => v.addEventListener('play', () => vids.forEach(o => o !== v && o.pause())));

// "today" photos: upload today/1.jpg, today/2.jpg ... (up to 12) and they appear here by themselves
const grid = document.getElementById('today-grid'), empty = document.getElementById('today-empty');
for (let i = 1; i <= 12; i++) {
  const img = new Image();
  img.onload = () => {
    const f = document.createElement('figure'); f.style.order = i; f.appendChild(img); grid.appendChild(f);
    empty.innerHTML = 'Finally — <b>both of us in the same frame.</b>';
  };
  img.src = `today/${i}.jpg?v=${Date.now()}`;
}

// floating hearts
const cv = document.getElementById('hearts'), cx = cv.getContext('2d');
let W, H, hearts = [];
const size = () => { W = cv.width = innerWidth * devicePixelRatio; H = cv.height = innerHeight * devicePixelRatio; };
size(); addEventListener('resize', size);
function spawn(x, y, burst) {
  hearts.push({ x, y, s: (burst ? 10 + Math.random() * 16 : 6 + Math.random() * 8) * devicePixelRatio,
    vx: (Math.random() - .5) * (burst ? 7 : .6) * devicePixelRatio, vy: -(burst ? 3 + Math.random() * 7 : .5 + Math.random() * .9) * devicePixelRatio,
    a: burst ? 1 : .5, r: Math.random() * 6, c: ['#e8467c', '#ff6f61', '#ffb3c7', '#ff8fab'][Math.random() * 4 | 0], burst });
}
function heart(h) {
  cx.save(); cx.translate(h.x, h.y); cx.rotate(Math.sin(h.r) * .4); cx.scale(h.s / 30, h.s / 30); cx.globalAlpha = Math.max(h.a, 0);
  cx.fillStyle = h.c; cx.beginPath(); cx.moveTo(0, 10); cx.bezierCurveTo(-18, -4, -10, -20, 0, -8); cx.bezierCurveTo(10, -20, 18, -4, 0, 10); cx.fill(); cx.restore();
}
let last = 0;
(function loop(t) {
  cx.clearRect(0, 0, W, H);
  if (t - last > 900 && hearts.length < 14) { spawn(Math.random() * W, H + 20, false); last = t; }
  hearts = hearts.filter(h => h.a > 0 && h.y > -40);
  hearts.forEach(h => { h.x += h.vx; h.y += h.vy; h.r += .03; if (h.burst) { h.vy += .12 * devicePixelRatio; h.a -= .012; } else h.a -= .0012; heart(h); });
  requestAnimationFrame(loop);
})(0);

// press and hold the heart
const btn = document.getElementById('hold'), fill = document.getElementById('hfill'), txt = document.getElementById('holdtxt'), promise = document.getElementById('promise');
let p = 0, holding = false, done = false;
const down = e => { e.preventDefault(); if (!done) { holding = true; btn.classList.add('holding'); } };
const up = () => { holding = false; btn.classList.remove('holding'); };
btn.addEventListener('pointerdown', down); addEventListener('pointerup', up); addEventListener('pointercancel', up);
btn.addEventListener('contextmenu', e => e.preventDefault());
(function tick() {
  if (!done) {
    p = Math.max(0, Math.min(1, p + (holding ? .012 : -.02)));
    fill.setAttribute('y', 92 - 92 * p);
    txt.textContent = p > .66 ? "don't let go" : p > .2 ? 'keep holding' : 'hold';
    if (holding && navigator.vibrate && Math.random() < .08) navigator.vibrate(12);
    if (p >= 1) {
      done = true; btn.classList.add('done'); txt.textContent = 'got you ♥'; promise.hidden = false;
      const r = btn.getBoundingClientRect();
      for (let i = 0; i < 70; i++) spawn((r.left + r.width / 2) * devicePixelRatio, (r.top + r.height / 2) * devicePixelRatio, true);
      if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
      setTimeout(() => promise.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    }
  }
  requestAnimationFrame(tick);
})();
