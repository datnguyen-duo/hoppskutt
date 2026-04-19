import { lazy, Suspense, startTransition, useEffect, useRef, useState } from 'react';
import './App.css';
import { boostLookup } from './data/boosts';
import { destinationLookup } from './data/destinations';
import { soundManager } from './effects/sound';
import {
  applyRunLoss,
  applyRunWin,
  clearEquippedBoost,
  consumeEquippedBoost,
  createInitialProgress,
  equipBoost,
  loadProgressState,
  saveProgressState,
} from './state/progression';
import { destinationIds } from './state/types';
import type {
  BoostId,
  DestinationId,
  ProgressState,
  Reward,
  RunSummary,
} from './state/types';
import { CollectionScreen } from './ui/screens/CollectionScreen';
import { DestinationScreen } from './ui/screens/DestinationScreen';
import { RewardScreen } from './ui/screens/RewardScreen';
import { StartScreen } from './ui/screens/StartScreen';

const RunScreen = lazy(async () => {
  const module = await import('./ui/RunScreen');
  return { default: module.RunScreen };
});

type Screen =
  | 'start'
  | 'destinations'
  | 'run'
  | 'reward'
  | 'collection';

type RewardViewState = {
  reward: Reward;
  destinationId: DestinationId;
  unlockedDestinationId: DestinationId | null;
  summary: RunSummary;
};

type RunSession = {
  destinationId: DestinationId;
  activeBoostId: BoostId | null;
};

type Notice = {
  tone: 'loss' | 'success' | 'info';
  message: string;
};

type NavigationState = {
  screen: Screen;
  selectedDestinationId: DestinationId;
};

const fallbackDestinationId: DestinationId = destinationIds[0];

function isDestinationId(value: string | null): value is DestinationId {
  return destinationIds.includes(value as DestinationId);
}

function loadInitialNavigationState(): NavigationState {
  if (typeof window === 'undefined') {
    return {
      screen: 'start',
      selectedDestinationId: fallbackDestinationId,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  const route = params.get('route');

  let screen: Screen = 'start';

  if (view === 'destinations') {
    screen = 'destinations';
  } else if (view === 'collection') {
    screen = 'collection';
  }

  return {
    screen,
    selectedDestinationId: isDestinationId(route) ? route : fallbackDestinationId,
  };
}

function buildNavigationUrl(screen: Screen, selectedDestinationId: DestinationId) {
  const url = new URL(window.location.href);

  if (screen === 'destinations') {
    url.searchParams.set('view', 'destinations');
    url.searchParams.set('route', selectedDestinationId);
    return url;
  }

  if (screen === 'collection') {
    url.searchParams.set('view', 'collection');
    url.searchParams.set('route', selectedDestinationId);
    return url;
  }

  url.searchParams.delete('view');
  url.searchParams.delete('route');
  return url;
}

function setNavigationState(
  screen: Screen,
  selectedDestinationId: DestinationId,
  mode: 'push' | 'replace' = 'push',
) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = buildNavigationUrl(screen, selectedDestinationId);
  const state: NavigationState = {
    screen,
    selectedDestinationId,
  };

  if (mode === 'replace') {
    window.history.replaceState(state, '', url);
    return;
  }

  window.history.pushState(state, '', url);
}

function App() {
  const initialNavigationState = loadInitialNavigationState();
  const [progress, setProgress] = useState<ProgressState>(() => loadProgressState());
  const [screen, setScreen] = useState<Screen>(initialNavigationState.screen);
  const [selectedDestinationId, setSelectedDestinationId] =
    useState<DestinationId>(initialNavigationState.selectedDestinationId);
  const [rewardState, setRewardState] = useState<RewardViewState | null>(null);
  const [runSession, setRunSession] = useState<RunSession | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const runSessionRef = useRef<RunSession | null>(null);
  const rewardStateRef = useRef<RewardViewState | null>(null);

  useEffect(() => {
    saveProgressState(progress);
  }, [progress]);

  useEffect(() => {
    void import('./ui/RunScreen');
  }, []);

  useEffect(() => {
    runSessionRef.current = runSession;
  }, [runSession]);

  useEffect(() => {
    rewardStateRef.current = rewardState;
  }, [rewardState]);

  const resolvedSelectedDestinationId = progress.unlockedDestinations.includes(
    selectedDestinationId,
  )
    ? selectedDestinationId
    : (progress.unlockedDestinations[0] ?? fallbackDestinationId);

  useEffect(() => {
    setNavigationState(screen, resolvedSelectedDestinationId, 'replace');
  }, [screen, resolvedSelectedDestinationId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as NavigationState | null;
      const fallback = loadInitialNavigationState();
      const nextSelectedDestinationId =
        state?.selectedDestinationId ?? fallback.selectedDestinationId;
      let nextScreen = state?.screen ?? fallback.screen;

      if (nextScreen === 'run' && !runSessionRef.current) {
        nextScreen = 'destinations';
      }

      if (nextScreen === 'reward' && !rewardStateRef.current) {
        nextScreen = 'destinations';
      }

      if (nextScreen !== 'run') {
        setRunSession(null);
      }

      setNotice(null);
      setSelectedDestinationId(nextSelectedDestinationId);
      startTransition(() => setScreen(nextScreen));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (
    nextScreen: Screen,
    options?: {
      selectedDestinationId?: DestinationId;
      replace?: boolean;
    },
  ) => {
    const nextSelectedDestinationId =
      options?.selectedDestinationId ?? resolvedSelectedDestinationId;

    setNavigationState(
      nextScreen,
      nextSelectedDestinationId,
      options?.replace ? 'replace' : 'push',
    );

    startTransition(() => setScreen(nextScreen));
  };

  const openDestinations = () => {
    soundManager.playMenu();
    setNotice(null);
    navigateTo('destinations');
  };

  const openCollection = () => {
    soundManager.playMenu();
    setNotice(null);
    navigateTo('collection');
  };

  const handleSelectDestination = (destinationId: DestinationId) => {
    setSelectedDestinationId(destinationId);
    setNavigationState(screen, destinationId, 'replace');
  };

  const beginRun = () => {
    const consumed = consumeEquippedBoost(progress);
    setProgress(consumed.progress);
    setRunSession({
      destinationId: resolvedSelectedDestinationId,
      activeBoostId: consumed.activeBoostId,
    });
    setNotice(
      consumed.activeBoostId
        ? {
            tone: 'info',
            message: `${boostLookup[consumed.activeBoostId].name} is clipped onto Chloe's day pack.`,
          }
        : null,
    );
    soundManager.playMenu();
    soundManager.startRunMusic(resolvedSelectedDestinationId);
    navigateTo('run');
  };

  const handleRunComplete = (summary: RunSummary) => {
    setRunSession(null);

    if (summary.won) {
      const outcome = applyRunWin(progress, summary);
      setProgress(outcome.progress);
      setRewardState({
        reward: outcome.reward,
        destinationId: summary.destinationId,
        unlockedDestinationId: outcome.unlockedDestinationId,
        summary,
      });
      navigateTo('reward', {
        selectedDestinationId: summary.destinationId,
      });
      return;
    }

    setProgress(applyRunLoss(progress, summary));
    setNotice({
      tone: 'loss',
      message: summary.reachedFinish
        ? `${destinationLookup[summary.destinationId].name} reached the finish, but Chloe only brought home ${summary.score}/${summary.target} tandborste.`
        : `${destinationLookup[summary.destinationId].name} got a little scrappy before the finish. Chloe still brought home ${summary.score}/${summary.target} tandborste.`,
    });
    navigateTo('destinations', {
      selectedDestinationId: summary.destinationId,
    });
  };

  const handleAbortRun = () => {
    setRunSession(null);
    setNotice({
      tone: 'info',
      message: 'Trail leg paused. Any packed helper was already used when the run began.',
    });
    soundManager.playMenu();
    navigateTo('destinations');
  };

  const handleEquipBoost = (boostId: BoostId) => {
    setProgress((current) => equipBoost(current, boostId));
    setNotice({
      tone: 'success',
      message: `${boostLookup[boostId].name} packed for the next stop.`,
    });
    soundManager.playMenu();
  };

  const handleClearBoost = () => {
    setProgress((current) => clearEquippedBoost(current));
    setNotice({
      tone: 'info',
      message: 'Day pack cleared.',
    });
    soundManager.playMenu();
  };

  const handleRewardContinue = () => {
    setRewardState(null);
    setNotice({
      tone: 'success',
      message: 'Route book updated. Pick the next trail stop.',
    });
    soundManager.playMenu();
    navigateTo('destinations');
  };

  const handleEquipRewardBoost = (boostId: BoostId) => {
    setProgress((current) => equipBoost(current, boostId));
    setRewardState(null);
    setNotice({
      tone: 'success',
      message: `${boostLookup[boostId].name} is packed for the next trail.`,
    });
    soundManager.playMenu();
    navigateTo('destinations');
  };

  const resetProgress = () => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    setRewardState(null);
    setRunSession(null);
    setSelectedDestinationId(fallbackDestinationId);
    setNotice({
      tone: 'info',
      message: 'Fresh route book packed. Back to Maryland for the first clean stamp.',
    });
    soundManager.playMenu();
    navigateTo('start');
  };

  return (
    <main className={`app-shell theme-${resolvedSelectedDestinationId}`}>
      <div className="app-shell__backdrop" />
      <div className="app-shell__grain" />

      {screen === 'start' && (
        <StartScreen onStart={openDestinations} />
      )}

      {screen === 'destinations' && (
        <DestinationScreen
          notice={notice}
          progress={progress}
          selectedDestinationId={resolvedSelectedDestinationId}
          onSelectDestination={handleSelectDestination}
          onPlay={beginRun}
          onOpenCollection={openCollection}
          onEquipBoost={handleEquipBoost}
          onClearBoost={handleClearBoost}
          onResetProgress={resetProgress}
        />
      )}

      {screen === 'collection' && (
        <CollectionScreen
          progress={progress}
          onBack={openDestinations}
          onEquipBoost={handleEquipBoost}
          onClearBoost={handleClearBoost}
        />
      )}

      {screen === 'run' && runSession && (
        <Suspense
          fallback={
            <section className="run-screen">
              <div className="run-overlay">
                <div className="run-popups" aria-live="polite">
                  <div className="hud-pop hud-pop--boost">
                    <strong>Chloe is already on the move.</strong>
                    <span>Loading the trail ahead...</span>
                  </div>
                </div>
              </div>
            </section>
          }
        >
          <RunScreen
            key={`${runSession.destinationId}-${runSession.activeBoostId ?? 'none'}`}
            destination={destinationLookup[runSession.destinationId]}
            activeBoostId={runSession.activeBoostId}
            onAbort={handleAbortRun}
            onComplete={handleRunComplete}
          />
        </Suspense>
      )}

      {screen === 'reward' && rewardState && (
        <RewardScreen
          progress={progress}
          reward={rewardState.reward}
          destination={destinationLookup[rewardState.destinationId]}
          unlockedDestinationId={rewardState.unlockedDestinationId}
          summary={rewardState.summary}
          onContinue={handleRewardContinue}
          onEquipRewardBoost={handleEquipRewardBoost}
          onOpenCollection={openCollection}
        />
      )}
    </main>
  );
}

export default App;
