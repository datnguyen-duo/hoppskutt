import type { RecipeId } from '../state/types';
import { recipeArtPaths } from '../assets/artPaths';

type RecipeIllustrationProps = {
  recipeId: RecipeId;
  locked?: boolean;
  className?: string;
};

export function RecipeIllustration({
  recipeId,
  locked = false,
  className,
}: RecipeIllustrationProps) {
  return (
    <div className={`recipe-illustration${locked ? ' is-locked' : ''}${className ? ` ${className}` : ''}`}>
      <img
        src={recipeArtPaths[recipeId]}
        alt=""
        role="presentation"
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
