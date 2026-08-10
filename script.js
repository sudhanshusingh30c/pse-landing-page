(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildDots(container, count, onSelect, activeIndex) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = container.dataset.dotClass;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      if (i === activeIndex) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.setAttribute('aria-selected', 'false');
      }
      btn.addEventListener('click', () => onSelect(i));
      container.appendChild(btn);
    }
  }

  /* ============ HERO SLIDER (dual-axis) ============ */
  (function heroSlider() {
    const track = document.getElementById('heroTrack');
    const slides = Array.from(track.children);
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    const dotsWrap = document.getElementById('heroDots');
    const playPauseBtn = document.getElementById('heroPlayPause');
    const playPauseIcon = document.getElementById('heroPlayPauseIcon');
    const focusBtn = document.getElementById('heroFocusBtn');
    const detailBtn = document.getElementById('heroDetailBtn');
    const hero = document.querySelector('.hero');

    let index = 0;
    let playing = true;
    let timer = null;
    const AUTOPLAY_MS = 6000;

    dotsWrap.dataset.dotClass = 'hero__dot';

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      Array.from(dotsWrap.children).forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function startAutoplay() {
      if (reducedMotion) return;
      stopAutoplay();
      timer = setInterval(next, AUTOPLAY_MS);
    }
    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    playPauseBtn.addEventListener('click', () => {
      playing = !playing;
      playPauseBtn.setAttribute('aria-pressed', String(playing));
      playPauseIcon.textContent = playing ? '❚❚' : '▶';
      playPauseBtn.querySelector('.sr-only').textContent = playing ? 'Pause autoplay' : 'Play autoplay';
      if (playing) startAutoplay(); else stopAutoplay();
    });

    focusBtn.addEventListener('click', () => setDetailMode(false));
    detailBtn.addEventListener('click', () => setDetailMode(true));
    function setDetailMode(isDetail) {
      slides.forEach(s => s.classList.toggle('is-detail', isDetail));
      focusBtn.classList.toggle('is-active', !isDetail);
      detailBtn.classList.toggle('is-active', isDetail);
      focusBtn.setAttribute('aria-pressed', String(!isDetail));
      detailBtn.setAttribute('aria-pressed', String(isDetail));
    }

    hero.addEventListener('mouseenter', stopAutoplay);
    hero.addEventListener('mouseleave', () => { if (playing) startAutoplay(); });
    hero.addEventListener('focusin', stopAutoplay);
    hero.addEventListener('focusout', () => { if (playing) startAutoplay(); });

    hero.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    let touchStartX = null;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      touchStartX = null;
    }, { passive: true });

    buildDots(dotsWrap, slides.length, goTo, index);
    render();
    startAutoplay();
  })();

  /* ============ ENQUIRY FORM (no backend — demo only) ============ */
  (function enquiryForm() {
    const form = document.getElementById('enquire');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('This is a front-end demo. Connect this form to your backend or a form service (e.g. Formspree) to actually receive enquiries.');
      form.reset();
    });
  })();

  /* ============ CHOOSE THE SCHOOL: mobile slider ============ */
  (function schoolsSlider() {
    const viewport = document.getElementById('schoolsViewport');
    const track = document.getElementById('schoolsTrack');
    const cards = Array.from(track.children);
    const dotsWrap = document.getElementById('schoolsDots');
    dotsWrap.dataset.dotClass = 'schools__dot';

    let index = 0;

    function isMobileLayout() {
      return window.matchMedia('(max-width: 900px)').matches;
    }

    function render() {
      if (!isMobileLayout()) { track.style.transform = ''; return; }
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = 20;
      track.style.transform = `translateX(-${index * (cardWidth + gap)}px)`;
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('is-active', i === index));
    }

    function goTo(i) {
      index = Math.max(0, Math.min(i, cards.length - 1));
      render();
    }

    buildDots(dotsWrap, cards.length, goTo, index);

    let touchStartX = null;
    viewport.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      if (touchStartX === null || !isMobileLayout()) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? goTo(index + 1) : goTo(index - 1); }
      touchStartX = null;
    }, { passive: true });

    window.addEventListener('resize', render);
    render();
  })();

  /* ============ EXHIBITION SLIDER ============ */
  (function exhibitionSlider() {
    const viewport = document.getElementById('exhibitionViewport');
    const track = document.getElementById('exhibitionTrack');
    const cards = Array.from(track.children);
    const prevBtn = document.getElementById('exPrev');
    const nextBtn = document.getElementById('exNext');
    const dotsWrap = document.getElementById('exhibitionDots');
    dotsWrap.dataset.dotClass = 'exhibition__dot';

    let index = 0;

    function cardStep() {
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = 20;
      return cardWidth + gap;
    }

    function maxIndex() {
      const visible = Math.max(1, Math.floor(viewport.clientWidth / cardStep()));
      return Math.max(0, cards.length - visible);
    }

    function render() {
      const i = Math.min(index, maxIndex());
      track.style.transform = `translateX(-${i * cardStep()}px)`;
      Array.from(dotsWrap.children).forEach((d, di) => d.classList.toggle('is-active', di === i));
    }

    function goTo(i) {
      index = Math.max(0, Math.min(i, cards.length - 1));
      render();
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    buildDots(dotsWrap, cards.length, goTo, index);

    let touchStartX = null;
    viewport.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? goTo(index + 1) : goTo(index - 1); }
      touchStartX = null;
    }, { passive: true });

    window.addEventListener('resize', render);
    render();
  })();

})();
