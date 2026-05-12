import * as THREE from 'three';
import { boostLookup, getBoostModifiers } from '../data/boosts';
import type { Destination } from '../data/destinations';
import { soundManager } from '../effects/sound';
import {
  getRoutePhase,
  obstacleSpecs,
  routePatternSets,
  type LaneIndex,
  type ObstacleResponse,
  type RunnerPattern,
  type RoutePhase,
  type RunnerObstacleKind,
} from './runnerConfig';
import { createRouteScene } from '../scenes/createRouteScene';
import type { BoostId, RunSummary } from '../state/types';

type EntityKind = RunnerObstacleKind | 'pickup';

type RunnerEntity = {
  kind: EntityKind;
  lane: LaneIndex;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  active: boolean;
  mesh: THREE.Object3D;
  response: ObstacleResponse | null;
  clearHeight: number;
  baseY: number;
  requiresJumpPickup: boolean;
};

export type HudSnapshot = {
  score: number;
  target: number;
  chain: number;
  hearts: number;
  finishProgress: number;
  treatProgress: number;
  boostLabel: string | null;
};

export type ScoreEvent = {
  label: string;
  value: number;
  chain: number;
  tone: 'good' | 'bad' | 'boost';
};

type RunnerGameParams = {
  canvas: HTMLCanvasElement;
  destination: Destination;
  activeBoostId: BoostId | null;
  onHudChange: (snapshot: HudSnapshot) => void;
  onScoreEvent: (event: ScoreEvent) => void;
  onComplete: (summary: RunSummary) => void;
};

type RunnerGameController = {
  dispose: () => void;
  isPaused: () => boolean;
  pause: () => void;
  resume: () => void;
};

type Spark = {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
};

type DogRig = {
  root: THREE.Group;
  model: THREE.Group;
  legs: THREE.Group[];
  tail: THREE.Mesh;
  head: THREE.Group;
  shadow: THREE.Mesh;
  materials: THREE.Material[];
};

type FinishGateRig = {
  root: THREE.Group;
  checkerMaterials: THREE.MeshLambertMaterial[];
};

const LANE_X: Record<LaneIndex, number> = {
  '-1': -2.2,
  '0': 0,
  '1': 2.2,
};
const PLAYER_Z = 5.2;
const BASE_ROUTE_SPEED = 9;
const GRAVITY = 17.5;
const JUMP_BUFFER_WINDOW = 0.14;
const GROUNDED_GRACE_WINDOW = 0.08;
const HURDLE_BODY_CLEARANCE = 0.78;
const HURDLE_CLEARANCE_GRACE = 0.1;
const DEFAULT_PICKUP_Y = 0.98;
const DEFAULT_PICKUP_Z_OFFSET = -0.2;
const HURDLE_PICKUP_MIN_Y = 1.38;
const HURDLE_PICKUP_Z_WINDOW = 0.48;
const JUMP_PICKUP_MIN_JUMP_Y = Math.max(
  0.12,
  obstacleSpecs.hurdle.clearHeight - HURDLE_BODY_CLEARANCE - HURDLE_CLEARANCE_GRACE,
);
const SPAWN_Z = -44;
const FINISH_TRIGGER_Z = PLAYER_Z - 0.45;
const SPAWN_LOOKAHEAD = PLAYER_Z - SPAWN_Z;

function laneValue(index: LaneIndex) {
  return LANE_X[index];
}

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createBox(
  width: number,
  height: number,
  depth: number,
  color: string,
  options: Partial<THREE.MeshLambertMaterialParameters> = {},
) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshLambertMaterial({
      color,
      ...options,
    }),
  );
}

function createCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  color: string,
  options: Partial<THREE.MeshLambertMaterialParameters> = {},
  radialSegments = 12,
) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments),
    new THREE.MeshLambertMaterial({
      color,
      ...options,
    }),
  );
}

function createHorizontalCylinder(
  radius: number,
  length: number,
  color: string,
  options: Partial<THREE.MeshLambertMaterialParameters> = {},
  radialSegments = 10,
) {
  const mesh = createCylinder(radius, radius, length, color, options, radialSegments);
  mesh.rotation.z = Math.PI / 2;
  return mesh;
}

function createFrontDisk(
  radius: number,
  depth: number,
  color: string,
  options: Partial<THREE.MeshLambertMaterialParameters> = {},
  radialSegments = 18,
) {
  const mesh = createCylinder(radius, radius, depth, color, options, radialSegments);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material: THREE.Material) => material.dispose());
    } else if (mesh.material) {
      mesh.material.dispose();
    }
  });
}

function createPickupMesh(destination: Destination) {
  const group = new THREE.Group();
  const outer = new THREE.Shape();
  outer.moveTo(-0.24, 0.03);
  outer.lineTo(-0.22, 0.1);
  outer.lineTo(-0.16, 0.14);
  outer.lineTo(-0.12, 0.24);
  outer.lineTo(-0.04, 0.2);
  outer.lineTo(0, 0.3);
  outer.lineTo(0.04, 0.2);
  outer.lineTo(0.12, 0.24);
  outer.lineTo(0.16, 0.14);
  outer.lineTo(0.22, 0.1);
  outer.lineTo(0.24, 0.03);
  outer.lineTo(0.24, -0.03);
  outer.lineTo(0.22, -0.1);
  outer.lineTo(0.16, -0.14);
  outer.lineTo(0.12, -0.24);
  outer.lineTo(0.04, -0.2);
  outer.lineTo(0, -0.3);
  outer.lineTo(-0.04, -0.2);
  outer.lineTo(-0.12, -0.24);
  outer.lineTo(-0.16, -0.14);
  outer.lineTo(-0.22, -0.1);
  outer.lineTo(-0.24, -0.03);
  outer.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-0.072, -0.072);
  hole.lineTo(0.072, -0.072);
  hole.lineTo(0.072, 0.072);
  hole.lineTo(-0.072, 0.072);
  hole.closePath();
  outer.holes.push(hole);

  const chewGeometry = new THREE.ExtrudeGeometry(outer, {
    depth: 1.22,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.016,
    bevelThickness: 0.018,
    curveSegments: 16,
  });
  chewGeometry.center();

  const capMaterial = new THREE.MeshLambertMaterial({
    color: '#e5bf7f',
    emissive: new THREE.Color('#e5bf7f').multiplyScalar(0.04),
  });
  const sideMaterial = new THREE.MeshLambertMaterial({
    color: '#bf8d4d',
    emissive: new THREE.Color(destination.theme.pickup).multiplyScalar(0.16),
  });
  const chew = new THREE.Mesh(chewGeometry, [capMaterial, sideMaterial]);
  chew.rotation.set(0.16, Math.PI / 4, 0.2);
  chew.scale.set(0.86, 0.8, 1.18);
  group.add(chew);
  group.scale.setScalar(0.88);
  return group;
}

function createObstacleMesh(kind: RunnerObstacleKind, destination: Destination) {
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  });
  const routeId = destination.id;
  const material = (color: string, glow = 0.06) =>
    new THREE.MeshLambertMaterial({
      color,
      emissive: new THREE.Color(color).multiplyScalar(glow),
    });
  const shadow = (radius: number) => {
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 18), shadowMaterial.clone());
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02;
    return mesh;
  };

  if (routeId === 'rainbow-bridge') {
    const group = new THREE.Group();
    group.add(shadow(kind === 'bench' ? 0.94 : 0.72));

    if (kind === 'crate') {
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 18, 12),
        new THREE.MeshLambertMaterial({
          color: destination.theme.secondary,
          emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.24),
          transparent: true,
          opacity: 0.78,
        }),
      );
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.34, 0),
        material(destination.theme.glow, 0.34),
      );
      const ribbon = createBox(0.82, 0.08, 0.08, destination.theme.accent, {
        emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.2),
      });
      const cloudA = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 8),
        material('#fff8ef', 0.16),
      );
      const cloudB = cloudA.clone();
      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.14, 0),
        material(destination.theme.accent, 0.34),
      );
      halo.position.y = 0.52;
      core.position.y = 0.52;
      ribbon.position.set(0, 0.52, 0.42);
      cloudA.position.set(-0.32, 0.3, 0.18);
      cloudB.position.set(0.32, 0.3, 0.14);
      star.position.set(0, 0.9, 0.08);
      group.add(halo, core, ribbon, cloudA, cloudB, star);
      return group;
    }

    if (kind === 'bench') {
      const postA = createBox(0.16, 0.92, 0.16, destination.theme.decoB, {
        emissive: new THREE.Color(destination.theme.decoB).multiplyScalar(0.18),
      });
      const postB = postA.clone();
      const beam = createBox(1.3, 0.16, 0.18, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.24),
      });
      const glow = createBox(0.9, 0.08, 0.08, '#fff8ef', {
        emissive: new THREE.Color('#fff8ef').multiplyScalar(0.28),
      });
      const lowerBeam = createBox(1.08, 0.1, 0.14, destination.theme.accent, {
        emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.24),
      });
      const cloudA = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 12, 8),
        material('#fff8ef', 0.18),
      );
      const cloudB = cloudA.clone();
      postA.position.set(-0.56, 0.46, 0);
      postB.position.set(0.56, 0.46, 0);
      beam.position.set(0, 0.92, 0);
      glow.position.set(0, 0.7, 0.24);
      lowerBeam.position.set(0, 0.5, 0.02);
      cloudA.position.set(-0.68, 0.22, 0.12);
      cloudB.position.set(0.68, 0.22, 0.12);
      group.add(postA, postB, beam, glow, lowerBeam, cloudA, cloudB);
      return group;
    }

    const bar = createBox(1.08, 0.12, 0.14, destination.theme.accent, {
      emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.28),
    });
    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2, 0),
      material(destination.theme.secondary, 0.3),
    );
    const postA = createBox(0.12, 0.42, 0.12, '#fff8ef', {
      emissive: new THREE.Color('#fff8ef').multiplyScalar(0.18),
    });
    const postB = postA.clone();
    const glowLine = createBox(0.84, 0.06, 0.06, destination.theme.secondary, {
      emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.34),
    });
    bar.position.y = 0.42;
    star.position.set(0, 0.64, 0.02);
    postA.position.set(-0.48, 0.24, 0);
    postB.position.set(0.48, 0.24, 0);
    glowLine.position.set(0, 0.3, 0.1);
    group.add(bar, star, postA, postB, glowLine);
    return group;
  }

  if (kind === 'crate') {
    const group = new THREE.Group();
    group.add(shadow(0.7));

    if (routeId === 'moco-police-station') {
      const base = createBox(1.08, 0.42, 0.64, '#f7f0dc', {
        emissive: new THREE.Color('#f7f0dc').multiplyScalar(0.06),
      });
      const frontPanel = createBox(0.98, 0.32, 0.04, '#fff8ea', {
        emissive: new THREE.Color('#fff8ea').multiplyScalar(0.08),
      });
      const stripeA = createBox(0.18, 0.42, 0.045, destination.theme.obstacle, {
        emissive: new THREE.Color(destination.theme.obstacle).multiplyScalar(0.16),
      });
      const stripeB = stripeA.clone();
      const beaconBlue = createFrontDisk(0.1, 0.045, destination.theme.accent, {
        emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.28),
      });
      const beaconRed = createFrontDisk(0.1, 0.045, destination.theme.decoB, {
        emissive: new THREE.Color(destination.theme.decoB).multiplyScalar(0.28),
      });
      const footA = createBox(0.18, 0.14, 0.74, '#2f4147', {
        emissive: new THREE.Color('#2f4147').multiplyScalar(0.04),
      });
      const footB = footA.clone();
      base.position.y = 0.32;
      frontPanel.position.set(0, 0.34, 0.34);
      stripeA.position.set(-0.24, 0.36, 0.37);
      stripeB.position.set(0.24, 0.36, 0.37);
      stripeA.rotation.z = -0.52;
      stripeB.rotation.z = -0.52;
      beaconBlue.position.set(-0.36, 0.62, 0.37);
      beaconRed.position.set(0.36, 0.62, 0.37);
      footA.position.set(-0.42, 0.1, 0);
      footB.position.set(0.42, 0.1, 0);
      group.add(base, frontPanel, stripeA, stripeB, beaconBlue, beaconRed, footA, footB);
      return group;
    }

    if (routeId === 'rhode-island') {
      const stonePost = createCylinder(0.36, 0.48, 0.62, '#8f8a7d', {
        emissive: new THREE.Color('#8f8a7d').multiplyScalar(0.05),
      }, 8);
      const lighthouseTop = createCylinder(0.22, 0.28, 0.24, '#f6f0df', {
        emissive: new THREE.Color('#f6f0df').multiplyScalar(0.06),
      }, 8);
      const light = createFrontDisk(0.12, 0.045, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.24),
      });
      const cap = createBox(0.78, 0.1, 0.66, '#d8cab7', {
        emissive: new THREE.Color('#d8cab7').multiplyScalar(0.05),
      });
      const stripe = createBox(0.62, 0.08, 0.07, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.12),
      });
      stonePost.position.y = 0.36;
      cap.position.y = 0.66;
      lighthouseTop.position.y = 0.84;
      light.position.set(0, 0.84, 0.22);
      stripe.position.set(0, 0.38, 0.42);
      group.add(stonePost, cap, lighthouseTop, light, stripe);
      return group;
    }

    if (routeId === 'colorado') {
      const boulder = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.56, 0),
        material('#846d5a', 0.04),
      );
      const chip = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.26, 0),
        material('#b9956d', 0.04),
      );
      const pebble = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.18, 0),
        material('#d0b085', 0.04),
      );
      const snowCap = createBox(0.36, 0.08, 0.3, '#fff4dc', {
        emissive: new THREE.Color('#fff4dc').multiplyScalar(0.05),
      });
      boulder.scale.set(1.05, 0.78, 0.86);
      boulder.position.set(-0.08, 0.48, 0);
      boulder.rotation.set(0.22, 0.38, -0.12);
      chip.scale.set(1, 0.7, 0.8);
      chip.position.set(0.38, 0.27, 0.2);
      pebble.scale.set(1.1, 0.62, 0.84);
      pebble.position.set(-0.42, 0.2, 0.24);
      snowCap.position.set(-0.16, 0.78, 0.06);
      snowCap.rotation.z = -0.18;
      group.add(boulder, chip, pebble, snowCap);
      return group;
    }

    if (routeId === 'greece') {
      const base = createBox(1.04, 0.26, 0.78, '#f6efe2', {
        emissive: new THREE.Color('#f6efe2').multiplyScalar(0.08),
      });
      const middleStep = createBox(0.84, 0.22, 0.62, '#fffaf0', {
        emissive: new THREE.Color('#fffaf0').multiplyScalar(0.09),
      });
      const topStep = createBox(0.58, 0.2, 0.48, '#fffef4', {
        emissive: new THREE.Color('#fffef4').multiplyScalar(0.1),
      });
      const tile = createBox(0.7, 0.08, 0.08, destination.theme.accent, {
        emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.16),
      });
      const sideTile = createBox(0.12, 0.18, 0.06, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.14),
      });
      base.position.y = 0.2;
      middleStep.position.set(0.08, 0.46, -0.04);
      topStep.position.set(0.18, 0.68, -0.12);
      tile.position.set(0.08, 0.36, 0.42);
      sideTile.position.set(-0.36, 0.52, 0.3);
      group.add(base, middleStep, topStep, tile, sideTile);
      return group;
    }

    if (routeId === 'sweden') {
      const logMaterial = new THREE.MeshLambertMaterial({
        color: '#7b513c',
        emissive: new THREE.Color('#7b513c').multiplyScalar(0.04),
      });
      const logA = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.04, 8), logMaterial);
      const logB = logA.clone();
      const logC = logA.clone();
      const rope = createBox(0.92, 0.08, 0.08, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.14),
      });
      const sawEndA = createFrontDisk(0.11, 0.04, '#f1c996', {
        emissive: new THREE.Color('#f1c996').multiplyScalar(0.05),
      });
      const sawEndB = sawEndA.clone();
      logA.rotation.z = Math.PI / 2;
      logB.rotation.z = Math.PI / 2;
      logC.rotation.z = Math.PI / 2;
      logA.position.set(0, 0.28, -0.16);
      logB.position.set(0, 0.48, 0.08);
      logC.position.set(0, 0.68, -0.1);
      rope.position.set(0, 0.49, 0.42);
      sawEndA.position.set(-0.44, 0.48, 0.43);
      sawEndB.position.set(0.44, 0.48, 0.43);
      group.add(logA, logB, logC, rope, sawEndA, sawEndB);
      return group;
    }

    if (routeId === 'vietnam') {
      const basket = createCylinder(0.46, 0.52, 0.62, '#8a5b38', {
        emissive: new THREE.Color('#8a5b38').multiplyScalar(0.05),
      }, 10);
      const rim = createBox(0.92, 0.12, 0.78, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.18),
      });
      const handle = createHorizontalCylinder(0.035, 0.72, '#6f4227', {
        emissive: new THREE.Color('#6f4227').multiplyScalar(0.05),
      });
      const fruitA = createFrontDisk(0.09, 0.045, '#f5c46e', {
        emissive: new THREE.Color('#f5c46e').multiplyScalar(0.28),
      });
      const fruitB = createFrontDisk(0.075, 0.045, '#ff7148', {
        emissive: new THREE.Color('#ff7148').multiplyScalar(0.22),
      });
      basket.scale.set(1.05, 1, 0.82);
      basket.position.y = 0.42;
      rim.position.y = 0.76;
      handle.position.set(0, 0.88, 0);
      fruitA.position.set(-0.12, 0.5, 0.43);
      fruitB.position.set(0.1, 0.42, 0.43);
      group.add(basket, rim, handle, fruitA, fruitB);
      return group;
    }

    const cooler = createBox(0.98, 0.62, 0.76, destination.theme.obstacle, {
      emissive: new THREE.Color(destination.theme.obstacle).multiplyScalar(0.04),
    });
    cooler.position.y = 0.36;
    const lid = createBox(1.04, 0.14, 0.82, '#fff9ed', {
      emissive: new THREE.Color('#fff9ed').multiplyScalar(0.06),
    });
    lid.position.y = 0.72;
    const handle = createHorizontalCylinder(0.035, 0.54, '#fff9ed', {
      emissive: new THREE.Color('#fff9ed').multiplyScalar(0.08),
    });
    const latch = createBox(0.18, 0.18, 0.08, '#ffefc8');
    const stripe = createBox(0.5, 0.08, 0.06, destination.theme.secondary, {
      emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.18),
    });
    const wheelA = createFrontDisk(0.1, 0.06, '#2d3c35', {
      emissive: new THREE.Color('#2d3c35').multiplyScalar(0.04),
    });
    const wheelB = wheelA.clone();
    handle.position.set(0, 0.88, 0.14);
    latch.position.set(0, 0.49, 0.42);
    stripe.position.set(0, 0.4, 0.41);
    wheelA.position.set(-0.34, 0.08, 0.42);
    wheelB.position.set(0.34, 0.08, 0.42);
    group.add(cooler, lid, handle, latch, stripe, wheelA, wheelB);
    return group;
  }

  if (kind === 'bench') {
    const group = new THREE.Group();
    group.add(shadow(0.92));

    if (routeId === 'moco-police-station') {
      const gateArm = createBox(1.34, 0.14, 0.14, '#fff8ea', {
        emissive: new THREE.Color('#fff8ea').multiplyScalar(0.08),
      });
      const armStripeA = createBox(0.24, 0.15, 0.04, destination.theme.decoB, {
        emissive: new THREE.Color(destination.theme.decoB).multiplyScalar(0.18),
      });
      const armStripeB = armStripeA.clone();
      const armStripeC = createBox(0.24, 0.15, 0.04, destination.theme.accent, {
        emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.2),
      });
      const postA = createBox(0.16, 0.76, 0.18, '#38444c', {
        emissive: new THREE.Color('#38444c').multiplyScalar(0.05),
      });
      const postB = postA.clone();
      const footA = createBox(0.42, 0.14, 0.44, '#2f4147', {
        emissive: new THREE.Color('#2f4147').multiplyScalar(0.04),
      });
      const footB = footA.clone();
      const beaconBlue = createFrontDisk(0.08, 0.045, destination.theme.accent, {
        emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.35),
      });
      const beaconRed = createFrontDisk(0.08, 0.045, destination.theme.decoB, {
        emissive: new THREE.Color(destination.theme.decoB).multiplyScalar(0.35),
      });
      gateArm.position.set(0, 0.78, 0);
      armStripeA.position.set(-0.4, 0.78, 0.09);
      armStripeB.position.set(0.4, 0.78, 0.09);
      armStripeC.position.set(0, 0.78, 0.09);
      postA.position.set(-0.56, 0.44, 0);
      postB.position.set(0.56, 0.44, 0);
      footA.position.set(-0.56, 0.08, 0);
      footB.position.set(0.56, 0.08, 0);
      beaconBlue.position.set(-0.2, 0.98, 0.1);
      beaconRed.position.set(0.2, 0.98, 0.1);
      group.add(
        gateArm,
        armStripeA,
        armStripeB,
        armStripeC,
        postA,
        postB,
        footA,
        footB,
        beaconBlue,
        beaconRed,
      );
      return group;
    }

    if (routeId === 'rhode-island') {
      const wall = createBox(1.24, 0.58, 0.44, '#8d877a', {
        emissive: new THREE.Color('#8d877a').multiplyScalar(0.05),
      });
      const cap = createBox(1.32, 0.14, 0.5, '#d8cab7', {
        emissive: new THREE.Color('#d8cab7').multiplyScalar(0.05),
      });
      const rail = createHorizontalCylinder(0.04, 1.1, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.12),
      });
      const postA = createBox(0.1, 0.32, 0.1, '#f1e6d2', {
        emissive: new THREE.Color('#f1e6d2').multiplyScalar(0.05),
      });
      const postB = postA.clone();
      const tideStripe = createBox(1.06, 0.05, 0.05, '#f4fbff', {
        emissive: new THREE.Color('#f4fbff').multiplyScalar(0.08),
      });
      wall.position.y = 0.38;
      cap.position.y = 0.74;
      rail.position.set(0, 0.92, -0.22);
      postA.position.set(-0.48, 0.9, -0.22);
      postB.position.set(0.48, 0.9, -0.22);
      tideStripe.position.set(0, 0.38, 0.24);
      group.add(wall, cap, rail, postA, postB, tideStripe);
      return group;
    }

    if (routeId === 'colorado') {
      const log = createHorizontalCylinder(0.24, 1.28, '#76503b', {
        emissive: new THREE.Color('#76503b').multiplyScalar(0.04),
      }, 8);
      const rockA = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.28, 0),
        material('#9b8065', 0.04),
      );
      const rockB = rockA.clone();
      const branch = createBox(0.44, 0.07, 0.08, '#4f7f3f', {
        emissive: new THREE.Color('#4f7f3f').multiplyScalar(0.05),
      });
      log.position.y = 0.58;
      rockA.position.set(-0.5, 0.28, 0.22);
      rockB.position.set(0.5, 0.28, -0.18);
      branch.position.set(0.18, 0.78, 0.18);
      branch.rotation.z = -0.28;
      group.add(log, rockA, rockB, branch);
      return group;
    }

    if (routeId === 'greece') {
      const wall = createBox(1.26, 0.62, 0.42, '#fff8ea', {
        emissive: new THREE.Color('#fff8ea').multiplyScalar(0.09),
      });
      const blueCap = createBox(1.18, 0.14, 0.48, destination.theme.accent, {
        emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.14),
      });
      const window = createBox(0.32, 0.26, 0.06, destination.theme.accent, {
        emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.18),
      });
      const windowCrossV = createBox(0.04, 0.26, 0.065, '#fff8ea', {
        emissive: new THREE.Color('#fff8ea').multiplyScalar(0.08),
      });
      const windowCrossH = createBox(0.32, 0.04, 0.065, '#fff8ea', {
        emissive: new THREE.Color('#fff8ea').multiplyScalar(0.08),
      });
      const sunTile = createBox(0.16, 0.16, 0.06, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.18),
      });
      wall.position.y = 0.42;
      blueCap.position.y = 0.82;
      window.position.set(-0.22, 0.48, 0.24);
      windowCrossV.position.copy(window.position);
      windowCrossV.position.z += 0.01;
      windowCrossH.position.copy(window.position);
      windowCrossH.position.z += 0.012;
      sunTile.position.set(0.34, 0.48, 0.25);
      group.add(wall, blueCap, window, windowCrossV, windowCrossH, sunTile);
      return group;
    }

    if (routeId === 'sweden') {
      const body = createBox(1.22, 0.52, 0.42, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.08),
      });
      const roof = createBox(1.34, 0.16, 0.48, '#6a4535', {
        emissive: new THREE.Color('#6a4535').multiplyScalar(0.04),
      });
      const timber = createBox(1.08, 0.08, 0.08, '#f1dcc5', {
        emissive: new THREE.Color('#f1dcc5').multiplyScalar(0.06),
      });
      const door = createBox(0.22, 0.32, 0.06, '#6a4535', {
        emissive: new THREE.Color('#6a4535').multiplyScalar(0.04),
      });
      const windowA = createBox(0.18, 0.18, 0.065, '#f8e0a0', {
        emissive: new THREE.Color('#f8e0a0').multiplyScalar(0.18),
      });
      const windowB = windowA.clone();
      const chimney = createBox(0.16, 0.22, 0.16, '#704a40', {
        emissive: new THREE.Color('#704a40').multiplyScalar(0.04),
      });
      body.position.y = 0.42;
      roof.position.y = 0.78;
      timber.position.set(0, 0.5, 0.25);
      door.position.set(0, 0.34, 0.25);
      windowA.position.set(-0.36, 0.5, 0.25);
      windowB.position.set(0.36, 0.5, 0.25);
      chimney.position.set(0.38, 0.94, -0.05);
      group.add(body, roof, timber, door, windowA, windowB, chimney);
      return group;
    }

    if (routeId === 'vietnam') {
      const cart = createBox(1.24, 0.42, 0.48, '#815236', {
        emissive: new THREE.Color('#815236').multiplyScalar(0.05),
      });
      const canopy = createBox(1.34, 0.16, 0.54, destination.theme.secondary, {
        emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.2),
      });
      const canopyTrim = createBox(1.18, 0.08, 0.05, '#ff7148', {
        emissive: new THREE.Color('#ff7148').multiplyScalar(0.2),
      });
      const lanternA = createBox(0.16, 0.18, 0.12, '#f2bd62', {
        emissive: new THREE.Color('#f2bd62').multiplyScalar(0.35),
      });
      const lanternB = lanternA.clone();
      const wheelA = createFrontDisk(0.12, 0.06, '#4a2d20', {
        emissive: new THREE.Color('#4a2d20').multiplyScalar(0.04),
      });
      const wheelB = wheelA.clone();
      cart.position.y = 0.36;
      canopy.position.y = 0.74;
      canopyTrim.position.set(0, 0.62, 0.3);
      lanternA.position.set(-0.38, 0.57, 0.29);
      lanternB.position.set(0.38, 0.57, 0.29);
      wheelA.position.set(-0.42, 0.14, 0.28);
      wheelB.position.set(0.42, 0.14, 0.28);
      group.add(cart, canopy, canopyTrim, lanternA, lanternB, wheelA, wheelB);
      return group;
    }

    const slatMaterial = {
      emissive: new THREE.Color(destination.theme.decoA).multiplyScalar(0.08),
    };
    const supportMaterial = {
      emissive: new THREE.Color('#fff8ea').multiplyScalar(0.05),
    };
    const seatFront = createBox(1.22, 0.12, 0.12, destination.theme.decoA, slatMaterial);
    const seatBack = seatFront.clone();
    const backLow = createBox(1.2, 0.12, 0.1, destination.theme.decoA, slatMaterial);
    const backHigh = backLow.clone();
    const supportA = createBox(0.16, 0.56, 0.16, '#fff8ea', supportMaterial);
    const supportB = supportA.clone();
    const frontRail = createBox(0.94, 0.1, 0.12, destination.theme.secondary, {
      emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.12),
    });
    const stretcher = createBox(0.86, 0.08, 0.16, destination.theme.obstacleAlt, {
      emissive: new THREE.Color(destination.theme.obstacleAlt).multiplyScalar(0.08),
    });
    seatFront.position.set(0, 0.56, 0.12);
    seatBack.position.set(0, 0.56, -0.12);
    backLow.position.set(0, 0.82, -0.2);
    backHigh.position.set(0, 1, -0.24);
    supportA.position.set(-0.42, 0.32, 0.04);
    supportB.position.set(0.42, 0.32, 0.04);
    frontRail.position.set(0, 0.38, -0.06);
    stretcher.position.set(0, 0.06, 0.08);
    group.add(seatFront, seatBack, backLow, backHigh, supportA, supportB, frontRail, stretcher);
    return group;
  }

  const group = new THREE.Group();
  group.add(shadow(0.72));

  if (routeId === 'moco-police-station') {
    const topRail = createBox(1.08, 0.12, 0.12, '#fff8ea', {
      emissive: new THREE.Color('#fff8ea').multiplyScalar(0.08),
    });
    const lowerRail = createBox(0.94, 0.1, 0.1, destination.theme.obstacle, {
      emissive: new THREE.Color(destination.theme.obstacle).multiplyScalar(0.16),
    });
    const stripeA = createBox(0.16, 0.34, 0.04, destination.theme.obstacle, {
      emissive: new THREE.Color(destination.theme.obstacle).multiplyScalar(0.16),
    });
    const stripeB = stripeA.clone();
    const postA = createBox(0.12, 0.5, 0.12, '#2f4147', {
      emissive: new THREE.Color('#2f4147').multiplyScalar(0.04),
    });
    const postB = postA.clone();
    const footA = createBox(0.34, 0.1, 0.42, '#2f4147', {
      emissive: new THREE.Color('#2f4147').multiplyScalar(0.04),
    });
    const footB = footA.clone();
    topRail.position.set(0, 0.46, 0);
    lowerRail.position.set(0, 0.28, 0.02);
    stripeA.position.set(-0.24, 0.46, 0.08);
    stripeB.position.set(0.24, 0.46, 0.08);
    stripeA.rotation.z = -0.5;
    stripeB.rotation.z = -0.5;
    postA.position.set(-0.5, 0.28, 0);
    postB.position.set(0.5, 0.28, 0);
    footA.position.set(-0.5, 0.08, 0);
    footB.position.set(0.5, 0.08, 0);
    group.add(topRail, lowerRail, stripeA, stripeB, postA, postB, footA, footB);
    return group;
  }

  if (routeId === 'rhode-island') {
    const postA = createBox(0.12, 0.54, 0.12, '#d8cab7', {
      emissive: new THREE.Color('#d8cab7').multiplyScalar(0.05),
    });
    const postB = postA.clone();
    const topRope = createHorizontalCylinder(0.04, 1.02, destination.theme.secondary, {
      emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.14),
    }, 8);
    const lowerRope = createHorizontalCylinder(0.03, 0.86, '#f4e2bd', {
      emissive: new THREE.Color('#f4e2bd').multiplyScalar(0.08),
    }, 8);
    const capA = createFrontDisk(0.08, 0.04, destination.theme.secondary, {
      emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.16),
    });
    const capB = capA.clone();
    postA.position.set(-0.46, 0.28, 0);
    postB.position.set(0.46, 0.28, 0);
    topRope.position.y = 0.48;
    lowerRope.position.y = 0.32;
    capA.position.set(-0.46, 0.58, 0.08);
    capB.position.set(0.46, 0.58, 0.08);
    group.add(postA, postB, topRope, lowerRope, capA, capB);
    return group;
  }

  if (routeId === 'colorado') {
    const log = createHorizontalCylinder(0.12, 1.04, '#7b513c', {
      emissive: new THREE.Color('#7b513c').multiplyScalar(0.04),
    }, 8);
    const postA = createBox(0.12, 0.36, 0.12, '#8d6a4d', {
      emissive: new THREE.Color('#8d6a4d').multiplyScalar(0.05),
    });
    const postB = postA.clone();
    const pineTip = createBox(0.26, 0.06, 0.08, '#3f7d3d', {
      emissive: new THREE.Color('#3f7d3d').multiplyScalar(0.05),
    });
    log.position.y = 0.34;
    postA.position.set(-0.42, 0.18, 0);
    postB.position.set(0.42, 0.18, 0);
    pineTip.position.set(0.18, 0.46, 0.08);
    pineTip.rotation.z = -0.34;
    group.add(log, postA, postB, pineTip);
    return group;
  }

  if (routeId === 'greece') {
    const lip = createBox(1.02, 0.18, 0.18, '#fff8ea', {
      emissive: new THREE.Color('#fff8ea').multiplyScalar(0.09),
    });
    const stripe = createBox(0.82, 0.06, 0.06, destination.theme.accent, {
      emissive: new THREE.Color(destination.theme.accent).multiplyScalar(0.14),
    });
    const postA = createBox(0.1, 0.3, 0.1, '#efe3d0', {
      emissive: new THREE.Color('#efe3d0').multiplyScalar(0.06),
    });
    const postB = postA.clone();
    const tileA = createBox(0.12, 0.12, 0.05, destination.theme.secondary, {
      emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.14),
    });
    const tileB = tileA.clone();
    lip.position.y = 0.26;
    stripe.position.set(0, 0.35, 0.1);
    postA.position.set(-0.42, 0.14, 0);
    postB.position.set(0.42, 0.14, 0);
    tileA.position.set(-0.2, 0.24, 0.12);
    tileB.position.set(0.2, 0.24, 0.12);
    group.add(lip, stripe, postA, postB, tileA, tileB);
    return group;
  }

  if (routeId === 'sweden') {
    const log = createHorizontalCylinder(0.12, 1.02, '#6d4b39', {
      emissive: new THREE.Color('#6d4b39').multiplyScalar(0.04),
    }, 8);
    const capA = createBox(0.16, 0.16, 0.16, destination.theme.secondary, {
      emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.1),
    });
    const capB = capA.clone();
    const baseRail = createBox(0.86, 0.08, 0.1, '#f1dcc5', {
      emissive: new THREE.Color('#f1dcc5').multiplyScalar(0.06),
    });
    log.position.y = 0.32;
    capA.position.set(-0.5, 0.32, 0);
    capB.position.set(0.5, 0.32, 0);
    baseRail.position.set(0, 0.16, 0.04);
    group.add(log, capA, capB, baseRail);
    return group;
  }

  if (routeId === 'vietnam') {
    const bar = createBox(1.02, 0.1, 0.12, destination.theme.secondary, {
      emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.22),
    });
    const lowerBamboo = createHorizontalCylinder(0.035, 0.86, '#d79b56', {
      emissive: new THREE.Color('#d79b56').multiplyScalar(0.08),
    }, 8);
    const postA = createBox(0.1, 0.42, 0.1, '#7a5238', {
      emissive: new THREE.Color('#7a5238').multiplyScalar(0.06),
    });
    const postB = postA.clone();
    const lantern = createBox(0.18, 0.2, 0.12, '#f4bf68', {
      emissive: new THREE.Color('#f4bf68').multiplyScalar(0.34),
    });
    const lanternGlow = createFrontDisk(0.07, 0.04, '#ff7148', {
      emissive: new THREE.Color('#ff7148').multiplyScalar(0.28),
    });
    bar.position.y = 0.36;
    lowerBamboo.position.y = 0.22;
    postA.position.set(-0.46, 0.22, 0);
    postB.position.set(0.46, 0.22, 0);
    lantern.position.set(0, 0.55, 0.02);
    lanternGlow.position.set(0, 0.55, 0.09);
    group.add(bar, lowerBamboo, postA, postB, lantern, lanternGlow);
    return group;
  }

  const rail = createBox(1.08, 0.12, 0.14, destination.theme.secondary, {
    emissive: new THREE.Color(destination.theme.secondary).multiplyScalar(0.2),
  });
  const postA = createBox(0.12, 0.42, 0.12, destination.theme.obstacleAlt, {
    emissive: new THREE.Color(destination.theme.obstacleAlt).multiplyScalar(0.08),
  });
  const postB = postA.clone();
  const braceA = createBox(0.1, 0.38, 0.08, destination.theme.obstacleAlt, {
    emissive: new THREE.Color(destination.theme.obstacleAlt).multiplyScalar(0.08),
  });
  const braceB = braceA.clone();
  const grassStripe = createBox(0.86, 0.06, 0.04, '#fff8ea', {
    emissive: new THREE.Color('#fff8ea').multiplyScalar(0.06),
  });
  rail.position.set(0, 0.34, 0);
  postA.position.set(-0.46, 0.2, 0);
  postB.position.set(0.46, 0.2, 0);
  braceA.position.set(-0.2, 0.2, 0.02);
  braceB.position.set(0.2, 0.2, 0.02);
  braceA.rotation.z = -0.46;
  braceB.rotation.z = 0.46;
  grassStripe.position.set(0, 0.36, 0.08);
  group.add(rail, postA, postB, braceA, braceB, grassStripe);
  return group;
}

function createFinishGate(destination: Destination): FinishGateRig {
  const root = new THREE.Group();
  const checkerGroup = new THREE.Group();
  const finalRoad = destination.run.cannotLose ?? false;
  const checkerDark = new THREE.MeshLambertMaterial({
    color: finalRoad ? destination.theme.accent : '#161616',
    emissive: new THREE.Color(finalRoad ? destination.theme.accent : '#161616').multiplyScalar(
      finalRoad ? 0.24 : 0.08,
    ),
  });
  const checkerLight = new THREE.MeshLambertMaterial({
    color: finalRoad ? '#fff8ef' : '#fff7e7',
    emissive: new THREE.Color(finalRoad ? '#fff8ef' : '#fff7e7').multiplyScalar(
      finalRoad ? 0.24 : 0.12,
    ),
  });
  const checkerMaterials = [checkerLight, checkerDark];
  const tileWidth = 0.9;
  const tileDepth = 0.46;
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(tileWidth, 0.024, tileDepth),
        (row + column) % 2 === 0 ? checkerLight : checkerDark,
      );
      tile.position.set(-3.15 + column * tileWidth, 0.02, -0.7 + row * tileDepth);
      checkerGroup.add(tile);
    }
  }
  checkerGroup.position.y = 0.24;
  root.add(checkerGroup);

  return {
    root,
    checkerMaterials,
  };
}

function createDog(): DogRig {
  const root = new THREE.Group();
  const model = new THREE.Group();
  const furWhite = new THREE.MeshLambertMaterial({
    color: '#fffaf3',
  });
  const furBlack = new THREE.MeshLambertMaterial({
    color: '#121318',
  });
  const cheekTan = new THREE.MeshLambertMaterial({
    color: '#c58c57',
  });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.56, 0.98), furWhite);
  torso.position.set(0, 1.04, -0.02);

  const hips = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.58, 0.66), furWhite);
  hips.position.set(0, 0.99, 0.54);

  const haunchLeft = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.36), furWhite);
  const haunchRight = haunchLeft.clone();
  haunchLeft.position.set(-0.43, 0.92, 0.62);
  haunchRight.position.set(0.43, 0.92, 0.62);

  const rumpCap = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.16, 0.32), furWhite);
  rumpCap.position.set(0, 1.22, 0.74);

  const shoulder = new THREE.Mesh(new THREE.BoxGeometry(1, 0.54, 0.52), furWhite);
  shoulder.position.set(0, 1.06, -0.42);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.56, 0.44), furWhite);
  chest.position.set(0, 0.96, -0.74);

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.28), furWhite);
  neck.position.set(0, 1.24, -0.72);
  neck.rotation.x = -0.12;

  const backPatch = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.14, 0.72), furBlack);
  backPatch.position.set(-0.02, 1.34, 0.06);

  const head = new THREE.Group();
  head.position.set(0.04, 1.46, -1.04);

  const headBlock = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.8, 0.62), furWhite);
  headBlock.position.set(0, 0, 0);

  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.22), furWhite);
  muzzle.position.set(0.08, -0.18, -0.32);

  const muzzleTip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.1), furWhite);
  muzzleTip.position.set(0.08, -0.18, -0.44);

  const facePatch = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.48), furBlack);
  facePatch.position.set(-0.2, 0.02, 0.04);
  facePatch.rotation.z = 0.03;

  const cheekMarkLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.08), cheekTan);
  const cheekMarkRight = cheekMarkLeft.clone();
  cheekMarkLeft.position.set(-0.2, -0.2, -0.28);
  cheekMarkRight.position.set(0.14, -0.22, -0.24);

  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.1, 0.1),
    new THREE.MeshLambertMaterial({
      color: '#0d0f14',
    }),
  );
  nose.position.set(0.08, -0.2, -0.48);

  const earGeometry = new THREE.BoxGeometry(0.28, 0.72, 0.28);
  const earLeft = new THREE.Mesh(earGeometry, furBlack);
  const earRight = earLeft.clone();
  earLeft.position.set(-0.48, 0.04, 0.06);
  earRight.position.set(0.48, 0.04, 0.06);
  earLeft.rotation.z = 0.68;
  earLeft.rotation.x = 0.2;
  earRight.rotation.z = -0.68;
  earRight.rotation.x = 0.2;

  const sidePatchLeft = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.34), furBlack);
  sidePatchLeft.position.set(-0.46, 1.02, 0.08);
  sidePatchLeft.rotation.z = -0.08;
  sidePatchLeft.rotation.x = 0.04;

  head.add(
    headBlock,
    muzzle,
    muzzleTip,
    facePatch,
    cheekMarkLeft,
    cheekMarkRight,
    nose,
    earLeft,
    earRight,
  );

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.24), furWhite);
  tail.position.set(0, 1.02, 0.92);
  tail.rotation.x = 1.02;

  const tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.08), furBlack);
  tailTip.position.set(0, 0, 0.08);
  tail.add(tailTip);

  const legs: THREE.Group[] = [];
  const legPositions: Array<{ x: number; z: number; front: boolean }> = [
    { x: -0.28, z: -0.36, front: true },
    { x: 0.28, z: -0.36, front: true },
    { x: -0.32, z: 0.5, front: false },
    { x: 0.32, z: 0.5, front: false },
  ];

  for (const { x, z, front } of legPositions) {
    const leg = new THREE.Group();
      const upper = createBox(0.26, front ? 0.38 : 0.34, 0.26, '#f7f6ef');
      const lower = createBox(0.22, front ? 0.26 : 0.24, 0.22, '#f7f6ef');
      const paw = createBox(0.32, 0.1, 0.32, '#f7f6ef');
      upper.position.y = front ? 0.52 : 0.48;
      lower.position.y = front ? 0.21 : 0.19;
      paw.position.y = 0.05;
    leg.add(upper, lower, paw);
    leg.position.set(x, 0, z);
    model.add(leg);
    legs.push(leg);
  }

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.94, 22),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.235;
  shadow.scale.set(1.16, 1.34, 1.08);
  shadow.renderOrder = 2;

  model.add(
    torso,
    hips,
    haunchLeft,
    haunchRight,
    rumpCap,
    shoulder,
    chest,
    backPatch,
    sidePatchLeft,
    neck,
    head,
    tail,
  );

  root.add(shadow, model);

  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    }
  });

  const materials = new Set<THREE.Material>();
  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) {
      return;
    }
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => materials.add(material));
      return;
    }
    materials.add(mesh.material);
  });

  return {
    root,
    model,
    legs,
    tail,
    head,
    shadow,
    materials: [...materials],
  };
}

export function createRunnerGame({
  canvas,
  destination,
  activeBoostId,
  onHudChange,
  onScoreEvent,
  onComplete,
}: RunnerGameParams): RunnerGameController {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.9));
  renderer.setSize(
    canvas.clientWidth || window.innerWidth,
    canvas.clientHeight || window.innerHeight,
    false,
  );
  renderer.shadowMap.enabled = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    49,
    (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight),
    0.1,
    120,
  );
  camera.position.set(-1.2, 4.35, 11.95);

  const routeScene = createRouteScene(scene, destination);
  const routeConfig = routePatternSets[destination.id];
  const boost = getBoostModifiers(activeBoostId);
  const routeSpeed = BASE_ROUTE_SPEED * destination.run.baseSpeed * boost.routeSpeedMultiplier;
  const activeBoostLabel = activeBoostId ? boostLookup[activeBoostId].shortLabel : null;
  const finishDistance = destination.run.finishDistance;
  const cannotLose = destination.run.cannotLose ?? false;
  const difficultyPressure = Math.max(0, destination.run.difficulty - 1);
  const pickupHitScaleX = Math.max(0.3, 0.42 - difficultyPressure * 0.024);
  const pickupHitScaleZ = Math.max(0.38, 0.5 - difficultyPressure * 0.022);
  const pickupXMargin = Math.max(0.12, 0.28 - difficultyPressure * 0.032);
  const pickupZMargin = Math.max(0.16, 0.28 - difficultyPressure * 0.024);
  const pickupHeightTolerance = Math.max(0.56, 0.82 - difficultyPressure * 0.052);
  const gaitAmplitude =
    routeConfig.styleBias === 'calm'
      ? 0.34
      : routeConfig.styleBias === 'alternating'
        ? 0.38
        : 0.42;
  const tailCadence =
    routeConfig.styleBias === 'calm'
      ? 8.8
      : routeConfig.styleBias === 'alternating'
        ? 9.4
        : 10.2;
  const lookAheadZ =
    routeConfig.styleBias === 'calm'
      ? -6.2
      : routeConfig.styleBias === 'alternating'
        ? -6.5
        : -6.8;

  const dogRig = createDog();
  const playerRoot = dogRig.root;
  playerRoot.position.set(0, 0, PLAYER_Z);
  scene.add(playerRoot);

  const laneDashes: THREE.Mesh[] = [];
  const dashMaterial = new THREE.MeshBasicMaterial({
    color: destination.theme.laneGlow,
    transparent: true,
    opacity: 0.4,
  });
  for (let index = 0; index < 14; index += 1) {
    for (const lane of [-1, 0, 1] as LaneIndex[]) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 1.3), dashMaterial);
      dash.position.set(laneValue(lane), 0.24, -index * 3.2);
      dash.receiveShadow = false;
      laneDashes.push(dash);
      scene.add(dash);
    }
  }

  const finishGate = createFinishGate(destination);
  finishGate.root.position.set(0, 0, PLAYER_Z - finishDistance);
  scene.add(finishGate.root);

  const pickupTemplate = createPickupMesh(destination);
  const obstacleTemplates: Record<RunnerObstacleKind, THREE.Object3D> = {
    hurdle: createObstacleMesh('hurdle', destination),
    crate: createObstacleMesh('crate', destination),
    bench: createObstacleMesh('bench', destination),
  };

  const sparkGeometry = new THREE.OctahedronGeometry(0.08, 0);
  const sparkBaseMaterial = new THREE.MeshBasicMaterial({
    color: destination.theme.spark,
    transparent: true,
    opacity: 0,
  });
  const sparks: Spark[] = Array.from({ length: 18 }, () => {
    const material = sparkBaseMaterial.clone();
    const mesh = new THREE.Mesh(sparkGeometry, material);
    mesh.visible = false;
    scene.add(mesh);
    return {
      mesh,
      material,
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 0,
      active: false,
    };
  });

  const entities: RunnerEntity[] = [];
  const entityPools: Record<EntityKind, RunnerEntity[]> = {
    pickup: [],
    hurdle: [],
    crate: [],
    bench: [],
  };
  let animationFrame: number | null = null;
  let disposed = false;
  let paused = false;
  let score = 0;
  let hearts = 3;
  let chain = 0;
  let bestChain = 0;
  let stumbles = 0;
  let elapsed = 0;
  let distanceTravelled = 0;
  let spawnTimer = 0.7;
  let targetLane: LaneIndex = 0;
  let playerX = 0;
  let jumpY = 0;
  let jumpVelocity = 0;
  let jumpBufferTimer = 0;
  let groundedGraceTimer = GROUNDED_GRACE_WINDOW;
  let invulnerableTimer = 0;
  let finishCountdown = -1;
  let finishWon = false;
  let reachedFinish = false;
  let finishApproachAnnounced = false;
  let hudKey = '';
  let cameraKick = 0;
  let landingCompression = 0;
  let stumbleTilt = 0;
  const baseYaw = 0.2;
  const phasePatternCursors: Record<RoutePhase, number> = {
    warmup: 0,
    middle: 0,
    final: 0,
  };

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    routeScene.resize(camera.aspect);
  }

  function publishHud(force = false) {
    const finishProgress = THREE.MathUtils.clamp(distanceTravelled / finishDistance, 0, 1);
    const treatProgress = THREE.MathUtils.clamp(score / destination.run.targetScore, 0, 1);
    const snapshot: HudSnapshot = {
      score,
      target: destination.run.targetScore,
      chain,
      hearts,
      finishProgress,
      treatProgress,
      boostLabel: activeBoostLabel,
    };
    const key = `${snapshot.score}|${snapshot.chain}|${snapshot.hearts}|${Math.floor(snapshot.finishProgress * 100)}|${Math.floor(snapshot.treatProgress * 100)}|${snapshot.boostLabel ?? 'none'}`;
    if (force || key !== hudKey) {
      hudKey = key;
      onHudChange(snapshot);
    }
  }

  function queueFinish(won: boolean) {
    if (finishCountdown >= 0) {
      return;
    }

    finishWon = won;
    finishCountdown = won ? 0.72 : 0.52;
    soundManager.stopRunMusic();
    if (won) {
      soundManager.playWin();
      return;
    }

    soundManager.playLose();
  }

  function spawnSparkBurst(origin: THREE.Vector3, tone: 'good' | 'bad') {
    const count = tone === 'good' ? 6 : 4;
    for (let index = 0; index < count; index += 1) {
      const spark = sparks.find((candidate) => !candidate.active);
      if (!spark) {
        continue;
      }
      spark.active = true;
      spark.life = tone === 'good' ? 0.34 : 0.28;
      spark.maxLife = spark.life;
      spark.velocity.set(
        THREE.MathUtils.randFloatSpread(tone === 'good' ? 3.4 : 2.4),
        THREE.MathUtils.randFloat(0.9, tone === 'good' ? 3.2 : 2.2),
        THREE.MathUtils.randFloatSpread(1.8),
      );
      spark.material.color.set(tone === 'good' ? destination.theme.spark : '#f0b1a3');
      spark.material.opacity = 1;
      spark.mesh.scale.setScalar(1);
      spark.mesh.position.copy(origin);
      spark.mesh.visible = true;
    }
  }

  function deactivateEntity(entity: RunnerEntity) {
    entity.active = false;
    entity.mesh.visible = false;
  }

  function makeEntity(
    kind: EntityKind,
    lane: LaneIndex,
    z: number,
    y: number,
    width: number,
    height: number,
    depth: number,
    response: ObstacleResponse | null,
    clearHeight: number,
    requiresJumpPickup = false,
  ): RunnerEntity {
    let entity = entityPools[kind].find((candidate) => !candidate.active);
    if (!entity) {
      const mesh =
        kind === 'pickup' ? pickupTemplate.clone(true) : obstacleTemplates[kind].clone(true);
      mesh.visible = false;
      scene.add(mesh);
      entity = {
        kind,
        lane,
        x: laneValue(lane),
        y,
        z,
        width,
        height,
        depth,
        active: false,
        mesh,
        response,
        clearHeight,
        baseY: y,
        requiresJumpPickup,
      };
      entityPools[kind].push(entity);
      entities.push(entity);
    }

    entity.kind = kind;
    entity.lane = lane;
    entity.x = laneValue(lane);
    entity.y = y;
    entity.z = z;
    entity.width = width;
    entity.height = height;
    entity.depth = depth;
    entity.response = response;
    entity.clearHeight = clearHeight;
    entity.baseY = y;
    entity.requiresJumpPickup = requiresJumpPickup;
    entity.active = true;
    entity.mesh.visible = true;
    entity.mesh.position.set(entity.x, y, z);
    entity.mesh.rotation.set(0, 0, 0);
    return entity;
  }

  function getPickupLimit(phase: RoutePhase) {
    if (cannotLose) {
      return Number.POSITIVE_INFINITY;
    }

    if (destination.run.difficulty <= 1) {
      return Number.POSITIVE_INFINITY;
    }

    if (destination.run.difficulty === 2) {
      return phase === 'final' ? 1 : 2;
    }

    if (destination.run.difficulty === 3) {
      return phase === 'warmup' ? 2 : 1;
    }

    if (destination.id === 'greece') {
      return phase === 'final' ? 1 : 2;
    }

    return 1;
  }

  function pickupY(pickup: RunnerPattern['tandborste'][number]) {
    return pickup.y ?? DEFAULT_PICKUP_Y;
  }

  function pickupZOffset(pickup: RunnerPattern['tandborste'][number]) {
    return pickup.z ?? DEFAULT_PICKUP_Z_OFFSET;
  }

  function liftFencePickups(pattern: RunnerPattern): RunnerPattern['tandborste'] {
    const hurdles = pattern.obstacles.filter((obstacle) => obstacle.kind === 'hurdle');
    if (hurdles.length === 0) {
      return pattern.tandborste;
    }

    return pattern.tandborste.map((pickup) => {
      const pairedHurdle = hurdles.find((hurdle) => {
        const hurdleZ = hurdle.z ?? 0;
        return (
          hurdle.lane === pickup.lane &&
          Math.abs(hurdleZ - pickupZOffset(pickup)) <= HURDLE_PICKUP_Z_WINDOW
        );
      });

      if (!pairedHurdle) {
        return pickup;
      }

      return {
        ...pickup,
        requiresJump: true,
        y: Math.max(pickupY(pickup), HURDLE_PICKUP_MIN_Y),
        z: pairedHurdle.z ?? 0,
      };
    });
  }

  function choosePickups(pickups: RunnerPattern['tandborste'], phase: RoutePhase) {
    const limit = getPickupLimit(phase);
    if (pickups.length <= limit) {
      return pickups;
    }

    return [...pickups]
      .sort((a, b) => {
        const heightDelta = pickupY(b) - pickupY(a);
        if (heightDelta !== 0) {
          return heightDelta;
        }

        const laneDelta = Math.abs(b.lane) - Math.abs(a.lane);
        if (laneDelta !== 0) {
          return laneDelta;
        }

        return pickupZOffset(a) - pickupZOffset(b);
      })
      .slice(0, limit);
  }

  function addPattern(): RoutePhase {
    const progress = distanceTravelled / finishDistance;
    const phase = getRoutePhase(progress);
    const patternPool = routeConfig.patterns[phase] as RunnerPattern[];
    const pattern =
      routeConfig.selectionMode === 'cycle'
        ? patternPool[phasePatternCursors[phase]++ % patternPool.length]
        : randomFrom(patternPool);
    const rowZ = SPAWN_Z;

    pattern.obstacles.forEach((obstacle) => {
      const spec = obstacleSpecs[obstacle.kind];
      makeEntity(
        obstacle.kind,
        obstacle.lane,
        rowZ + (obstacle.z ?? 0),
        spec.y,
        spec.width,
        spec.height,
        spec.depth,
        spec.response,
        spec.clearHeight,
      );
    });

    choosePickups(liftFencePickups(pattern), phase).forEach((pickup) => {
      makeEntity(
        'pickup',
        pickup.lane,
        rowZ + pickupZOffset(pickup),
        pickupY(pickup),
        0.64,
        0.48,
        0.52,
        null,
        0,
        pickup.requiresJump ?? false,
      );
    });

    return phase;
  }

  function isGrounded() {
    return jumpY <= 0.04 && jumpVelocity <= 0.01;
  }

  function canStartJump() {
    return finishCountdown < 0 && (isGrounded() || groundedGraceTimer > 0);
  }

  function performJump() {
    jumpBufferTimer = 0;
    groundedGraceTimer = 0;
    jumpVelocity = 6.65 * boost.jumpBoost;
    soundManager.playJump();
    onScoreEvent({
      label: 'Hoppskutt!',
      value: 0,
      chain,
      tone: 'boost',
    });
  }

  function requestJump() {
    if (paused || finishCountdown >= 0) {
      return;
    }

    if (canStartJump()) {
      performJump();
      return;
    }

    jumpBufferTimer = JUMP_BUFFER_WINDOW;
  }

  function collect(entity: RunnerEntity) {
    deactivateEntity(entity);
    chain += 1;
    bestChain = Math.max(bestChain, chain);
    const value = Math.max(1, Math.round(1 * boost.scoreMultiplier));
    score += value;
    cameraKick = Math.max(cameraKick, 0.2);
    soundManager.playPickup(chain > 3);
    onScoreEvent({
      label: cannotLose ? `Memory light +${value}` : `Tandborste +${value}`,
      value,
      chain,
      tone: chain > 3 ? 'boost' : 'good',
    });
    spawnSparkBurst(new THREE.Vector3(entity.x, entity.mesh.position.y, entity.z), 'good');
    publishHud(true);
  }

  function softTouch(entity: RunnerEntity) {
    deactivateEntity(entity);
    chain += 1;
    bestChain = Math.max(bestChain, chain);
    const value = Math.max(1, Math.round(1 * boost.scoreMultiplier));
    score += value;
    cameraKick = Math.max(cameraKick, 0.16);
    soundManager.playPickup(true);
    onScoreEvent({
      label: `Gentle glow +${value}`,
      value,
      chain,
      tone: 'boost',
    });
    spawnSparkBurst(new THREE.Vector3(entity.x, 0.9, entity.z), 'good');
    publishHud(true);
  }

  function stumble(entity: RunnerEntity) {
    deactivateEntity(entity);
    if (invulnerableTimer > 0) {
      return;
    }

    chain = 0;
    hearts -= 1;
    stumbles += 1;
    invulnerableTimer = 1.05;
    stumbleTilt = entity.response === 'jump' ? 0.18 : 0.14;
    cameraKick = Math.min(cameraKick - 0.24, -0.34);
    soundManager.playBump();
    onScoreEvent({
      label: hearts > 0 ? (entity.response === 'jump' ? 'Missed hop' : 'Wrong lane') : 'Wiped Out',
      value: 0,
      chain: 0,
      tone: 'bad',
    });
    spawnSparkBurst(new THREE.Vector3(entity.x, 0.9, entity.z), 'bad');
    publishHud(true);
    if (hearts <= 0) {
      queueFinish(false);
    }
  }

  function updateEntities(delta: number, totalElapsed: number) {
    spawnTimer -= delta;
    const canSpawnMorePatterns =
      finishCountdown < 0 && distanceTravelled + SPAWN_LOOKAHEAD < finishDistance;
    if (spawnTimer <= 0 && canSpawnMorePatterns) {
      const phase = addPattern();
      const [minSpawn, maxSpawn] = routeConfig.spawnRanges[phase];
      spawnTimer = THREE.MathUtils.randFloat(minSpawn, maxSpawn);
    }

    for (let index = 0; index < entities.length; index += 1) {
      const entity = entities[index];
      if (!entity.active) {
        continue;
      }

      entity.z += routeSpeed * delta;
      entity.mesh.position.z = entity.z;

      if (entity.kind === 'pickup') {
        entity.mesh.position.y =
          entity.baseY + Math.sin(totalElapsed * 4.4 + index * 0.8) * 0.08;
        entity.mesh.rotation.y = Math.PI / 4 + Math.sin(totalElapsed * 2 + index) * 0.05;
        entity.mesh.rotation.z = 0.24 + Math.sin(totalElapsed * 3.8 + index) * 0.04;
      }

      if (entity.z > 11) {
        deactivateEntity(entity);
        continue;
      }

      const xClose =
        Math.abs(playerX - entity.x) <
        entity.width * (entity.kind === 'pickup' ? pickupHitScaleX : 0.48) +
          (entity.kind === 'pickup' ? pickupXMargin : 0.18);
      const zClose =
        Math.abs(PLAYER_Z - entity.z) <
        entity.depth * (entity.kind === 'pickup' ? pickupHitScaleZ : 0.44) +
          (entity.kind === 'pickup' ? pickupZMargin : 0.2);

      if (!xClose || !zClose) {
        continue;
      }

      if (entity.kind === 'pickup') {
        const chestHeight = 1.1 + jumpY;
        const catchesStandardPickup =
          Math.abs(chestHeight - entity.mesh.position.y) < pickupHeightTolerance;
        const catchesJumpPickup = entity.requiresJumpPickup && jumpY >= JUMP_PICKUP_MIN_JUMP_Y;
        if (catchesStandardPickup || catchesJumpPickup) {
          collect(entity);
        }
        continue;
      }

      if (cannotLose) {
        softTouch(entity);
        continue;
      }

      if (entity.response === 'jump') {
        const clearance = jumpY + HURDLE_BODY_CLEARANCE;
        if (clearance < entity.clearHeight - HURDLE_CLEARANCE_GRACE) {
          stumble(entity);
        } else {
          deactivateEntity(entity);
        }
        continue;
      }

      stumble(entity);
    }
  }

  function updatePlayer(delta: number, totalElapsed: number) {
    if (jumpBufferTimer > 0) {
      jumpBufferTimer = Math.max(0, jumpBufferTimer - delta);
    }
    if (!isGrounded()) {
      groundedGraceTimer = Math.max(0, groundedGraceTimer - delta);
    }

    const laneTarget = laneValue(targetLane);
    playerX = THREE.MathUtils.damp(playerX, laneTarget, 14.2 * boost.laneShiftMultiplier, delta);
    if (Math.abs(playerX - laneTarget) < 0.02) {
      playerX = laneTarget;
    }

    const previousJumpY = jumpY;
    jumpVelocity -= GRAVITY * delta;
    jumpY = Math.max(0, jumpY + jumpVelocity * delta);
    if (jumpY === 0) {
      if (previousJumpY > 0.02) {
        landingCompression = Math.max(
          landingCompression,
          THREE.MathUtils.clamp(Math.abs(jumpVelocity) * 0.018 + 0.05, 0.08, 0.18),
        );
      }
      if (jumpVelocity < 0) {
        jumpVelocity = 0;
      }
    }

    if (isGrounded()) {
      groundedGraceTimer = GROUNDED_GRACE_WINDOW;
      if (jumpBufferTimer > 0) {
        performJump();
      }
    }

    landingCompression = THREE.MathUtils.damp(landingCompression, 0, 10, delta);
    stumbleTilt = THREE.MathUtils.damp(stumbleTilt, 0, 9.5, delta);

    const gait = totalElapsed * (8.2 + routeSpeed * 0.08);
    const groundBounce = jumpY > 0 ? 0 : 0.05 + Math.abs(Math.sin(gait)) * 0.08;
    const leanTarget = -THREE.MathUtils.clamp((laneTarget - playerX) * 0.28, -0.18, 0.18);
    const airborneStretch = jumpY > 0 ? Math.min(0.07, jumpY * 0.06) : 0;

    playerRoot.position.set(playerX, jumpY + groundBounce, PLAYER_Z);
    playerRoot.rotation.y = THREE.MathUtils.damp(
      playerRoot.rotation.y,
      baseYaw + (laneTarget - playerX) * -0.08,
      9,
      delta,
    );
    dogRig.model.rotation.z = THREE.MathUtils.damp(dogRig.model.rotation.z, leanTarget, 11, delta);
    dogRig.model.rotation.x = THREE.MathUtils.damp(
      dogRig.model.rotation.x,
      -stumbleTilt + (jumpY > 0 ? -0.05 : 0),
      8,
      delta,
    );
    dogRig.model.scale.set(
      1 + landingCompression * 0.22 - airborneStretch * 0.08,
      1 - landingCompression + airborneStretch,
      1 + landingCompression * 0.15 - airborneStretch * 0.04,
    );

    const stride = jumpY > 0 ? 0.12 : Math.sin(gait) * gaitAmplitude;
    dogRig.legs.forEach((leg, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      leg.rotation.x = stride * direction;
      leg.position.y = jumpY > 0 ? 0.04 : Math.max(0, Math.sin(gait + index * 0.3) * 0.05);
    });
    dogRig.tail.rotation.x = 0.9 + Math.sin(totalElapsed * tailCadence) * 0.1;
    dogRig.head.rotation.y =
      Math.sin(totalElapsed * 3.9) * 0.03 + dogRig.model.rotation.z * -0.16;
    dogRig.head.rotation.x =
      -0.06 + (jumpY > 0 ? -0.04 : 0) + Math.sin(totalElapsed * 6.2) * 0.01;
    dogRig.shadow.scale.set(1.16 - jumpY * 0.08, 1.4 - jumpY * 0.1, 1.12 - jumpY * 0.08);

    if (invulnerableTimer > 0) {
      invulnerableTimer = Math.max(0, invulnerableTimer - delta);
      const opacity = 0.62 + Math.sin(elapsed * 14) * 0.06;
      dogRig.materials.forEach((material) => {
        material.transparent = true;
        material.opacity = opacity;
      });
      playerRoot.visible = true;
    } else {
      playerRoot.visible = true;
      dogRig.materials.forEach((material) => {
        material.transparent = false;
        material.opacity = 1;
      });
    }
  }

  function updateEnvironment(delta: number, totalElapsed: number) {
    laneDashes.forEach((dash) => {
      dash.position.z += routeSpeed * delta;
      if (dash.position.z > 8) {
        dash.position.z -= 64;
      }
    });

    finishGate.root.position.z += routeSpeed * delta;
    const remainingDistance = Math.max(0, finishDistance - distanceTravelled);
    const gatePulse =
      remainingDistance < 60
        ? 0.18 + Math.sin(totalElapsed * 4.2) * 0.08
        : 0.06 + Math.sin(totalElapsed * 2.4) * 0.03;
    finishGate.checkerMaterials[0].emissiveIntensity = 0.12 + gatePulse;
    finishGate.checkerMaterials[1].emissiveIntensity = 0.08 + gatePulse * 0.7;
  }

  function updateSparks(delta: number) {
    for (let index = 0; index < sparks.length; index += 1) {
      const spark = sparks[index];
      if (!spark.active) {
        continue;
      }
      spark.life -= delta;
      spark.velocity.y -= 8 * delta;
      spark.mesh.position.addScaledVector(spark.velocity, delta);
      const alpha = THREE.MathUtils.clamp(spark.life / spark.maxLife, 0, 1);
      spark.mesh.scale.setScalar(alpha * 1.55);
      spark.material.opacity = alpha;
      if (spark.life <= 0) {
        spark.active = false;
        spark.mesh.visible = false;
        spark.material.opacity = 0;
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (paused) {
      return;
    }

    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      targetLane = Math.max(-1, (targetLane - 1) as LaneIndex) as LaneIndex;
    }
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      targetLane = Math.min(1, (targetLane + 1) as LaneIndex) as LaneIndex;
    }
    if (
      event.key === 'ArrowUp' ||
      event.key.toLowerCase() === 'w' ||
      event.code === 'Space'
    ) {
      event.preventDefault();
      if (!event.repeat) {
        requestJump();
      }
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (
      event.key === 'ArrowLeft' ||
      event.key.toLowerCase() === 'a' ||
      event.key === 'ArrowRight' ||
      event.key.toLowerCase() === 'd'
    ) {
      return;
    }
  }

  function handlePointerDown(event: PointerEvent) {
    if (paused) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width * 0.32) {
      targetLane = Math.max(-1, (targetLane - 1) as LaneIndex) as LaneIndex;
      return;
    }
    if (x > rect.width * 0.68) {
      targetLane = Math.min(1, (targetLane + 1) as LaneIndex) as LaneIndex;
      return;
    }
    requestJump();
  }

  function step(now: number) {
    if (disposed || paused) {
      return;
    }

    const current = now * 0.001;
    const delta = Math.min(0.033, current - elapsed || 0.016);
    elapsed = current;

    if (finishCountdown < 0) {
      distanceTravelled = Math.min(finishDistance, distanceTravelled + routeSpeed * delta);
    } else {
      finishCountdown = Math.max(0, finishCountdown - delta);
      if (finishCountdown === 0) {
        onComplete({
          destinationId: destination.id,
          won: finishWon,
          score,
          target: destination.run.targetScore,
          bestChain,
          stumbles,
          activeBoostId,
          finishDistance,
          distanceTravelled: Math.round(Math.min(distanceTravelled, finishDistance)),
          reachedFinish,
        });
        return;
      }
    }

    const remainingDistance = finishDistance - distanceTravelled;
    if (!finishApproachAnnounced && finishCountdown < 0 && remainingDistance < 68) {
      finishApproachAnnounced = true;
      cameraKick = Math.max(cameraKick, 0.18);
      soundManager.playFinishApproach();
      onScoreEvent({
        label: cannotLose ? 'Rainbow gate ahead' : 'Finish gate ahead',
        value: 0,
        chain,
        tone: 'boost',
      });
    }

    updatePlayer(delta, current);
    updateEnvironment(delta, current);
    updateEntities(delta, current);
    updateSparks(delta);
    routeScene.update(current);

    if (!reachedFinish && finishCountdown < 0 && finishGate.root.position.z >= FINISH_TRIGGER_Z) {
      reachedFinish = true;
      const won = cannotLose || (score >= destination.run.targetScore && hearts > 0);
      onScoreEvent({
        label: cannotLose
          ? 'Rainbow Bridge crossed'
          : won
            ? 'Sticker secured'
            : 'Need more Tandborste',
        value: 0,
        chain,
        tone: won ? 'good' : 'bad',
      });
      queueFinish(won);
    }

    cameraKick = THREE.MathUtils.damp(cameraKick, 0, 7.5, delta);
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      playerX * 0.16 - 1.02,
      6,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      4.3 + jumpY * 0.08 + Math.max(0, cameraKick * 0.12),
      6.2,
      delta,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      11.9 + cameraKick * -0.38,
      6.2,
      delta,
    );
    camera.lookAt(playerX * 0.05, 1.24 + jumpY * 0.06, lookAheadZ + cameraKick * 0.22);

    publishHud();
    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(step);
  }

  function pause() {
    if (disposed || paused) {
      return;
    }

    paused = true;
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    soundManager.pauseRunMusic();
  }

  function resume() {
    if (disposed || !paused) {
      return;
    }

    paused = false;
    elapsed = performance.now() * 0.001;
    soundManager.resumeRunMusic(destination.id);
    animationFrame = window.requestAnimationFrame(step);
  }

  publishHud(true);
  resize();
  soundManager.startRunMusic(destination.id);
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  canvas.addEventListener('pointerdown', handlePointerDown);
  animationFrame = window.requestAnimationFrame(step);

  return {
    isPaused() {
      return paused;
    },
    pause,
    resume,
    dispose() {
      disposed = true;
      soundManager.stopRunMusic();
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      routeScene.dispose();
      renderer.dispose();
      sparkGeometry.dispose();
      sparkBaseMaterial.dispose();
      sparks.forEach((spark) => {
        scene.remove(spark.mesh);
        spark.material.dispose();
      });
      laneDashes.forEach((dash) => {
        dash.geometry.dispose();
      });
      dashMaterial.dispose();
      scene.remove(finishGate.root);
      disposeObject3D(finishGate.root);
      disposeObject3D(playerRoot);
      disposeObject3D(pickupTemplate);
      Object.values(obstacleTemplates).forEach((template) => {
        disposeObject3D(template);
      });
      entities.forEach((entity) => {
        scene.remove(entity.mesh);
      });
    },
  };
}
