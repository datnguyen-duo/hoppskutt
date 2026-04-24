import type { DestinationId } from '../state/types';
import { postcardArtPaths } from '../assets/artPaths';

type PostcardSceneProps = {
  destinationId: DestinationId;
  className?: string;
};

export function PostcardScene({ destinationId, className }: PostcardSceneProps) {
  return (
    <div className={`postcard-scene postcard-scene--${destinationId}${className ? ` ${className}` : ''}`}>
      <img
        src={postcardArtPaths[destinationId]}
        alt=""
        role="presentation"
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
