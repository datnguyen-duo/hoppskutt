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
    description: 'Faster lane changes.',
    accent: '#19d3a5',
    flavorText: 'Good when the road gets busy.',
    modifiers: {
      laneShiftMultiplier: 1.28,
    },
  },
  {
    id: 'spring-collar',
    name: 'Spring Collar',
    shortLabel: 'Jump+',
    description: 'Higher, softer hops.',
    accent: '#ff8f5b',
    flavorText: 'A little more air on each hop.',
    modifiers: {
      jumpBoost: 1.15,
    },
  },
  {
    id: 'lucky-bandana',
    name: 'Lucky Bandana',
    shortLabel: 'Score x',
    description: 'More points per Tandborste.',
    accent: '#ffd33f',
    flavorText: 'For bigger Tandborste runs.',
    modifiers: {
      scoreMultiplier: 1.5,
    },
  },
  {
    id: 'tailwind-tag',
    name: 'Tailwind Tag',
    shortLabel: 'Slow+',
    description: 'Slows the route a bit.',
    accent: '#65c7ff',
    flavorText: 'More time to read the road.',
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
