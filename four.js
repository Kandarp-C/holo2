import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "./SkeletonUtils.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.75, 3.25);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const gltfLoader = new GLTFLoader();
let new_avtar, animationMixer;
let animationsMap = {}; // Store animations here
let currentAction = null; // Track current animation

// 1️⃣ Load Character Model
gltfLoader.load("./assets/new_avtar.glb", (gltf) => {
    new_avtar = gltf.scene;
    new_avtar.position.y -= 1; 
    scene.add(new_avtar);
});

// 2️⃣ Load Animation Model
gltfLoader.load("./assets/animation.glb", (animGltf) => {
    if (!new_avtar) {
        console.error("Character is not loaded yet!");
        return;
    }

    const skinnedCharacter = SkeletonUtils.clone(new_avtar);
    scene.add(skinnedCharacter);

    // Hide the static model
    new_avtar.visible = false;

    animationMixer = new THREE.AnimationMixer(skinnedCharacter);

    // Store all animations in a dictionary
    animGltf.animations.forEach((clip) => {
        animationsMap[clip.name] = animationMixer.clipAction(clip);
    });

    // Play the first animation by default
    playAnimation(Object.keys(animationsMap)[0]);
});

// 3️⃣ Function to Play Animation
function playAnimation(animationName) {
    if (!animationsMap[animationName]) {
        console.error(`Animation "${animationName}" not found!`);
        return;
    }

    if (currentAction) {
        currentAction.fadeOut(0.5); // Smooth transition
    }

    currentAction = animationsMap[animationName];
    currentAction.reset().fadeIn(0.5).play();
}

// 4️⃣ Create Buttons for Animation Switching
const buttonContainer = document.createElement("div");
buttonContainer.style.position = "absolute";
buttonContainer.style.top = "10px";
buttonContainer.style.left = "10px";
document.body.appendChild(buttonContainer);

["Idle", "Run", "Jump"].forEach((animation) => {
    const btn = document.createElement("button");
    btn.innerText = animation;
    btn.style.margin = "5px";
    btn.onclick = () => playAnimation(animation);
    buttonContainer.appendChild(btn);
});

// 5️⃣ Animation Loop
function animate() {
    requestAnimationFrame(animate);
    if (animationMixer) animationMixer.update(0.016); // Update animation
    renderer.render(scene, camera);
    controls.update();
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
