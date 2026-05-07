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
  const selectedCannotLose = selected.run.cannotLose ?? false;
  const equippedBoost = progress.equippedBoostId
    ? boostLookup[progress.equippedBoostId]
    : null;
  const availableBoosts = boosts.filter(
    (boost) => progress.boostInventory[boost.id] > 0 || progress.equippedBoostId === boost.id,
  );
  const hasHelperChoices = availableBoosts.length > 0;
  const helperName = equippedBoost?.name ?? (hasHelperChoices ? 'No helper' : 'No helpers yet');
  const helperNote =
    equippedBoost?.description ??
    (hasHelperChoices ? 'Run without one or pick a helper.' : 'Helpers show up after clears.');
  const routeCards = destinations.map((destination) => {
    const unlocked = progress.unlockedDestinations.includes(destination.id);
    const wins = progress.winsByDestination[destination.id];
    const isSelected = destination.id === selectedDestinationId;
    const isFreshStop = unlocked && wins === 0 && destination.id !== 'maryland';
    const stateLabel = isSelected
      ? isFreshStop
        ? 'Next'
        : 'Selected'
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
        aria-current={isSelected ? 'true' : undefined}
      >
        <span className="destination-stop-card__node">Lv. {destination.run.difficulty}</span>
        <div className="destination-stop-card__art">
          <PostcardScene destinationId={destination.id} className="postcard-scene--compact" />
        </div>
        <div className="destination-stop-card__body">
          <div className="destination-stop-card__copy">
            <span className="destination-card__country">{destination.country}</span>
            <strong>{destination.routeLabel}</strong>
            <span className="destination-stop-card__name">{destination.name}</span>
            <span className="destination-card__challenge">{destination.run.skillFocus}</span>
            <span className="destination-card__status">
              {isFreshStop
                ? 'First clear ready'
                : unlocked
                  ? `${wins} clear${wins === 1 ? '' : 's'}`
                  : destination.unlockHint}
            </span>
          </div>
          <span className="destination-stop-card__state">{stateLabel}</span>
        </div>
      </button>
    );
  });

  return (
    <section className="screen destination-screen destination-screen--hub">
      <header className="topbar topbar--destination destination-topbar">
        <div className="destination-topbar__main">
          <div className="destination-topbar__copy">
            <p className="eyebrow">Routes</p>
            <h2>Choose a route.</h2>
            <p>Pick a stop, pack a helper, then run.</p>
          </div>

          <div className="topbar__actions">
            <button type="button" className="button button--ghost" onClick={onOpenMenu}>
              <Menu />
              Home
            </button>
            <button type="button" className="button button--ghost" onClick={onOpenCollection}>
              <BookOpen />
              Book
            </button>
            <button type="button" className="button button--quiet" onClick={onResetProgress}>
              <RotateCcw />
              Reset
            </button>
          </div>
        </div>

        <div className="destination-route-track destination-route-track--top" aria-label="Route path">
          <div className="destination-stop-list">{routeCards}</div>
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
            </div>
          </div>

          <div className="destination-hero-panel__footer">
            <div className="destination-route-badges" aria-label="Selected route details">
              <div className="destination-route-badge">
                <Map />
                <span>Distance</span>
                <strong>{selected.run.finishDistance}m</strong>
              </div>
              <div className="destination-route-badge">
                <Stamp />
                <span>{selectedCannotLose ? 'Memory' : 'Goal'}</span>
                <strong>
                  {selectedCannotLose
                    ? 'Cannot lose'
                    : `${selected.run.targetScore} tandborste`}
                </strong>
              </div>
              <div className="destination-route-badge">
                <Gauge />
                <span>Level</span>
                <strong>Lv. {selected.run.difficulty}</strong>
              </div>
              <div className="destination-route-badge">
                <Stamp />
                <span>Best</span>
                <strong>{progress.bestScores[selected.id]} pts</strong>
              </div>
            </div>

            <div className="destination-hero-panel__cta">
              <div className="destination-hero-panel__playbox">
                <div className="destination-play-card">
                  <div className="destination-loadout-slot">
                    <Backpack />
                    <div className="destination-loadout-slot__copy">
                      <span className="eyebrow">Helper Slot</span>
                      <strong>{helperName}</strong>
                      <small>{helperNote}</small>
                    </div>
                    {progress.equippedBoostId && (
                      <button type="button" className="button button--quiet" onClick={onClearBoost}>
                        <RotateCcw />
                        Clear
                      </button>
                    )}
                  </div>
                  <button type="button" className="button button--primary" onClick={onPlay}>
                    <Play />
                    Run Route
                  </button>
                </div>

                <div className="destination-challenge-preview">
                  <div className="destination-challenge-preview__header">
                    <Gauge />
                    <div>
                      <span>Run Feel</span>
                      <strong>{selected.run.challengeSummary}</strong>
                    </div>
                  </div>
                  <div className="destination-challenge-preview__tips">
                    {selected.run.challengeTips.map((tip) => (
                      <span key={tip}>{tip}</span>
                    ))}
                  </div>
                </div>

                {hasHelperChoices && (
                  <div className="destination-pack-grid destination-pack-grid--hero">
                    {availableBoosts.map((boost) => {
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
                )}
              </div>
            </div>
          </div>
        </article>

      </div>
    </section>
  );
}
