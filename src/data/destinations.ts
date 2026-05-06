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
    cannotLose?: boolean;
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
    name: 'Kerwood Home Route',
    routeLabel: 'Home Loop',
    tagline: 'Silver Spring roads, trees, and park light.',
    overview: "Chloe's first run stays close to home: sidewalks, fields, flowers, and an easy park path.",
    unlockHint: 'Start here.',
    run: {
      difficulty: 1,
      skillFocus: 'Home Loop',
      finishDistance: 250,
      targetScore: 13,
      baseSpeed: 0.9,
      trailNote: 'Follow the home-road lanes and grab Tandborste.',
      challengeSummary: 'Wide roads. Gentle pace. Easy start.',
      challengeTips: ['Wide lanes', 'Park signs', 'Gentle start'],
    },
    recipe: {
      id: 'maryland-crab-cake',
      name: 'Maryland Picnic',
      country: 'Maryland',
      flavorText: "A small home-route treat for Chloe's book.",
    },
    theme: {
      accent: '#1f9b6b',
      secondary: '#d3dee3',
      background: '#cdf4db',
      backgroundAlt: '#8fd7ae',
      fog: '#bfead0',
      lightA: '#f7fff6',
      lightB: '#dce7ea',
      surface: '#66b97f',
      surfaceEdge: '#357a56',
      laneGlow: '#fbf0b9',
      decoA: '#2da267',
      decoB: '#f06f76',
      glow: '#e8f6f7',
      obstacle: '#4b6d5a',
      obstacleAlt: '#d7dfe2',
      pickup: '#ffd33f',
      spark: '#fff67a',
    },
  },
  {
    id: 'rhode-island',
    country: 'Rhode Island',
    name: 'Newport Cliff Route',
    routeLabel: 'Cliff Walk',
    tagline: 'A quicker cliff-side run.',
    overview: 'Sea air, stone rails, and a little more lane switching.',
    unlockHint: 'Clear Maryland.',
    run: {
      difficulty: 2,
      skillFocus: 'Fast Mix',
      finishDistance: 460,
      targetScore: 32,
      baseSpeed: 1.26,
      trailNote: 'Move sooner. The lanes change faster here.',
      challengeSummary: 'Faster lanes with tighter pickups.',
      challengeTips: ['Move early', 'Watch the sides', 'Tighter pickups'],
    },
    recipe: {
      id: 'rhode-island-clam-cakes',
      name: 'Clam Cake Sack',
      country: 'Rhode Island',
      flavorText: "Warm beach snacks for Chloe's book.",
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
    tagline: 'Mountain air and rockier lanes.',
    overview: 'A bright uphill run with more hopping and sharper turns.',
    unlockHint: 'Clear Rhode Island.',
    run: {
      difficulty: 3,
      skillFocus: 'Rock Mix',
      finishDistance: 500,
      targetScore: 38,
      baseSpeed: 1.32,
      trailNote: 'Hop the rocks, then slide back into lane.',
      challengeSummary: 'More jumps and quick lane changes.',
      challengeTips: ['Hop cleanly', 'Shift after jumps', 'Watch rocks'],
    },
    recipe: {
      id: 'colorado-burrito',
      name: 'Green Chile Burrito',
      country: 'Colorado',
      flavorText: 'A warm camp snack from the mountain stop.',
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
    tagline: 'Sunny steps and clean jumps.',
    overview: 'White walls, blue windows, and pickups that ask for tidy hops.',
    unlockHint: 'Clear Colorado.',
    run: {
      difficulty: 4,
      skillFocus: 'Step Combos',
      finishDistance: 500,
      targetScore: 38,
      baseSpeed: 1.3,
      trailNote: 'Hop the steps. Land, breathe, line up the next one.',
      challengeSummary: 'Step patterns with time to recover.',
      challengeTips: ['Hop steps', 'Recover', 'Line up treats'],
    },
    recipe: {
      id: 'greece-spanakopita',
      name: 'Spanakopita Fold',
      country: 'Greece',
      flavorText: 'A flaky sunny card for Chloe.',
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
    tagline: 'Forest rhythm, longer run.',
    overview: 'Pines, red cabins, and a longer stretch to hold focus.',
    unlockHint: 'Clear Greece.',
    run: {
      difficulty: 5,
      skillFocus: 'Endurance',
      finishDistance: 570,
      targetScore: 50,
      baseSpeed: 1.44,
      trailNote: 'Longer run. Pick safe lanes first, treats second.',
      challengeSummary: 'Longer route with paired blockers.',
      challengeTips: ['Stay patient', 'Pick safe lanes', 'Long run'],
    },
    recipe: {
      id: 'sweden-kanelbulle',
      name: 'Kanelbulle Break',
      country: 'Sweden',
      flavorText: 'A soft cinnamon break for the book.',
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
    tagline: 'Lanterns, speed, and one last challenge.',
    overview: 'The fastest regular route before Rainbow Bridge.',
    unlockHint: 'Clear Sweden.',
    run: {
      difficulty: 6,
      skillFocus: 'Finale Rush',
      finishDistance: 620,
      targetScore: 58,
      baseSpeed: 1.5,
      trailNote: 'Fast lanes. Grab Tandborste when it is safe.',
      challengeSummary: 'Fastest route. Clean moves matter.',
      challengeTips: ['Fast pace', 'Chain blockers', 'Choose safely'],
    },
    recipe: {
      id: 'vietnam-banh-mi',
      name: 'Banh Mi Pack',
      country: 'Vietnam',
      flavorText: 'A bright final trip snack before the bridge.',
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
  {
    id: 'rainbow-bridge',
    country: 'Rainbow Bridge',
    name: 'Rainbow Bridge',
    routeLabel: 'Forever Road',
    tagline: "Chloe's final road. No losing here.",
    overview:
      "A soft rainbow run for Chloe's last day. Just lights, clouds, and love.",
    unlockHint: 'Clear Vietnam.',
    run: {
      difficulty: 7,
      skillFocus: 'Forever Run',
      finishDistance: 560,
      targetScore: 24,
      baseSpeed: 1.08,
      cannotLose: true,
      trailNote:
        'Chloe cannot lose here. Follow the lights and enjoy the road.',
      challengeSummary: 'No fail state. Just a warm final ride.',
      challengeTips: ['Cannot lose', 'Soft lights', 'For Chloe'],
    },
    recipe: {
      id: 'rainbow-bridge-sunbeam',
      name: 'Sunbeam Picnic',
      country: 'Rainbow Bridge',
      flavorText: 'One more warm little picnic for Chloe.',
    },
    theme: {
      accent: '#ff5f9f',
      secondary: '#ffe45c',
      background: '#d8f5ff',
      backgroundAlt: '#ffdff2',
      fog: '#e7fbff',
      lightA: '#fff9f0',
      lightB: '#ffe08f',
      surface: '#7ff2e1',
      surfaceEdge: '#ff9fc6',
      laneGlow: '#fff7a8',
      decoA: '#79d8ff',
      decoB: '#b88cff',
      glow: '#fff36f',
      obstacle: '#ffa8c9',
      obstacleAlt: '#fff0a8',
      pickup: '#fff36f',
      spark: '#ffffff',
    },
  },
];

export const destinationLookup = Object.fromEntries(
  destinations.map((destination) => [destination.id, destination]),
) as Record<DestinationId, Destination>;
