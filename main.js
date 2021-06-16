// Canvas element and context Constants
const lowerCanvas = document.getElementById("lower-canvas");
const lowerCanvasContext = lowerCanvas.getContext("2d");
const upperCanvas = document.createElement("canvas");
const upperCanvasContext = upperCanvas.getContext("2d");
const canvasOffset = lowerCanvas.getBoundingClientRect();

let canvasObjects = [];
let activeObject = {};

// styling lower-canvas
lowerCanvas.width = window.innerWidth - 50;
lowerCanvas.height = window.innerHeight - 200;

// styling upper-canvas
upperCanvas.height = lowerCanvas.height;
upperCanvas.width = lowerCanvas.width;
upperCanvas.style.position = "absolute";
upperCanvas.style.top = "1px";
upperCanvas.style.left = "1px";

const canvasContainer = document.getElementById("canvas-container");
canvasContainer.style.position = "relative";
canvasContainer.appendChild(upperCanvas);

// Initialization of drawing states.
let isDrawingModeOn = false;
let startX = 0;
let startY = 0;
const offsetX = canvasOffset.top;
const offsetY = canvasOffset.left;

// This method get called on double click on canvas, and remove is any object is selected ( clicked occur on any object ).
function doubleClickOnCanvas(event) {
  event.preventDefault();
  event.stopPropagation();
  const isObjectSelected = getActiveObject(event);

  if (isObjectSelected && !event.altKey && !event.ctrlKey) {
    removeSelectedObjectAndRedraw(false);
  }
}

/**
 * Add/ Modify object on mouse up on canvas.
 */
function mouseUp(event) {
  event.preventDefault();
  event.stopPropagation();

  if (isDrawingModeOn) {
    canvasObjects.push(activeObject);
    isDrawingModeOn = false;
  }
  lowerCanvasContext.drawImage(upperCanvas, 0, 0);
  upperCanvasContext.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height);
  discardActiveObject();
}

/**
 * This method will be called on mouse movement on canvas.
 * Draw rectangle if drawing mode is on.
 * move object if any selected.
 */
function mouseMove(event) {
  event.preventDefault();
  event.stopPropagation();

  const { pointX, pointY } = getMouseDownPointer(event);
  const movementX = pointX - startX;
  const movementY = pointY - startY;

  upperCanvasContext.clearRect(0, 0, upperCanvas.width, upperCanvas.height);
  if (isDrawingModeOn) {
    upperCanvasContext.fillRect(startX, startY, movementX, movementY);
    if (movementX < 0) {
      activeObject.top = pointX;
    }
    if (movementY < 0) {
      activeObject.left = pointY;
    }
    activeObject.width = Math.abs(movementX);
    activeObject.height = Math.abs(movementY);
  } else if (activeObject.isSelected) {
    const newTop = activeObject.top + movementX;
    const newLeft = activeObject.left + movementY;
    upperCanvasContext.fillRect(
      newTop,
      newLeft,
      activeObject.width,
      activeObject.height
    );
    canvasObjects[activeObject.id].top = newTop;
    canvasObjects[activeObject.id].left = newLeft;
  }
}

/**
 * Start drawing or modifying an object on canvas.
 */
function mouseDown(event) {
  event.preventDefault();
  event.stopPropagation();

  const isObjectSelected = getActiveObject(event);
  const { pointX, pointY } = getMouseDownPointer(event);
  startX = pointX;
  startY = pointY;

  if (!isObjectSelected) {
    const fillColor = getRandomColor();

    isDrawingModeOn = true;

    upperCanvasContext.fillStyle = fillColor;
    activeObject = {
      id: canvasObjects.length,
      type: "rect",
      top: startX,
      left: startY,
      fill: fillColor,
      height: 0,
      width: 0,
      isSelected: true,
    };
  } else {
    // Duplicate object if control key is pressed.
    if (event.ctrlKey) {
      canvasObjects[activeObject.id].isSelected = false;
      activeObject.id = canvasObjects.length;
      canvasObjects.push(activeObject);
    }

    // Duplicate object if control key is pressed.
    if (event.altKey) {
      activeObject.fill = getRandomColor();
    }

    removeSelectedObjectAndRedraw();

    upperCanvasContext.fillStyle = activeObject.fill;
    upperCanvasContext.fillRect(
      activeObject.top,
      activeObject.left,
      activeObject.width,
      activeObject.height
    );
  }
}

/**
 * Make object active on mouse down event.
 * @returns return true if any object get selected else return false.
 */
function getActiveObject(event) {
  const { pointX, pointY } = getMouseDownPointer(event);
  if (canvasObjects.length) {
    for (let index = canvasObjects.length - 1; index >= 0; index--) {
      if (
        pointX >= canvasObjects[index].top &&
        pointY >= canvasObjects[index].left &&
        pointX <= canvasObjects[index].width + canvasObjects[index].top &&
        pointY <= canvasObjects[index].height + canvasObjects[index].left
      ) {
        canvasObjects[index].isSelected = true;
        activeObject = Object.assign({}, canvasObjects[index]);
        return true;
      }
    }
  }
  return false;
}

/**
 * @param pushRemovedObject boolean value that determine if true then remove object from canvas, and add after modification. else remove the object completely from canvas.
 */
function removeSelectedObjectAndRedraw(pushRemovedObject = true) {
  canvasObjects.splice(activeObject.id, 1);
  activeObject.id = canvasObjects.length;

  if (pushRemovedObject) {
    canvasObjects.push(Object.assign({}, activeObject));
  } else {
    activeObject = {};
  }

  lowerCanvasContext.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height);
  for (const index in canvasObjects) {
    if (!canvasObjects[index].isSelected) {
      canvasObjects[index].id = index;
      lowerCanvasContext.fillStyle = canvasObjects[index].fill;
      lowerCanvasContext.fillRect(
        canvasObjects[index].top,
        canvasObjects[index].left,
        canvasObjects[index].width,
        canvasObjects[index].height
      );
    }
  }
}

/**
 * Discards active object.
 */
function discardActiveObject() {
  canvasObjects[activeObject.id].isSelected = false;
  activeObject = {};
}

/**
 * Return X, Y coordinates of mouse down relative canvas positions.
 */
function getMouseDownPointer(mouseEvent) {
  const pointX = mouseEvent.clientX - offsetX;
  const pointY = mouseEvent.clientY - offsetY;

  return { pointX: pointX, pointY: pointY };
}

// Adding mouse events on canvas.
upperCanvas.addEventListener("mousedown", mouseDown);
upperCanvas.addEventListener("mousemove", mouseMove);
upperCanvas.addEventListener("mouseup", mouseUp);
upperCanvas.addEventListener("dblclick", doubleClickOnCanvas);

// Reset canvas.
function clearCanvas() {
  lowerCanvasContext.clearRect(0, 0, lowerCanvas.width, lowerCanvas.height);
  canvasObjects = [];
}

// Generate random string of length 6.
function getRandomColor() {
  return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
}
