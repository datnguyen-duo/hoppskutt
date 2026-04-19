import type { DestinationId } from '../state/types';

type PostcardSceneProps = {
  destinationId: DestinationId;
  className?: string;
};

const postcardSources: Record<DestinationId, string> = {
  maryland: '/assets/generated/maryland-postcard.png',
  'rhode-island': '/assets/generated/rhode-island-postcard.png',
  colorado: '/assets/generated/colorado-postcard.png',
  greece: '/assets/generated/greece-postcard.png',
  sweden: '/assets/generated/sweden-postcard.png',
  vietnam: '/assets/generated/vietnam-postcard.png',
};

export function PostcardScene({ destinationId, className }: PostcardSceneProps) {
  return (
    <div className={`postcard-scene postcard-scene--${destinationId}${className ? ` ${className}` : ''}`}>
      <img
        src={postcardSources[destinationId]}
        alt=""
        role="presentation"
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
