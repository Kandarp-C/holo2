import * as THREE from "three";
import getLayer from "./getLayer.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';


const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
camera.position.z = 3.25;
camera.position.y =0.75;
camera.position.x = 0;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const ctrls = new OrbitControls(camera, renderer.domElement);
ctrls.enableDamping = true;

const gltfLoader = new GLTFLoader();
gltfLoader.load('./assets/new_avtar.glb'/* './assets/robot/scene.gltf'*/ , (gltf) =>{
console.log(gltf);
     const new_avtar = gltf.scene;

    new_avtar.position.y -= 1; 

    /*gltf.scene.rotation.x += 0; // Rotate around the x-axis
    gltf.scene.rotation.y += 0; // Rotate around the y-axis
    gltf.scene.rotation.z += 0;*/ // for robot rotation required

    new_avtar.traverse( (child) => {
      if (child.isMesh){
        //child.geometry.center();
      }
    });
    scene.add(new_avtar)

    gltf.scene.getObjectByName("");
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

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  ctrls.update();
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);