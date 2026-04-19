import type { BoostId } from '../state/types';

export type BoostDefinition = {
  id: BoostId;
  name: string;
  shortLabel: string;
  description: string;
  accent: string;
  flavorText: string;
  modifiers: {
    laneShiftMultiplier?: number;
    jumpBoost?: number;
    scoreMultiplier?: number;
    routeSpeedMultiplier?: number;
  };
};

export const boosts: BoostDefinition[] = [
  {
    id: 'quick-paws',
    name: 'Quick Paws',
    shortLabel: 'Lane+',
    description: 'Snappier lane shifts for cleaner weaves through obstacles.',
    accent: '#19d3a5',
    flavorText: 'A burst of paw-speed when the route starts to crowd.',
    modifiers: {
      laneShiftMultiplier: 1.28,
    },
  },
  {
    id: 'spring-collar',
    name: 'Spring Collar',
    shortLabel: 'Jump+',
    description: 'Adds a little extra lift and hang time to each skip.',
    accent: '#ff8f5b',
    flavorText: 'The collar jingles once, then every hop feels lighter.',
    modifiers: {
      jumpBoost: 1.15,
    },
  },
  {
    id: 'lucky-bandana',
    name: 'Lucky Bandana',
    shortLabel: 'Score x',
    description: 'Tandborste pickups pay out extra points while it is equipped.',
    accent: '#ffd33f',
    flavorText: 'A bright ribbon and a nose that keeps finding the good stuff.',
    modifiers: {
      scoreMultiplier: 1.5,
    },
  },
  {
    id: 'tailwind-tag',
    name: 'Tailwind Tag',
    shortLabel: 'Slow+',
    description: 'The route scrolls a touch slower, buying more reading time.',
    accent: '#65c7ff',
    flavorText: 'Like a kind breeze nudging the whole run into focus.',
    modifiers: {
      routeSpeedMultiplier: 0.88,
    },
  },
];

export const boostLookup = Object.fromEntries(
  boosts.map((boost) => [boost.id, boost]),
) as Record<BoostId, BoostDefinition>;

export type AppliedBoostModifiers = {
  laneShiftMultiplier: number;
  jumpBoost: number;
  scoreMultiplier: number;
  routeSpeedMultiplier: number;
};

export function getBoostModifiers(boostId: BoostId | null): AppliedBoostModifiers {
  const boost = boostId ? boostLookup[boostId] : null;

  return {
    laneShiftMultiplier: boost?.modifiers.laneShiftMultiplier ?? 1,
    jumpBoost: boost?.modifiers.jumpBoost ?? 1,
    scoreMultiplier: boost?.modifiers.scoreMultiplier ?? 1,
    routeSpeedMultiplier: boost?.modifiers.routeSpeedMultiplier ?? 1,
  };
}
