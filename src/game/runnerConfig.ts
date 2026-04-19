import type { DestinationId } from '../state/types';

export type LaneIndex = -1 | 0 | 1;
export type RunnerObstacleKind = 'hurdle' | 'crate' | 'bench';
export type ObstacleResponse = 'jump' | 'lane';
export type RoutePhase = 'warmup' | 'middle' | 'final';
export type RouteStyleBias = 'calm' | 'alternating' | 'breezy';

export type PatternObstacle = {
  lane: LaneIndex;
  kind: RunnerObstacleKind;
  z?: number;
};

export type PatternPickup = {
  lane: LaneIndex;
  y?: number;
  z?: number;
};

export type RunnerPattern = {
  obstacles: PatternObstacle[];
  tandborste: PatternPickup[];
};

export type ObstacleSpec = {
  response: ObstacleResponse;
  width: number;
  height: number;
  depth: number;
  y: number;
  clearHeight: number;
};

type RoutePatternSet = {
  styleBias: RouteStyleBias;
  spawnRanges: Record<RoutePhase, [number, number]>;
  patterns: Record<RoutePhase, RunnerPattern[]>;
};

export const obstacleSpecs: Record<RunnerObstacleKind, ObstacleSpec> = {
  hurdle: {
    response: 'jump',
    width: 1.04,
    height: 0.72,
    depth: 0.46,
    y: 0.23,
    clearHeight: 1.02,
  },
  crate: {
    response: 'lane',
    width: 0.96,
    height: 0.82,
    depth: 0.76,
    y: 0.21,
    clearHeight: 0.82,
  },
  bench: {
    response: 'lane',
    width: 1.24,
    height: 0.98,
    depth: 0.58,
    y: 0.27,
    clearHeight: 0.98,
  },
};

export function getRoutePhase(progress: number): RoutePhase {
  if (progress < 0.2) {
    return 'warmup';
  }

  if (progress < 0.78) {
    return 'middle';
  }

  return 'final';
}

const calmPatterns: Record<RoutePhase, RunnerPattern[]> = {
  warmup: [
    {
      obstacles: [{ lane: -1, kind: 'hurdle' }],
      tandborste: [{ lane: 0 }, { lane: 1 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'crate' }],
      tandborste: [{ lane: 0 }],
    },
    {
      obstacles: [],
      tandborste: [{ lane: -1, z: -0.28 }, { lane: 1, z: -0.28 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'crate' }],
      tandborste: [{ lane: 0, y: 1.02 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'hurdle' }],
      tandborste: [{ lane: 0, y: 1.08 }],
    },
  ],
  middle: [
    {
      obstacles: [{ lane: 0, kind: 'hurdle' }],
      tandborste: [{ lane: 0, y: 1.28 }, { lane: -1 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'crate' }],
      tandborste: [{ lane: 0 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'bench' }],
      tandborste: [{ lane: -1, y: 1.04 }],
    },
    {
      obstacles: [{ lane: 0, kind: 'crate' }],
      tandborste: [{ lane: 1 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'hurdle' }],
      tandborste: [{ lane: 1, y: 1.22 }],
    },
  ],
  final: [
    {
      obstacles: [{ lane: -1, kind: 'crate' }, { lane: 1, kind: 'hurdle' }],
      tandborste: [{ lane: 0, y: 1.1 }],
    },
    {
      obstacles: [{ lane: 0, kind: 'bench' }],
      tandborste: [{ lane: -1, y: 1.06 }, { lane: 1, y: 1.06 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'hurdle' }, { lane: 1, kind: 'crate' }],
      tandborste: [{ lane: 0, y: 1.14 }],
    },
    {
      obstacles: [{ lane: 0, kind: 'hurdle' }, { lane: 1, kind: 'bench' }],
      tandborste: [{ lane: -1, y: 1.14 }],
    },
  ],
};

const alternatingPatterns: Record<RoutePhase, RunnerPattern[]> = {
  warmup: [
    {
      obstacles: [{ lane: -1, kind: 'crate' }],
      tandborste: [{ lane: 0 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'crate' }],
      tandborste: [{ lane: 0 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'hurdle' }],
      tandborste: [{ lane: 0, y: 1.08 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'hurdle' }],
      tandborste: [{ lane: 0, y: 1.08 }],
    },
    {
      obstacles: [],
      tandborste: [{ lane: -1, z: -0.34 }, { lane: 1, z: -0.34 }],
    },
  ],
  middle: [
    {
      obstacles: [{ lane: -1, kind: 'crate' }],
      tandborste: [{ lane: 1, z: -0.34 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'crate' }],
      tandborste: [{ lane: -1, z: -0.34 }],
    },
    {
      obstacles: [{ lane: 0, kind: 'hurdle' }],
      tandborste: [{ lane: 0, y: 1.28 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'bench' }],
      tandborste: [{ lane: 1, y: 1.04 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'bench' }],
      tandborste: [{ lane: -1, y: 1.04 }],
    },
  ],
  final: [
    {
      obstacles: [{ lane: -1, kind: 'crate' }, { lane: 0, kind: 'hurdle' }],
      tandborste: [{ lane: 1, y: 1.16 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'crate' }, { lane: 0, kind: 'hurdle' }],
      tandborste: [{ lane: -1, y: 1.16 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'bench' }],
      tandborste: [{ lane: 1 }, { lane: 0, y: 1.14 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'bench' }],
      tandborste: [{ lane: -1 }, { lane: 0, y: 1.14 }],
    },
  ],
};

const mountainPatterns: Record<RoutePhase, RunnerPattern[]> = {
  warmup: [
    {
      obstacles: [{ lane: 1, kind: 'hurdle' }],
      tandborste: [{ lane: 0 }, { lane: -1, z: -0.22 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'crate' }],
      tandborste: [{ lane: 1 }],
    },
    {
      obstacles: [{ lane: 0, kind: 'hurdle' }],
      tandborste: [{ lane: 0, y: 1.08 }],
    },
    {
      obstacles: [],
      tandborste: [{ lane: -1 }, { lane: 1 }],
    },
  ],
  middle: [
    {
      obstacles: [{ lane: -1, kind: 'bench' }],
      tandborste: [{ lane: 0 }, { lane: 1, y: 1.12 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'hurdle' }],
      tandborste: [{ lane: -1 }, { lane: 0, y: 1.18 }],
    },
    {
      obstacles: [{ lane: 0, kind: 'crate' }],
      tandborste: [{ lane: -1 }, { lane: 1 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'hurdle' }],
      tandborste: [{ lane: 1, y: 1.2 }],
    },
  ],
  final: [
    {
      obstacles: [{ lane: -1, kind: 'hurdle' }, { lane: 1, kind: 'bench' }],
      tandborste: [{ lane: 0, y: 1.14 }],
    },
    {
      obstacles: [{ lane: 0, kind: 'bench' }],
      tandborste: [{ lane: -1 }, { lane: 1 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'crate' }, { lane: 0, kind: 'hurdle' }],
      tandborste: [{ lane: -1, y: 1.18 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'crate' }, { lane: 0, kind: 'hurdle' }],
      tandborste: [{ lane: 1, y: 1.18 }],
    },
  ],
};

const breezyPatterns: Record<RoutePhase, RunnerPattern[]> = {
  warmup: [
    {
      obstacles: [],
      tandborste: [{ lane: -1, z: -0.38 }, { lane: 1, z: -0.38 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'crate' }],
      tandborste: [{ lane: -1 }, { lane: 0, y: 1.1, z: -0.28 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'crate' }],
      tandborste: [{ lane: 1 }, { lane: 1, y: 1.1, z: -0.28 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'hurdle' }],
      tandborste: [{ lane: 0, y: 1.06 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'hurdle' }],
      tandborste: [{ lane: 0, y: 1.06 }],
    },
  ],
  middle: [
    {
      obstacles: [{ lane: -1, kind: 'hurdle' }],
      tandborste: [{ lane: 1 }, { lane: 1, y: 1.18, z: -0.28 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'hurdle' }],
      tandborste: [{ lane: -1 }, { lane: -1, y: 1.18, z: -0.28 }],
    },
    {
      obstacles: [{ lane: 0, kind: 'crate' }],
      tandborste: [{ lane: -1, y: 1.02 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'crate' }],
      tandborste: [{ lane: 1, z: -0.34 }, { lane: 1, y: 1.18 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'crate' }],
      tandborste: [{ lane: -1, z: -0.34 }, { lane: -1, y: 1.18 }],
    },
  ],
  final: [
    {
      obstacles: [{ lane: -1, kind: 'hurdle' }, { lane: 0, kind: 'crate' }],
      tandborste: [{ lane: 1, y: 1.18, z: -0.36 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'hurdle' }, { lane: 0, kind: 'crate' }],
      tandborste: [{ lane: -1, y: 1.18, z: -0.36 }],
    },
    {
      obstacles: [{ lane: 0, kind: 'bench' }],
      tandborste: [{ lane: -1 }, { lane: 1 }],
    },
    {
      obstacles: [{ lane: -1, kind: 'bench' }],
      tandborste: [{ lane: 0 }, { lane: 1, y: 1.18 }],
    },
    {
      obstacles: [{ lane: 1, kind: 'bench' }],
      tandborste: [{ lane: 0 }, { lane: -1, y: 1.18 }],
    },
  ],
};

export const routePatternSets = {
  maryland: {
    styleBias: 'calm',
    spawnRanges: {
      warmup: [1.04, 1.18],
      middle: [1.02, 1.16],
      final: [1, 1.14],
    },
    patterns: calmPatterns,
  },
  'rhode-island': {
    styleBias: 'alternating',
    spawnRanges: {
      warmup: [1, 1.14],
      middle: [0.98, 1.12],
      final: [0.96, 1.1],
    },
    patterns: alternatingPatterns,
  },
  colorado: {
    styleBias: 'calm',
    spawnRanges: {
      warmup: [1.02, 1.14],
      middle: [0.98, 1.1],
      final: [0.96, 1.08],
    },
    patterns: mountainPatterns,
  },
  greece: {
    styleBias: 'alternating',
    spawnRanges: {
      warmup: [1.02, 1.14],
      middle: [0.98, 1.1],
      final: [0.96, 1.08],
    },
    patterns: alternatingPatterns,
  },
  sweden: {
    styleBias: 'calm',
    spawnRanges: {
      warmup: [1.06, 1.2],
      middle: [1.02, 1.16],
      final: [1, 1.12],
    },
    patterns: calmPatterns,
  },
  vietnam: {
    styleBias: 'breezy',
    spawnRanges: {
      warmup: [0.98, 1.12],
      middle: [0.96, 1.1],
      final: [0.94, 1.08],
    },
    patterns: breezyPatterns,
  },
} satisfies Record<DestinationId, RoutePatternSet>;
