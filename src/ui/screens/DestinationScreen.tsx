import type { CSSProperties } from 'react';
import { Backpack, BookOpen, Gauge, Map, Menu, Play, RotateCcw, Stamp } from 'lucide-react';
import { boosts, boostLookup } from '../../data/boosts';
import { destinationLookup, destinations } from '../../data/destinations';
import type { BoostId, DestinationId, ProgressState } from '../../state/types';
import { PostcardScene } from '../PostcardScene';

type Notice = {
  tone: 'loss' | 'success' | 'info';
  message: string;
} | null;

type DestinationScreenProps = {
  notice: Notice;
  progress: ProgressState;
  selectedDestinationId: DestinationId;
  onSelectDestination: (destinationId: DestinationId) => void;
  onPlay: () => void;
  onOpenMenu: () => void;
  onOpenCollection: () => void;
  onEquipBoost: (boostId: BoostId) => void;
  onClearBoost: () => void;
  onResetProgress: () => void;
};

export function DestinationScreen({
  notice,
  progress,
  selectedDestinationId,
  onSelectDestination,
  onPlay,
  onOpenMenu,
  onOpenCollection,
  onEquipBoost,
  onClearBoost,
  onResetProgress,
}: DestinationScreenProps) {
  const selected = destinationLookup[selectedDestinationId];
  const equippedBoost = progress.equippedBoostId
    ? boostLookup[progress.equippedBoostId]
    : null;

  return (
    <section className="screen destination-screen destination-screen--hub">
      <header className="topbar topbar--destination destination-topbar">
        <div className="destination-topbar__copy">
          <p className="eyebrow">Trail Select</p>
          <h2>Choose the next trailhead.</h2>
          <p>
            Pick one stop, pack one helper, and send Chloe straight for the finish gate.
          </p>
        </div>

        <div className="topbar__actions">
          <button type="button" className="button button--ghost" onClick={onOpenMenu}>
            <Menu />
            Main Menu
          </button>
          <button type="button" className="button button--ghost" onClick={onOpenCollection}>
            <BookOpen />
            Route Book
          </button>
          <button type="button" className="button button--quiet" onClick={onResetProgress}>
            <RotateCcw />
            Reset Trip
          </button>
        </div>
      </header>

      {notice && (
        <div className={`notice notice--${notice.tone}`}>
          <span>{notice.message}</span>
        </div>
      )}

      <div className="destination-hub">
        <article
          className="screen-card destination-hero-panel"
          style={
            {
              '--screen-accent': selected.theme.accent,
              '--screen-secondary': selected.theme.secondary,
            } as CSSProperties
          }
        >
          <div className="destination-hero-panel__art">
            <div className="destination-hero-panel__scene">
              <span className="destination-hero__route-badge">{selected.routeLabel}</span>
              <span className="destination-hero__country-badge">{selected.country}</span>
              <PostcardScene destinationId={selected.id} className="postcard-scene--hero" />
              <div className="destination-hero-panel__shade" aria-hidden="true" />
            </div>
            <div className="destination-hero-panel__copy">
              <h3>{selected.name}</h3>
              <p className="destination-hero-panel__tagline">{selected.tagline}</p>
              <p className="destination-hero-panel__overview">{selected.overview}</p>
            </div>
          </div>

          <div className="destination-hero-panel__footer">
            <div className="destination-hero-panel__stats">
              <div className="summary-chip">
                <Map />
                <span>Trail</span>
                <strong>{selected.run.finishDistance}m route</strong>
              </div>
              <div className="summary-chip">
                <Stamp />
                <span>Goal</span>
                <strong>{selected.run.targetScore} tandborste</strong>
              </div>
              <div className="summary-chip">
                <Gauge />
                <span>Skill</span>
                <strong>Level {selected.run.difficulty}: {selected.run.skillFocus}</strong>
              </div>
              <div className="summary-chip">
                <Stamp />
                <span>Best</span>
                <strong>{progress.bestScores[selected.id]} pts</strong>
              </div>
            </div>

            <div className="destination-hero-panel__cta">
              <div className="destination-hero-panel__playbox">
                <div className="destination-pack-summary destination-pack-summary--hero">
                  <div className="destination-pack-summary__copy">
                    <span className="eyebrow">Day Pack</span>
                    <strong>{equippedBoost?.name ?? 'Packed light'}</strong>
                    <small>{equippedBoost?.description ?? 'Optional helpers can be packed before the run.'}</small>
                  </div>
                  {progress.equippedBoostId && (
                    <button type="button" className="button button--quiet" onClick={onClearBoost}>
                      <RotateCcw />
                      Clear
                    </button>
                  )}
                </div>
                <div className="destination-pack-grid destination-pack-grid--hero">
                  {boosts.map((boost) => {
                    const amount = progress.boostInventory[boost.id];
                    const active = progress.equippedBoostId === boost.id;

                    return (
                      <button
                        key={boost.id}
                        type="button"
                        className={`destination-pack-card${active ? ' is-active' : ''}${amount <= 0 ? ' is-empty' : ''}`}
                        style={{ '--boost-accent': boost.accent } as CSSProperties}
                        onClick={() => amount > 0 && onEquipBoost(boost.id)}
                        disabled={amount <= 0}
                      >
                        <div className="destination-pack-card__top">
                          <span className="daypack-choice__dot" aria-hidden="true" />
                          <span className="destination-pack-card__count">{amount}x</span>
                        </div>
                        <div className="destination-pack-card__copy">
                          <strong>{boost.name}</strong>
                          <span>{boost.shortLabel}</span>
                          <p>{boost.description}</p>
                        </div>
                        <span className="destination-pack-card__state">
                          {active ? 'Packed' : amount > 0 ? 'Pack' : 'Empty'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="destination-challenge-preview">
                  <div className="destination-challenge-preview__header">
                    <Gauge />
                    <div>
                      <span>Route Skill</span>
                      <strong>{selected.run.challengeSummary}</strong>
                    </div>
                  </div>
                  <div className="destination-challenge-preview__tips">
                    {selected.run.challengeTips.map((tip) => (
                      <span key={tip}>{tip}</span>
                    ))}
                  </div>
                </div>

                <div className="destination-hero-panel__actions">
                  <div className="loadout-chip">
                    <Backpack />
                    <span>Ready</span>
                    <strong>{equippedBoost?.shortLabel ?? 'No pack clipped'}</strong>
                  </div>
                  <button type="button" className="button button--primary" onClick={onPlay}>
                    <Play />
                    Play Route
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside className="destination-sidebar">
          <section className="screen-card destination-sidebar__section">
            <div className="section-heading section-heading--compact destination-stop-header">
              <div>
                <p className="eyebrow">Route Map</p>
                <h3>Pick an open stop.</h3>
              </div>
              <div className="destination-stop-summary">
                <div className="summary-chip">
                  <Stamp />
                  <span>Trail Stamps</span>
                  <strong>{progress.totalWins}</strong>
                </div>
                <div className="summary-chip">
                  <BookOpen />
                  <span>Recipe Cards</span>
                  <strong>{progress.unlockedRecipes.length}/{destinations.length}</strong>
                </div>
              </div>
            </div>

            <div className="destination-stop-list">
              {destinations.map((destination) => {
                const unlocked = progress.unlockedDestinations.includes(destination.id);
                const wins = progress.winsByDestination[destination.id];
                const isSelected = destination.id === selectedDestinationId;
                const isFreshStop = unlocked && wins === 0 && destination.id !== 'maryland';
                const stateLabel = isSelected
                  ? isFreshStop
                    ? 'Next'
                    : 'Live'
                  : isFreshStop
                    ? 'New'
                    : unlocked
                      ? 'Open'
                      : 'Locked';

                return (
                  <button
                    key={destination.id}
                    type="button"
                    className={`destination-stop-card${isSelected ? ' is-selected' : ''}${isFreshStop ? ' is-fresh' : ''}${unlocked ? '' : ' is-locked'}`}
                    style={
                      {
                        '--card-accent': destination.theme.accent,
                        '--card-secondary': destination.theme.secondary,
                      } as CSSProperties
                    }
                    onClick={() => unlocked && onSelectDestination(destination.id)}
                    disabled={!unlocked}
                  >
                    <div className="destination-stop-card__art">
                      <PostcardScene
                        destinationId={destination.id}
                        className="postcard-scene--compact"
                      />
                    </div>
                    <div className="destination-stop-card__body">
                      <div className="destination-stop-card__copy">
                        <span className="destination-card__country">{destination.country}</span>
                        <strong>{destination.routeLabel}</strong>
                        <span className="destination-stop-card__name">{destination.name}</span>
                        <span className="destination-card__challenge">
                          Level {destination.run.difficulty}: {destination.run.skillFocus}
                        </span>
                        <span className="destination-card__status">
                          {isFreshStop
                            ? 'Ready for the first stamp'
                            : unlocked
                              ? `${wins} stamp${wins === 1 ? '' : 's'}`
                              : destination.unlockHint}
                        </span>
                      </div>
                      <span className="destination-stop-card__state">{stateLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
