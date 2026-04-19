import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export type RoutePropId =
  | 'quaternius-rock'
  | 'kenney-sign'
  | 'kenney-fence'
  | 'kenney-palm';

const gltfLoader = new GLTFLoader();
const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();

const templateCache = new Map<RoutePropId, Promise<THREE.Group>>();

function markTemplate(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) {
      return;
    }

    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = true;
    mesh.userData.sharedAsset = true;

    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    materials.forEach((material) => {
      material.transparent = false;
      const textured = material as THREE.Material & { map?: THREE.Texture | null };
      if (textured.map) {
        textured.map.generateMipmaps = false;
        textured.map.minFilter = THREE.LinearFilter;
        textured.map.magFilter = THREE.LinearFilter;
        textured.map.anisotropy = 1;
      }
    });
  });
}

function cloneSharedAsset(template: THREE.Group) {
  const clone = template.clone(true);
  markTemplate(clone);
  return clone;
}

function loadGltf(url: string) {
  return new Promise<THREE.Group>((resolve, reject) => {
    gltfLoader.load(
      url,
      (asset) => {
        const root = asset.scene;
        markTemplate(root);
        resolve(root);
      },
      undefined,
      reject,
    );
  });
}

function loadObjWithMtl(objUrl: string, mtlUrl: string) {
  return new Promise<THREE.Group>((resolve, reject) => {
    mtlLoader.load(
      mtlUrl,
      (materials) => {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(
          objUrl,
          (object) => {
            markTemplate(object);
            resolve(object);
          },
          undefined,
          reject,
        );
      },
      undefined,
      reject,
    );
  });
}

function getTemplate(id: RoutePropId) {
  const cached = templateCache.get(id);
  if (cached) {
    return cached;
  }

  const templatePromise = (() => {
    switch (id) {
      case 'quaternius-rock':
        return loadGltf('/assets/route-props/quaternius/Rock_Medium_1.gltf');
      case 'kenney-sign':
        return loadObjWithMtl(
          '/assets/route-props/kenney/sign.obj',
          '/assets/route-props/kenney/sign.mtl',
        );
      case 'kenney-fence':
        return loadObjWithMtl(
          '/assets/route-props/kenney/fence_simpleLow.obj',
          '/assets/route-props/kenney/fence_simpleLow.mtl',
        );
      case 'kenney-palm':
        return loadObjWithMtl(
          '/assets/route-props/kenney/tree_palmShort.obj',
          '/assets/route-props/kenney/tree_palmShort.mtl',
        );
      default:
        throw new Error(`Unknown route prop: ${String(id)}`);
    }
  })();

  templateCache.set(id, templatePromise);
  return templatePromise;
}

export async function createRouteProp(id: RoutePropId) {
  const template = await getTemplate(id);
  return cloneSharedAsset(template);
}
