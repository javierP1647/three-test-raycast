import * as THREE from "three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import * as dat from "dat.gui";
import "./style.css";

const objects = [];
//const objGroup = new THREE.Group()
const lastObject = objects[objects.length -1]
let posIn3d
let currentColor = objects.length > 1? objects[objects.length - 1].material.color : 0xff0000
let camera, scene, renderer;
let plane,
  controls,
  gui,
  pointer,
  raycaster,
  currentShape = "box",
  isCreationMode = false,
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
    posUp: ()=> toScreenSpin('up'),
    posDown: ()=> toScreenSpin('down'),
    posLeft: ()=> toScreenSpin('left'),
    posRight: ()=> toScreenSpin('right'),
    rotateY: 'spin',
    rotateZ: ()=> axisBack(),
  };

const currentObject = () => objects.length > 0 ? objects[objects.length - 1] : null;



/* SHAPE OPTIONS */

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

    createControls();
    controls.enabled = false

  console.log("CHECKING PARAMETER ASSIGNEMENT", isCreationMode);
  document.addEventListener("pointerdown", onPointerDown);
}

/* OBJECT CRUD */

function createObject(intersect) {
  const { x, y, z } = intersect.point;

  console.log("CREATING OBJECT, CHECKING INTERSECT", intersect, x, y, z);

  const basicGeometry = getShape(currentShape);

  const basicMaterial = new THREE.MeshBasicMaterial({
    color: createParams.color,
  });
  const basicMesh = new THREE.Mesh(basicGeometry, basicMaterial);
  basicMesh.position.copy(intersect.point);

  console.log("CHECKING BASIC MESH BEFORE PUSHING", basicMesh);
  scene.add(basicMesh);
  objects.push(basicMesh);

  console.log("CHECKING ALL OBJECTS AFTER CREATION", objects, scene);
  controls.enabled = true
}

function deleteObject() {
    if (objects.length > 1) {

    scene.remove(objects[objects.length-1])
    objects.pop()

    }
    createGui();
}

function clearAllObject() {
    console.log(objects)
    objects.forEach((obj, index)=>{
        if (index >= 1){
            scene.remove(obj)
        }
    })
   objects.splice(1, objects.length-1)
    console.log(objects)
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
  controls.enabled = true
  //controls.addEventListener('change', axisSwap);
}

/* SCENE CREATION */

scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const objGroup = new THREE.Group()
scene.add(objGroup)



///// AXIS HACK /////


const axisGeometry = new THREE.BoxGeometry( 100, 100, 250 );
const axisMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
const axisCube = new THREE.Mesh( axisGeometry, axisMaterial );
axisCube.rotation.x = Math.PI * 1
axisCube.rotation.y = Math.PI * 8
axisCube.rotation.z = Math.PI / 1
console.log(axisCube.rotation.y)
scene.add( axisCube );
console.log(axisCube)


const axisBack = ()=> {
  let spin = camera.rotation.z
  let unSpin = camera.rotation.z * -1
  axisCube.rotation.y = unSpin
}

/* AXIS SWAP */

//controls.addEventListener('change', render);

function axisSwap(){
    axisCube.add(currentObject())
    console.log(objGroup)
    objGroup.add(currentObject())
    console.log(objGroup)
    objGroup.remove(currentObject())
}

////// TRANSLATE CONTROLS ////

// const controller = new TransformControls( Camera, renderer.domElement );
// controller.addEventListener( 'change', render );
//
// controller.addEventListener( 'dragging-changed', function ( event ) {
//
//    controls.enabled = ! event.value;
//
// } );



const localGeometry = new THREE.BoxGeometry( 100, 100, 250 );
const localMaterial = new THREE.MeshBasicMaterial( {color: 0x00CCCC, wireframe: true} );
const localCube = new THREE.Mesh( localGeometry, localMaterial );
axisCube.rotation.x = Math.PI * 1
axisCube.rotation.y = Math.PI * 8
axisCube.rotation.z = Math.PI / 1
console.log(localCube.rotation.y)
scene.add( localCube );

console.log(localCube);

/* GUI CREATION */

const createGui = () => {
  /**
   * Panel
   */
  gui = new dat.GUI({
    // closed: true,
    width: 400,
  });
  gui.domElement.id = "gui";


  gui.add(parameters, "resetCamera");
  gui.add(parameters, "rotateY");
  gui.add(parameters, "rotateZ");
  gui.add(parameters, "posUp");
  gui.add(parameters, "posDown");
  gui.add(parameters, "posLeft");
  gui.add(parameters, "posRight");

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

  if (currentObject()) {
    modify
      .add(currentObject().position, "x")
      .min(-500)
      .max(500)
      .step(1)
      .name("side to side")
      .listen();
    modify
      .add(currentObject().position, "z")
      .min(-500)
      .max(500)
      .step(1)
      .name("up and down")
      .listen();
      modify
          .add(axisCube.position, "z")
          .min(-500)
          .max(500)
          .step(1)
          .name("up and down screen")
          .listen();
      modify
          .add(axisCube.position, "x")
          .min(-500)
          .max(500)
          .step(1)
          .name("side to side screen")
          .listen();
      modify
          .add(localCube.position, "x")
          .min(-500)
          .max(500)
          .step(1)
          .name("side to side screen local")
          .listen();
    modify
      .add(currentObject().rotation, "y")
      .min(-Math.PI * 2)
      .max(Math.PI * 2)
      .step(Math.PI / 4)
      .name("rotate")
      .listen();
      modify
          .add(axisCube.rotation, "y")
          .min(-Math.PI * 12)
          .max(Math.PI * 12)
          .step(Math.PI / 8)
          .name("rotate Axis")
          .listen();
    modify
      .addColor(parameters, "color")
      .onChange(() => {
          objects[objects.length - 1].material.color.set(parameters.color)

        console.log("CHECKING CURRENT OBJ", currentObject());

      })
      .listen();
  }

  let deleteObject = gui.addFolder("Delete");
  deleteObject.open();
  deleteObject.add(parameters, "delete");
  deleteObject.add(parameters, "clear");


};



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

  plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false })
  );
  scene.add(plane);
  objects.push(plane);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  createControls();
  createGui();
  document.body.appendChild(renderer.domElement);


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

    createGui();

    createControls();
  }
}



function toScreenSpin(direction) {

    const obj = objects[objects.length-1]

    //const obj2 = objects[objects.length-2]
    // const vector = new THREE.Vector3();
    // vector.setFromMatrixPosition( obj.matrixWorld );
    // const widthHalf = (window.innerWidth/2);
    // const heightHalf = (window.innerHeight/2);
    // vector.project(camera);

    if (direction === 'up'){


        axisCube.add(obj)

        axisCube.translateZ(10)
        //localCube.translateZ(-10)
        //objGroup.add(obj)
        //localCube.add(obj)

        //axisCube.remove(obj)
        //localCube.add(obj)
    }
    else if (direction === 'down'){
        axisCube.add(obj)

        axisCube.geometry.translate( 0, 0, -5 );
        //objects.add(obj)
        //axisCube.geometry.translate( 0, 0, 50 );

    }
    else if (direction === 'left'){
        axisCube.add(obj)

        axisCube.geometry.translate( 50, 0, 0 );
        //objects.add(obj)
        axisCube.geometry.translate( -50, 0, 0 );


    } else if (direction === 'right'){
        axisCube.add(obj)

        axisCube.geometry.translate( -50, 0, 0 );
        //objects.add(obj)
        axisCube.geometry.translate( 50, 0, 0 );

    }
}


function render() {
  console.log("RENDERING A NEW FRAME", scene);

  renderer.render(scene, camera);
}


/////// UPDATE FUNCTION /////////
/////// UPDATE FUNCTION /////////
/////// UPDATE FUNCTION /////////





const update = () => {



  axisBack()
  if (controls) controls.update();



  renderer.render(scene, camera);

  window.requestAnimationFrame(update);
};


update();









/////// SCREEN SPACE TEST /////////
/////// SCREEN SPACE TEST /////////
/////// SCREEN SPACE TEST /////////


// function screenSpace(obj){
//
//     const vector = obj.clone();
//     let windowWidth = window.innerWidth;
//     const minWidth = 1280;
//
//     if(windowWidth < minWidth) {
//         windowWidth = minWidth;
//     }
//     console.log(obj)
//     const widthHalf = (windowWidth/2);
//     const heightHalf = (window.innerHeight/2);
//
//     vector.project(camera);
//
//     vector.x = ( vector.x * widthHalf ) + widthHalf;
//     vector.y = - ( vector.y * heightHalf ) + heightHalf;
//     vector.z = 0;
//
//     console.log(vector)
//     console.log(objects[1].position)
//
//     return vector;
//
// };

// function toScreenXYZ(direction)
// {
//     const obj = objects[objects.length-1]
//     const vector = new THREE.Vector3();
//     vector.setFromMatrixPosition( obj.matrixWorld );
//     const widthHalf = (window.innerWidth/2);
//     const heightHalf = (window.innerHeight/2);
//     vector.project(camera);
//     if (direction === 'up'){
//         //vector.x = ( vector.x * widthHalf ) + widthHalf;
//         obj.position.z =  (( vector.y * heightHalf ) + heightHalf) * -1
//     }
//     else if (direction === 'down'){
//         vector.x = ( vector.x * widthHalf ) + widthHalf;
//         vector.y = - ( vector.y * heightHalf ) + heightHalf;
//     }
//     else if (direction === 'left'){
//         vector.x = ( vector.x * widthHalf ) + widthHalf;
//         vector.y = - ( vector.y * heightHalf ) + heightHalf;
//
//     } else if (direction === 'right'){
//         vector.x = ( vector.x * widthHalf ) + widthHalf;
//         vector.y = - ( vector.y * heightHalf ) + heightHalf;
//     }
//     //vector.x = ( vector.x * widthHalf ) + widthHalf;
//     //vector.y = - ( vector.y * heightHalf ) + heightHalf;
//     console.log(vector)
//     console.log(obj)
//     return vector;
// };










/////// SCREEN SPACE TEST /////////





