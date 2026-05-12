import type { DestinationId, RecipeId } from '../state/types';

const generatedArtBasePath = '/assets/generated/sticker-arcade';

export const heroArtPath = `${generatedArtBasePath}/chloe-hero-sticker-arcade-wide-silver-collar.png`;
export const heroPortraitArtPath = `${generatedArtBasePath}/chloe-hero-sticker-arcade-portrait-silver-collar.png`;

export const postcardArtPaths: Record<DestinationId, string> = {
  maryland: `${generatedArtBasePath}/maryland-kerwood-greenway-postcard-sticker-arcade.png`,
  'moco-police-station': `${generatedArtBasePath}/moco-police-station-postcard-sticker-arcade.png`,
  'rhode-island': `${generatedArtBasePath}/rhode-island-postcard-sticker-arcade.png`,
  colorado: `${generatedArtBasePath}/colorado-postcard-sticker-arcade.png`,
  greece: `${generatedArtBasePath}/greece-postcard-sticker-arcade.png`,
  sweden: `${generatedArtBasePath}/sweden-postcard-sticker-arcade.png`,
  vietnam: `${generatedArtBasePath}/vietnam-postcard-sticker-arcade.png`,
  'rainbow-bridge': `${generatedArtBasePath}/rainbow-bridge-postcard-sticker-arcade.png`,
};

export const recipeArtPaths: Record<RecipeId, string> = {
  'maryland-crab-cake': `${generatedArtBasePath}/maryland-crab-cake-sticker-arcade.png`,
  'moco-station-badge': `${generatedArtBasePath}/moco-police-station-card-sticker-arcade.png`,
  'rhode-island-clam-cakes': `${generatedArtBasePath}/rhode-island-clam-cakes-sticker-arcade.png`,
  'colorado-burrito': `${generatedArtBasePath}/colorado-burrito-sticker-arcade.png`,
  'greece-spanakopita': `${generatedArtBasePath}/greece-spanakopita-sticker-arcade.png`,
  'sweden-kanelbulle': `${generatedArtBasePath}/sweden-kanelbulle-sticker-arcade.png`,
  'vietnam-banh-mi': `${generatedArtBasePath}/vietnam-banh-mi-sticker-arcade.png`,
  'rainbow-bridge-sunbeam': `${generatedArtBasePath}/rainbow-bridge-postcard-sticker-arcade.png`,
};
