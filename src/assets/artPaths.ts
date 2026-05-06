import type { DestinationId, RecipeId } from '../state/types';

const stickerArcadeBasePath = '/assets/generated/sticker-arcade';

export const heroArtPath = `${stickerArcadeBasePath}/chloe-hero-sticker-arcade-wide-silver-collar.png`;
export const heroPortraitArtPath = `${stickerArcadeBasePath}/chloe-hero-sticker-arcade-portrait-silver-collar.png`;

export const postcardArtPaths: Record<DestinationId, string> = {
  maryland: `${stickerArcadeBasePath}/maryland-kerwood-postcard-sticker-arcade.png`,
  'rhode-island': `${stickerArcadeBasePath}/rhode-island-postcard-sticker-arcade.png`,
  colorado: `${stickerArcadeBasePath}/colorado-postcard-sticker-arcade.png`,
  greece: `${stickerArcadeBasePath}/greece-postcard-sticker-arcade.png`,
  sweden: `${stickerArcadeBasePath}/sweden-postcard-sticker-arcade.png`,
  vietnam: `${stickerArcadeBasePath}/vietnam-postcard-sticker-arcade.png`,
  'rainbow-bridge': `${stickerArcadeBasePath}/rainbow-bridge-postcard-sticker-arcade.png`,
};

export const recipeArtPaths: Record<RecipeId, string> = {
  'maryland-crab-cake': `${stickerArcadeBasePath}/maryland-crab-cake-sticker-arcade.png`,
  'rhode-island-clam-cakes': `${stickerArcadeBasePath}/rhode-island-clam-cakes-sticker-arcade.png`,
  'colorado-burrito': `${stickerArcadeBasePath}/colorado-burrito-sticker-arcade.png`,
  'greece-spanakopita': `${stickerArcadeBasePath}/greece-spanakopita-sticker-arcade.png`,
  'sweden-kanelbulle': `${stickerArcadeBasePath}/sweden-kanelbulle-sticker-arcade.png`,
  'vietnam-banh-mi': `${stickerArcadeBasePath}/vietnam-banh-mi-sticker-arcade.png`,
  'rainbow-bridge-sunbeam': `${stickerArcadeBasePath}/rainbow-bridge-postcard-sticker-arcade.png`,
};
