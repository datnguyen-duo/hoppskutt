import { useState } from 'react';
import { BookOpen, Camera, Info, Menu, Play, X } from 'lucide-react';
import chloeHeroKeyart from '../../assets/chloe-hero-keyart-maryland.jpg';
import chloeCopilot from '../../assets/chloe-copilot.jpg';

type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSection, setMenuSection] = useState<'about' | 'resources'>('about');
  const [photoOpen, setPhotoOpen] = useState(false);

  const openSection = (section: 'about' | 'resources') => {
    setMenuSection(section);
    setMenuOpen(true);
  };

  return (
    <section className="screen start-screen">
      <div className="start-landing">
        <div className="start-landing__scene">
          <img
            src={chloeHeroKeyart}
            alt="Illustrated roadtrip portrait of Chloe as a copilot with a Maryland marsh trail backdrop"
            className="start-landing__photo"
          />
          <div className="start-landing__wash" aria-hidden="true" />
          <div className="start-landing__ambient start-landing__ambient--one" aria-hidden="true" />
          <div className="start-landing__ambient start-landing__ambient--two" aria-hidden="true" />
          <div className="start-landing__beam" aria-hidden="true" />
        </div>

        <div className="start-landing__topbar">
          <div className="start-landing__brand" aria-label="Trailhead Chloe">
            <img src="/trailhead-chloe.svg" alt="" className="start-landing__brand-icon" />
          </div>
          <button
            type="button"
            className="start-landing__menu-button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>
        </div>

        <div className="start-landing__hero">
          <p className="eyebrow">A Roadtrip Game For Chloe</p>
          <h1>Hoppskutt</h1>
          <p className="start-landing__subtitle">
            Start in Maryland and keep rolling all the way to Vietnam.
          </p>
          <p className="start-landing__lede">
            Chesapeake marsh light kicks off Chloe&apos;s route book. Pick the next stop, weave
            past route clutter, and cross the finish with enough tandborste to earn each stamp.
          </p>
          <div className="start-landing__actions">
            <button type="button" className="button button--primary" onClick={onStart}>
              <Play />
              Play
            </button>
          </div>
        </div>
      </div>

      <div
        className={`start-menu-overlay${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
      <aside className={`start-menu-drawer${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="start-menu-drawer__header">
          <div>
            <p className="eyebrow">Menu</p>
            <h2>Trailhead Chloe</h2>
          </div>
          <button
            type="button"
            className="button button--quiet"
            onClick={() => setMenuOpen(false)}
          >
            <X />
            Close
          </button>
        </div>

        <div className="start-menu-drawer__nav">
          <button type="button" className="start-menu-item" onClick={() => openSection('about')}>
            <Info />
            About
          </button>
          <button type="button" className="start-menu-item" onClick={() => openSection('resources')}>
            <BookOpen />
            Resources
          </button>
          <button
            type="button"
            className="start-menu-item"
            onClick={() => {
              setPhotoOpen(true);
              setMenuOpen(false);
            }}
          >
            <Camera />
            Photo
          </button>
          <button
            type="button"
            className="button button--primary start-menu-drawer__play"
            onClick={onStart}
          >
            <Play />
            Play
          </button>
        </div>

        <div className="start-menu-drawer__body">
          {menuSection === 'about' && (
            <div className="start-menu-panel">
              <p className="eyebrow">About</p>
              <p>
                Hoppskutt started as a small tribute project: part dog game, part travel keepsake,
                and part experiment in turning a real companion into a playful arcade world.
              </p>
              <p>
                This space is a placeholder for your own story about Chloe, the roadtrip feeling,
                and why this game mattered enough to build.
              </p>
            </div>
          )}

          {menuSection === 'resources' && (
            <div className="start-menu-panel">
              <p className="eyebrow">Resources</p>
              <ul className="start-menu-resources">
                <li>OpenAI Codex</li>
                <li>OpenAI image generation</li>
                <li>Kenney UI Pack (CC0)</li>
                <li>Lucide icons</li>
                <li>Playwright</li>
                <li>React</li>
                <li>Vite</li>
                <li>Three.js</li>
                <li>Chloe reference photography</li>
              </ul>
            </div>
          )}
        </div>
      </aside>

      {photoOpen && (
        <div className="start-photo-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="start-photo-modal__scrim"
            aria-label="Close photo"
            onClick={() => setPhotoOpen(false)}
          />
          <div className="start-photo-modal__card">
            <div className="start-photo-modal__header">
              <div>
                <p className="eyebrow">Original Photo</p>
                <h2>Chloe the copilot.</h2>
              </div>
              <button
                type="button"
                className="button button--quiet"
                onClick={() => setPhotoOpen(false)}
              >
                <X />
                Close
              </button>
            </div>
            <img
              src={chloeCopilot}
              alt="Original photo of Chloe sitting in the driver's seat"
              className="start-photo-modal__image"
            />
            <div className="start-photo-modal__actions">
              <button type="button" className="button button--primary" onClick={onStart}>
                <Play />
                Play
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
