import * as THREE from "three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import "./style.css";

//import { createGui } from "./gui";
import createGui from "./gui";

const objects = [];
//const objGroup = new THREE.Group()

let currentColor =
  objects.length > 1 ? objects[objects.length - 1].material.color : 0xff0000;
let camera, scene, renderer;

globalThis.currentShape = "box";

let plane,
  controls,
  pointer,
  raycaster,
  createParams = {
    color: 0x0000ff,
    geo: {},
  },
  parameters = {
    color: currentColor,
    create: () => assignParametersToCreate(),
    delete: () => deleteObject(),
    clear: () => clearAllObject(),
    resetCamera: () => resetCameraPosition(),
    posUp: () => toScreenSpin("up"),
    posDown: () => toScreenSpin("down"),
    posLeft: () => toScreenSpin("left"),
    posRight: () => toScreenSpin("right"),
    rotateY: "spin",
    rotateZ: () => axisBack(),
  };

const currentObject = () =>
  objects.length > 0 ? objects[objects.length - 1] : null;

/* SHAPE OPTIONS */

function getShape(shape) {
  switch (shape) {
    case "box":
      return new THREE.BoxGeometry(50, 50, 50);
    case "cyl":
      return new THREE.CylinderGeometry(50, 50, 30, 12);
    case "pyd":
      return new THREE.ConeGeometry(50, 50, 40, 40);
    default:
      return new THREE.BoxGeometry(50, 50, 50);
  }
}

/* SET PARAMETER OF OBJECT TO CREATE */

function assignParametersToCreate() {
  controls.enabled = false;

  document.addEventListener("pointerdown", onPointerDown);
}

/* OBJECT CRUD */

function createObject(intersect) {
  let { x, y, z } = intersect.point;

  console.log("CREATING OBJECT, CHECKING", currentShape, x, y, z);

  const basicGeometry = getShape(currentShape);

  console.log("CHECK GEOMETRY", basicGeometry);

  const { height } = basicGeometry.parameters;

  y += height / 2;

  const basicMaterial = new THREE.MeshBasicMaterial({
    color: createParams.color,
  });
  const basicMesh = new THREE.Mesh(basicGeometry, basicMaterial);
  basicMesh.position.copy({ x, y, z });

  //console.log("CHECKING BASIC MESH BEFORE PUSHING", basicMesh);
  scene.add(basicMesh);
  objects.push(basicMesh);

  //console.log("CHECKING ALL OBJECTS AFTER CREATION", objects, scene);
  controls.enabled = true;
}

function deleteObject() {
  console.log("CHECKING OBJECTS ARRAY BEFORE DELETION", objects);
  if (objects.length > 1) {
    console.log("CHECKING SCENE", scene);
    const objectToRemove = objects[objects.length - 1];
    objectToRemove.removeFromParent();
    objects.pop();
    console.log("CHECKING AFTER DELETION", objects);
  }
  createGui({
    createParams,
    currentObject,
    parameters,
    localCube,
    axisCube,
    currentShape,
  });
}

function clearAllObject() {
  console.log(objects);
  objects.forEach((obj, index) => {
    if (index >= 1) {
      scene.remove(obj);
    }
  });
  objects.splice(1, objects.length - 1);
  console.log(objects);
}

// CONTROL CREATION

function resetCameraPosition() {
  //camera.position.set(0, 1500, 0);
  //camera.rotation.set(0, 0, 0);
  //camera.lookAt(0, 0, 0);
  controls.reset();
}

function createControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * -1;
  controls.minPolarAngle = Math.PI * -1;
  controls.rotateSpeed = 0.1;
  controls.zoomSpeed = 0.1;
  controls.maxDistance = 2000;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  //controls.addEventListener("change", update);
  //controls.addEventListener('change', axisSwap);
}

/* SCENE CREATION */

scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const objGroup = new THREE.Group();
scene.add(objGroup);

///// AXIS HACK /////

const axisGeometry = new THREE.BoxGeometry(100, 100, 250);
const axisMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});
const axisCube = new THREE.Mesh(axisGeometry, axisMaterial);
axisCube.rotation.x = Math.PI * 1;
axisCube.rotation.y = Math.PI * 8;
axisCube.rotation.z = Math.PI / 1;
console.log(axisCube.rotation.y);
scene.add(axisCube);
console.log(axisCube);

const axisBack = () => {
  //let spin = camera.rotation.z;
  let unSpin = camera.rotation.z * -1;
  axisCube.rotation.y = unSpin;
};

const localGeometry = new THREE.BoxGeometry(100, 100, 250);
const localMaterial = new THREE.MeshBasicMaterial({
  color: 0x00cccc,
  wireframe: true,
});
const localCube = new THREE.Mesh(localGeometry, localMaterial);
axisCube.rotation.x = Math.PI * 1;
axisCube.rotation.y = Math.PI * 8;
axisCube.rotation.z = Math.PI / 1;
console.log(localCube.rotation.y);
scene.add(localCube);

console.log(localCube);

/* GUI CREATION */

init();
//render();

/* INITIALIZE CANVAS */

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 1500, 0);
  //camera.lookAt(0, 0, 0);
  //let unSpin = camera.rotation.y * -1
  //camera.rotation._onChange(()=> axisCube.rotation.set(0,unSpin,0))

  // grid

  const gridHelper = new THREE.GridHelper(1000, 20);
  scene.add(gridHelper);

  // raycaster

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const geometry = new THREE.PlaneGeometry(1000, 1000);
  geometry.rotateX(-Math.PI / 2);

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ visible: false })
  );
  scene.add(plane);
  objects.push(plane);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  createGui({
    createParams,
    currentObject,
    parameters,
    localCube,
    axisCube,
    currentShape,
  });
  document.body.appendChild(renderer.domElement);

  let GUI = document.getElementById("gui");

  console.log("CHEKCKING GUI HTML NODE", GUI);

  GUI.onpointerover = (event) => {
    controls.enabled = false;
    //console.log("CHECKING ONPOINTEROVER ", controls.enabled);
  };

  GUI.onpointerout = (event) => {
    controls.enabled = true;
    //console.log("CHECKING ONPOINTEROUT ", controls.enabled);
  };

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onPointerDown(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objects, false);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    createObject(intersect);

    document.removeEventListener("pointerdown", onPointerDown);

    createGui({
      createParams,
      currentObject,
      parameters,
      localCube,
      axisCube,
      currentShape,
    });
    controls.enabled = true;
  }
}

function toScreenSpin(direction) {
  const obj = objects[objects.length - 1];

  //const obj2 = objects[objects.length-2]
  // const vector = new THREE.Vector3();
  // vector.setFromMatrixPosition( obj.matrixWorld );
  // const widthHalf = (window.innerWidth/2);
  // const heightHalf = (window.innerHeight/2);
  // vector.project(camera);

  if (direction === "up") {
    axisCube.attach(obj);

    axisCube.translateZ(10);
    //localCube.translateZ(-10)
    //objGroup.add(obj)

    localCube.attach(obj);

    //obj.removeFromParent();

    console.log("CHECK OBJECTS ARRAY ATER POSITION CHANGE", obj, objects);

    //axisCube.remove(obj)
    //localCube.add(obj)
  } else if (direction === "down") {
    axisCube.attach(obj);

    axisCube.translateZ(-10);

    localCube.attach(obj);

    console.log("CHECK OBJECTS ARRAY ATER POSITION CHANGE", obj, objects);
    //objects.add(obj)
    //axisCube.geometry.translate( 0, 0, 50 );
  } else if (direction === "left") {
    axisCube.add(obj);

    axisCube.geometry.translate(50, 0, 0);
    //objects.add(obj)
    axisCube.geometry.translate(-50, 0, 0);
  } else if (direction === "right") {
    axisCube.add(obj);

    axisCube.geometry.translate(-50, 0, 0);
    //objects.add(obj)
    axisCube.geometry.translate(50, 0, 0);
  }
}

/////// UPDATE FUNCTION /////////

const update = () => {
  axisBack();
  if (controls) controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(update);
};

createControls();
update();
