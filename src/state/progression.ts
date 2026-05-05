import { boosts } from '../data/boosts';
import { destinations, destinationLookup } from '../data/destinations';
import {
  boostIds,
  destinationIds,
  type BoostId,
  type DestinationId,
  type ProgressState,
  type Reward,
  type RunSummary,
} from './types';

const STORAGE_KEY = 'hoppskutt-progress-v3';

function createBoostInventory(): Record<BoostId, number> {
  return Object.fromEntries(boostIds.map((id) => [id, 0])) as Record<BoostId, number>;
}

function createDestinationRecord(defaultValue: number) {
  return Object.fromEntries(
    destinationIds.map((id) => [id, defaultValue]),
  ) as Record<DestinationId, number>;
}

export function createInitialProgress(): ProgressState {
  return {
    unlockedDestinations: ['maryland'],
    unlockedRecipes: [],
    boostInventory: createBoostInventory(),
    equippedBoostId: null,
    winsByDestination: createDestinationRecord(0),
    bestScores: createDestinationRecord(0),
    totalWins: 0,
  };
}

function sanitizeProgress(raw: unknown): ProgressState {
  const initial = createInitialProgress();

  if (!raw || typeof raw !== 'object') {
    return initial;
  }

  const candidate = raw as Partial<ProgressState>;

  const storedUnlockedDestinations = Array.isArray(candidate.unlockedDestinations)
    ? candidate.unlockedDestinations.filter((id): id is DestinationId =>
        destinationIds.includes(id as DestinationId),
      )
    : initial.unlockedDestinations;

  const unlockedRecipes = Array.isArray(candidate.unlockedRecipes)
    ? candidate.unlockedRecipes.filter((id) =>
        destinations.some((destination) => destination.recipe.id === id),
      )
    : initial.unlockedRecipes;

  const boostInventory = { ...initial.boostInventory };
  for (const boostId of boostIds) {
    const amount = candidate.boostInventory?.[boostId];
    if (typeof amount === 'number' && Number.isFinite(amount)) {
      boostInventory[boostId] = Math.max(0, Math.floor(amount));
    }
  }

  const winsByDestination = { ...initial.winsByDestination };
  const bestScores = { ...initial.bestScores };

  for (const destinationId of destinationIds) {
    const wins = candidate.winsByDestination?.[destinationId];
    const best = candidate.bestScores?.[destinationId];

    if (typeof wins === 'number' && Number.isFinite(wins)) {
      winsByDestination[destinationId] = Math.max(0, Math.floor(wins));
    }

    if (typeof best === 'number' && Number.isFinite(best)) {
      bestScores[destinationId] = Math.max(0, Math.floor(best));
    }
  }

  const unlockedDestinationSet = new Set<DestinationId>(
    storedUnlockedDestinations.length > 0
      ? storedUnlockedDestinations
      : initial.unlockedDestinations,
  );
  unlockedDestinationSet.add('maryland');
  for (let index = 1; index < destinations.length; index += 1) {
    const previousDestinationId = destinations[index - 1].id;
    const nextDestinationId = destinations[index].id;
    if (winsByDestination[previousDestinationId] > 0) {
      unlockedDestinationSet.add(nextDestinationId);
    }
  }
  const unlockedDestinations = destinations
    .map((destination) => destination.id)
    .filter((destinationId) => unlockedDestinationSet.has(destinationId));

  return {
    unlockedDestinations,
    unlockedRecipes,
    boostInventory,
    equippedBoostId:
      candidate.equippedBoostId && boostIds.includes(candidate.equippedBoostId)
        ? candidate.equippedBoostId
        : null,
    winsByDestination,
    bestScores,
    totalWins:
      typeof candidate.totalWins === 'number' && Number.isFinite(candidate.totalWins)
        ? Math.max(0, Math.floor(candidate.totalWins))
        : initial.totalWins,
  };
}

export function loadProgressState(): ProgressState {
  if (typeof window === 'undefined') {
    return createInitialProgress();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialProgress();
    }

    return sanitizeProgress(JSON.parse(raw));
  } catch {
    return createInitialProgress();
  }
}

export function saveProgressState(progress: ProgressState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getNextDestinationToUnlock(currentId: DestinationId): DestinationId | null {
  const currentIndex = destinations.findIndex((destination) => destination.id === currentId);
  return destinations[currentIndex + 1]?.id ?? null;
}

function chooseBoost(progress: ProgressState, destinationId: DestinationId): BoostId {
  const destinationIndex = destinations.findIndex((destination) => destination.id === destinationId);
  const pick =
    (progress.totalWins + progress.winsByDestination[destinationId] + destinationIndex) %
    boosts.length;
  return boosts[pick].id;
}

export function consumeEquippedBoost(progress: ProgressState): {
  progress: ProgressState;
  activeBoostId: BoostId | null;
} {
  const equippedBoostId = progress.equippedBoostId;

  if (!equippedBoostId) {
    return {
      progress,
      activeBoostId: null,
    };
  }

  if (progress.boostInventory[equippedBoostId] <= 0) {
    return {
      progress: {
        ...progress,
        equippedBoostId: null,
      },
      activeBoostId: null,
    };
  }

  return {
    activeBoostId: equippedBoostId,
    progress: {
      ...progress,
      equippedBoostId: null,
      boostInventory: {
        ...progress.boostInventory,
        [equippedBoostId]: progress.boostInventory[equippedBoostId] - 1,
      },
    },
  };
}

export function equipBoost(progress: ProgressState, boostId: BoostId): ProgressState {
  if (progress.boostInventory[boostId] <= 0) {
    return progress;
  }

  return {
    ...progress,
    equippedBoostId: boostId,
  };
}

export function clearEquippedBoost(progress: ProgressState): ProgressState {
  if (!progress.equippedBoostId) {
    return progress;
  }

  return {
    ...progress,
    equippedBoostId: null,
  };
}

export function applyRunWin(
  progress: ProgressState,
  summary: RunSummary,
): {
  progress: ProgressState;
  reward: Reward;
  unlockedDestinationId: DestinationId | null;
} {
  const destination = destinationLookup[summary.destinationId];
  const recipeAlreadyUnlocked = progress.unlockedRecipes.includes(destination.recipe.id);
  const firstWin = progress.winsByDestination[summary.destinationId] === 0;
  const unlockedDestinationId = firstWin
    ? getNextDestinationToUnlock(summary.destinationId)
    : null;

  let reward: Reward;
  let nextProgress: ProgressState = {
    ...progress,
    totalWins: progress.totalWins + 1,
    winsByDestination: {
      ...progress.winsByDestination,
      [summary.destinationId]: progress.winsByDestination[summary.destinationId] + 1,
    },
    bestScores: {
      ...progress.bestScores,
      [summary.destinationId]: Math.max(
        progress.bestScores[summary.destinationId],
        summary.score,
      ),
    },
  };

  if (!recipeAlreadyUnlocked) {
    reward = {
      kind: 'recipe',
      recipeId: destination.recipe.id,
      destinationId: summary.destinationId,
    };

    nextProgress = {
      ...nextProgress,
      unlockedRecipes: [...nextProgress.unlockedRecipes, destination.recipe.id],
    };
  } else {
    const boostId = chooseBoost(progress, summary.destinationId);
    reward = {
      kind: 'boost',
      boostId,
      destinationId: summary.destinationId,
    };

    nextProgress = {
      ...nextProgress,
      boostInventory: {
        ...nextProgress.boostInventory,
        [boostId]: nextProgress.boostInventory[boostId] + 1,
      },
    };
  }

  if (
    unlockedDestinationId &&
    !nextProgress.unlockedDestinations.includes(unlockedDestinationId)
  ) {
    nextProgress = {
      ...nextProgress,
      unlockedDestinations: [
        ...nextProgress.unlockedDestinations,
        unlockedDestinationId,
      ],
    };
  }

  return {
    progress: nextProgress,
    reward,
    unlockedDestinationId,
  };
}

export function applyRunLoss(
  progress: ProgressState,
  summary: RunSummary,
): ProgressState {
  return {
    ...progress,
    bestScores: {
      ...progress.bestScores,
      [summary.destinationId]: Math.max(
        progress.bestScores[summary.destinationId],
        summary.score,
      ),
    },
  };
}
