/* =====================================================================
   Sarthak Verma Portfolio - React components + anime.js + Lenis
   (plain JavaScript, no build step, no JSX)
   ===================================================================== */

/* ---------- 0. Safety checks (shows a message instead of a blank page) ---------- */
const root = document.getElementById('root');
addEventListener('error', e => {
  if (root.dataset.ready) return;
  root.innerHTML = '<p class="boot">Error: ' + e.message + '</p>';
});
if (!window.React || !window.ReactDOM || !window.anime) {
  root.innerHTML = '<p class="boot">React / anime.js load nahi hui. Internet on karo aur page reload karo.</p>';
  throw new Error('Libraries missing');
}

/* ---------- 1. Helpers ---------- */
const { useState, useEffect, useRef } = React;
const h = React.createElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hide = reduce ? undefined : { opacity: 0 };   // start hidden, anime.js reveals it

const goTo = id => {
  const el = document.querySelector(id);
  window.lenis ? window.lenis.scrollTo(el, { offset: -30 }) : el.scrollIntoView({ behavior: 'smooth' });
};
const btn = (id, text, extra) =>
  h('a', { href: id, className: 'btn' + extra, onClick: e => { e.preventDefault(); goTo(id); } }, text);

/* Reveal: 3D flip-up when an element enters the screen */
function Reveal({ delay = 0, children }) {
  const ref = useRef();
  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      anime({ targets: el, opacity: [0, 1], translateY: [70, 0], rotateX: [-16, 0], duration: 1100, delay, easing: 'easeOutExpo' });
      io.disconnect();
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return h('div', { ref, className: 'reveal', style: hide }, ...[].concat(children));
}

/* Tilt: 3D tilt + red spotlight that follows the cursor */
function Tilt({ children }) {
  const ref = useRef();
  const move = e => {
    const el = ref.current, r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty('--mx', x + 'px');
    el.style.setProperty('--my', y + 'px');
    el.style.transform = `perspective(800px) rotateX(${(0.5 - y / r.height) * 14}deg) rotateY(${(x / r.width - 0.5) * 14}deg)`;
  };
  return h('article', { ref, className: 'card', onPointerMove: move, onPointerLeave: () => { ref.current.style.transform = ''; } }, ...[].concat(children));
}

/* ---------- 2. Nav ---------- */
function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const f = () => setSolid(scrollY > 40);
    addEventListener('scroll', f, { passive: true });
    f();
    return () => removeEventListener('scroll', f);
  }, []);
  const links = [['#about', 'About'], ['#skills', 'Skills'], ['#projects', 'Projects'], ['#contact', 'Contact']];
  const click = id => e => { e.preventDefault(); goTo(id); };
  return h('header', { className: 'nav' + (solid ? ' solid' : '') },
    h('a', { href: '#home', className: 'logo', onClick: click('#home') }, 'SV', h('i', null, '.')),
    h('nav', null, links.map(([id, t]) => h('a', { key: id, href: id, onClick: click(id) }, t))));
}

/* ---------- 3. Hero (carousel + 3D orbiting rings) ---------- */
const SLIDES = [
  { tag: "Hi, I'm", title: 'Sarthak Verma', sub: 'I build clean, fast and creative things with code.' },
  { tag: 'Computer Science student, age 19', title: 'LNCT Main Campus', sub: 'Learning by building, one project at a time.' },
  { tag: 'What I work with', title: 'Python, Java, C++ and the web', sub: 'Git and GitHub keep every project organised.' },
];

function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const scene = useRef();

  useEffect(() => {                                   // auto-play
    if (reduce || paused) return;
    const t = setInterval(() => setI(n => (n + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {                                   // letter-by-letter 3D entrance
    if (reduce) return;
    anime({ targets: '.hero-text .ch', translateY: [90, 0], rotateX: [-90, 0], opacity: [0, 1], delay: anime.stagger(35), duration: 1000, easing: 'easeOutExpo' });
    anime({ targets: '.hero-text .tag, .hero-text .sub', opacity: [0, 1], translateY: [24, 0], delay: 350, duration: 900, easing: 'easeOutQuad' });
  }, [i]);

  useEffect(() => {                                   // rings orbit forever
    if (reduce) return;
    const a = anime({ targets: '.ring', rotateY: [0, 360], duration: (el, k) => 14000 + k * 5000, easing: 'linear', loop: true });
    return () => a.pause();
  }, []);

  const onMove = e => {                               // cursor parallax
    if (reduce) return;
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    scene.current.style.transform = `rotateY(${x * 30}deg) rotateX(${-y * 30}deg)`;
  };

  const s = SLIDES[i];
  const words = s.title.split(' ').flatMap((w, wi) => [
    h('span', { className: 'w', key: wi }, [...w].map((c, k) => h('span', { className: 'ch', key: k, style: hide }, c))),
    ' ',
  ]);

  return h('section', { id: 'home', className: 'hero', onPointerMove: onMove },
    h('div', { className: 'scene-wrap' },
      h('div', { className: 'scene', ref: scene },
        [0, 1, 2].map(k => h('div', { key: k, className: 'orbit', style: { inset: k * 12 + '%', transform: `rotateX(${62 + k * 18}deg)` } },
          h('div', { className: 'ring' }))),
        h('div', { className: 'core' }))),
    h('div', { className: 'hero-inner', onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) },
      h('div', { className: 'carousel' },
        h('div', { className: 'hero-text', key: i },
          h('p', { className: 'tag', style: hide }, s.tag),
          h('h1', null, words),
          h('p', { className: 'sub', style: hide }, s.sub))),
      h('div', { className: 'dots' }, SLIDES.map((_, k) =>
        h('button', { key: k, className: k === i ? 'on' : '', 'aria-label': 'Go to slide ' + (k + 1), onClick: () => setI(k) }))),
      h('div', { className: 'cta' }, btn('#projects', 'View my work', ''), btn('#contact', 'Contact me', ' ghost'))));
}

/* ---------- 4. About ---------- */
function About() {
  const facts = [['Name', 'Sarthak Verma'], ['Age', '19'], ['College', 'LNCT Main Campus'], ['Field', 'Computer Science']];
  return h('section', { id: 'about' },
    h(Reveal, null, h('h2', { className: 'title' }, 'About me')),
    h(Reveal, { delay: 100 }, h('p', { className: 'lead' },
      "I'm a Computer Science student who enjoys turning ideas into working software, from problem solving in Python, Java and C++ to building smooth, animated interfaces for the web.")),
    h(Reveal, { delay: 200 }, h('dl', { className: 'facts' },
      facts.map(([t, d]) => h('div', { key: t }, h('dt', null, t), h('dd', null, d))))));
}

/* ---------- 5. Skills (3D ring rotated by scroll) ---------- */
const SKILLS = [
  ['Py', 'Python', 'Programming language'], ['Ht', 'HTML', 'Page structure'],
  ['Cs', 'CSS', 'Styling and animation'], ['Js', 'JavaScript', 'Programming language'],
  ['Jv', 'Java', 'Programming language'], ['C+', 'C++', 'Programming language'],
  ['Gt', 'Git', 'Version control'], ['Gh', 'GitHub', 'Code hosting and collaboration'],
];

function Skills() {
  const track = useRef(), ring = useRef();
  useEffect(() => {
    const tl = anime({ targets: ring.current, rotateY: -360, easing: 'linear', duration: 1000, autoplay: false });
    const update = () => {
      const r = track.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      tl.seek(tl.duration * p);
    };
    addEventListener('scroll', update, { passive: true });
    update();
    return () => removeEventListener('scroll', update);
  }, []);

  return h('section', { id: 'skills', className: 'track', ref: track },
    h('div', { className: 'stage' },
      h('div', { className: 'head' },
        h('h2', { className: 'title' }, 'Skills'),
        h('p', { className: 'lead' }, 'Scroll to rotate the ring.')),
      h('div', { className: 'tilt3d' },
        h('div', { className: 'ring3d', ref: ring },
          SKILLS.map(([ico, name, note], k) =>
            h('div', { key: name, className: 'tile', style: { transform: `rotateY(${k * 45}deg) translateZ(var(--r))` } },
              h('span', { className: 'ico' }, ico), h('h3', null, name), h('p', null, note)))))));
}

/* ---------- 6. Projects (edit this list with your own work) ---------- */
const PROJECTS = [
  { name: 'Project one', text: 'Write what you built and the problem it solves.', tags: ['Tech 1', 'Tech 2'] },
  { name: 'Project two', text: 'Write what you built and the problem it solves.', tags: ['Tech 1', 'Tech 2'] },
  { name: 'Project three', text: 'Write what you built and the problem it solves.', tags: ['Tech 1', 'Tech 2'] },
];

function Projects() {
  return h('section', { id: 'projects' },
    h(Reveal, null, h('h2', { className: 'title' }, 'Projects')),
    h(Reveal, { delay: 100 }, h('p', { className: 'lead' }, 'Replace these placeholders with your own work.')),
    h('div', { className: 'grid' }, PROJECTS.map((p, k) =>
      h(Reveal, { key: p.name, delay: k * 140 },
        h(Tilt, null,
          h('h3', null, p.name),
          h('p', null, p.text),
          h('div', { className: 'tags' }, p.tags.map(t => h('span', { key: t }, t))))))));
}

/* ---------- 7. Contact ---------- */
function Contact() {
  return h('section', { id: 'contact' },
    h(Reveal, null, h('h2', { className: 'title' }, "Let's build something")),
    h(Reveal, { delay: 100 }, h('p', { className: 'lead' }, "See my code and what I'm working on.")),
    h(Reveal, { delay: 200 },
      h('a', { href: 'https://github.com/', target: '_blank', rel: 'noopener', className: 'btn' }, 'Open my GitHub')));
}

/* ---------- 8. App ---------- */
function App() {
  useEffect(() => { root.dataset.ready = 1; }, []);
  return h(React.Fragment, null, h(Nav), h(Hero), h(About), h(Skills), h(Projects), h(Contact),
    h('footer', null, '© 2026 Sarthak Verma'));
}
ReactDOM.createRoot(root).render(h(App));

/* ---------- 9. Page-level effects ---------- */
// Lenis: smooth scrolling
if (window.Lenis && !reduce) {
  window.lenis = new Lenis({ lerp: 0.08 });
  const raf = t => { window.lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

// Cursor glow (smooth follow) + magnetic buttons
const glow = document.querySelector('.cursor-glow');
let mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;
addEventListener('pointermove', e => {
  mx = e.clientX; my = e.clientY;
  document.querySelectorAll('.btn').forEach(b => {
    const r = b.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    b.style.transform = Math.hypot(dx, dy) < 110 ? `translate(${dx * 0.25}px,${dy * 0.25}px)` : '';
  });
});
(function follow() {
  gx += (mx - gx) * 0.08; gy += (my - gy) * 0.08;
  glow.style.transform = `translate3d(${gx}px,${gy}px,0) translate(-50%,-50%)`;
  requestAnimationFrame(follow);
})();

// Scroll progress bar, background parallax, hero fade
const bar = document.querySelector('.progress');
addEventListener('scroll', () => {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (reduce) return;
  document.querySelectorAll('.orb').forEach((o, k) => { o.style.transform = `translateY(${y * (k ? -0.12 : 0.18)}px)`; });
  const hi = document.querySelector('.hero-inner');
  if (hi) { hi.style.transform = `translateY(${y * 0.2}px)`; hi.style.opacity = Math.max(0, 1 - y / (innerHeight * 0.8)); }
}, { passive: true });
