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
    tagline: 'Blue crab air, cattails, and a flat bay run that opens the trip gently.',
    overview:
      'Maryland is the soft opener: plank textures, marsh greens, and dockside color that make the first route bright, coastal, and easy to read.',
    unlockHint: 'Start here.',
    run: {
      difficulty: 1,
      skillFocus: 'Open Lanes',
      finishDistance: 250,
      targetScore: 13,
      baseSpeed: 0.9,
      trailNote: 'Open boardwalk. Stay centered, breathe, and grab the easy tandborste.',
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
      accent: '#5a8c78',
      secondary: '#d0a06b',
      background: '#eef4ef',
      backgroundAlt: '#dce8df',
      fog: '#dce7df',
      lightA: '#e8f3ea',
      lightB: '#f8d9a6',
      surface: '#8fa48c',
      surfaceEdge: '#7d9380',
      laneGlow: '#e8ede2',
      decoA: '#8ca17c',
      decoB: '#7e9b8c',
      glow: '#f5e1a6',
      obstacle: '#81583b',
      obstacleAlt: '#d8c39a',
      pickup: '#deb16a',
      spark: '#fff0be',
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
      skillFocus: 'Lane Rhythm',
      finishDistance: 306,
      targetScore: 18,
      baseSpeed: 1.03,
      trailNote: 'Cliff walk rhythm. Switch left and right early before the rail closes in.',
      challengeSummary: 'Alternating cliff rails teach early left-right movement.',
      challengeTips: ['Side-to-side rhythm', 'Early lane reads', 'Pickups mark safe lanes'],
    },
    recipe: {
      id: 'rhode-island-clam-cakes',
      name: 'Clam Cake Sack',
      country: 'Rhode Island',
      flavorText:
        'Warm clam cakes with a little salt-crisp outside, packed like a paper-bag beach snack.',
    },
    theme: {
      accent: '#6c8798',
      secondary: '#d8b486',
      background: '#f1f4f5',
      backgroundAlt: '#dde7ea',
      fog: '#d8e3e8',
      lightA: '#eef7f8',
      lightB: '#f6dcb7',
      surface: '#9ba59f',
      surfaceEdge: '#84908b',
      laneGlow: '#edf1eb',
      decoA: '#98a6ad',
      decoB: '#7f9287',
      glow: '#f4dfb6',
      obstacle: '#6b5647',
      obstacleAlt: '#d8cab7',
      pickup: '#e0b276',
      spark: '#fff2c9',
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
      skillFocus: 'Rock Hops',
      finishDistance: 342,
      targetScore: 20,
      baseSpeed: 1.09,
      trailNote: 'Switchbacks and rocks. Time the jump, then land into the next lane.',
      challengeSummary: 'Rock-hop timing with raised pickups after the jump.',
      challengeTips: ['Jump timing', 'Rock blockers', 'Land into the lane'],
    },
    recipe: {
      id: 'colorado-burrito',
      name: 'Green Chile Burrito',
      country: 'Colorado',
      flavorText:
        'A camp-stop burrito with green chile heat, soft tortilla folds, and mountain-town comfort.',
    },
    theme: {
      accent: '#6f8f68',
      secondary: '#c98b56',
      background: '#f1f3ed',
      backgroundAlt: '#e3e6db',
      fog: '#dce3d2',
      lightA: '#edf5eb',
      lightB: '#efd2a0',
      surface: '#8f9b83',
      surfaceEdge: '#7f8c73',
      laneGlow: '#eff1e6',
      decoA: '#819368',
      decoB: '#9a7b5f',
      glow: '#f6dd9b',
      obstacle: '#845f45',
      obstacleAlt: '#d8c09a',
      pickup: '#d7ab68',
      spark: '#fff1b5',
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
      finishDistance: 370,
      targetScore: 23,
      baseSpeed: 1.15,
      trailNote: 'Island steps. Hop cleanly, then slide fast to the sunlit lane.',
      challengeSummary: 'Step combos mix hops with quick side moves.',
      challengeTips: ['Hop then shift', 'Raised pickups', 'Short combo reads'],
    },
    recipe: {
      id: 'greece-spanakopita',
      name: 'Spanakopita Fold',
      country: 'Greece',
      flavorText:
        'Flaky spinach-and-feta pastry folded into a neat square for a sunny island snack break.',
    },
    theme: {
      accent: '#5f86ad',
      secondary: '#ddb16b',
      background: '#f3f6f8',
      backgroundAlt: '#e1eaf0',
      fog: '#dde7ef',
      lightA: '#f2f8fb',
      lightB: '#f4dab1',
      surface: '#b7b3a6',
      surfaceEdge: '#999487',
      laneGlow: '#f2f3ef',
      decoA: '#7d9fc0',
      decoB: '#9ab17f',
      glow: '#f8e3a8',
      obstacle: '#9f7e5a',
      obstacleAlt: '#efe3d0',
      pickup: '#e2b770',
      spark: '#fff3c8',
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
      finishDistance: 430,
      targetScore: 25,
      baseSpeed: 1.2,
      trailNote: 'Long forest loop. Fewer freebies, more patience. Protect the stride.',
      challengeSummary: 'A longer forest loop with fewer free pickups.',
      challengeTips: ['Endurance run', 'Paired blockers', 'Protect paws'],
    },
    recipe: {
      id: 'sweden-kanelbulle',
      name: 'Kanelbulle Break',
      country: 'Sweden',
      flavorText:
        'A soft cinnamon bun with pearl sugar, packed like a fika stop between ferry and forest.',
    },
    theme: {
      accent: '#749082',
      secondary: '#c76a57',
      background: '#eef4f1',
      backgroundAlt: '#dde8e2',
      fog: '#d6e1da',
      lightA: '#edf5f2',
      lightB: '#f4d7bd',
      surface: '#8ea092',
      surfaceEdge: '#7e9081',
      laneGlow: '#ebefe7',
      decoA: '#7a8f73',
      decoB: '#b7604d',
      glow: '#f6e3b3',
      obstacle: '#6a5646',
      obstacleAlt: '#dcd3c4',
      pickup: '#ddb172',
      spark: '#fff2cc',
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
      skillFocus: 'Finale Mix',
      finishDistance: 460,
      targetScore: 30,
      baseSpeed: 1.26,
      trailNote: 'Lantern finale. Fast reads, quick recoveries, and bold pickups.',
      challengeSummary: 'Finale mix: fast spawns, unsafe center lane, and recovery checks.',
      challengeTips: ['Fast decisions', 'Mixed hazards', 'No autopilot lane'],
    },
    recipe: {
      id: 'vietnam-banh-mi',
      name: 'Banh Mi Pack',
      country: 'Vietnam',
      flavorText:
        'A crisp baguette packed with herbs, pickles, and savory heat for a bright street-side reset.',
    },
    theme: {
      accent: '#5a916b',
      secondary: '#d69b52',
      background: '#f1f5ef',
      backgroundAlt: '#dfe9df',
      fog: '#dae6d8',
      lightA: '#eef6ef',
      lightB: '#f5d2a3',
      surface: '#8e9880',
      surfaceEdge: '#7c856f',
      laneGlow: '#edf0e7',
      decoA: '#78905f',
      decoB: '#c8703f',
      glow: '#f7dd9f',
      obstacle: '#7a5238',
      obstacleAlt: '#dcc39a',
      pickup: '#dfaf63',
      spark: '#fff0b3',
    },
  },
];

export const destinationLookup = Object.fromEntries(
  destinations.map((destination) => [destination.id, destination]),
) as Record<DestinationId, Destination>;
