"use strict";

import "./style.css";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);

// positioning and pointing the camera to the center of the scence
camera.position.set(25, 26, 23);
camera.lookAt(scene.position);

// renderer
const container = document.querySelector("#app");
const renderer = new THREE.WebGLRenderer({ container });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(THREE.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// adding controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true.valueOf;
controls.dampingFactor = 0.5;

// loading textures
const loader = new THREE.TextureLoader();
const earthTexture = loader.load("../imgs/2k_earth_nightmap.jpg");
const cloudTexture = loader.load("../imgs/2k_earth_clouds.jpg");
const bumpMapTexture = loader.load("../imgs/earthbump4k.jpg");
const normalMapTexture = loader.load("../imgs/earth_normalmap_flat4k.jpg");
const specMapTexture = loader.load("../imgs/earthspec4k.jpg");

// creating the Earth
const earthGeo = new THREE.SphereGeometry(15, 30, 30);
const earthMat = new THREE.MeshPhongMaterial({
  map: earthTexture,
  bumpMap: bumpMapTexture,
  normalMap: normalMapTexture,
  specularMap: specMapTexture,
});
const earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

// adding Clouds
const cloudGeo = new THREE.SphereGeometry(15, 30, 30);
const cloudMat = new THREE.MeshPhongMaterial({
  map: cloudTexture,
  transparent: true,
  opacity: 0.12,
});
const cloud = new THREE.Mesh(cloudGeo, cloudMat);
scene.add(cloud);

// adding Ambient light so it's more realistic
const ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

// adding Directional Light to "represent the moon"
// it makes the side that doesn't face the moon darker
const directionalLight = new THREE.DirectionalLight(0xffffff, 9);
directionalLight.position.set(100, 10, -50);
scene.add(directionalLight);

// setting camera for viewing Starry Bg
const cameraBG = new THREE.OrthographicCamera(
  -sizes.width, // left
  sizes.width, // right
  sizes.height, // top
  -sizes.height, // bottom
  -10000, // near
  10000 // far
);
cameraBG.position.z = 50;

// creating Plane for Starry Bg
const sceneBG = new THREE.Scene();
const bgTextureLoader = new THREE.TextureLoader();

bgTextureLoader.load("../imgs/starry_background.jpg", (texture) => {
  const materialColor = new THREE.MeshBasicMaterial({ map: texture });
  const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materialColor);
  bgPlane.position.z = -100;
  bgPlane.scale.set(sizes.width * 2, sizes.height * 2, 1);
  sceneBG.add(bgPlane);
});

// setting up composer
const composer = new EffectComposer(renderer);

// rendering the bg
const renderPass = new RenderPass(scene, camera);
renderPass.clear = false;
composer.addPass(renderPass);

const bgPass = new RenderPass(sceneBG, cameraBG);
composer.addPass(bgPass);

const earthRenderPass = new RenderPass();
earthRenderPass.scene = scene;
earthRenderPass.camera = camera;
earthRenderPass.clear = false;
earthRenderPass.clearDepth = true;
composer.addPass(earthRenderPass);

const effectCopy = new ShaderPass(CopyShader);
effectCopy.renderToScreen = true;
composer.addPass(effectCopy);

document.body.appendChild(renderer.domElement);

// Resizing the canvas
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

// Setting animation
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  // earth.rotation.x += 0.01;
  // earth.rotation.y += 0.01;
  earth.rotation.z += 0.01;
  cloud.rotation.z += 0.01;

  // renderer.autoClear = false;
  composer.render();
}
animate();
