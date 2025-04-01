import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from './SkeletonUtils.js';

// Create Scene
const scene = new THREE.Scene();

// Set up Cameras
const cameras = [
  new THREE.PerspectiveCamera(45, 1, 0.1, 1000), // Front
  new THREE.PerspectiveCamera(45, 1, 0.1, 1000), // Left
  new THREE.PerspectiveCamera(45, 1, 0.1, 1000), // Back
  new THREE.PerspectiveCamera(45, 1, 0.1, 1000), // Right
];

// Position Cameras Correctly
cameras[0].position.set(0, 1, 3);  // Front view
cameras[1].position.set(-3, 1, 0); // Left view
cameras[2].position.set(0, 1, -3); // Back view
cameras[3].position.set(3, 1, 0);  // Right view

cameras.forEach(cam => cam.lookAt(0, 1, 0)); // Make all cameras look at the model

// Create Renderers
const renderers = [];
["quad1", "quad2", "quad3", "quad4"].forEach((id, i) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
  document.getElementById(id).appendChild(renderer.domElement);
  renderers.push(renderer);
});

// Load Character Model
const gltfLoader = new GLTFLoader();
let character, animationMixer;

gltfLoader.load('./assets/new_avtar.glb', (gltf) => {
  character = gltf.scene;
  character.position.y -= 1;
  scene.add(character);

  // Load Animation
  gltfLoader.load("assets/animation.glb", (animGltf) => {
    const animation = animGltf.animations[0];
    const skinnedCharacter = SkeletonUtils.clone(character); // Clone for animation

    animationMixer = new THREE.AnimationMixer(skinnedCharacter);
    const action = animationMixer.clipAction(animation);
    action.play();
  });
});

// Lighting (Brighter Scene)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.5); // Brighter light
const dirLight = new THREE.DirectionalLight(0xffffff, 3); // Stronger light
dirLight.position.set(5, 10, 5);
scene.add(hemiLight, dirLight);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderers.forEach((renderer, i) => {
    renderer.render(scene, cameras[i]);
  });
}

animate();

// Resize Handling
window.addEventListener('resize', () => {
  renderers.forEach(renderer => {
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
  });
});
