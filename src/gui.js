import * as dat from "dat.gui";

const createGui = ({
  createParams,
  currentObject,
  parameters,
  axisCube,
  localCube,
}) => {
  //console.log("CHECK GLOBALS", this, window, globalThis);
  /**
   * Panel
   */

  const previusGui = document.getElementById("gui");

  if (previusGui) {
    previusGui.remove();
  }

  let gui = new dat.GUI({
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
      globalThis.currentShape = newValue;
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
        objects[objects.length - 1].material.color.set(parameters.color);

        console.log("CHECKING CURRENT OBJ", currentObject());
      })
      .listen();
  }

  let deleteObject = gui.addFolder("Delete");
  deleteObject.open();
  deleteObject.add(parameters, "delete");
  deleteObject.add(parameters, "clear");
};

export default createGui;
