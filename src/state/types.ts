export const destinationIds = [
  'maryland',
  'moco-police-station',
  'rhode-island',
  'colorado',
  'greece',
  'sweden',
  'vietnam',
  'rainbow-bridge',
] as const;

export const recipeIds = [
  'maryland-crab-cake',
  'moco-station-badge',
  'rhode-island-clam-cakes',
  'colorado-burrito',
  'greece-spanakopita',
  'sweden-kanelbulle',
  'vietnam-banh-mi',
  'rainbow-bridge-sunbeam',
] as const;

export const boostIds = [
  'quick-paws',
  'spring-collar',
  'lucky-bandana',
  'tailwind-tag',
] as const;

export type DestinationId = (typeof destinationIds)[number];
export type RecipeId = (typeof recipeIds)[number];
export type BoostId = (typeof boostIds)[number];

export type Reward =
  | {
      kind: 'recipe';
      recipeId: RecipeId;
      destinationId: DestinationId;
    }
  | {
      kind: 'boost';
      boostId: BoostId;
      destinationId: DestinationId;
    };

export type ProgressState = {
  unlockedDestinations: DestinationId[];
  unlockedRecipes: RecipeId[];
  boostInventory: Record<BoostId, number>;
  equippedBoostId: BoostId | null;
  winsByDestination: Record<DestinationId, number>;
  bestScores: Record<DestinationId, number>;
  totalWins: number;
};

export type RunSummary = {
  destinationId: DestinationId;
  won: boolean;
  score: number;
  target: number;
  bestChain: number;
  stumbles: number;
  activeBoostId: BoostId | null;
  finishDistance: number;
  distanceTravelled: number;
  reachedFinish: boolean;
};
