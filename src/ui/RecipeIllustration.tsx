import type { RecipeId } from '../state/types';

type RecipeIllustrationProps = {
  recipeId: RecipeId;
  locked?: boolean;
  className?: string;
};

const illustrationSources: Record<RecipeId, string> = {
  'maryland-crab-cake': '/assets/generated/maryland-crab-cake.png',
  'rhode-island-clam-cakes': '/assets/generated/rhode-island-clam-cakes.png',
  'colorado-burrito': '/assets/generated/colorado-burrito.png',
  'greece-spanakopita': '/assets/generated/greece-spanakopita.png',
  'sweden-kanelbulle': '/assets/generated/sweden-kanelbulle.png',
  'vietnam-banh-mi': '/assets/generated/vietnam-banh-mi.png',
};

export function RecipeIllustration({
  recipeId,
  locked = false,
  className,
}: RecipeIllustrationProps) {
  return (
    <div className={`recipe-illustration${locked ? ' is-locked' : ''}${className ? ` ${className}` : ''}`}>
      <img
        src={illustrationSources[recipeId]}
        alt=""
        role="presentation"
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
