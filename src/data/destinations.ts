import type { DestinationId, RecipeId } from '../state/types';

export type DestinationTheme = {
  accent: string;
  secondary: string;
  background: string;
  backgroundAlt: string;
  fog: string;
  lightA: string;
  lightB: string;
  surface: string;
  surfaceEdge: string;
  laneGlow: string;
  decoA: string;
  decoB: string;
  glow: string;
  obstacle: string;
  obstacleAlt: string;
  pickup: string;
  spark: string;
};

export type DestinationRecipe = {
  id: RecipeId;
  name: string;
  country: string;
  flavorText: string;
};

export type Destination = {
  id: DestinationId;
  country: string;
  name: string;
  routeLabel: string;
  tagline: string;
  overview: string;
  unlockHint: string;
  run: {
    difficulty: number;
    skillFocus: string;
    finishDistance: number;
    targetScore: number;
    baseSpeed: number;
    trailNote: string;
    challengeSummary: string;
    challengeTips: string[];
  };
  recipe: DestinationRecipe;
  theme: DestinationTheme;
};

export const destinations: Destination[] = [
  {
    id: 'maryland',
    country: 'Maryland',
    name: 'Chesapeake Marsh Route',
    routeLabel: 'Bay Boardwalk',
    tagline: 'Blue crab air, cattails, and a bright boardwalk dash that opens the arcade.',
    overview:
      'Maryland is the soft opener: plank textures, marsh greens, and dockside color that make the first route bright, coastal, and easy to read.',
    unlockHint: 'Start here.',
    run: {
      difficulty: 1,
      skillFocus: 'Open Lanes',
      finishDistance: 250,
      targetScore: 13,
      baseSpeed: 0.9,
      trailNote: 'Open boardwalk. Stay centered, breathe, and grab the easy Tandborste.',
      challengeSummary: 'Wide lanes, single hazards, and generous pickup lines.',
      challengeTips: ['Open center lane', 'Single blockers', 'Easy pickup reads'],
    },
    recipe: {
      id: 'maryland-crab-cake',
      name: 'Crab Cake Picnic',
      country: 'Maryland',
      flavorText:
        'Golden crab cake with lemon and herbs, wrapped up for a breezy Chesapeake lunch stop.',
    },
    theme: {
      accent: '#00a982',
      secondary: '#ffbf32',
      background: '#bff7e8',
      backgroundAlt: '#72dcc0',
      fog: '#83e8d2',
      lightA: '#effff8',
      lightB: '#ffe06d',
      surface: '#31c19c',
      surfaceEdge: '#058a73',
      laneGlow: '#fff7a8',
      decoA: '#28d08a',
      decoB: '#ff6b5f',
      glow: '#ffe65c',
      obstacle: '#b24a39',
      obstacleAlt: '#ffe18a',
      pickup: '#ffd33f',
      spark: '#fff67a',
    },
  },
  {
    id: 'rhode-island',
    country: 'Rhode Island',
    name: 'Newport Cliff Route',
    routeLabel: 'Cliff Walk',
    tagline: 'Salt air, stone edges, and a narrow Atlantic route with clean coastal rhythm.',
    overview:
      'Rhode Island leans into sea-glass blues and sandstone rails, keeping the route tidy while adding a little more side-to-side decision making.',
    unlockHint: 'Stamp Maryland first.',
    run: {
      difficulty: 2,
      skillFocus: 'Fast Mix',
      finishDistance: 460,
      targetScore: 32,
      baseSpeed: 1.26,
      trailNote: 'Cliff walk sprint. Fast mixed reads, tight pickups, and no autopilot lane.',
      challengeSummary: 'Vietnam-speed spawns with mixed hazards and recovery checks.',
      challengeTips: ['Fast decisions', 'Mixed hazards', 'Tighter pickups'],
    },
    recipe: {
      id: 'rhode-island-clam-cakes',
      name: 'Clam Cake Sack',
      country: 'Rhode Island',
      flavorText:
        'Warm clam cakes with a little salt-crisp outside, packed like a paper-bag beach snack.',
    },
    theme: {
      accent: '#1f9be0',
      secondary: '#ffb84d',
      background: '#c7f1ff',
      backgroundAlt: '#74c7ea',
      fog: '#a5e4f7',
      lightA: '#f2fdff',
      lightB: '#ffe0a8',
      surface: '#4fb1dc',
      surfaceEdge: '#247fae',
      laneGlow: '#fff1a4',
      decoA: '#3ab6d8',
      decoB: '#ff7d66',
      glow: '#ffe182',
      obstacle: '#73565a',
      obstacleAlt: '#ffd083',
      pickup: '#ffd33f',
      spark: '#fff67a',
    },
  },
  {
    id: 'colorado',
    country: 'Colorado',
    name: 'Aspen Pass Route',
    routeLabel: 'Switchback Run',
    tagline: 'Pine shade, red earth, and mountain air with a crisp alpine read.',
    overview:
      'Colorado shifts the trip uphill with cooler greens, rock warmth, and broader horizon cues that make the trail feel open without getting muddy.',
    unlockHint: 'Stamp Rhode Island first.',
    run: {
      difficulty: 3,
      skillFocus: 'Rock Mix',
      finishDistance: 500,
      targetScore: 38,
      baseSpeed: 1.32,
      trailNote: 'Switchbacks and rocks. Jump cleanly, then snap into the next safe lane.',
      challengeSummary: 'Vietnam pace plus tighter jump-lane swaps.',
      challengeTips: ['Jump then shift', 'Rock blockers', 'Risky treats'],
    },
    recipe: {
      id: 'colorado-burrito',
      name: 'Green Chile Burrito',
      country: 'Colorado',
      flavorText:
        'A camp-stop burrito with green chile heat, soft tortilla folds, and mountain-town comfort.',
    },
    theme: {
      accent: '#3fb559',
      secondary: '#ff884a',
      background: '#d8f7c4',
      backgroundAlt: '#9fe17e',
      fog: '#bceca4',
      lightA: '#f6ffe8',
      lightB: '#ffd278',
      surface: '#83be55',
      surfaceEdge: '#4d9138',
      laneGlow: '#fff38c',
      decoA: '#41a84d',
      decoB: '#d86d39',
      glow: '#ffe45f',
      obstacle: '#9b5433',
      obstacleAlt: '#ffd987',
      pickup: '#ffd33f',
      spark: '#fff67a',
    },
  },
  {
    id: 'greece',
    country: 'Greece',
    name: 'Cyclades Step Route',
    routeLabel: 'Island Steps',
    tagline: 'White walls, warm stone, and sea-bright color on a clean terrace run.',
    overview:
      'Greece turns the route into sun-washed steps and blue-window geometry, keeping everything bright, airy, and sharply readable.',
    unlockHint: 'Stamp Colorado first.',
    run: {
      difficulty: 4,
      skillFocus: 'Step Combos',
      finishDistance: 500,
      targetScore: 38,
      baseSpeed: 1.3,
      trailNote: 'Island steps. Hop cleanly, then use the next beat to recover and line up the treat.',
      challengeSummary: 'Step combos with recovery beats and readable raised pickups.',
      challengeTips: ['Hop then recover', 'Readable treats', 'Combo training'],
    },
    recipe: {
      id: 'greece-spanakopita',
      name: 'Spanakopita Fold',
      country: 'Greece',
      flavorText:
        'Flaky spinach-and-feta pastry folded into a neat square for a sunny island snack break.',
    },
    theme: {
      accent: '#1778ff',
      secondary: '#ffc447',
      background: '#dff7ff',
      backgroundAlt: '#8bd5ff',
      fog: '#bbeaff',
      lightA: '#f6fdff',
      lightB: '#ffdf8b',
      surface: '#f0d7a2',
      surfaceEdge: '#d2a85f',
      laneGlow: '#ffffff',
      decoA: '#197bff',
      decoB: '#69c474',
      glow: '#ffe45f',
      obstacle: '#b77a3f',
      obstacleAlt: '#fff2c7',
      pickup: '#ffd33f',
      spark: '#fff67a',
    },
  },
  {
    id: 'sweden',
    country: 'Sweden',
    name: 'Archipelago Pine Route',
    routeLabel: 'Red Cabin Loop',
    tagline: 'Pine shade, cool water, and calm red-cabin landmarks along the coast.',
    overview:
      'Sweden cools the palette down with forest greens, painted timber accents, and a quieter route rhythm that still feels playful.',
    unlockHint: 'Stamp Greece first.',
    run: {
      difficulty: 5,
      skillFocus: 'Endurance',
      finishDistance: 570,
      targetScore: 50,
      baseSpeed: 1.44,
      trailNote: 'Long forest loop. Faster paired blockers, scarce treats, and little recovery room.',
      challengeSummary: 'Longer endurance pressure with scarce pickup routes.',
      challengeTips: ['Endurance pace', 'Paired blockers', 'Protect paws'],
    },
    recipe: {
      id: 'sweden-kanelbulle',
      name: 'Kanelbulle Break',
      country: 'Sweden',
      flavorText:
        'A soft cinnamon bun with pearl sugar, packed like a fika stop between ferry and forest.',
    },
    theme: {
      accent: '#2ca66f',
      secondary: '#ff5f4f',
      background: '#d7f7ee',
      backgroundAlt: '#94dfc8',
      fog: '#b6ebdc',
      lightA: '#f5fff9',
      lightB: '#ffd2a2',
      surface: '#5bbd83',
      surfaceEdge: '#2a8c61',
      laneGlow: '#fff1a0',
      decoA: '#228b57',
      decoB: '#ed4f45',
      glow: '#ffe55c',
      obstacle: '#704a40',
      obstacleAlt: '#ffd7a0',
      pickup: '#ffd33f',
      spark: '#fff67a',
    },
  },
  {
    id: 'vietnam',
    country: 'Vietnam',
    name: 'Lantern River Route',
    routeLabel: 'Old Quarter Glide',
    tagline: 'Lantern light, river rails, and warm market color in the final run.',
    overview:
      'Vietnam closes the trip with lantern glow, painted shutters, and lively riverside color that still keeps the lane language clear.',
    unlockHint: 'Stamp Sweden first.',
    run: {
      difficulty: 6,
      skillFocus: 'Finale Rush',
      finishDistance: 620,
      targetScore: 58,
      baseSpeed: 1.5,
      trailNote: 'Lantern finale. The route is fast, the treats are risky, and every recovery matters.',
      challengeSummary: 'Fastest spawns, chained blockers, and precision Tandborste reads.',
      challengeTips: ['Fastest pace', 'Chained hazards', 'Precision treats'],
    },
    recipe: {
      id: 'vietnam-banh-mi',
      name: 'Banh Mi Pack',
      country: 'Vietnam',
      flavorText:
        'A crisp baguette packed with herbs, pickles, and savory heat for a bright street-side reset.',
    },
    theme: {
      accent: '#00a86f',
      secondary: '#ffb12d',
      background: '#d9ffe5',
      backgroundAlt: '#8ee4a6',
      fog: '#b7efc8',
      lightA: '#f5fff5',
      lightB: '#ffd68a',
      surface: '#4fc879',
      surfaceEdge: '#19894f',
      laneGlow: '#fff28a',
      decoA: '#159a65',
      decoB: '#ff7148',
      glow: '#ffe55c',
      obstacle: '#8c4a31',
      obstacleAlt: '#ffd28b',
      pickup: '#ffd33f',
      spark: '#fff67a',
    },
  },
];

export const destinationLookup = Object.fromEntries(
  destinations.map((destination) => [destination.id, destination]),
) as Record<DestinationId, Destination>;
