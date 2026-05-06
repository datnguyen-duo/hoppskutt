import type { CSSProperties } from 'react';
import { ArrowLeft, Backpack, BookOpen, Menu, RotateCcw, Stamp } from 'lucide-react';
import { boosts, boostLookup } from '../../data/boosts';
import { destinations } from '../../data/destinations';
import type { BoostId, ProgressState } from '../../state/types';
import { PostcardScene } from '../PostcardScene';
import { RecipeIllustration } from '../RecipeIllustration';

type CollectionScreenProps = {
  progress: ProgressState;
  onOpenMenu: () => void;
  onBack: () => void;
  onEquipBoost: (boostId: BoostId) => void;
  onClearBoost: () => void;
};

export function CollectionScreen({
  progress,
  onOpenMenu,
  onBack,
  onEquipBoost,
  onClearBoost,
}: CollectionScreenProps) {
  const equippedBoost = progress.equippedBoostId
    ? boostLookup[progress.equippedBoostId]
    : null;
  const helperCount = boosts.reduce(
    (total, boost) => total + progress.boostInventory[boost.id],
    0,
  );

  return (
    <section className="screen collection-screen">
      <header className="topbar topbar--collection">
        <div>
          <p className="eyebrow">Book</p>
          <h2>Chloe&apos;s book.</h2>
        </div>
        <div className="topbar__actions">
          <button type="button" className="button button--ghost" onClick={onOpenMenu}>
            <Menu />
            Home
          </button>
          <button type="button" className="button button--ghost" onClick={onBack}>
            <ArrowLeft />
            Routes
          </button>
        </div>
      </header>

      <div className="collection-board">
        <section className="screen-card passport-cover">
          <span className="chloe-pin chloe-pin--passport" aria-hidden="true" />
          <div className="passport-cover__copy">
            <p className="eyebrow">Arcade Album</p>
            <h3>Chloe&apos;s clears, cards, and helpers.</h3>
            <p>A small book for the trip.</p>
          </div>

          <div className="passport-summary">
            <div className="summary-chip">
              <Stamp />
              <span>Clears</span>
              <strong>{progress.totalWins}</strong>
            </div>
            <div className="summary-chip">
              <BookOpen />
              <span>Routes</span>
              <strong>{progress.unlockedDestinations.length}/{destinations.length}</strong>
            </div>
            <div className="summary-chip">
              <BookOpen />
              <span>Cards</span>
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
                <p className="eyebrow">Cards</p>
                <h3>Cards Chloe has found.</h3>
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
                      <strong>{unlocked ? destination.recipe.name : 'Hidden Card'}</strong>
                      {unlocked ? (
                        <RecipeIllustration recipeId={destination.recipe.id} className="recipe-illustration--mini" />
                      ) : (
                        <div className="recipe-lock-plate">Stamp Pending</div>
                      )}
                      <p>
                        {unlocked
                          ? destination.recipe.flavorText
                          : `Clear ${destination.country}.`}
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
                <p className="eyebrow">Helpers</p>
                <h3>
                  {helperCount > 0
                    ? 'Clip one before a route.'
                    : 'Helpers show up after clears.'}
                </h3>
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
                      <span>{active ? 'Clipped' : amount > 0 ? 'Clip' : 'Not found'}</span>
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
