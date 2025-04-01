import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "./SkeletonUtils.js";

// 🌍 Scene & Model Setup
const scene = new THREE.Scene();
const loader = new GLTFLoader();
let model, mixer;

// 📌 Create 4 Quadrants (DIV Containers)
const createQuadrant = (id, top, left) => {
    const div = document.createElement("div");
    div.id = id;
    div.style.position = "absolute";
    div.style.width = "50vw";
    div.style.height = "50vh";
    div.style.top = top;
    div.style.left = left;
    div.style.overflow = "hidden";
    document.body.appendChild(div);
    return div;
};

// Create 4 divs (for 4 camera views)
const quadrants = [
    createQuadrant("quad1", "0", "0"),       // Top-left (Front View)
    createQuadrant("quad2", "0", "50vw"),    // Top-right (Right View)
    createQuadrant("quad3", "50vh", "0"),    // Bottom-left (Back View)
    createQuadrant("quad4", "50vh", "50vw")  // Bottom-right (Left View)
];

// 🎥 4 Cameras (Different Angles)
const cameras = [
    new THREE.PerspectiveCamera(45, 1, 0.1, 1000),
    new THREE.PerspectiveCamera(45, 1, 0.1, 1000),
    new THREE.PerspectiveCamera(45, 1, 0.1, 1000),
    new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
];

// Set different camera positions
cameras[0].position.set(0, 2, 5);  // Front View
cameras[1].position.set(5, 2, 0);  // Right View
cameras[2].position.set(0, 2, -5); // Back View
cameras[3].position.set(-5, 2, 0); // Left View

cameras.forEach(camera => camera.lookAt(0, 1, 0)); // Make all cameras focus on the model

// 🎨 4 Renderers
const renderers = quadrants.map((div) => {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    div.appendChild(renderer.domElement);
    return renderer;
});

// 💡 Lighting Setup
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(hemiLight);

// 1️⃣ Load Character Model
loader.load("./assets/new_avtar.glb", (gltf) => {
    model = gltf.scene;
    model.position.y -= 1;
    scene.add(model);
});

// 2️⃣ Load Animation & Setup Animation Mixer
loader.load("./assets/animation.glb", (animGltf) => {
    if (!model) return;
    
    const skinnedCharacter = SkeletonUtils.clone(model);
    scene.add(skinnedCharacter);
    
    model.visible = false; // Hide static model
    
    mixer = new THREE.AnimationMixer(skinnedCharacter);
    const action = mixer.clipAction(animGltf.animations[0]);
    action.play();
});

// 🏃‍♂️ Animation Loop
function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(0.016);

    for (let i = 0; i < 4; i++) {
        renderers[i].render(scene, cameras[i]);
    }
}

animate();

// 🔄 Handle Window Resize
window.addEventListener("resize", () => {
    for (let i = 0; i < 4; i++) {
        renderers[i].setSize(window.innerWidth / 2, window.innerHeight / 2);
    }
});
