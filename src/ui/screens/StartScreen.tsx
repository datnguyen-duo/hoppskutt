import { useState } from 'react';
import { Backpack, BookOpen, Camera, Info, Map, Menu, Play, Stamp, X } from 'lucide-react';
import { boosts } from '../../data/boosts';
import { destinations } from '../../data/destinations';
import { heroArtPath, heroPortraitArtPath } from '../../assets/artPaths';
import type { ProgressState } from '../../state/types';
import chloeCopilot from '../../assets/chloe-copilot.jpg';

type StartScreenProps = {
  progress: ProgressState;
  onStart: () => void;
  onOpenCollection: () => void;
};

type MenuSection = 'journey' | 'progress' | 'story' | 'credits';

export function StartScreen({ progress, onStart, onOpenCollection }: StartScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSection, setMenuSection] = useState<MenuSection>('journey');
  const [photoOpen, setPhotoOpen] = useState(false);
  const hasProgress =
    progress.totalWins > 0 ||
    progress.unlockedDestinations.length > 1 ||
    progress.unlockedRecipes.length > 0;
  const playLabel = hasProgress ? 'Continue Run' : 'Start Run';
  const packedBoostCount = boosts.reduce(
    (total, boost) => total + progress.boostInventory[boost.id],
    0,
  );

  const openSection = (section: MenuSection) => {
    setMenuSection(section);
    setMenuOpen(true);
  };

  return (
    <section className="screen start-screen">
      <div className="start-landing">
        <div className="start-landing__scene">
          <picture>
            <source srcSet={heroArtPath} media="(min-width: 960px)" />
            <img
              src={heroPortraitArtPath}
              alt="Sticker-arcade portrait of Chloe as a roadtrip copilot with a Maryland marsh route outside"
              className="start-landing__photo"
            />
          </picture>
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
            <span>Menu</span>
          </button>
        </div>

        <div className="start-landing__hero">
          <p className="eyebrow">Sticker Arcade For Chloe</p>
          <h1>Hoppskutt</h1>
          <p className="start-landing__subtitle">
            Dash from Maryland to Vietnam, one Tandborste run at a time.
          </p>
          <p className="start-landing__lede">
            Pick a stage, clip a helper to Chloe&apos;s pack, weave through route clutter, and
            cash in enough Tandborste to light up the next sticker stop.
          </p>
          <div className="start-landing__actions">
            <button type="button" className="button button--primary" onClick={onStart}>
              <Play />
              {playLabel}
            </button>
            <button type="button" className="button button--ghost button--glass" onClick={onOpenCollection}>
              <BookOpen />
              Sticker Book
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
            <p className="eyebrow">Trip Menu</p>
            <h2>Where to next?</h2>
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

        <div className="start-menu-drawer__primary">
          <button
            type="button"
            className="button button--primary start-menu-drawer__play"
            onClick={onStart}
          >
            <Play />
            {playLabel}
          </button>
          <button type="button" className="button button--ghost" onClick={onOpenCollection}>
            <BookOpen />
            Sticker Book
          </button>
        </div>

        <div className="start-menu-summary" aria-label="Trip progress">
          <div>
            <Stamp />
            <span>Stamps</span>
            <strong>{progress.totalWins}</strong>
          </div>
          <div>
            <Map />
            <span>Stops</span>
            <strong>{progress.unlockedDestinations.length}/{destinations.length}</strong>
          </div>
          <div>
            <Backpack />
            <span>Helpers</span>
            <strong>{packedBoostCount}</strong>
          </div>
        </div>

        <div className="start-menu-drawer__nav">
          <button
            type="button"
            className={`start-menu-item${menuSection === 'journey' ? ' is-active' : ''}`}
            aria-pressed={menuSection === 'journey'}
            onClick={() => openSection('journey')}
          >
            <Map />
            Journey
          </button>
          <button
            type="button"
            className={`start-menu-item${menuSection === 'progress' ? ' is-active' : ''}`}
            aria-pressed={menuSection === 'progress'}
            onClick={() => openSection('progress')}
          >
            <Stamp />
            Progress
          </button>
          <button
            type="button"
            className={`start-menu-item${menuSection === 'story' ? ' is-active' : ''}`}
            aria-pressed={menuSection === 'story'}
            onClick={() => openSection('story')}
          >
            <Info />
            Story
          </button>
          <button
            type="button"
            className={`start-menu-item${menuSection === 'credits' ? ' is-active' : ''}`}
            aria-pressed={menuSection === 'credits'}
            onClick={() => openSection('credits')}
          >
            <BookOpen />
            Credits
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
        </div>

        <div className="start-menu-drawer__body">
          {menuSection === 'journey' && (
            <div className="start-menu-panel">
              <p className="eyebrow">Journey</p>
              <div className="start-journey-list">
                <div>
                  <span>1</span>
                  <strong>Pick a stage</strong>
                  <p>Maryland opens first, then each clean clear unlocks the next sticker stop.</p>
                </div>
                <div>
                  <span>2</span>
                  <strong>Clip one helper</strong>
                  <p>Helpers sharpen lane shifts, soften the route, or boost the Tandborste score.</p>
                </div>
                <div>
                  <span>3</span>
                  <strong>Clear the finish gate</strong>
                  <p>Cross with enough Tandborste to file stickers, snack cards, and bragging rights.</p>
                </div>
              </div>
            </div>
          )}

          {menuSection === 'progress' && (
            <div className="start-menu-panel">
              <p className="eyebrow">Progress</p>
              <div className="start-progress-list">
                <div>
                  <span>Open stops</span>
                  <strong>{progress.unlockedDestinations.length}/{destinations.length}</strong>
                </div>
                <div>
                  <span>Snack cards</span>
                  <strong>{progress.unlockedRecipes.length}/{destinations.length}</strong>
                </div>
                <div>
                  <span>Trail stamps</span>
                  <strong>{progress.totalWins}</strong>
                </div>
                <div>
                  <span>Pack helpers</span>
                  <strong>{packedBoostCount}</strong>
                </div>
              </div>
            </div>
          )}

          {menuSection === 'story' && (
            <div className="start-menu-panel">
              <p className="eyebrow">Story</p>
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

          {menuSection === 'credits' && (
            <div className="start-menu-panel">
              <p className="eyebrow">Credits</p>
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
