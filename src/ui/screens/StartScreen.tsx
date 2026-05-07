import { useState } from 'react';
import { Backpack, BookOpen, Camera, Heart, Info, Map, Menu, Play, Stamp, X } from 'lucide-react';
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

type MenuSection = 'journey' | 'progress' | 'story' | 'memory' | 'credits';

export function StartScreen({ progress, onStart, onOpenCollection }: StartScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSection, setMenuSection] = useState<MenuSection>('journey');
  const [photoOpen, setPhotoOpen] = useState(false);
  const hasProgress =
    progress.totalWins > 0 ||
    progress.unlockedDestinations.length > 1 ||
    progress.unlockedRecipes.length > 0;
  const playLabel = hasProgress ? 'Continue Trip' : 'Choose Route';
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
          <p className="eyebrow">For Chloe</p>
          <h1>Hoppskutt</h1>
          <p className="start-landing__subtitle">
            A game dedicated to Chloe&apos;s many adventures.
          </p>
          <p className="start-landing__lede">
            Pick a route, collect tandborste, and unlock the next postcard.
          </p>
          <div className="start-landing__actions">
            <button type="button" className="button button--primary" onClick={onStart}>
              <Play />
              {playLabel}
            </button>
            <button type="button" className="button button--ghost button--glass" onClick={onOpenCollection}>
              <BookOpen />
              Chloe&apos;s Book
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
            <h2>Hoppskutt</h2>
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
            Chloe&apos;s Book
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
            <span>Routes</span>
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
            Trip
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
            className={`start-menu-item${menuSection === 'memory' ? ' is-active' : ''}`}
            aria-pressed={menuSection === 'memory'}
            onClick={() => openSection('memory')}
          >
            <Heart />
            Chloe
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
              <p className="eyebrow">Trip</p>
              <div className="start-journey-list">
                <div>
                  <span>1</span>
                  <strong>Pick a route</strong>
                  <p>Choose any open stop.</p>
                </div>
                <div>
                  <span>2</span>
                  <strong>Collect tandborste</strong>
                  <p>Clear routes to fill Chloe&apos;s book.</p>
                </div>
                <div>
                  <span>3</span>
                  <strong>Pack helpers</strong>
                  <p>Helpers unlock as the trip grows.</p>
                </div>
              </div>
            </div>
          )}

          {menuSection === 'progress' && (
            <div className="start-menu-panel">
              <p className="eyebrow">Progress</p>
              <div className="start-progress-list">
                <div>
                  <span>Open routes</span>
                  <strong>{progress.unlockedDestinations.length}/{destinations.length}</strong>
                </div>
                <div>
                  <span>Cards</span>
                  <strong>{progress.unlockedRecipes.length}/{destinations.length}</strong>
                </div>
                <div>
                  <span>Clears</span>
                  <strong>{progress.totalWins}</strong>
                </div>
                <div>
                  <span>Helpers</span>
                  <strong>{packedBoostCount}</strong>
                </div>
              </div>
            </div>
          )}

          {menuSection === 'story' && (
            <div className="start-menu-panel">
              <p className="eyebrow">Story</p>
              <p>
                I started building this game in April 2026 to honor Chloe, my
                favorite trucker, and the adventures that we&apos;ve been on
                together. We&apos;ve taken Chloe to over 20 states and parts of
                Canada. She has walked through and woken up in some of the most
                beautiful places in the world.
              </p>
              <p>
                The name Hoppskutt was inspired by the Swedish words
                &quot;hopp&quot; and &quot;skutt,&quot; meaning &quot;hop&quot;
                or &quot;jump&quot; to pay homage to her &quot;Swedish&quot;
                roots. Even the in-game treats are Swedish for
                &quot;toothbrush&quot;. These Purina Dentalife treats were a
                part of Chloe&apos;s daily routine of &quot;brushing&quot;
                before bedtime.
              </p>
              <p>
                This game is a small way to keep these memories alive.
              </p>
              <p>
                RIP Chloe 5/4/2026. I love and miss you everyday.
              </p>
            </div>
          )}

          {menuSection === 'memory' && (
            <div className="start-menu-panel">
              <p className="eyebrow">Chloe</p>
              <p>
                Chloe is part Lab, Pointer and Rottweiler and 100% princess.
                She&apos;s the most gentle, loving and sweetest dog ever. But
                don&apos;t let that fool you - she will hustle you to give her
                food by targeting the weakest link at the dinner table. She is
                the type of dog to demand attention from everyone in the room
                but still cuddle you when you&apos;re sad. She&apos;s
                one-of-a-kind and a perfect mix of goofy and royalty.
              </p>
            </div>
          )}

          {menuSection === 'credits' && (
            <div className="start-menu-panel">
              <p className="eyebrow">Credits</p>
              <p>
                Made for Chloe with reference photography, generated game art,
                open assets, and a lot of love.
              </p>
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
                Choose Route
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
