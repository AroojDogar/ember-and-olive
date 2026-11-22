
"use client";

import {
  useRef,
  useState,
  type PointerEvent,
} from "react";

const scenes = [
  {
    number: "01",
    eyebrow: "THE GRAND ARRIVAL",
    title: "The",
    accent: "Arrival",
    description:
      "A world of warmth, elegance and anticipation. Every remarkable evening begins with a sense of wonder.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=90",
  },
  {
    number: "02",
    eyebrow: "THE ART OF DINING",
    title: "The",
    accent: "Experience",
    description:
      "An intimate celebration of exquisite flavors, thoughtful presentation and exceptional hospitality.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=90",
  },
  {
    number: "03",
    eyebrow: "THE LASTING IMPRESSION",
    title: "The",
    accent: "Afterglow",
    description:
      "When the final course is served, the most memorable part of the evening is still unfolding.",
    image:
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1400&q=90",
  },
];

export default function Royal3DGallery() {
  const [active, setActive] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);

  const next = () => {
    setActive((current) => (current + 1) % scenes.length);
  };

  const previous = () => {
    setActive(
      (current) =>
        (current + scenes.length - 1) % scenes.length
    );
  };

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width - 0.5;

    const y =
      (event.clientY - rect.top) / rect.height - 0.5;

    stageRef.current?.style.setProperty(
      "--gallery-ry",
      `${x * 9}deg`
    );

    stageRef.current?.style.setProperty(
      "--gallery-rx",
      `${-y * 6}deg`
    );
  }

  function resetPointer() {
    stageRef.current?.style.setProperty(
      "--gallery-ry",
      "0deg"
    );

    stageRef.current?.style.setProperty(
      "--gallery-rx",
      "0deg"
    );
  }

  return (
    <section
      className="r3d-section"
      aria-labelledby="r3d-title"
    >
      <style>{galleryStyles}</style>

      <div className="r3d-container">
        <div className="r3d-topline">
          <span>THE EMBER & OLIVE COLLECTION</span>
          <span>AN IMMERSIVE EXPERIENCE / 001</span>
        </div>

        <div className="r3d-heading">
          <div className="r3d-eyebrow">
            <span className="r3d-line" />
            AN INVITATION TO DISCOVER
          </div>

          <h2 id="r3d-title">
            BEYOND
            <br />
            <em>ORDINARY.</em>
          </h2>

          <p>
            Three moments. One extraordinary evening.
            Discover the atmosphere behind the experience.
          </p>
        </div>

        <div
          ref={stageRef}
          className="r3d-stage"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointer}
        >
          <div
            className="r3d-stage-glow"
            aria-hidden="true"
          />

          <div
            className="r3d-stage-ring"
            aria-hidden="true"
          />

          {scenes.map((scene, index) => {
            const position =
              index === active
                ? "center"
                : index === (active + 1) % scenes.length
                ? "right"
                : "left";

            return (
              <button
                key={scene.number}
                type="button"
                className="r3d-card"
                data-position={position}
                onClick={() => setActive(index)}
                aria-label={`Show ${scene.accent}`}
                aria-pressed={active === index}
              >
                <span
                  className="r3d-photo"
                  style={{
                    backgroundImage: `url("${scene.image}")`,
                  }}
                />

                <span className="r3d-shade" />

                <span className="r3d-card-border" />

                <span className="r3d-card-top">
                  <span>EMBER & OLIVE</span>
                  <span>{scene.number} / 03</span>
                </span>

                <span className="r3d-card-bottom">
                  <span className="r3d-card-small">
                    THE ROYAL NOIR EXPERIENCE
                  </span>

                  <span className="r3d-card-title">
                    {scene.accent}
                  </span>
                </span>
              </button>
            );
          })}

          <span
            className="r3d-side-label"
            aria-hidden="true"
          >
            AN EXPRESSION OF TIMELESS LUXURY
          </span>
        </div>

        <div className="r3d-bottom">
          <div
            className="r3d-description"
            key={active}
            aria-live="polite"
          >
            <span className="r3d-number">
              {scenes[active].number} / 03
            </span>

            <div>
              <span className="r3d-description-eyebrow">
                {scenes[active].eyebrow}
              </span>

              <h3>
                {scenes[active].title}{" "}
                <em>{scenes[active].accent}.</em>
              </h3>

              <p>{scenes[active].description}</p>
            </div>
          </div>

          <div className="r3d-navigation">
            <button
              type="button"
              aria-label="Previous scene"
              onClick={previous}
            >
              <span className="r3d-arrow-left">→</span>
            </button>

            <span>
              {String(active + 1).padStart(2, "0")}
              <span className="r3d-divider"> / </span>
              03
            </span>

            <button
              type="button"
              aria-label="Next scene"
              onClick={next}
            >
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const galleryStyles = `
.r3d-section {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(
      ellipse at 50% 48%,
      #29382c 0%,
      #111b15 55%,
      #0b130f 100%
    );
  color: #f0e9dd;
  padding: 115px 5% 100px;
  isolation: isolate;
}

.r3d-section::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.12;
  pointer-events: none;
  background-image:
    linear-gradient(
      rgba(213,180,124,.18) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(213,180,124,.18) 1px,
      transparent 1px
    );
  background-size: 120px 120px;
}

.r3d-container {
  position: relative;
  max-width: 1500px;
  margin: 0 auto;
}

.r3d-topline {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(213,180,124,.3);
  color: #b8a888;
  font-size: 9px;
  letter-spacing: .25em;
}

.r3d-heading {
  margin-top: 80px;
  text-align: center;
}

.r3d-eyebrow {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  color: #d5b47c;
  font-size: 10px;
  letter-spacing: .3em;
}

.r3d-line {
  width: 35px;
  height: 1px;
  background: #d5b47c;
}

.r3d-heading h2 {
  margin-top: 30px;
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: clamp(75px, 11vw, 170px);
  font-weight: 400;
  line-height: .78;
  letter-spacing: -.07em;
}

.r3d-heading h2 em {
  color: #d9bd8e;
  font-weight: 400;
}

.r3d-heading > p {
  max-width: 440px;
  margin: 32px auto 0;
  color: #aeb5a8;
  font-size: 13px;
  line-height: 2;
}

/* REAL CSS 3D PERSPECTIVE */

.r3d-stage {
  --spread: clamp(220px, 28vw, 420px);
  --gallery-rx: 0deg;
  --gallery-ry: 0deg;

  position: relative;
  width: 100%;
  height: 720px;
  margin-top: 45px;
  perspective: 1350px;
  perspective-origin: center 45%;
  transform-style: preserve-3d;
}

.r3d-stage-glow {
  position: absolute;
  width: 55%;
  height: 80%;
  left: 22.5%;
  top: 10%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(213,180,124,.16),
    transparent 70%
  );
  filter: blur(28px);
  pointer-events: none;
}

.r3d-stage-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(85vw, 920px);
  height: min(65vw, 560px);
  transform:
    translate(-50%, -50%)
    rotateX(72deg);
  border: 1px solid rgba(213,180,124,.19);
  border-radius: 50%;
  pointer-events: none;
}

.r3d-card {
  appearance: none;
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: clamp(275px, 36vw, 510px);
  height: clamp(370px, 42vw, 580px);
  overflow: hidden;
  padding: 0;
  background: #283029;
  border: 0;
  color: #fff8ec;
  text-align: left;
  cursor: pointer;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  box-shadow: 0 35px 75px rgba(0,0,0,.55);
  transition:
    transform 850ms cubic-bezier(.2,.75,.2,1),
    opacity 850ms ease,
    box-shadow 850ms ease;
}

.r3d-card[data-position="center"] {
  z-index: 5;
  opacity: 1;
  transform:
    translate3d(-50%, -50%, 90px)
    rotateX(var(--gallery-rx))
    rotateY(var(--gallery-ry));
  box-shadow: 0 45px 100px rgba(0,0,0,.65);
}

.r3d-card[data-position="left"] {
  z-index: 3;
  opacity: .65;
  transform:
    translate3d(
      calc(-50% - var(--spread)),
      -50%,
      -150px
    )
    rotateY(36deg)
    scale(.83);
}

.r3d-card[data-position="right"] {
  z-index: 3;
  opacity: .65;
  transform:
    translate3d(
      calc(-50% + var(--spread)),
      -50%,
      -150px
    )
    rotateY(-36deg)
    scale(.83);
}

.r3d-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition:
    transform 1.1s ease,
    filter .8s ease;
}

.r3d-card[data-position="center"]:hover .r3d-photo {
  transform: scale(1.055);
}

.r3d-card:not([data-position="center"]) .r3d-photo {
  filter: brightness(.65) saturate(.7);
}

.r3d-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(8,14,10,.35),
    transparent 35%,
    rgba(8,14,10,.88)
  );
}

.r3d-card-border {
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(232,205,155,.62);
  pointer-events: none;
}

.r3d-card-top {
  position: absolute;
  top: 37px;
  left: 37px;
  right: 37px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #e8d3ae;
  font-size: 9px;
  letter-spacing: .19em;
}

.r3d-card-bottom {
  position: absolute;
  bottom: 45px;
  left: 37px;
  right: 37px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.r3d-card-small {
  font-size: 9px;
  color: #dec69b;
  letter-spacing: .23em;
}

.r3d-card-title {
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: clamp(50px, 6vw, 80px);
  font-style: italic;
  letter-spacing: -.05em;
  line-height: 1;
}

.r3d-side-label {
  position: absolute;
  right: 0;
  top: 50%;
  writing-mode: vertical-rl;
  transform: translateY(-50%);
  font-size: 9px;
  color: #af9670;
  letter-spacing: .3em;
}

/* DESCRIPTION & NAVIGATION */

.r3d-bottom {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 35px;
  padding-top: 35px;
  border-top: 1px solid rgba(213,180,124,.35);
}

.r3d-description {
  display: flex;
  align-items: start;
  gap: 35px;
  animation: r3dReveal .65s ease both;
}

.r3d-number {
  font-family:
    "Cormorant Garamond", Georgia, serif;
  color: #d5b47c;
  font-size: 33px;
  white-space: nowrap;
}

.r3d-description-eyebrow {
  display: block;
  margin-bottom: 13px;
  color: #d5b47c;
  font-size: 9px;
  letter-spacing: .24em;
}

.r3d-description h3 {
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: clamp(40px, 5vw, 65px);
  font-weight: 400;
  line-height: 1;
}

.r3d-description h3 em {
  color: #d5b47c;
}

.r3d-description p {
  max-width: 510px;
  margin-top: 18px;
  color: #b0b7a9;
  font-size: 13px;
  line-height: 2;
}

.r3d-navigation {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-shrink: 0;
}

.r3d-navigation > span {
  font-family:
    "Cormorant Garamond", Georgia, serif;
  font-size: 25px;
  color: #e1c493;
  white-space: nowrap;
}

.r3d-divider {
  color: #6c766b;
}

.r3d-navigation button {
  display: grid;
  place-items: center;
  width: 55px;
  height: 55px;
  border: 1px solid rgba(213,180,124,.55);
  background: transparent;
  color: #d5b47c;
  font-size: 25px;
  transition:
    background .3s,
    color .3s,
    transform .3s;
}

.r3d-navigation button:hover {
  background: #d5b47c;
  color: #132017;
  transform: translateY(-3px);
}

.r3d-arrow-left {
  display: inline-block;
  transform: rotate(180deg);
}

@keyframes r3dReveal {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* TABLET */
@media (max-width: 1000px) {
  .r3d-stage {
    --spread: 31vw;
    height: 650px;
  }
  .r3d-card {
    width: 43vw;
    height: 510px;
  }
  .r3d-side-label {
    display: none;
  }
}

/* MOBILE */
@media (max-width: 700px) {
  .r3d-section {
    padding: 85px 5% 75px;
  }
  .r3d-topline {
    font-size: 7px;
    letter-spacing: .13em;
  }
  .r3d-topline span:last-child {
    text-align: right;
  }
  .r3d-heading {
    margin-top: 65px;
  }
  .r3d-heading h2 {
    font-size: clamp(58px, 13vw, 95px);
  }
  .r3d-heading > p {
    font-size: 12px;
  }
  .r3d-eyebrow {
    font-size: 8px;
  }
  .r3d-stage {
--spread: 34vw;    height: 520px;
    margin-top: 15px;
  }
  .r3d-card {
    width: min(75vw, 350px);
    height: 420px;
  }
  .r3d-card[data-position="left"] {
    opacity: .45;
  }
  .r3d-card[data-position="right"] {
    opacity: .45;
  }
  .r3d-card-border {
    inset: 12px;
  }
  .r3d-card-top {
    top: 27px;
    left: 25px;
    right: 25px;
    font-size: 7px;
  }
  .r3d-card-bottom {
    bottom: 31px;
    left: 25px;
    right: 25px;
  }
  .r3d-card-title {
    font-size: 54px;
  }
  .r3d-card-small {
    font-size: 7px;
  }
  .r3d-bottom {
    flex-direction: column;
    align-items: stretch;
    gap: 28px;
  }
  .r3d-description {
    gap: 17px;
  }
  .r3d-description h3 {
    font-size: 45px;
  }
  .r3d-description p {
    font-size: 12px;
  }
  .r3d-navigation {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .r3d-section *,
  .r3d-section *::before,
  .r3d-section *::after {
    animation: none !important;
    transition: none !important;
  }
  .r3d-card[data-position="center"] {
    transform: translate3d(-50%, -50%, 90px);
  }
}
`;
