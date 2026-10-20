/* =====================================================================
   Sarthak Verma Portfolio - Vanilla JS + anime.js + Lenis
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Smooth Scrolling (Lenis or Native) ---------- */
  if (window.Lenis && !reduce) {
    window.lenis = new Lenis({ lerp: 0.08 });
    const raf = (t) => {
      window.lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  const goTo = (id) => {
    const el = document.querySelector(id);
    if (!el) return;
    if (window.lenis) {
      window.lenis.scrollTo(el, { offset: -30 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* ---------- Nav Scroll Background & Smooth Anchor Links ---------- */
  const nav = document.querySelector('.nav');
  const onScrollNav = () => {
    if (nav) {
      nav.classList.toggle('solid', window.scrollY > 40);
    }
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      goTo(targetId);
    });
  });

  /* ---------- Reveal Animations (on scroll) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el, index) => {
    if (!reduce) el.style.opacity = '0';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!reduce && window.anime) {
          anime({
            targets: el,
            opacity: [0, 1],
            translateY: [70, 0],
            rotateX: [-16, 0],
            duration: 1100,
            delay: (index % 3) * 120,
            easing: 'easeOutExpo'
          });
        } else {
          el.style.opacity = '1';
        }
        io.disconnect();
      },
      { threshold: 0.15 }
    );
    io.observe(el);
  });

  /* ---------- 3D Tilt & Spotlight for Cards ---------- */
  const cards = document.querySelectorAll('.card');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      card.style.transform = `perspective(800px) rotateX(${(0.5 - y / r.height) * 14}deg) rotateY(${((x / r.width) - 0.5) * 14}deg)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- Hero Carousel & 3D Scene ---------- */
  const SLIDES = [
    { tag: "Hi, I'm", title: 'Sarthak Verma', sub: 'I build clean, fast and creative things with code.' },
    { tag: 'Computer Science student, age 19', title: 'LNCT Main Campus', sub: 'Learning by building, one project at a time.' },
    { tag: 'What I work with', title: 'Python, Java, C++ and the web', sub: 'Git and GitHub keep every project organised.' }
  ];

  let currentSlide = 0;
  let isPaused = false;
  const heroTextTag = document.querySelector('.hero-text .tag');
  const heroTextTitle = document.querySelector('.hero-text h1');
  const heroTextSub = document.querySelector('.hero-text .sub');
  const dotsContainer = document.querySelector('.dots');
  const scene = document.querySelector('.scene');
  const heroInner = document.querySelector('.hero-inner');

  // Generate Carousel Dots
  if (dotsContainer) {
    SLIDES.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      if (idx === 0) dot.classList.add('on');
      dot.addEventListener('click', () => {
        currentSlide = idx;
        renderSlide(currentSlide);
      });
      dotsContainer.appendChild(dot);
    });
  }

  const renderSlide = (index) => {
    const s = SLIDES[index];
    if (!heroTextTag || !heroTextTitle || !heroTextSub) return;

    // Reset styles
    if (!reduce) {
      heroTextTag.style.opacity = '0';
      heroTextSub.style.opacity = '0';
    }

    heroTextTag.textContent = s.tag;
    heroTextSub.textContent = s.sub;

    // Build letter spans for 3D animation
    heroTextTitle.innerHTML = s.title
      .split(' ')
      .map(
        (word) =>
          `<span class="w">${[...word]
            .map((char) => `<span class="ch" style="${reduce ? '' : 'opacity:0;'}">${char}</span>`)
            .join('')}</span>`
      )
      .join(' ');

    // Update dots
    document.querySelectorAll('.dots button').forEach((dot, idx) => {
      dot.classList.toggle('on', idx === index);
    });

    // Animate letters and text
    if (!reduce && window.anime) {
      anime({
        targets: '.hero-text .ch',
        translateY: [90, 0],
        rotateX: [-90, 0],
        opacity: [0, 1],
        delay: anime.stagger(35),
        duration: 1000,
        easing: 'easeOutExpo'
      });
      anime({
        targets: '.hero-text .tag, .hero-text .sub',
        opacity: [0, 1],
        translateY: [24, 0],
        delay: 350,
        duration: 900,
        easing: 'easeOutQuad'
      });
    } else {
      document.querySelectorAll('.hero-text .ch').forEach((ch) => (ch.style.opacity = '1'));
      heroTextTag.style.opacity = '1';
      heroTextSub.style.opacity = '1';
    }
  };

  renderSlide(currentSlide);

  // Auto-play Slides
  setInterval(() => {
    if (reduce || isPaused) return;
    currentSlide = (currentSlide + 1) % SLIDES.length;
    renderSlide(currentSlide);
  }, 5000);

  if (heroInner) {
    heroInner.addEventListener('mouseenter', () => { isPaused = true; });
    heroInner.addEventListener('mouseleave', () => { isPaused = false; });
  }

  // Hero Rings continuous 3D rotation
  if (!reduce && window.anime) {
    anime({
      targets: '.ring',
      rotateY: [0, 360],
      duration: (el, k) => 14000 + k * 5000,
      easing: 'linear',
      loop: true
    });
  }

  // Hero Scene cursor parallax
  const heroSection = document.getElementById('home');
  if (heroSection && scene && !reduce) {
    heroSection.addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      scene.style.transform = `rotateY(${x * 30}deg) rotateX(${-y * 30}deg)`;
    });
  }

  /* ---------- Skills 3D Ring Rotation On Scroll ---------- */
  const track = document.getElementById('skills');
  const ring3d = document.querySelector('.ring3d');

  if (track && ring3d && !reduce && window.anime) {
    const ringAnim = anime({
      targets: ring3d,
      rotateY: -360,
      easing: 'linear',
      duration: 1000,
      autoplay: false
    });

    const updateRingScroll = () => {
      const r = track.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      ringAnim.seek(ringAnim.duration * p);
    };

    window.addEventListener('scroll', updateRingScroll, { passive: true });
    updateRingScroll();
  }

  /* ---------- Cursor Glow & Magnetic Buttons ---------- */
  const glow = document.querySelector('.cursor-glow');
  let mx = window.innerWidth / 2,
    my = window.innerHeight / 2,
    gx = mx,
    gy = my;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;

    document.querySelectorAll('.btn').forEach((b) => {
      const r = b.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      b.style.transform = Math.hypot(dx, dy) < 110 ? `translate(${dx * 0.25}px, ${dy * 0.25}px)` : '';
    });
  });

  (function followCursor() {
    if (glow) {
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(followCursor);
  })();

  /* ---------- Progress Bar & Ambient Parallax ---------- */
  const progressBar = document.querySelector('.progress');
  const orbs = document.querySelectorAll('.orb');

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (progressBar) {
        progressBar.style.transform = `scaleX(${maxScroll > 0 ? y / maxScroll : 0})`;
      }

      if (reduce) return;

      orbs.forEach((o, k) => {
        o.style.transform = `translateY(${y * (k ? -0.12 : 0.18)}px)`;
      });

      if (heroInner) {
        heroInner.style.transform = `translateY(${y * 0.2}px)`;
        heroInner.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.8));
      }
    },
    { passive: true }
  );
});
