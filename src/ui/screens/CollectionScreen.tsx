import type { CSSProperties } from 'react';
import { ArrowLeft, BookOpen, Backpack, RotateCcw, Stamp } from 'lucide-react';
import { boosts, boostLookup } from '../../data/boosts';
import { destinations } from '../../data/destinations';
import type { BoostId, ProgressState } from '../../state/types';
import { PostcardScene } from '../PostcardScene';
import { RecipeIllustration } from '../RecipeIllustration';

type CollectionScreenProps = {
  progress: ProgressState;
  onBack: () => void;
  onEquipBoost: (boostId: BoostId) => void;
  onClearBoost: () => void;
};

export function CollectionScreen({
  progress,
  onBack,
  onEquipBoost,
  onClearBoost,
}: CollectionScreenProps) {
  const equippedBoost = progress.equippedBoostId
    ? boostLookup[progress.equippedBoostId]
    : null;

  return (
    <section className="screen collection-screen">
      <header className="topbar topbar--collection">
        <div>
          <p className="eyebrow">Route Book</p>
          <h2>Chloe&apos;s route book.</h2>
        </div>
        <button type="button" className="button button--ghost" onClick={onBack}>
          <ArrowLeft />
          Trail Board
        </button>
      </header>

      <div className="collection-board">
        <section className="screen-card passport-cover">
          <span className="chloe-pin chloe-pin--passport" aria-hidden="true" />
          <div className="passport-cover__copy">
            <p className="eyebrow">Passport Cover</p>
            <h3>Stamps, snack cards, and route helpers all in one book.</h3>
            <p>Keep the whole trip readable at a glance.</p>
          </div>

          <div className="passport-summary">
            <div className="summary-chip">
              <Stamp />
              <span>Trail Stamps</span>
              <strong>{progress.totalWins}</strong>
            </div>
            <div className="summary-chip">
              <BookOpen />
              <span>Stops</span>
              <strong>{progress.unlockedDestinations.length}/{destinations.length}</strong>
            </div>
            <div className="summary-chip">
              <BookOpen />
              <span>Recipes</span>
              <strong>{progress.unlockedRecipes.length}/{destinations.length}</strong>
            </div>
            <div className="summary-chip">
              <Backpack />
              <span>Packed</span>
              <strong>{equippedBoost?.shortLabel ?? 'None'}</strong>
            </div>
          </div>
        </section>

        <div className="collection-layout">
          <article className="screen-card recipe-shelf">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">Snack Cards</p>
                <h3>{destinations.length} keepsakes, one shelf.</h3>
              </div>
            </div>

            <div className="recipe-shelf__grid">
              {destinations.map((destination) => {
                const unlocked = progress.unlockedRecipes.includes(destination.recipe.id);

                return (
                  <article
                    key={destination.recipe.id}
                    className={`recipe-shelf-card${unlocked ? '' : ' is-locked'}`}
                    style={
                      {
                        '--recipe-accent': destination.theme.accent,
                        '--recipe-secondary': destination.theme.secondary,
                      } as CSSProperties
                    }
                  >
                    <div className="recipe-shelf-card__scene">
                      <span className="recipe-card__stamp">
                        {unlocked ? 'Filed' : 'Pending'}
                      </span>
                      <PostcardScene destinationId={destination.id} className="postcard-scene--compact" />
                    </div>
                    <div className="recipe-shelf-card__body">
                      <span className="recipe-card__country">{destination.recipe.country}</span>
                      <strong>{unlocked ? destination.recipe.name : 'Hidden Snack Card'}</strong>
                      {unlocked ? (
                        <RecipeIllustration recipeId={destination.recipe.id} className="recipe-illustration--mini" />
                      ) : (
                        <div className="recipe-lock-plate">Stamp Pending</div>
                      )}
                      <p>
                        {unlocked
                          ? destination.recipe.flavorText
                          : `Earn a clean stamp in ${destination.country} to unlock this keepsake.`}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </article>

          <aside className="screen-card kit-panel collection-pack">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">Day Pack Notes</p>
                <h3>Pack helpers for the next route.</h3>
              </div>
              {progress.equippedBoostId && (
                <button type="button" className="button button--quiet" onClick={onClearBoost}>
                  <RotateCcw />
                  Clear
                </button>
              )}
            </div>

            <div className="kit-list">
              {boosts.map((boost) => {
                const amount = progress.boostInventory[boost.id];
                const active = progress.equippedBoostId === boost.id;

                return (
                  <button
                    key={boost.id}
                    type="button"
                    className={`kit-item${active ? ' is-active' : ''}${amount <= 0 ? ' is-empty' : ''}`}
                    onClick={() => onEquipBoost(boost.id)}
                    disabled={amount <= 0}
                  >
                    <div
                      className="kit-item__swatch"
                      style={{ '--kit-accent': boost.accent } as CSSProperties}
                      aria-hidden="true"
                    />
                    <div className="kit-item__copy">
                      <strong>{boost.name}</strong>
                      <span>{boost.flavorText}</span>
                    </div>
                    <div className="kit-item__actions">
                      <span>{amount}x</span>
                      <span>{active ? 'Packed' : 'Pack'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
