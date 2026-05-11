/* ================================================================
   ROSHAN MENYANBO — Deep Summit script.js
   ================================================================ */
(function () {
  "use strict";

  /* ============================================================
     1. NAV SCROLL STATE
  ============================================================ */
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });

  /* ============================================================
     2. MOBILE MENU — glassmorphism overlay
  ============================================================ */
  const hamburger   = document.getElementById("hamburger");
  const mobileMenu  = document.getElementById("mobileMenu");
  const mobileClose = document.getElementById("mobileClose");
  const mobileLinks = document.querySelectorAll(".mobile-link");
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    mobileMenu.classList.add("open");
    document.body.style.overflow = "hidden";
    const s = hamburger.querySelectorAll("span");
    s[0].style.transform = "translateY(7px) rotate(45deg)";
    s[1].style.opacity   = "0";
    s[2].style.transform = "translateY(-7px) rotate(-45deg)";
  }

  function closeMenu() {
    menuOpen = false;
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
    const s = hamburger.querySelectorAll("span");
    s[0].style.transform = "";
    s[1].style.opacity   = "";
    s[2].style.transform = "";
  }

  hamburger.addEventListener("click", () => menuOpen ? closeMenu() : openMenu());
  mobileClose.addEventListener("click", closeMenu);
  mobileLinks.forEach(l => l.addEventListener("click", closeMenu));

  /* ============================================================
     3. HERO CANVAS — floating ice particles
  ============================================================ */
  const canvas = document.getElementById("heroCanvas");
  const ctx    = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, { passive: true });

  const PARTICLE_COUNT = 70;
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x:    Math.random() * window.innerWidth,
      y:    Math.random() * window.innerHeight,
      r:    Math.random() * 1.8 + 0.4,
      vx:   (Math.random() - 0.5) * 0.25,
      vy:  -(Math.random() * 0.35 + 0.1),
      alpha: Math.random() * 0.5 + 0.1,
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 180, 216, ${p.alpha})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -10)              p.y = canvas.height + 10;
      if (p.x < -10)              p.x = canvas.width  + 10;
      if (p.x > canvas.width + 10) p.x = -10;
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ============================================================
     4. PARALLAX SCROLLING — hero layers + philosophy bg
  ============================================================ */
  const parallaxLayers = document.querySelectorAll(".parallax-layer[data-speed]");
  const philoBg        = document.getElementById("philoBg");

  window.addEventListener("scroll", () => {
    const sy = window.scrollY;

    // Hero mountain layers — each moves at its own speed
    parallaxLayers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed);
      layer.style.transform = `translateY(${sy * speed}px)`;
    });

    // Philosophy section bg
    if (philoBg) {
      const philo = philoBg.closest("section");
      if (philo) {
        const rect   = philo.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2);
        philoBg.style.transform = `translateY(${offset * 0.15}px)`;
      }
    }
  }, { passive: true });

  /* ============================================================
     5. STAT COUNTER ANIMATION
  ============================================================ */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2200;
    const start    = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value    = Math.floor(easeOutExpo(progress) * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else              el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  const counters        = document.querySelectorAll(".stat-block__num");
  const counterTriggered = new Set();

  /* ============================================================
     6. SCROLL REVEAL — fade + ascend on scroll
  ============================================================ */
  const revealEls = document.querySelectorAll(
    ".reveal-up, .reveal-left, .reveal-right"
  );

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  // Counter observer (separate — triggers as soon as hero stats hit viewport)
  const counterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counterTriggered.has(entry.target)) {
          counterTriggered.add(entry.target);
          animateCounter(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => counterObserver.observe(el));

  /* ============================================================
     7. GALLERY LIGHTBOX
  ============================================================ */
  document.querySelectorAll(".gallery__item").forEach(item => {
    item.addEventListener("click", () => {
      const titleEl = item.querySelector(".gallery__caption-title");
      const subEl   = item.querySelector(".gallery__caption-sub");
      const imgEl   = item.querySelector("img");
      const svgEl   = item.querySelector("svg");
      const title   = titleEl ? titleEl.textContent : "";
      const sub     = subEl   ? subEl.textContent   : "";

      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        background:rgba(8,6,18,0.93);
        backdrop-filter:blur(18px);
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        cursor:pointer; animation:fadeIn 0.3s ease;
        padding:2rem;
      `;

      if (imgEl) {
        const clone = document.createElement("img");
        clone.src   = imgEl.src;
        clone.alt   = imgEl.alt;
        clone.style.cssText = `
          max-width:88vw; max-height:75vh;
          object-fit:contain;
          border:1px solid rgba(0,180,216,0.35);
          box-shadow:0 0 80px rgba(0,180,216,0.2);
        `;
        overlay.appendChild(clone);
      } else if (svgEl) {
        const clone = svgEl.cloneNode(true);
        clone.style.cssText = `max-width:80vw; max-height:70vh; border:1px solid rgba(0,180,216,0.35);`;
        overlay.appendChild(clone);
      }

      const meta = document.createElement("div");
      meta.style.cssText = `
        margin-top:1.5rem; text-align:center;
      `;
      meta.innerHTML = `
        <p style="font-family:'Oswald',sans-serif;font-size:1.1rem;letter-spacing:0.1em;text-transform:uppercase;color:#fff;">${title}</p>
        <p style="font-family:'Montserrat',sans-serif;font-size:0.65rem;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;color:#00B4D8;margin-top:0.4rem;">${sub}</p>
        <p style="font-family:'Montserrat',sans-serif;font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(155,164,176,0.4);margin-top:1rem;">Click or press Esc to close</p>
      `;
      overlay.appendChild(meta);
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";

      const close = () => {
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity 0.25s ease";
        setTimeout(() => { overlay.remove(); document.body.style.overflow = ""; }, 260);
      };

      overlay.addEventListener("click", close);
      const escHandler = e => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", escHandler); } };
      document.addEventListener("keydown", escHandler);
    });
  });

  /* ============================================================
     8. CONTACT FORM
  ============================================================ */
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const fields = document.querySelectorAll(
        "#contactForm input, #contactForm select, #contactForm textarea"
      );
      let valid = true;

      fields.forEach(f => {
        if (!f.value.trim()) {
          valid = false;
          f.style.borderColor = "#ff5555";
          f.style.boxShadow   = "0 0 0 3px rgba(255,85,85,0.12)";
          setTimeout(() => { f.style.borderColor = ""; f.style.boxShadow = ""; }, 2200);
        }
      });

      if (!valid) return;

      const orig = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>Message Sent!</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      submitBtn.style.background = "#0ea566";
      submitBtn.style.boxShadow  = "0 0 30px rgba(14,165,102,0.5)";
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML  = orig;
        submitBtn.style.background = "";
        submitBtn.style.boxShadow  = "";
        submitBtn.disabled   = false;
        fields.forEach(f => (f.value = ""));
      }, 4000);
    });
  }

  /* ============================================================
     9. ACTIVE NAV LINK ON SCROLL
  ============================================================ */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__links a");

  sections.forEach(section => {
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach(link => {
              const active = link.getAttribute("href") === `#${id}`;
              link.style.color = active ? "#00B4D8" : "";
            });
          }
        });
      },
      { threshold: 0.4 }
    ).observe(section);
  });

  /* ============================================================
     10. ICE CURSOR GLOW (desktop only)
  ============================================================ */
  if (window.matchMedia("(pointer:fine)").matches) {
    const glow = document.createElement("div");
    glow.style.cssText = `
      position:fixed; width:300px; height:300px; border-radius:50%;
      background:radial-gradient(circle, rgba(0,180,216,0.07) 0%, transparent 70%);
      pointer-events:none; z-index:9997;
      transform:translate(-50%,-50%);
      will-change:left,top;
      transition:left 0.1s linear,top 0.1s linear;
    `;
    document.body.appendChild(glow);
    document.addEventListener("mousemove", e => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top  = `${e.clientY}px`;
    }, { passive: true });
  }

  /* ============================================================
     11. SMOOTH ANCHOR SCROLL
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

})();
