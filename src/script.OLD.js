import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import * as dat from "dat.gui";

let allObjects = [];

/**
 * Canvas
 */
const canvas = document.querySelector("canvas.webgl");

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Objects Group
 */

let objects = new THREE.Group();
scene.add(objects);

/* let plane1;
const geometry1 = new THREE.PlaneGeometry(10000, 10000);
geometry1.rotateX(-Math.PI / 2);

plane1 = new THREE.Mesh(
  geometry1,
  new THREE.MeshBasicMaterial({ color: 0xff0000, visible: true })
);

//plane1.position.set({z:10, y:2, x:0})
scene.add(plane1);

objects.add(plane1);
allObjects.push(plane1); */

/**
 * init Object
 */

/* const initGeometry = new THREE.BoxGeometry(1, 1, 1)
const initMaterial = new THREE.MeshBasicMaterial({color: 0xff0000})
const initMesh = new THREE.Mesh(initGeometry, initMaterial)
scene.add(initMesh)
objects.add(initMesh)

allObjects.push(initMesh)
 */

// globals
let activeObj;
let currentColor = 0xff0000;
let currentShape = "box";
let focusObect = new THREE.Group();

let isCreationMode = false;
let createParams = {
  color: 0x0000ff,
  geo: {},
};

let pointer = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

const currentObject = () => {
  const result =
    objects.children.length > 0
      ? objects.children[objects.children.length - 1]
      : null;

  //console.log("CHECKING CURRENT OBJECT", currentObject, objects, objects.children.length)

  return result;
};

//let active = currentObject()

const parameters = {
  color: 0xff0000,
  create: () => assignParametersToCreate(), //createObject(),
  deleteLast: () => objects.children.pop(),
  clear: () => objects.clear(),
};

/**
 * Create Object
 */

function getShape(shape) {
  switch (shape) {
    case "box":
      return new THREE.BoxGeometry(1, 1, 1);
    case "cyl":
      return new THREE.CylinderGeometry(1, 1, 1, 12);
    case "pyd":
      return new THREE.ConeGeometry(1, 1, 4, 4);
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}
///// CLONE? //////

function assignParametersToCreate() {
  isCreationMode = true;
  createControls();

  console.log("CHECKING PARAMETER ASSIGNEMENT", isCreationMode);
  document.addEventListener("pointerdown", onPointerDown);
}

function createObject(intersect) {
  const { x, y, z } = intersect.point;

  console.log("CREATING OBJECT, CHECKING INTERSECT", intersect, x, y, z);

  const basicGeometry = getShape(currentShape);

  const basicMaterial = new THREE.MeshBasicMaterial({
    color: createParams.color,
  });
  const basicMesh = new THREE.Mesh(basicGeometry, basicMaterial);
  basicMesh.position.copy(intersect.point); //.position.set(x,y,z).add( intersect.face.normal );
  //basicMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

  console.log("CHECKING BASIC MESH BEFORE PUSHING", basicMesh);

  objects.children.push(basicMesh);
  allObjects.push(basicMesh);

  console.log("CHECKING ALL OBJECTS AFTER CREATION", allObjects);
}

let plane;

const size = 10;
const divisions = 20;

const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
planeGeometry.rotateX(-Math.PI / 2);

plane = new THREE.Mesh(
  planeGeometry,
  new THREE.MeshBasicMaterial({ visible: true })
);
scene.add(plane);
allObjects.push(plane);

//objects.push( plane );

/**
 * WindowSize
 */

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(10, 5, -10);
scene.add(camera);

// Controls

let controls;

function createControls() {
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  //controls.maxPolarAngle = Math.PI;
  //controls.minPolarAngle = Math.PI;
  controls.rotateSpeed = 0.1;
  controls.zoomSpeed = 0.1;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  controls.enabled = !isCreationMode;
}

createControls();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let gui;

const createGui = () => {
  /**
   * Panel
   */
  gui = new dat.GUI({
    // closed: true,
    width: 400,
  });
  gui.domElement.id = "gui";

  // gui.hide()

  //gui.add(initMesh, 'visible')
  //gui.add(initMaterial, 'wireframe')

  let create = gui.addFolder("Create New Object");
  create.open();
  create.addColor(createParams, "color").onChange(() => {
    //createParams.Color.set(parameters.color)
    currentColor = createParams.Color;
  });
  let changeGeo = create
    .add(createParams, "geo", {
      box: "box",
      cyl: "cyl",
      pyr: "pyr",
    })
    .setValue("box")
    .listen()
    .onChange(function (newValue) {
      console.log(newValue);
      currentShape = newValue;
    });
  create.add(parameters, "create");

  let modify = gui.addFolder("Modify Current Object");

  modify.open();

  //console.log("CHECKING ACTIVE", active)
  if (currentObject()) {
    modify
      .add(currentObject().position, "y")
      .min(-3)
      .max(3)
      .step(0.01)
      .name("elevation")
      .listen();
    modify
      .add(currentObject().position, "x")
      .min(-3)
      .max(3)
      .step(0.01)
      .name("currentObject() side to side")
      .listen();
    modify
      .add(currentObject().position, "x")
      .min(-3)
      .max(3)
      .step(0.01)
      .name("side to side")
      .listen();
    modify
      .add(currentObject().position, "z")
      .min(-3)
      .max(3)
      .step(0.01)
      .name("up and down")
      .listen();
    modify
      .add(currentObject().rotation, "y")
      .min(-Math.PI * 2)
      .max(Math.PI * 2)
      .step(Math.PI / 4)
      .name("rotate")
      .listen();
    modify
      .addColor(parameters, "color")
      .onChange(() => {
        initMaterial.color.set(parameters.color);

        console.log("CHECKING CURRENT OBJ", currentObject());
        // CreateParameters.Color.set(parameters.color)
      })
      .listen();
  }

  let deleteObject = gui.addFolder("Delete");
  deleteObject.open();
  deleteObject.add(parameters, "deleteLast");
  deleteObject.add(parameters, "clear");

  // gui.add(null,'delete current')
};

createGui();

function onPointerDown(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(allObjects, false);

  console.log(
    "EXCECUTING POINTER DOWN",
    event,
    pointer,
    raycaster,
    intersects,
    allObjects
  );

  if (intersects.length > 0) {
    const intersect = intersects[0];

    /*  // delete cube

        if ( isShiftDown ) {

            if ( intersect.object !== plane ) {

                scene.remove( intersect.object );

                objects.splice( objects.indexOf( intersect.object ), 1 );

            }

            // create cube */

    //} else {

    /* const newObject = new THREE.Mesh( cubeGeo, cubeMaterial );
        newObject.position.copy( intersect.point ).add( intersect.face.normal );
        newObject.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
        scene.add( newObject );

        objects.push( newObject ); */

    createObject(intersect);
    // Update HUI Controls

    //gui.updateDisplay()

    isCreationMode = false;

    createGui();
    createControls();

    console.log(
      "JUST CREATED AN OBJECT AFTER POINTER DOWN",
      event,
      isCreationMode
    );
  }

  update();
}

/**
 * Animate
 */
const clock = new THREE.Clock();

const update = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  if (controls) controls.update();

  // Update Current Object
  //active = objects.children[objects.children.length - 1]

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(update);
};

update();

console.log("CHECKING ALL OBJTS AT THE BEGGINING", allObjects);
