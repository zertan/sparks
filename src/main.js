import * as THREE from 'three';
import './style.css';

const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb30000);
scene.fog = new THREE.FogExp2(0xa00000, 0.02);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);

const ambient = new THREE.AmbientLight(0xffc8b0, 0.8);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff1d6, 1.2);
sun.position.set(-10, 20, 10);
sun.castShadow = false;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120, 64, 64),
  new THREE.MeshStandardMaterial({ color: 0xd9b97a, roughness: 0.9, metalness: 0.05 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const sandPos = ground.geometry.attributes.position;
for (let i = 0; i < sandPos.count; i++) {
  const x = sandPos.getX(i);
  const z = sandPos.getZ(i);
  const height = Math.sin(x * 0.2) * 0.2 + Math.cos(z * 0.25) * 0.3 + (Math.random() - 0.5) * 0.15;
  sandPos.setY(i, height);
}
sandPos.needsUpdate = true;
ground.geometry.computeVertexNormals();

const character = new THREE.Group();
scene.add(character);

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.4, 2.2, 0.9),
  new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: 0.6 })
);
body.position.y = 1.5;
character.add(body);

const head = new THREE.Mesh(
  new THREE.BoxGeometry(0.9, 0.9, 0.9),
  new THREE.MeshStandardMaterial({ color: 0xf5d6c6 })
);
head.position.y = 2.5;
character.add(head);

const legMaterial = new THREE.MeshStandardMaterial({ color: 0x202028, roughness: 0.6 });
function createLeg(xOffset) {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1, 0.6), legMaterial);
  leg.position.set(xOffset, 0.5, 0);
  return leg;
}
const leftLeg = createLeg(-0.4);
const rightLeg = createLeg(0.4);
character.add(leftLeg, rightLeg);

const sword = new THREE.Mesh(
  new THREE.BoxGeometry(0.25, 0.25, 4.5),
  new THREE.MeshStandardMaterial({
    color: 0x9bd7ff,
    emissive: 0x1bb4ff,
    emissiveIntensity: 0.6,
    metalness: 0.7,
    roughness: 0.1,
  })
);
sword.position.set(-0.2, 1.4, -2.2);
sword.rotation.x = Math.PI * 0.1;
sword.rotation.y = -Math.PI * 0.1;
character.add(sword);

const sparksGeo = new THREE.BufferGeometry();
const sparkCount = 350;
const sparkPositions = new Float32Array(sparkCount * 3);
const sparkSpeeds = new Float32Array(sparkCount);
for (let i = 0; i < sparkCount; i++) {
  sparkPositions[i * 3] = (Math.random() - 0.5) * 2;
  sparkPositions[i * 3 + 1] = Math.random() * 2 + 0.5;
  sparkPositions[i * 3 + 2] = -Math.random() * 2;
  sparkSpeeds[i] = Math.random() * 0.5 + 0.3;
}
sparksGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
const swordSparks = new THREE.Points(
  sparksGeo,
  new THREE.PointsMaterial({ color: 0x26f0d1, size: 0.07, transparent: true, opacity: 0.9 })
);
character.add(swordSparks);

function updateSwordSparks(delta) {
  const positions = swordSparks.geometry.attributes.position;
  for (let i = 0; i < sparkCount; i++) {
    const y = positions.getY(i) + sparkSpeeds[i] * delta * 6;
    positions.setY(i, y > 2.2 ? 0.5 : y);
    positions.setX(i, positions.getX(i) + (Math.random() - 0.5) * 0.06);
    positions.setZ(i, positions.getZ(i) + (Math.random() - 0.5) * 0.06);
  }
  positions.needsUpdate = true;
}

const worms = [];
function createWorm() {
  const group = new THREE.Group();
  const segmentMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd35c,
    emissive: 0xffb347,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.2,
  });
  const count = 8;
  for (let i = 0; i < count; i++) {
    const segment = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 1.4), segmentMaterial);
    const t = i / count;
    const curve = Math.sin(t * Math.PI) * 1.5;
    segment.position.set(curve, 0, -i * 1.2);
    group.add(segment);
  }
  group.userData = {
    phase: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random() * 0.6,
    radius: 10 + Math.random() * 25,
    offset: Math.random() * Math.PI * 2,
  };
  scene.add(group);
  worms.push(group);
}

for (let i = 0; i < 10; i++) {
  createWorm();
}

const wormSparkGeo = new THREE.SphereGeometry(0.1, 6, 6);
const wormSparkMaterial = new THREE.MeshStandardMaterial({
  color: 0x1ef2d5,
  emissive: 0x1ef2d5,
  emissiveIntensity: 1.4,
  metalness: 0.4,
  roughness: 0.15,
  transparent: true,
});
const wormSparks = [];

function addWormSparks(position) {
  const count = 6 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const spark = new THREE.Mesh(wormSparkGeo, wormSparkMaterial.clone());
    spark.position.copy(position).add(
      new THREE.Vector3((Math.random() - 0.5) * 1.2, Math.random() * 1.2, (Math.random() - 0.5) * 1.2)
    );
    spark.userData.life = 0.5 + Math.random() * 0.6;
    spark.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.4, Math.random() * 1, (Math.random() - 0.5) * 0.4);
    scene.add(spark);
    wormSparks.push(spark);
  }
}

function updateWormSparks(delta) {
  for (let i = wormSparks.length - 1; i >= 0; i--) {
    const spark = wormSparks[i];
    spark.userData.life -= delta;
    spark.position.addScaledVector(spark.userData.velocity, delta * 3);
    spark.material.opacity = Math.max(spark.userData.life / 0.6, 0);
    if (spark.userData.life <= 0) {
      scene.remove(spark);
      wormSparks.splice(i, 1);
    }
  }
}

const keys = new Set();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3(0, 0, -1);
let runPhase = 0;

const baseCameraAngle = -Math.PI * 0.9;
let cameraYawOffset = 0;
let isDragging = false;
let lastX = 0;

window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

window.addEventListener('pointerdown', (e) => {
  isDragging = true;
  lastX = e.clientX;
});
window.addEventListener('pointerup', () => (isDragging = false));
window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastX;
  lastX = e.clientX;
  cameraYawOffset = THREE.MathUtils.clamp(cameraYawOffset - dx * 0.0025, -0.7, 0.7);
});

function handleInput(delta) {
  direction.set(0, 0, 0);
  if (keys.has('w')) direction.z -= 1;
  if (keys.has('s')) direction.z += 1;
  if (keys.has('a')) direction.x -= 1;
  if (keys.has('d')) direction.x += 1;
  direction.normalize();

  const speed = 14;
  if (direction.lengthSq() > 0) {
    velocity.lerp(direction.clone().multiplyScalar(speed), 0.25);
    const angle = Math.atan2(direction.x, direction.z);
    character.rotation.y = angle;
    runPhase += delta * speed * 0.6;
  } else {
    velocity.lerp(new THREE.Vector3(0, 0, 0), 0.12);
    runPhase += delta * 2;
  }

  character.position.addScaledVector(velocity, delta);
  character.position.y = 0;

  const legLift = Math.sin(runPhase) * 0.35;
  leftLeg.position.z = legLift;
  rightLeg.position.z = -legLift;
  body.position.y = 1.5 + Math.abs(Math.sin(runPhase * 0.5)) * 0.1;
}

function updateWorms(delta, elapsed) {
  worms.forEach((worm, i) => {
    const data = worm.userData;
    const angle = data.offset + elapsed * 0.12 + i * 0.6;
    const height = Math.abs(Math.sin(elapsed * data.speed + data.phase)) * 3 + 0.4;
    worm.position.set(Math.cos(angle) * data.radius, height - 0.5, Math.sin(angle) * data.radius);
    worm.rotation.y = Math.sin(elapsed * data.speed * 0.8 + data.phase) * 0.6;

    const head = worm.children[0];
    if (Math.random() < 0.05) {
      addWormSparks(worm.localToWorld(head.position.clone()));
    }
  });
}

function updateCamera() {
  const yaw = baseCameraAngle + cameraYawOffset;
  const radius = 22;
  const eye = new THREE.Vector3(Math.cos(yaw) * radius, 14, Math.sin(yaw) * radius);
  camera.position.copy(character.position.clone().add(eye));
  camera.lookAt(character.position.x, character.position.y + 2, character.position.z);
}

let last = performance.now();
function animate(now) {
  const delta = Math.min((now - last) / 1000, 0.05);
  last = now;

  handleInput(delta);
  updateWorms(delta, now * 0.001);
  updateSwordSparks(delta);
  updateWormSparks(delta);
  updateCamera();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
