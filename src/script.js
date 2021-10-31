import * as THREE from "three/build/three.module.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

//import OrbitWrapper from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";

//import "../../node_modules/three/examples/js/controls/OrbitControls.js";

import * as dat from "dat.gui";

//const { OrbitControls } = OrbitWrapper;

import "./style.css";

const objects = [];

let camera, scene, renderer;
let plane,
  controls,
  gui,
  pointer,
  raycaster,
  isShiftDown = false,
  currentShape = "box",
  isCreationMode = false,
  createParams = {
    color: 0x0000ff,
    geo: {},
  },
  parameters = {
    color: 0xff0000,
    create: () => assignParametersToCreate(), //createObject(),
    deleteLast: () => objects.pop(),
    clear: () => objects.clear(),
  };

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;

const currentObject = () => {
  const result = objects.length > 0 ? objects[objects.length - 1] : null;

  //console.log("CHECKING CURRENT OBJECT", currentObject, objects, objects.children.length)

  return result;
};

/* SHAPE TRANSLATION */

function getShape(shape) {
  switch (shape) {
    case "box":
      return new THREE.BoxGeometry(50, 50, 50);
    case "cyl":
      return new THREE.CylinderGeometry(50, 50, 50, 12);
    case "pyd":
      return new THREE.ConeGeometry(50, 50, 40, 40);
    default:
      return new THREE.BoxGeometry(50, 50, 50);
  }
}

/* SET PARAMETER OF OBJECT TO CREATE */

function assignParametersToCreate() {
  isCreationMode = true;
  createControls();

  console.log("CHECKING PARAMETER ASSIGNEMENT", isCreationMode);
  document.addEventListener("pointerdown", onPointerDown);
}

/* CREATE OBECTE */

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
  scene.add(basicMesh);
  objects.push(basicMesh);

  console.log("CHECKING ALL OBJECTS AFTER CREATION", objects, scene);
}

// CONTROL CREATION

function createControls() {
  controls = new OrbitControls(camera, renderer.domElement);
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

/* GUI CREEATION */
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

/* TRIGGER INITIALIZATION & FIRST RENDER */

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
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // roll-over helpers

  const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0.5,
    transparent: true,
  });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  scene.add(rollOverMesh);

  // cubes

  cubeGeo = new THREE.BoxGeometry(50, 50, 50);
  cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c }); //map: new THREE.TextureLoader().load( 'textures/square-outline-textured.png' ) } );

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

  // lights

  const ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  createControls();
  createGui();
  document.body.appendChild(renderer.domElement);

  //document.addEventListener("pointermove", onPointerMove);
  //document.addEventListener("pointerdown", onPointerDown);
  //document.addEventListener("keydown", onDocumentKeyDown);
  //document.addEventListener("keyup", onDocumentKeyUp);

  //
  //controls.addEventListener("change", render);
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  //render();
}

/* function onPointerMove(event) {
        pointer.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects(objects, false);

        if (intersects.length > 0) {
          const intersect = intersects[0];

          rollOverMesh.position
            .copy(intersect.point)
            .add(intersect.face.normal);
          rollOverMesh.position
            .divideScalar(50)
            .floor()
            .multiplyScalar(50)
            .addScalar(25);


        }

        render();
      } */

function onPointerDown(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objects, false);

  if (intersects.length > 0) {
    const intersect = intersects[0];

    // delete cube

    if (isShiftDown) {
      if (intersect.object !== plane) {
        scene.remove(intersect.object);

        objects.splice(objects.indexOf(intersect.object), 1);
      }

      // create cube
    } else {
      /* const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position
              .divideScalar(50)
              .floor()
              .multiplyScalar(50)
              .addScalar(25);
            scene.add(voxel);

            objects.push(voxel); */

      createObject(intersect);
    }

    isCreationMode = false;
    document.removeEventListener("pointerdown", onPointerDown);

    createGui();

    createControls();
    //render();
  }
}

/* function onDocumentKeyDown(event) {
        switch (event.keyCode) {
          case 16:
            isShiftDown = true;
            break;
        }
      }

      function onDocumentKeyUp(event) {
        switch (event.keyCode) {
          case 16:
            isShiftDown = false;
            break;
        }
      } */

function render() {
  console.log("WE ARE RENDENRING A NEW FRAME", scene);

  renderer.render(scene, camera);
}

const update = () => {
  //const elapsedTime = clock.getElapsedTime();

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
