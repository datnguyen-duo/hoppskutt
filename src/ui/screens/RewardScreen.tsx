import type { CSSProperties } from 'react';
import { boostLookup } from '../../data/boosts';
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
  onEquipRewardBoost: (boostId: BoostId) => void;
  onOpenCollection: () => void;
};

export function RewardScreen({
  progress,
  reward,
  destination,
  unlockedDestinationId,
  summary,
  onContinue,
  onEquipRewardBoost,
  onOpenCollection,
}: RewardScreenProps) {
  const unlockedDestination = unlockedDestinationId
    ? destinationLookup[unlockedDestinationId]
    : null;
  const recipeUnlocked = reward.kind === 'recipe' ? destination.recipe : null;
  const boostReward = reward.kind === 'boost' ? boostLookup[reward.boostId] : null;

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
          <span className="reward-card__hero-stamp">Trail Stamp Earned</span>
          <span className="reward-card__hero-route">{destination.routeLabel}</span>
          <PostcardScene destinationId={destination.id} className="postcard-scene--hero" />
        </div>

        <div className="reward-card__intro">
          <p className="eyebrow">Trail Stamp Earned</p>
          <h2>{destination.name} stamped into Chloe&apos;s route book.</h2>
          <p>
            {summary.score}/{summary.target} tandborste, best chain x{summary.bestChain}, and{' '}
            {summary.stumbles} stumble{summary.stumbles === 1 ? '' : 's'}.
          </p>
        </div>

        <div className="reward-card__stats">
          <div>
            <span>Tandborste</span>
            <strong>{summary.score}</strong>
          </div>
          <div>
            <span>Best Stride</span>
            <strong>x{summary.bestChain}</strong>
          </div>
          <div>
            <span>Route Finish</span>
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
                  <span className="eyebrow">Recipe Card</span>
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
                  <span className="eyebrow">Day Pack Drop</span>
                  <h3>{boostReward.name}</h3>
                  <p>{boostReward.description}</p>
                  <small>
                    Inventory now: {progress.boostInventory[boostReward.id]} available charge
                    {progress.boostInventory[boostReward.id] === 1 ? '' : 's'}.
                  </small>
                </div>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => onEquipRewardBoost(boostReward.id)}
                >
                  Pack For Next Stop
                </button>
              </div>
            )}
          </div>

          <div className="reward-card__side">
            {unlockedDestination && (
              <div className="unlock-banner">
                <span className="eyebrow">New Stop</span>
                <strong>{unlockedDestination.country} unlocked</strong>
                <p>{unlockedDestination.tagline}</p>
              </div>
            )}

            <div className="reward-card__actions">
              <button type="button" className="button button--ghost" onClick={onOpenCollection}>
                Open Route Book
              </button>
              <button type="button" className="button button--primary" onClick={onContinue}>
                Keep Rolling
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
