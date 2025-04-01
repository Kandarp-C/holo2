import * as THREE from "three";
import getLayer from "./getLayer.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "./SkeletonUtils.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
camera.position.set(0, 0.75, 3.25);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const ctrls = new OrbitControls(camera, renderer.domElement);
ctrls.enableDamping = true;

const gltfLoader = new GLTFLoader();
let new_avtar, animationMixer;

// 1️⃣ Load Character First  
gltfLoader.load("./assets/new_avtar.glb", (gltf) => {
    console.log(gltf);
    new_avtar = gltf.scene;
    new_avtar.position.y -= 1;

    new_avtar.traverse((child) => {
        if (child.isMesh) {
            //child.geometry.center();
        }
    });

    scene.add(new_avtar);

    // 2️⃣ Load Animation Only After Character is Ready  
    gltfLoader.load("assets/your_animated_model.glb", function (animGltf) {
      if (!new_avtar) {
          console.error("Character is not loaded yet!");
          return;
      }
  
      const skinnedCharacter = SkeletonUtils.clone(new_avtar); // Clone skeleton ✅
      scene.add(skinnedCharacter);
  
      // 🛑 Hide the original static model
      new_avtar.visible = false; // Static model becomes invisible!
  
      animationMixer = new THREE.AnimationMixer(skinnedCharacter);
      const action = animationMixer.clipAction(animGltf.animations[0]);
      action.play();
  });
  
});

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(hemiLight);

// Sprites BG
const gradientBackground = getLayer({
    hue: 0.5,
    numSprites: 8,
    opacity: 0.2,
    radius: 10,
    size: 24,
    z: -15.5,
});
scene.add(gradientBackground);

// 3️⃣ Update Animation in Render Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (animationMixer) animationMixer.update(delta);

    renderer.render(scene, camera);
    ctrls.update();
}

animate();

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
