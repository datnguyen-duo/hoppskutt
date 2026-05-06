import type { CSSProperties } from 'react';
import { Backpack, BookOpen, Map, Play } from 'lucide-react';
import { boosts, boostLookup } from '../../data/boosts';
import { destinationLookup, type Destination } from '../../data/destinations';
import type { BoostId, ProgressState, Reward, RunSummary } from '../../state/types';
import { PostcardScene } from '../PostcardScene';
import { RecipeIllustration } from '../RecipeIllustration';

type RewardScreenProps = {
  progress: ProgressState;
  reward: Reward;
  destination: Destination;
  unlockedDestinationId: Destination['id'] | null;
  summary: RunSummary;
  onContinue: () => void;
  onEquipBoost: (boostId: BoostId) => void;
  onStartNextRun: () => void;
  onOpenCollection: () => void;
};

export function RewardScreen({
  progress,
  reward,
  destination,
  unlockedDestinationId,
  summary,
  onContinue,
  onEquipBoost,
  onStartNextRun,
  onOpenCollection,
}: RewardScreenProps) {
  const unlockedDestination = unlockedDestinationId
    ? destinationLookup[unlockedDestinationId]
    : null;
  const nextDestination = unlockedDestination ?? destination;
  const equippedBoost = progress.equippedBoostId
    ? boostLookup[progress.equippedBoostId]
    : null;
  const recipeUnlocked = reward.kind === 'recipe' ? destination.recipe : null;
  const boostReward = reward.kind === 'boost' ? boostLookup[reward.boostId] : null;
  const cannotLose = destination.run.cannotLose ?? false;
  const availableBoosts = boosts.filter(
    (boost) => progress.boostInventory[boost.id] > 0 || progress.equippedBoostId === boost.id,
  );

  return (
    <section className="screen reward-screen">
      <div className="screen-card reward-card">
        <div
          className="reward-card__hero"
          style={
            {
              '--reward-accent': destination.theme.accent,
              '--reward-secondary': destination.theme.secondary,
            } as CSSProperties
          }
        >
          <span className="reward-card__hero-stamp">
            {cannotLose ? 'Forever Clear' : 'Clear'}
          </span>
          <span className="reward-card__hero-route">{destination.routeLabel}</span>
          <span className="reward-card__hero-clear">{cannotLose ? 'Loved!' : 'Clear!'}</span>
          <PostcardScene destinationId={destination.id} className="postcard-scene--hero" />
        </div>

        <div className="reward-card__intro">
          <p className="eyebrow">{cannotLose ? 'Rainbow Bridge' : 'Clear'}</p>
          <h2>
            {cannotLose
              ? 'Rainbow Bridge is in Chloe\'s book.'
              : `${destination.routeLabel} cleared.`}
          </h2>
          <p>
            {cannotLose
              ? `${summary.score} lights found. Chloe cannot lose here.`
              : `${summary.score}/${summary.target} Tandborste. Best stride x${summary.bestChain}.`}
          </p>
        </div>

        <div className="reward-card__stats">
          <div>
            <span>{cannotLose ? 'Lights' : 'Tandborste'}</span>
            <strong>{summary.score}</strong>
          </div>
          <div>
            <span>Best Stride</span>
            <strong>x{summary.bestChain}</strong>
          </div>
          <div>
            <span>Distance</span>
            <strong>{summary.distanceTravelled}/{summary.finishDistance}m</strong>
          </div>
        </div>

        <div className="reward-card__board">
          <div className="reward-card__main">
            {recipeUnlocked && (
              <div
                className="reward-card__prize reward-card__prize--recipe"
                style={
                  {
                    '--reward-accent': destination.theme.accent,
                    '--reward-secondary': destination.theme.secondary,
                  } as CSSProperties
                }
              >
                <div className="reward-card__prize-copy">
                  <span className="eyebrow">Card</span>
                  <h3>{recipeUnlocked.name}</h3>
                  <p>{recipeUnlocked.flavorText}</p>
                </div>
                <div className="reward-card__prize-art">
                  <RecipeIllustration recipeId={recipeUnlocked.id} />
                </div>
              </div>
            )}

            {boostReward && (
              <div
                className="reward-card__prize reward-card__prize--boost"
                style={{ '--reward-accent': boostReward.accent } as CSSProperties}
              >
                <div className="reward-card__prize-copy">
                  <span className="eyebrow">Helper</span>
                  <h3>{boostReward.name}</h3>
                  <p>{boostReward.description}</p>
                  <small>
                    {progress.boostInventory[boostReward.id]} in Chloe&apos;s pack.
                  </small>
                </div>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => onEquipBoost(boostReward.id)}
                >
                  Clip Helper
                </button>
              </div>
            )}
          </div>

          <div className="reward-card__side">
            {unlockedDestination && (
              <div className="unlock-banner">
                <span className="eyebrow">New Route</span>
                <strong>{unlockedDestination.country} is open</strong>
                <p>{unlockedDestination.tagline}</p>
              </div>
            )}

            <div className="reward-quick-pack">
              <div className="reward-quick-pack__header">
                <Backpack />
                <div>
                  <span className="eyebrow">Helpers</span>
                  <strong>{equippedBoost?.name ?? 'None clipped'}</strong>
                </div>
              </div>
              {availableBoosts.length > 0 ? (
                <div className="reward-quick-pack__grid">
                  {availableBoosts.map((boost) => {
                    const amount = progress.boostInventory[boost.id];
                    const active = progress.equippedBoostId === boost.id;

                    return (
                      <button
                        key={boost.id}
                        type="button"
                        className={`reward-quick-pack__item${active ? ' is-active' : ''}${amount <= 0 ? ' is-empty' : ''}`}
                        style={{ '--boost-accent': boost.accent } as CSSProperties}
                        onClick={() => amount > 0 && onEquipBoost(boost.id)}
                        disabled={amount <= 0}
                      >
                        <span className="daypack-choice__dot" aria-hidden="true" />
                        <strong>{boost.shortLabel}</strong>
                        <span>{amount}x</span>
                        <small>{active ? 'Clipped' : amount > 0 ? 'Clip' : 'Empty'}</small>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-helper-note empty-helper-note--compact">
                  <strong>No helpers yet.</strong>
                  <span>Keep running routes to find some.</span>
                </div>
              )}
            </div>

            <div className="reward-card__actions">
              <button type="button" className="button button--primary" onClick={onStartNextRun}>
                <Play />
                {unlockedDestination
                  ? `Run ${nextDestination.routeLabel}`
                  : 'Run Again'}
              </button>
              <button type="button" className="button button--ghost" onClick={onContinue}>
                <Map />
                Routes
              </button>
              <button type="button" className="button button--ghost" onClick={onOpenCollection}>
                <BookOpen />
                Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
