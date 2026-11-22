
"use client";


import Royal3DGallery from "./components/Royal3DGallery";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

const dishes = [
  {
    name: "The Art of",
    accent: "Beginnings",
    category: "I / THE FIRST IMPRESSION",
    description:
      "Delicate textures, vibrant ingredients, and an elegant introduction to an extraordinary evening.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "A Taste of",
    accent: "Indulgence",
    category: "II / THE MAIN EXPERIENCE",
    description:
      "Beautifully composed flavors and a celebration of the extraordinary in every detail.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "The Sweetest",
    accent: "Finale",
    category: "III / THE FINAL MOMENT",
    description:
      "The perfect ending, where indulgent desserts become lasting memories.",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1400&q=85",
  },
];

const nav = [
  { name: "Home", href: "#home" },
  { name: "Our Story", href: "#story" },
  { name: "The Collection", href: "#collection" },
  { name: "Experience", href: "#experience" },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19 19 5M8 5h11v11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12h16m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Crest() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className="crest-svg"
    >
      <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth=".7" />
      <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth=".4" />
      <path
        d="M60 13 64 25 60 33 56 25 60 13ZM60 107 64 95 60 87 56 95 60 107ZM13 60 25 56 33 60 25 64 13 60ZM107 60 95 56 87 60 95 64 107 60Z"
        fill="currentColor"
      />
      <text
        x="60"
        y="70"
        textAnchor="middle"
        fontSize="30"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fill="currentColor"
      >
        E&O
      </text>
    </svg>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const dish = dishes[active];

  useEffect(() => {
    const elements =
      rootRef.current?.querySelectorAll<HTMLElement>(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    elements?.forEach((element) => observer.observe(element));
    rootRef.current?.classList.add("motion-ready");

    const updateProgress = () => {
      const max =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        max > 0 ? Math.min(window.scrollY / max, 1) : 0;

      if (progressRef.current) {
        progressRef.current.style.transform =
          `scaleX(${progress})`;
      }
    };

    updateProgress();

    window.addEventListener("scroll", updateProgress, {
      passive: true,
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);

  function handleTilt(event: MouseEvent<HTMLDivElement>) {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
    ) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    event.currentTarget.style.setProperty(
      "--rotate-y",
      `${x * 9}deg`
    );

    event.currentTarget.style.setProperty(
      "--rotate-x",
      `${-y * 7}deg`
    );
  }

  function resetTilt(event: MouseEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--rotate-x", "0deg");
    event.currentTarget.style.setProperty("--rotate-y", "0deg");
  }

  const nextDish = () => {
    setActive((current) => (current + 1) % dishes.length);
  };

  const previousDish = () => {
    setActive(
      (current) => (current + dishes.length - 1) % dishes.length
    );
  };

  return (
    <main className="royal" ref={rootRef}>
      <style>{royalStyles}</style>

      <div
        ref={progressRef}
        className="scroll-progress"
        aria-hidden="true"
      />

      {/* NAVIGATION */}
      <header className="royal-header">
        <a href="#home" className="brand" aria-label="Ember and Olive Home">
          <span className="brand-main">
            EMBER <em>&</em> OLIVE
          </span>
          <span className="brand-sub">THE DINING HOUSE</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((item) => (
            <a href={item.href} key={item.name}>
              {item.name}
            </a>
          ))}
        </nav>

        <a href="#collection" className="nav-action">
          EXPLORE CUISINE <Arrow diagonal />
        </a>

        <button
          className="mobile-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {nav.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* CINEMATIC 3D HERO */}
      <section className="royal-hero" id="home">
        <div className="hero-glow" />
        <div className="hero-grid" />

        <div className="hero-content">
          <div className="eyebrow hero-entrance">
            <span className="gold-line" />
            THE ART OF EXTRAORDINARY DINING
          </div>

          <div className="hero-heading">
            <p className="heading-overline hero-entrance">
              A WORLD BEYOND THE ORDINARY
            </p>

            <h1>
              <span className="title-line title-one">WHERE</span>
              <span className="title-line title-two">
                <em>LUXURY</em>
              </span>
              <span className="title-line title-three">
                HAS A
              </span>
              <span className="title-line title-four">
                TASTE<span className="gold-dot">.</span>
              </span>
            </h1>
          </div>

          <div className="hero-bottom hero-entrance">
            <p>
              A refined journey of contemporary cuisine,
              timeless hospitality and unforgettable moments.
            </p>

            <a className="royal-button" href="#collection">
              DISCOVER THE EXPERIENCE
              <span className="button-icon">
                <Arrow diagonal />
              </span>
            </a>
          </div>
        </div>

        {/* INTERACTIVE DEPTH LAYERS */}
        <div
          className="hero-visual"
          onMouseMove={handleTilt}
          onMouseLeave={resetTilt}
        >
          <div className="visual-scene">
            <div className="visual-back-frame" />

            <div className="visual-photo">
              <div
                className="visual-photo-inner"
                role="img"
                aria-label="Luxury fine dining ambience"
              />
              <div className="photo-vignette" />
            </div>

            <div className="floating-crest">
              <Crest />
            </div>

            <div className="visual-caption">
              <span>01 / THE EXPERIENCE</span>
              <strong>AN EVENING TO REMEMBER</strong>
            </div>

            <div className="vertical-caption">
              THE ART OF FINE DINING — EMBER & OLIVE
            </div>
          </div>
        </div>

        <div className="hero-edge-label">
          <span>THE ROYAL NOIR COLLECTION</span>
          <span>EST. MMXXVI</span>
        </div>

        <a className="hero-scroll" href="#story">
          <span>SCROLL TO EXPLORE</span>
          <span className="scroll-indicator" />
        </a>
      </section>

      {/* GOLD EDITORIAL RIBBON */}
      <div className="royal-ribbon" aria-hidden="true">
        <div className="ribbon-track">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              THE ART OF FINE DINING
              <span className="ribbon-star">✦</span>
              A CELEBRATION OF TASTE
              <span className="ribbon-star">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* STORY */}
      <section className="story-section section-padding" id="story">
        <div className="section-top reveal">
          <span>01 / OUR PHILOSOPHY</span>
          <span>THE ESSENCE OF EMBER & OLIVE</span>
        </div>

        <div className="story-layout">
          <div className="story-copy reveal">
            <div className="eyebrow">
              <span className="gold-line" />
              A TIMELESS PHILOSOPHY
            </div>

            <h2 className="display-heading">
              NOT JUST
              <br />
              <em>DINING.</em>
              <br />
              AN ART
              <br />
              <span>FORM.</span>
            </h2>

            <p className="section-description">
              Great dining is never simply about what is
              served. It is the anticipation, the atmosphere,
              the artistry and the memories created
              between each course.
            </p>

            <div className="story-signature">
              <span className="signature-line" />
              <span>THE EMBER & OLIVE PHILOSOPHY</span>
            </div>
          </div>

          <div className="story-gallery reveal">
            <div className="story-image-main" role="img" aria-label="Elegant restaurant interior" />
            <div className="story-image-small" role="img" aria-label="Fine dining cuisine" />
            <div className="story-image-label">
              <Crest />
              <span>CRAFTED FOR THE MOMENT</span>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE NUMBERS */}
      <section className="values-section">
        <div className="values-inner">
          <div className="value-item reveal">
            <span className="value-number">01</span>
            <div>
              <h3>ARTISTRY</h3>
              <p>Beautifully considered cuisine</p>
            </div>
          </div>

          <div className="value-item reveal">
            <span className="value-number">02</span>
            <div>
              <h3>ELEGANCE</h3>
              <p>Every detail, intentionally refined</p>
            </div>
          </div>

          <div className="value-item reveal">
            <span className="value-number">03</span>
            <div>
              <h3>HOSPITALITY</h3>
              <p>Experiences worth remembering</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SIGNATURE COLLECTION */}
      <section className="collection-section section-padding" id="collection">
        <div className="section-top reveal">
          <span>02 / SIGNATURE COLLECTION</span>
          <span>THE ART OF TASTE</span>
        </div>

        <div className="collection-heading reveal">
          <div>
            <div className="eyebrow">
              <span className="gold-line" />
              CURATED EXPERIENCES
            </div>

            <h2 className="display-heading">
              A TASTE OF
              <br />
              <em>EXCELLENCE.</em>
            </h2>
          </div>

          <p className="section-description">
            An editorial journey through flavors,
            textures and experiences that define
            our culinary philosophy.
          </p>
        </div>

        <div className="collection-stage reveal">
          <div className="dish-visual">
            <div className="dish-outline" />

            <div key={active} className="dish-image-wrap">
              <div
                className="dish-image"
                role="img"
                aria-label={dish.accent + " dining presentation"}
                style={{
                  backgroundImage: `url("${dish.image}")`,
                }}
              />
            </div>

            <div className="dish-badge">
              <Crest />
            </div>

            <div className="dish-counter">
              {String(active + 1).padStart(2, "0")} / 03
            </div>
          </div>

          <div className="dish-details" aria-live="polite">
            <span className="dish-category">{dish.category}</span>

            <div className="dish-gold-rule" />

            <h3 key={`title-${active}`}>
              {dish.name}
              <br />
              <em>{dish.accent}.</em>
            </h3>

            <p>{dish.description}</p>

            <div className="dish-controls">
              <div className="dish-dots">
                {dishes.map((item, index) => (
                  <button
                    key={item.category}
                    aria-label={`Show collection ${index + 1}`}
                    aria-pressed={active === index}
                    onClick={() => setActive(index)}
                    className={active === index ? "selected" : ""}
                    type="button"
                  />
                ))}
              </div>

              <div className="dish-buttons">
                <button
                  type="button"
                  onClick={previousDish}
                  aria-label="Previous collection"
                >
                  <span className="flip-arrow"><Arrow /></span>
                </button>
                <button
                  type="button"
                  onClick={nextDish}
                  aria-label="Next collection"
                >
                  <Arrow />
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="collection-note">
          COLLECTION PREVIEW — OUR LIVE DATABASE MENU WILL APPEAR HERE
          AFTER INTEGRATION.
        </p>
      </section>

<Royal3DGallery />

      {/* FULL BLEED EXPERIENCE */}
      <section className="experience-section" id="experience">
        <div className="experience-image" />
        <div className="experience-shade" />

        <div className="experience-content reveal">
          <div className="eyebrow">
            <span className="gold-line" />
            THE EMBER & OLIVE EXPERIENCE
          </div>

          <h2>
            SOME MOMENTS
            <br />
            <em>DESERVE</em>
            <br />
            FOREVER.
          </h2>

          <p>
            Beyond exquisite cuisine lies something more
            meaningful — the beauty of being present,
            together, in a moment worth savoring.
          </p>

          <a href="#home" className="royal-button">
            BACK TO THE BEGINNING
            <span className="button-icon"><Arrow diagonal /></span>
          </a>
        </div>

        <div className="experience-side-text">
          AN EVENING BEYOND EXPECTATION
        </div>
      </section>

      {/* CLOSING */}
      <section className="closing-section">
        <div className="closing-ornament reveal">
          <Crest />
        </div>

        <div className="eyebrow closing-eyebrow reveal">
          THE INVITATION IS YOURS
        </div>

        <h2 className="reveal">
          EXPERIENCE
          <br />
          <em>THE EXCEPTIONAL.</em>
        </h2>

        <p className="reveal">
          An extraordinary experience begins
          with a simple invitation.
        </p>

        <a className="closing-link reveal" href="#collection">
          EXPLORE OUR COLLECTION
          <Arrow diagonal />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="royal-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span>EMBER <em>&</em> OLIVE</span>
            <small>A DINING HOUSE</small>
          </div>

          <p>
            An extraordinary celebration of
            flavor, artistry and hospitality.
          </p>

          <nav aria-label="Footer navigation">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer-big">E<span>&</span>O.</div>

        <div className="footer-bottom">
          <span>© 2026 EMBER & OLIVE</span>
          <span>THE ROYAL NOIR EXPERIENCE</span>
          <span>DESIGNED TO BE REMEMBERED</span>
        </div>
      </footer>
    </main>
  );
}

const royalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');

.royal {
  --dark: #101916;
  --dark2: #17241e;
  --gold: #d5b47c;
  --gold-light: #e6cf9e;
  --ivory: #eee9df;
  --muted: #b0b1a5;
  background: var(--dark);
  color: var(--ivory);
  font-family: 'DM Sans', Arial, sans-serif;
  overflow: clip;
  scroll-behavior: smooth;
}

.royal *,
.royal *::before,
.royal *::after {
  box-sizing: border-box;
}

.royal a { text-decoration: none; }
.royal button { cursor: pointer; }
.royal svg { width: 20px; height: 20px; }
.royal em { font-weight: 400; }
.royal h1, .royal h2, .royal h3, .royal p { margin: 0; }
.royal section { scroll-margin-top: 80px; }

.royal a:focus-visible,
.royal button:focus-visible {
  outline: 2px solid var(--gold-light);
  outline-offset: 5px;
}

.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: left;
  z-index: 200;
  pointer-events: none;
}

/* NAVIGATION */
.royal-header {
  height: 100px;
  padding: 0 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  border-bottom: 1px solid rgba(230,207,158,.20);
}

.brand { display: flex; flex-direction: column; color: white; }
.brand-main {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 31px;
  letter-spacing: -.04em;
  line-height: 1;
  white-space: nowrap;
}
.brand-main em { color: var(--gold); }
.brand-sub {
  color: var(--gold);
  font-size: 9px;
  letter-spacing: .38em;
  margin-top: 8px;
}
.desktop-nav { display: flex; gap: 36px; }
.desktop-nav a {
  color: #f1ebdf;
  font-size: 10px;
  letter-spacing: .17em;
  text-transform: uppercase;
  transition: color .3s;
}
.desktop-nav a:hover { color: var(--gold); }
.nav-action {
  display: flex;
  align-items: center;
  gap: 13px;
  color: var(--gold-light);
  font-size: 10px;
  letter-spacing: .14em;
  border-bottom: 1px solid var(--gold);
  padding-bottom: 10px;
  transition: gap .3s;
}
.nav-action:hover { gap: 21px; }
.nav-action svg { width: 15px; height: 15px; }
.mobile-toggle, .mobile-nav { display: none; }

/* HERO */
.royal-hero {
  position: relative;
  min-height: 900px;
  min-height: max(900px, 100svh);
  background:
    radial-gradient(ellipse at 65% 40%, #304036 0%, transparent 48%),
    linear-gradient(115deg, #0c1512 0%, #18231e 65%, #101713 100%);
  isolation: isolate;
}

.hero-glow {
  position: absolute;
  width: 680px;
  height: 680px;
  border-radius: 50%;
  right: 10%;
  top: 14%;
  background: radial-gradient(circle, rgba(172,119,61,.13), transparent 70%);
  pointer-events: none;
}

.hero-grid {
  position: absolute;
  inset: 0;
  opacity: .18;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(255,255,255,.10) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size: 160px 160px;
  mask-image: linear-gradient(to right, transparent, black 30%, black);
}

.hero-content {
  position: relative;
  z-index: 5;
  width: 69%;
  padding: 205px 0 155px 6%;
}

.eyebrow {
  color: var(--gold);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .28em;
  display: flex;
  align-items: center;
  gap: 18px;
  text-transform: uppercase;
  line-height: 1.8;
}

.gold-line {
  display: inline-block;
  flex-shrink: 0;
  width: 42px;
  height: 1px;
  background: var(--gold);
}

.heading-overline {
  font-size: 10px;
  letter-spacing: .35em;
  color: #b5b5a9;
  margin: 44px 0 18px;
}

.hero-heading h1 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 400;
  font-size: clamp(90px, 11vw, 175px);
  line-height: .72;
  letter-spacing: -.075em;
  position: relative;
}

.title-line {
  display: block;
  width: fit-content;
  animation: titleRise 1.1s both cubic-bezier(.2,.8,.2,1);
}
.title-one { animation-delay: .1s; }
.title-two {
  color: var(--gold-light);
  padding-left: 11%;
  margin-top: 22px;
  animation-delay: .25s;
}
.title-three {
  padding-left: 2%;
  margin-top: 18px;
  animation-delay: .4s;
}
.title-four {
  padding-left: 9%;
  margin-top: 20px;
  animation-delay: .55s;
}
.gold-dot { color: var(--gold); }

.hero-bottom {
  margin-top: 70px;
  display: flex;
  align-items: center;
  gap: 44px;
  flex-wrap: wrap;
}
.hero-bottom p {
  color: #babdb3;
  font-size: 13px;
  line-height: 2;
  max-width: 300px;
}
.royal-button {
  min-height: 61px;
  padding: 9px 10px 9px 23px;
  background: var(--gold);
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .13em;
  color: #172017;
  transition: transform .3s, box-shadow .3s, background .3s;
}
.royal-button:hover {
  transform: translateY(-4px);
  background: #edd7a9;
  box-shadow: 0 15px 35px rgba(0,0,0,.3);
}
.button-icon {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(19,30,22,.4);
  display: grid;
  place-items: center;
}
.button-icon svg { width: 18px; }

.hero-entrance {
  animation: softRise 1.2s .6s both;
}

/* 3D LAYERED IMAGE */
.hero-visual {
  position: absolute;
  z-index: 3;
  right: 6%;
  top: 20%;
  width: 39%;
  height: 62%;
  perspective: 1400px;
}

.visual-scene {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(var(--rotate-x,0deg))
             rotateY(var(--rotate-y,0deg));
  transition: transform .22s ease-out;
}

.visual-back-frame {
  position: absolute;
  inset: -18px -20px 20px 20px;
  border: 1px solid rgba(213,180,124,.65);
  transform: translateZ(-35px);
}

.visual-photo {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transform: translateZ(15px);
  box-shadow: 0 45px 90px rgba(0,0,0,.5);
}

.visual-photo-inner {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1500&q=90');
  background-position: center;
  background-size: cover;
  filter: saturate(.72) contrast(1.12);
  animation: slowZoom 16s ease-in-out infinite alternate;
}

.photo-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10,15,12,.1) 25%, rgba(10,15,12,.8));
}

.floating-crest {
  position: absolute;
  top: -60px;
  right: -49px;
  width: 132px;
  height: 132px;
  border-radius: 50%;
  background: #cbaa78;
  color: #152018;
  display: grid;
  place-items: center;
  box-shadow: 0 18px 45px rgba(0,0,0,.38);
  transform: translateZ(75px);
  animation: crestFloat 5s ease-in-out infinite;
}
.floating-crest .crest-svg { width: 115px; height: 115px; }

.visual-caption {
  position: absolute;
  bottom: 34px;
  left: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transform: translateZ(55px);
}
.visual-caption span {
  font-size: 9px;
  color: var(--gold-light);
  letter-spacing: .25em;
}
.visual-caption strong {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 27px;
  font-weight: 400;
}

.vertical-caption {
  position: absolute;
  right: -36px;
  bottom: 40px;
  writing-mode: vertical-rl;
  font-size: 9px;
  letter-spacing: .3em;
  color: var(--gold-light);
  transform: translateZ(45px);
}

.hero-edge-label {
  position: absolute;
  z-index: 7;
  left: 6%;
  bottom: 35px;
  width: 88%;
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  letter-spacing: .3em;
  color: #aeac9e;
}
.hero-scroll {
  position: absolute;
  right: 6%;
  bottom: 85px;
  z-index: 6;
  color: var(--gold-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  font-size: 9px;
  letter-spacing: .2em;
}
.scroll-indicator {
  width: 1px;
  height: 45px;
  background: linear-gradient(var(--gold),transparent);
  animation: scrollPulse 2s infinite;
}

/* RIBBON */
.royal-ribbon {
  overflow: hidden;
  background: #cfb381;
  color: #152119;
  padding: 21px 0;
}
.ribbon-track {
  width: max-content;
  display: flex;
  animation: ribbonMove 35s linear infinite;
}
.ribbon-track > span {
  white-space: nowrap;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 29px;
  font-style: italic;
  letter-spacing: .04em;
  padding-right: 35px;
}
.ribbon-star { font-size: 18px; margin: 0 30px; }

/* SHARED SECTIONS */
.section-padding { padding: 125px 6%; }
.section-top {
  max-width: 1450px;
  margin: 0 auto 100px;
  border-bottom: 1px solid rgba(213,180,124,.35);
  padding-bottom: 19px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: #a89c80;
  font-size: 10px;
  letter-spacing: .27em;
}
.display-heading {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 400;
  font-size: clamp(65px, 8vw, 125px);
  line-height: .85;
  letter-spacing: -.065em;
}
.display-heading em { color: var(--gold); }
.section-description {
  color: #aeb3a6;
  font-size: 15px;
  line-height: 2.2;
  max-width: 460px;
}

/* STORY */
.story-section {
  background:
    radial-gradient(circle at 12% 35%, #24362a, transparent 40%),
    #142119;
}
.story-layout {
  max-width: 1450px;
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 8%;
}
.story-copy .display-heading { margin: 33px 0 42px; }
.story-copy .display-heading span { color: #fff8e9; }
.story-signature {
  margin-top: 48px;
  display: flex;
  gap: 20px;
  align-items: center;
  color: var(--gold);
  letter-spacing: .24em;
  font-size: 9px;
}
.signature-line { width: 65px; height: 1px; background: var(--gold); }

.story-gallery { position: relative; min-height: 650px; }
.story-image-main {
  position: absolute;
  top: 0;
  right: 0;
  width: 85%;
  height: 85%;
  background: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85') center/cover;
  filter: saturate(.7);
  box-shadow: 0 40px 65px rgba(0,0,0,.35);
}
.story-image-small {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 49%;
  height: 43%;
  border: 9px solid #142119;
  background: url('https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85') center/cover;
  box-shadow: 0 20px 45px rgba(0,0,0,.4);
  transform: translateZ(20px);
  transition: transform .6s ease;
}
.story-gallery:hover .story-image-small {
  transform: translate(12px,-12px) rotate(-2deg);
}
.story-image-label {
  position: absolute;
  z-index: 4;
  right: -22px;
  bottom: 40px;
  display: flex;
  align-items: center;
  gap: 13px;
  background: var(--gold);
  color: #152119;
  padding: 14px 25px;
  font-size: 9px;
  letter-spacing: .16em;
}
.story-image-label .crest-svg { width: 43px; height: 43px; }

/* VALUES */
.values-section { background: #cdb589; color: #172119; }
.values-inner {
  max-width: 1450px;
  margin: auto;
  padding: 55px 6%;
  display: grid;
  grid-template-columns: repeat(3,1fr);
}
.value-item {
  display: flex;
  gap: 23px;
  align-items: center;
  border-right: 1px solid rgba(20,30,20,.25);
  padding: 12px 30px;
}
.value-item:last-child { border: 0; }
.value-number {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 62px;
  line-height: 1;
  opacity: .55;
}
.value-item h3 { font-size: 11px; letter-spacing: .24em; }
.value-item p { font-size: 11px; opacity: .75; margin-top: 9px; }

/* COLLECTION */
.collection-section {
  background:
    radial-gradient(ellipse at 75% 50%, #2b3a2b, transparent 50%),
    #101814;
}
.collection-heading {
  max-width: 1450px;
  margin: 0 auto 70px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 50px;
}
.collection-heading .display-heading { margin-top: 30px; }
.collection-heading .section-description { max-width: 300px; }

.collection-stage {
  max-width: 1450px;
  margin: auto;
  min-height: 600px;
  display: grid;
  grid-template-columns: 1.08fr .92fr;
  border: 1px solid rgba(213,180,124,.28);
}
.dish-visual {
  min-height: 600px;
  position: relative;
  perspective: 1200px;
  background: #273228;
  overflow: hidden;
}
.dish-outline {
  position: absolute;
  inset: 22px;
  z-index: 2;
  border: 1px solid rgba(231,211,160,.55);
  pointer-events: none;
}
.dish-image-wrap {
  position: absolute;
  inset: 0;
  animation: dishEnter .7s ease both;
}
.dish-image {
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
  filter: saturate(.85) contrast(1.05);
  transition: transform 1.1s ease;
}
.dish-visual:hover .dish-image {
  transform: scale(1.09) rotate(1deg);
}
.dish-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to top, rgba(9,15,11,.65),transparent 50%);
}
.dish-badge {
  position: absolute;
  z-index: 3;
  top: 48px;
  left: 48px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--gold);
  color: #162019;
  display: grid;
  place-items: center;
  box-shadow: 0 15px 30px rgba(0,0,0,.3);
}
.dish-badge .crest-svg { width: 78px; height: 78px; }
.dish-counter {
  position: absolute;
  z-index: 3;
  bottom: 50px;
  left: 48px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 35px;
}

.dish-details {
  padding: 65px 8%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.dish-category {
  color: var(--gold);
  font-size: 10px;
  letter-spacing: .25em;
}
.dish-gold-rule {
  margin: 55px 0 35px;
  height: 1px;
  width: 65px;
  background: var(--gold);
}
.dish-details h3 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(58px,5.7vw,94px);
  line-height: .95;
  letter-spacing: -.055em;
  font-weight: 400;
  animation: softRise .5s ease both;
}
.dish-details h3 em { color: var(--gold); }
.dish-details p {
  color: #aeb4a6;
  font-size: 14px;
  line-height: 2;
  max-width: 380px;
  margin-top: 30px;
}
.dish-controls {
  margin-top: 70px;
  padding-top: 28px;
  width: 100%;
  border-top: 1px solid rgba(213,180,124,.28);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dish-dots { display: flex; gap: 10px; }
.dish-dots button {
  height: 3px;
  width: 24px;
  background: #6e7468;
  border: 0;
  transition: width .3s, background .3s;
}
.dish-dots button.selected {
  width: 45px;
  background: var(--gold);
}
.dish-buttons { display: flex; gap: 10px; }
.dish-buttons button {
  display: grid;
  place-items: center;
  width: 51px;
  height: 51px;
  background: transparent;
  border: 1px solid rgba(213,180,124,.55);
  color: var(--gold);
  transition: background .3s, color .3s, transform .3s;
}
.dish-buttons button:hover {
  background: var(--gold);
  color: #182119;
  transform: translateY(-3px);
}
.flip-arrow { transform: rotate(180deg); display: flex; }
.collection-note {
  max-width: 1450px;
  margin: 23px auto 0 !important;
  font-size: 10px;
  letter-spacing: .18em;
  color: #8c9889;
  line-height: 2;
}

/* FULL BLEED EXPERIENCE */
.experience-section {
  height: 850px;
  min-height: 750px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 8%;
  overflow: hidden;
}
.experience-image {
  position: absolute;
  inset: 0;
  background: url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=2000&q=90') center/cover;
  background-attachment: fixed;
  filter: saturate(.75);
}
.experience-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,rgba(9,16,12,.95),rgba(10,18,13,.7) 55%,rgba(9,16,12,.25));
}
.experience-content { position: relative; z-index: 2; }
.experience-content h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(75px, 9vw, 148px);
  font-weight: 400;
  letter-spacing: -.065em;
  line-height: .83;
  margin: 40px 0;
}
.experience-content h2 em { color: var(--gold-light); }
.experience-content p {
  max-width: 430px;
  color: #c1c6b8;
  font-size: 14px;
  line-height: 2.2;
}
.experience-content .royal-button { margin-top: 36px; }
.experience-side-text {
  position: absolute;
  right: 42px;
  bottom: 70px;
  writing-mode: vertical-rl;
  font-size: 9px;
  letter-spacing: .35em;
  color: var(--gold);
}

/* CLOSING */
.closing-section {
  text-align: center;
  padding: 140px 20px;
  background:
    radial-gradient(ellipse at center,#27382c,#101916 65%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.closing-ornament { color: var(--gold); }
.closing-ornament svg { width: 100px; height: 100px; }
.closing-eyebrow { margin-top: 40px; }
.closing-section h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(63px,8vw,125px);
  line-height: .92;
  font-weight: 400;
  letter-spacing: -.06em;
  margin: 38px 0;
}
.closing-section h2 em { color: var(--gold); }
.closing-section p {
  color: #bdc2b5;
  font-size: 14px;
  line-height: 2.1;
  max-width: 370px;
}
.closing-link {
  margin-top: 40px;
  display: flex;
  gap: 15px;
  align-items: center;
  color: var(--gold);
  padding-bottom: 13px;
  border-bottom: 1px solid var(--gold);
  font-size: 10px;
  letter-spacing: .18em;
  transition: gap .3s;
}
.closing-link:hover { gap: 27px; }

/* FOOTER */
.royal-footer {
  background: #0a110e;
  padding: 80px 6% 26px;
  border-top: 1px solid rgba(213,180,124,.2);
}
.footer-top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 40px;
  padding-bottom: 60px;
  border-bottom: 1px solid rgba(213,180,124,.2);
}
.footer-brand { display: flex; flex-direction: column; }
.footer-brand > span {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 37px;
}
.footer-brand em { color: var(--gold); }
.footer-brand small {
  color: var(--gold);
  font-size: 9px;
  letter-spacing: .3em;
}
.footer-top p {
  color: #aeb4a6;
  max-width: 270px;
  font-size: 13px;
  line-height: 2;
}
.footer-top nav { display: flex; flex-direction: column; gap: 14px; }
.footer-top nav a {
  font-size: 11px;
  color: #c4c4b5;
  transition: color .3s;
}
.footer-top nav a:hover { color: var(--gold); }
.footer-big {
  text-align: center;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(190px,35vw,550px);
  line-height: .82;
  letter-spacing: -.08em;
  color: #29342a;
  overflow: hidden;
  padding: 38px 0;
}
.footer-big span { color: #786545; font-style: italic; }
.footer-bottom {
  border-top: 1px solid rgba(213,180,124,.2);
  display: flex;
  justify-content: space-between;
  padding-top: 24px;
  gap: 15px;
  flex-wrap: wrap;
  color: #8b9487;
  font-size: 9px;
  letter-spacing: .18em;
}

/* SCROLL REVEALS */
.motion-ready .reveal {
  opacity: 0;
  transform: translateY(45px);
  transition:
    opacity .9s cubic-bezier(.2,.8,.2,1),
    transform .9s cubic-bezier(.2,.8,.2,1);
}
.motion-ready .reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes titleRise {
  from { opacity: 0; transform: translateY(60px) rotateX(12deg); }
  to { opacity: 1; transform: translateY(0) rotateX(0); }
}
@keyframes softRise {
  from { opacity: 0; transform: translateY(25px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slowZoom {
  from { transform: scale(1); }
  to { transform: scale(1.12); }
}
@keyframes crestFloat {
  0%,100% { translate: 0 0; }
  50% { translate: 0 -13px; }
}
@keyframes ribbonMove {
  to { transform: translateX(-50%); }
}
@keyframes dishEnter {
  from { opacity: 0; transform: scale(1.08) rotateY(-9deg); }
  to { opacity: 1; transform: scale(1) rotateY(0); }
}
@keyframes scrollPulse {
  0%,100% { opacity: .35; }
  50% { opacity: 1; }
}

/* TABLET */
@media (max-width: 1150px) {
  .desktop-nav { gap: 17px; }
  .desktop-nav a { font-size: 9px; }
  .hero-content { width: 75%; }
  .hero-heading h1 { font-size: clamp(85px,11vw,130px); }
  .hero-visual { width: 42%; right: 5%; }
  .story-layout { gap: 4%; }
  .story-gallery { min-height: 530px; }
  .display-heading { font-size: clamp(63px,8vw,100px); }
}

/* MOBILE */
@media (max-width: 850px) {
  .royal-header { height: 80px; padding: 0 5%; }
  .brand-main { font-size: 27px; }
  .desktop-nav, .nav-action { display: none; }
  .mobile-toggle {
    display: flex;
    width: 44px;
    height: 44px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: transparent;
    border: 1px solid rgba(213,180,124,.5);
  }
  .mobile-toggle span {
    width: 19px;
    height: 1px;
    background: var(--gold);
  }
  .mobile-nav {
    position: absolute;
    display: flex;
    flex-direction: column;
    left: 0;
    right: 0;
    top: 80px;
    padding: 35px 7%;
    background: #101916;
    border-bottom: 1px solid var(--gold);
    box-shadow: 0 20px 40px rgba(0,0,0,.4);
    gap: 22px;
  }
  .mobile-nav a {
    color: var(--ivory);
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 27px;
  }
  .royal-hero { min-height: 1080px; }
  .hero-content {
    width: 100%;
    padding: 140px 5% 470px;
  }
  .hero-heading h1 {
    font-size: clamp(74px,13.8vw,120px);
    line-height: .78;
  }
  .heading-overline { margin-top: 30px; }
  .title-two { padding-left: 6%; }
  .title-four { padding-left: 5%; }
  .hero-bottom { margin-top: 42px; gap: 25px; }
  .hero-bottom p { max-width: 300px; }
  .hero-visual {
    top: auto;
    bottom: 110px;
    left: 13%;
    right: auto;
    height: 365px;
    width: 75%;
  }
  .floating-crest {
    width: 90px;
    height: 90px;
    top: -35px;
    right: -30px;
  }
  .floating-crest .crest-svg { width: 78px; height: 78px; }
  .visual-caption { left: 23px; bottom: 20px; }
  .vertical-caption { display: none; }
  .hero-edge-label { left: 5%; width: 90%; bottom: 22px; }
  .hero-scroll { display: none; }

  .section-padding { padding: 90px 6%; }
  .section-top { margin-bottom: 55px; }
  .story-layout { grid-template-columns: 1fr; gap: 70px; }
  .story-gallery { min-height: 570px; }
  .story-copy .display-heading { font-size: clamp(70px,11vw,120px); }

  .values-inner { grid-template-columns: 1fr; padding: 35px 6%; }
  .value-item {
    border-right: 0;
    border-bottom: 1px solid rgba(20,30,20,.25);
    padding: 25px 0;
  }
  .value-item:last-child { border: 0; }

  .collection-heading { display: block; }
  .collection-heading .section-description { margin-top: 32px; }
  .collection-stage { grid-template-columns: 1fr; }
  .dish-visual { min-height: 510px; }
  .dish-details { min-height: 460px; padding: 50px 7%; }

  .experience-section { height: 780px; }
  .experience-image { background-attachment: scroll; }
  .experience-content h2 { font-size: clamp(70px,10vw,110px); }
  .footer-top { flex-wrap: wrap; }
}

@media (max-width: 500px) {
  .royal-hero { min-height: 940px; }
  .hero-content { padding-top: 135px; padding-bottom: 410px; }
  .eyebrow { font-size: 8px; gap: 10px; letter-spacing: .19em; }
  .gold-line { width: 25px; }
  .heading-overline { font-size: 8px; }
  .hero-heading h1 { font-size: clamp(62px,15vw,82px); }
  .title-two, .title-three, .title-four { margin-top: 14px; }
  .hero-bottom { margin-top: 35px; }
  .hero-bottom p { font-size: 12px; }
  .royal-button { min-height: 55px; font-size: 9px; gap: 12px; }
  .hero-visual {
    height: 310px;
    width: 75%;
    bottom: 90px;
  }
  .visual-caption strong { font-size: 19px; }
  .visual-caption span { font-size: 8px; }
  .hero-edge-label { font-size: 7px; }
  .ribbon-track > span { font-size: 22px; }
  .section-top { font-size: 8px; letter-spacing: .15em; }
  .display-heading { font-size: clamp(56px,12vw,80px); }
  .story-copy .display-heading { font-size: clamp(64px,13vw,95px); }
  .story-gallery { min-height: 440px; }
  .story-image-label { right: 0; bottom: 10px; padding: 10px; font-size: 7px; }
  .story-image-label .crest-svg { width: 30px; height: 30px; }
  .story-image-small { border-width: 5px; }
  .dish-visual { min-height: 370px; }
  .dish-details { padding: 38px 7%; }
  .dish-details h3 { font-size: clamp(56px,13vw,75px); }
  .dish-gold-rule { margin: 35px 0 25px; }
  .dish-controls { margin-top: 40px; }
  .dish-badge { top: 32px; left: 32px; width: 65px; height: 65px; }
  .dish-badge .crest-svg { width: 55px; height: 55px; }
  .dish-counter { bottom: 32px; left: 32px; }
  .experience-section { min-height: 670px; height: auto; padding: 100px 7%; }
  .experience-content h2 { font-size: clamp(57px,12vw,80px); }
  .experience-side-text { display: none; }
  .closing-section { padding: 100px 6%; }
  .closing-section h2 { font-size: clamp(54px,12vw,75px); }
  .footer-top { flex-direction: column; gap: 30px; }
  .footer-big { font-size: 45vw; }
  .footer-bottom { font-size: 8px; }
}

@media (prefers-reduced-motion: reduce) {
  .royal *,
  .royal *::before,
  .royal *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
  .motion-ready .reveal { opacity: 1; transform: none; }
  .visual-scene { transform: none !important; }
}
`;
