import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Backpack, DoorOpen, Map, Stamp } from 'lucide-react';
import { boostLookup } from '../data/boosts';
import {
  createRunnerGame,
  type HudSnapshot,
  type ScoreEvent,
} from '../game/createRunnerGame';
import type { Destination } from '../data/destinations';
import type { BoostId, RunSummary } from '../state/types';

type RunScreenProps = {
  destination: Destination;
  activeBoostId: BoostId | null;
  onAbort: () => void;
  onComplete: (summary: RunSummary) => void;
};

type Popup = {
  id: number;
  label: string;
  chain: number;
  tone: 'good' | 'bad' | 'boost';
};

function createInitialHud(
  destination: Destination,
  activeBoostId: BoostId | null,
): HudSnapshot {
  return {
    score: 0,
    target: destination.run.targetScore,
    chain: 0,
    hearts: 3,
    finishProgress: 0,
    treatProgress: 0,
    boostLabel: activeBoostId ? boostLookup[activeBoostId].shortLabel : null,
  };
}

function getFinishLabel(finishProgress: number, cannotLose: boolean) {
  if (cannotLose) {
    if (finishProgress >= 1) {
      return 'Bridge crossed';
    }
    if (finishProgress >= 0.82) {
      return 'Almost there';
    }
    if (finishProgress >= 0.48) {
      return 'Halfway';
    }
    return 'Start';
  }

  if (finishProgress >= 1) {
    return 'Done';
  }
  if (finishProgress >= 0.82) {
    return 'Almost there';
  }
  if (finishProgress >= 0.48) {
    return 'Halfway';
  }
  return 'Start';
}

export function RunScreen({
  destination,
  activeBoostId,
  onAbort,
  onComplete,
}: RunScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const popupIdRef = useRef(0);
  const popupTimersRef = useRef<number[]>([]);
  const [hud, setHud] = useState(() => createInitialHud(destination, activeBoostId));
  const [popups, setPopups] = useState<Popup[]>([]);
  const cannotLose = destination.run.cannotLose ?? false;
  const scoreLabel = cannotLose ? 'Memory Lights' : 'Tandborste';
  const finishLabel = getFinishLabel(hud.finishProgress, cannotLose);

  const handleHudChange = useEffectEvent((nextHud: HudSnapshot) => {
    setHud(nextHud);
  });

  const handleScoreEvent = useEffectEvent((event: ScoreEvent) => {
    const id = popupIdRef.current + 1;
    popupIdRef.current = id;
    setPopups((current) => [...current.slice(-2), { id, ...event }]);
    const timeout = window.setTimeout(() => {
      setPopups((current) => current.filter((popup) => popup.id !== id));
    }, 650);
    popupTimersRef.current.push(timeout);
  });

  const handleComplete = useEffectEvent((summary: RunSummary) => {
    onComplete(summary);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const controller = createRunnerGame({
      canvas,
      destination,
      activeBoostId,
      onHudChange: handleHudChange,
      onScoreEvent: handleScoreEvent,
      onComplete: handleComplete,
    });

    return () => {
      controller.dispose();
      popupTimersRef.current.forEach((timeout) => window.clearTimeout(timeout));
      popupTimersRef.current = [];
    };
  }, [activeBoostId, destination]);

  return (
    <section className="run-screen">
      <canvas ref={canvasRef} className="run-screen__canvas" />

      <div
        className="run-overlay"
        style={
          {
            '--run-accent': destination.theme.accent,
            '--run-secondary': destination.theme.secondary,
          } as CSSProperties
        }
      >
        <div className="run-topbar">
          <div className="run-hud">
            <div className="run-hud__panel run-hud__panel--score">
              <Stamp />
              <span className="eyebrow">{scoreLabel}</span>
              <strong>{cannotLose ? `${hud.score} found` : `${hud.score}/${hud.target}`}</strong>
              <div className="run-progress">
                <div className="run-progress__track">
                  <div
                    className="run-progress__fill"
                    style={{ width: `${Math.min(100, hud.treatProgress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="run-hud__panel run-hud__panel--route">
              <Map />
              <span className="eyebrow">Route</span>
              <strong>{finishLabel}</strong>
              <div className="run-progress">
                <div className="run-progress__track">
                  <div
                    className="run-progress__fill run-progress__fill--route"
                    style={{ width: `${Math.min(100, hud.finishProgress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="run-hud__panel run-hud__panel--run">
              <Backpack />
              <span className="eyebrow">Stride</span>
              <strong>x{hud.chain} stride</strong>
              <small>{cannotLose ? 'Safe run' : hud.boostLabel ?? 'No helper'}</small>
              {cannotLose ? (
                <div className="run-paws run-paws--forever" aria-label="Forever clear">
                  <span className="run-paws__forever">Safe clear</span>
                </div>
              ) : (
                <div className="run-paws" aria-label={`${hud.hearts} paws left`}>
                  {Array.from({ length: 3 }, (_, index) => (
                    <span
                      key={index}
                      className={`run-paws__dot${index < hud.hearts ? ' is-active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="button" className="button button--ghost" onClick={onAbort}>
            <DoorOpen />
            Exit
          </button>
        </div>

        <div className="run-popups" aria-live="polite">
          {popups.map((popup) => (
            <div key={popup.id} className={`hud-pop hud-pop--${popup.tone}`}>
              <strong>{popup.label}</strong>
              {popup.chain > 1 && popup.tone !== 'bad' && <span>Stride x{popup.chain}</span>}
            </div>
          ))}
        </div>

        <div className="run-bottombar">
          <div className="run-tip">
            <span className="eyebrow">Run Note</span>
            <div className="run-focus">
              <span>Lv. {destination.run.difficulty}</span>
              <span>{destination.run.skillFocus}</span>
            </div>
            <strong>{destination.run.trailNote}</strong>
            <div className="run-controls">
              <span>Left</span>
              <span>Hop</span>
              <span>Right</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
