import * as THREE from 'three';
import type { Destination } from '../data/destinations';
import { postcardArtPaths } from '../assets/artPaths';

type RouteSceneController = {
  update: (elapsed: number) => void;
  dispose: () => void;
};

function makeMaterial(
  color: string,
  options: Partial<THREE.MeshLambertMaterialParameters> = {},
) {
  return new THREE.MeshLambertMaterial({
    color,
    ...options,
  });
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    if ((mesh as THREE.Mesh).isMesh && mesh.userData.sharedAsset) {
      return;
    }

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

function makePine(canopyColor: string) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 1.8, 8),
    makeMaterial('#79573f'),
  );
  const canopyA = new THREE.Mesh(
    new THREE.ConeGeometry(0.62, 0.92, 12),
    makeMaterial(canopyColor),
  );
  const canopyB = new THREE.Mesh(
    new THREE.ConeGeometry(0.46, 0.78, 12),
    makeMaterial(canopyColor),
  );
  trunk.position.y = 0.9;
  canopyA.position.y = 1.52;
  canopyB.position.y = 2.04;
  tree.add(trunk, canopyA, canopyB);
  return tree;
}

function makeLantern(color: string, glow: string) {
  const lantern = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.34, 8),
    makeMaterial(color),
  );
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.28, 0.34),
    makeMaterial(glow, {
      emissive: new THREE.Color(glow).multiplyScalar(0.16),
    }),
  );
  pole.position.y = 0.67;
  cap.position.y = 1.46;
  lantern.add(pole, cap);
  return lantern;
}

function makeHouse(baseColor: string, roofColor: string) {
  const house = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.78, 0.92),
    makeMaterial(baseColor),
  );
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.94, 0.48, 4),
    makeMaterial(roofColor),
  );
  body.position.y = 0.39;
  roof.position.y = 1.02;
  roof.rotation.y = Math.PI / 4;
  house.add(body, roof);
  return house;
}

function makeReedCluster(color: string) {
  const reeds = new THREE.Group();
  for (let index = 0; index < 5; index += 1) {
    const stalk = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.7 + index * 0.04, 0.04),
      makeMaterial(color),
    );
    stalk.position.set(-0.16 + index * 0.08, 0.34 + index * 0.02, 0);
    reeds.add(stalk);
  }
  return reeds;
}

function makeLowStone(color: string) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.46, 0.74),
    makeMaterial(color),
  );
}

function makeBuoy(color: string) {
  const buoy = new THREE.Group();
  const float = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 14, 12),
    makeMaterial(color),
  );
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8),
    makeMaterial('#7f8a75'),
  );
  post.position.y = 0.18;
  float.position.y = 0.42;
  buoy.add(post, float);
  return buoy;
}

function makeCloudCluster(color: string) {
  const cloud = new THREE.Group();
  const material = makeMaterial(color, {
    emissive: new THREE.Color(color).multiplyScalar(0.08),
  });
  const parts = [
    { x: -0.36, y: 0.28, scale: [0.74, 0.42, 0.42] },
    { x: 0, y: 0.42, scale: [0.92, 0.58, 0.5] },
    { x: 0.4, y: 0.26, scale: [0.66, 0.38, 0.38] },
  ] as const;

  parts.forEach((part) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 12), material);
    puff.scale.set(part.scale[0], part.scale[1], part.scale[2]);
    puff.position.set(part.x, part.y, 0);
    cloud.add(puff);
  });

  return cloud;
}

function makeMemoryLight(color: string) {
  const group = new THREE.Group();
  const glow = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.24, 0),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.86,
    }),
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 16, 12),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
  );
  group.add(halo, glow);
  return group;
}

export function createRouteScene(
  scene: THREE.Scene,
  destination: Destination,
): RouteSceneController {
  const root = new THREE.Group();
  const animated: Array<(elapsed: number) => void> = [];
  const disposableTextures: THREE.Texture[] = [];

  scene.background = new THREE.Color(destination.theme.background);
  scene.fog = new THREE.Fog(destination.theme.fog, 15, 48);
  scene.add(root);

  const ambient = new THREE.HemisphereLight(
    destination.theme.lightA,
    destination.theme.background,
    1.34,
  );
  const sun = new THREE.DirectionalLight(destination.theme.lightB, 1.3);
  sun.position.set(6, 12, 8);
  sun.castShadow = false;
  root.add(ambient, sun);

  const textureLoader = new THREE.TextureLoader();
  const backdropTexture = textureLoader.load(postcardArtPaths[destination.id]);
  backdropTexture.colorSpace = THREE.SRGBColorSpace;
  backdropTexture.generateMipmaps = true;
  backdropTexture.magFilter = THREE.LinearFilter;
  backdropTexture.minFilter = THREE.LinearMipmapLinearFilter;
  disposableTextures.push(backdropTexture);
  scene.background = backdropTexture;

  const trackBase = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, 0.24, 52),
    makeMaterial(destination.theme.surfaceEdge),
  );
  trackBase.position.set(0, 0.05, -10);
  root.add(trackBase);

  const track = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 0.08, 52),
    makeMaterial(destination.theme.surface, {
      emissive: new THREE.Color(destination.theme.laneGlow).multiplyScalar(0.06),
    }),
  );
  track.position.set(0, 0.19, -10);
  root.add(track);

  if (destination.id === 'rainbow-bridge') {
    const rainbowColors = [
      '#ff6868',
      '#ffb84d',
      '#fff36f',
      '#68e082',
      '#5fd9ff',
      '#7994ff',
      '#d681ff',
    ];
    const stripeWidth = 7.2 / rainbowColors.length;
    rainbowColors.forEach((color, index) => {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(stripeWidth, 0.035, 52.2),
        new THREE.MeshLambertMaterial({
          color,
          emissive: new THREE.Color(color).multiplyScalar(0.12),
        }),
      );
      stripe.position.set(-3.6 + stripeWidth * (index + 0.5), 0.255, -10);
      root.add(stripe);
    });
  }

  const shoulderMaterial = makeMaterial(destination.theme.decoA, {
    emissive: new THREE.Color(destination.theme.decoA).multiplyScalar(0.03),
  });
  const shoulderLeft = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 52), shoulderMaterial);
  const shoulderRight = shoulderLeft.clone();
  shoulderLeft.position.set(-4.4, 0.2, -10);
  shoulderRight.position.set(4.4, 0.2, -10);
  root.add(shoulderLeft, shoulderRight);

  const bermMaterial = makeMaterial(destination.theme.backgroundAlt, {
    emissive: new THREE.Color(destination.theme.backgroundAlt).multiplyScalar(0.02),
  });
  const bermLeft = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 52), bermMaterial);
  const bermRight = bermLeft.clone();
  bermLeft.position.set(-5.8, 0.18, -10);
  bermRight.position.set(5.8, 0.18, -10);
  root.add(bermLeft, bermRight);

  const laneGlowMaterial = new THREE.MeshBasicMaterial({
    color: destination.theme.laneGlow,
    transparent: true,
    opacity: 0.2,
  });
  for (const x of [-2.2, 0, 2.2]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 48), laneGlowMaterial);
    line.position.set(x, 0.26, -10);
    root.add(line);
  }

  const context = new THREE.Group();

  if (destination.id === 'maryland') {
    const reedsLeft = makeReedCluster('#7d9569');
    reedsLeft.position.set(-6.7, 0, -18.2);
    const reedsRight = makeReedCluster('#8a9f72');
    reedsRight.position.set(6.7, 0, -24.2);
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 1.1, 0.16),
      makeMaterial('#9f815f'),
    );
    post.position.set(-7.2, 0.56, -12.8);
    const buoy = makeBuoy(destination.theme.secondary);
    buoy.position.set(6.8, 0, -14.4);
    animated.push((elapsed) => {
      buoy.position.y = Math.sin(elapsed * 2.2) * 0.06;
    });
    context.add(reedsLeft, reedsRight, post, buoy);
  }

  if (destination.id === 'rhode-island') {
    const lighthouse = new THREE.Group();
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.32, 1.9, 12),
      makeMaterial('#f4f0e8'),
    );
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.24, 12),
      makeMaterial(destination.theme.secondary),
    );
    tower.position.y = 0.95;
    top.position.y = 1.98;
    lighthouse.add(tower, top);
    lighthouse.position.set(-7, 0, -21);
    const stone = makeLowStone('#8e978f');
    stone.position.set(6.7, 0.23, -15.2);
    context.add(lighthouse, stone);
  }

  if (destination.id === 'colorado') {
    const pineA = makePine('#6a8758');
    pineA.position.set(-6.8, 0, -19.4);
    const pineB = makePine('#78925e');
    pineB.scale.set(0.86, 0.86, 0.86);
    pineB.position.set(6.8, 0, -22.4);
    const rock = makeLowStone('#8e735b');
    rock.position.set(-7.1, 0.23, -12.8);
    context.add(pineA, pineB, rock);
  }

  if (destination.id === 'greece') {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1, 0.4),
      makeMaterial('#fbf8f1'),
    );
    wall.position.set(-7.1, 0.5, -16.4);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 16, 12),
      makeMaterial(destination.theme.accent),
    );
    dome.scale.set(1, 0.7, 1);
    dome.position.set(-7.1, 1.18, -16.4);
    const olive = makePine('#94a26f');
    olive.scale.set(0.74, 0.68, 0.74);
    olive.position.set(6.6, 0, -18.8);
    context.add(wall, dome, olive);
  }

  if (destination.id === 'sweden') {
    const cabin = makeHouse('#bb5f4e', '#7b503f');
    cabin.scale.set(0.9, 0.9, 0.9);
    cabin.position.set(-6.9, 0, -18.2);
    const pine = makePine('#738765');
    pine.position.set(6.8, 0, -21.8);
    context.add(cabin, pine);
  }

  if (destination.id === 'vietnam') {
    const lanternLeft = makeLantern('#876548', '#ffd49d');
    const lanternRight = makeLantern('#876548', '#ffd49d');
    lanternLeft.position.set(-6.8, 0, -16.2);
    lanternRight.position.set(6.8, 0, -18.2);
    const rail = new THREE.Group();
    const postA = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.86, 0.12),
      makeMaterial('#8e6a49'),
    );
    const postB = postA.clone();
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.08, 0.08),
      makeMaterial('#c9985a'),
    );
    postA.position.set(-0.68, 0.43, 0);
    postB.position.set(0.68, 0.43, 0);
    beam.position.set(0, 0.72, 0);
    rail.add(postA, postB, beam);
    rail.position.set(0, 0, -23.6);
    animated.push((elapsed) => {
      lanternLeft.rotation.z = Math.sin(elapsed * 1.8) * 0.04;
      lanternRight.rotation.z = Math.sin(elapsed * 1.8 + 0.6) * -0.04;
    });
    context.add(lanternLeft, lanternRight, rail);
  }

  if (destination.id === 'rainbow-bridge') {
    const clouds = [
      { x: -7.1, z: -15.8, scale: 1 },
      { x: 7.2, z: -20.8, scale: 0.9 },
      { x: -6.7, z: -28.4, scale: 0.78 },
      { x: 6.9, z: -34.2, scale: 1.08 },
    ];
    clouds.forEach((cloudSpec, index) => {
      const cloud = makeCloudCluster(index % 2 === 0 ? '#fff8f1' : '#ffe8f6');
      cloud.scale.setScalar(cloudSpec.scale);
      cloud.position.set(cloudSpec.x, 0.6 + index * 0.08, cloudSpec.z);
      animated.push((elapsed) => {
        cloud.position.y = 0.6 + index * 0.08 + Math.sin(elapsed * 0.9 + index) * 0.08;
      });
      context.add(cloud);
    });

    const memoryColors = ['#fff36f', '#ff9fc6', '#7ff2e1', '#b88cff', '#ffffff'];
    for (let index = 0; index < 12; index += 1) {
      const light = makeMemoryLight(memoryColors[index % memoryColors.length]);
      const side = index % 2 === 0 ? -1 : 1;
      light.position.set(side * (5.4 + (index % 3) * 0.58), 1.5 + (index % 4) * 0.22, -10 - index * 3);
      animated.push((elapsed) => {
        light.rotation.y = elapsed * 0.8 + index;
        light.rotation.z = Math.sin(elapsed * 1.2 + index) * 0.2;
        light.position.y = 1.5 + (index % 4) * 0.22 + Math.sin(elapsed * 1.5 + index) * 0.12;
      });
      context.add(light);
    }
  }

  root.add(context);

  return {
    update(elapsed) {
      animated.forEach((animation) => animation(elapsed));
    },
    dispose() {
      scene.remove(root);
      disposeObject(root);
      disposableTextures.forEach((texture) => texture.dispose());
    },
  };
}
