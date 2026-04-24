import type { DestinationId, RecipeId } from '../state/types';

export const heroArtPath = '/assets/generated/game-2d/chloe-hero-keyart-oil-canvas.webp';

export const postcardArtPaths: Record<DestinationId, string> = {
  maryland: '/assets/generated/game-2d/maryland-postcard-oil-canvas.webp',
  'rhode-island': '/assets/generated/game-2d/rhode-island-postcard-oil-canvas.webp',
  colorado: '/assets/generated/game-2d/colorado-postcard-oil-canvas.webp',
  greece: '/assets/generated/game-2d/greece-postcard-oil-canvas.webp',
  sweden: '/assets/generated/game-2d/sweden-postcard-oil-canvas.webp',
  vietnam: '/assets/generated/game-2d/vietnam-postcard-oil-canvas.webp',
};

export const recipeArtPaths: Record<RecipeId, string> = {
  'maryland-crab-cake': '/assets/generated/game-2d/maryland-crab-cake-oil-canvas.webp',
  'rhode-island-clam-cakes': '/assets/generated/game-2d/rhode-island-clam-cakes-oil-canvas.webp',
  'colorado-burrito': '/assets/generated/game-2d/colorado-burrito-oil-canvas.webp',
  'greece-spanakopita': '/assets/generated/game-2d/greece-spanakopita-oil-canvas.webp',
  'sweden-kanelbulle': '/assets/generated/game-2d/sweden-kanelbulle-oil-canvas.webp',
  'vietnam-banh-mi': '/assets/generated/game-2d/vietnam-banh-mi-oil-canvas.webp',
};
