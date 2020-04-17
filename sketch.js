// Apple Pencil demo using Pressure.js

// Alternative method: https://github.com/quietshu/apple-pencil-safari-api-test

// If you want to go deeper into pointer events
// https://patrickhlauke.github.io/touch/
// https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure


/***********************
*       SETTINGS       *
************************/

// How sensitive is the brush size to the pressure of the pen?
var pressureMultiplier = 10;

// What is the smallest size for the brush?
var minBrushSize = 1;

// Higher numbers give a smoother stroke
var brushDensity = 5;

var showDebug = true;

// Jitter smoothing parameters
// See: http://cristal.univ-lille.fr/~casiez/1euro/
var minCutoff = 0.0001; // decrease this to get rid of slow speed jitter but increase lag (must be > 0)
var beta = 1.0;  // increase this to get rid of high speed lag


/***********************
*       GLOBALS        *
************************/
var xFilter, yFilter, pFilter;
var inBetween;
var prevPenX = 0;
var prevPenY = 0;
var prevBrushSize = 1;
var amt, x, y, s, d;
var pressure = -2;
var drawCanvas, uiCanvas;
var isPressureInit = false;
var isDrawing = false;
var isDrawingJustStarted = false;
var isErasing = false;
var eraserToolActive = false;
var newLineToDraw = false;
var newDrawing = true;
var allPoints = [];
var reducedPoints = [];
var lines = [];
var redoStack = [];
var undoStack = [];
let sideBarStyle = getComputedStyle(document.getElementsByClassName('sidenav')[0]);
let sideBarOffset = parseFloat(sideBarStyle.width) + parseFloat(sideBarStyle.paddingLeft) + parseFloat(sideBarStyle.paddingRight);

/***********************
*    DRAWING CANVAS    *
************************/
new p5(function (p) {

    p.setup = () => {
       
    // Filters used to smooth position and pressure jitter
    xFilter = new OneEuroFilter(60, minCutoff, beta, 1.0);
    yFilter = new OneEuroFilter(60, minCutoff, beta, 1.0);
    pFilter = new OneEuroFilter(60, minCutoff, beta, 1.0);

    // prevent scrolling on iOS Safari
    disableScroll();

    //Initialize the canvas
    drawCanvas = p.createCanvas((p.windowWidth - sideBarOffset), p.windowHeight);
    drawCanvas.parent("#drawingCanvasContainer");
    drawCanvas.id("drawingCanvas");
    p.background(255);
    drawCanvas.position(sideBarOffset, 0);
    drawCanvasElement = document.getElementById('drawingCanvas');
    drawCanvasElement.addEventListener('pre-img-upload', () => {
      lines = [];
      p.clear();
      p.background(255);
    });
    
  }

  p.mouseReleased = function () {
    if (reducedPoints.length > 0 && !eraserToolActive) {
      for (let i = 0; i < (reducedPoints.length - 1); i++) {
        lines.push([reducedPoints[i], reducedPoints[i+1]]);
        undoStack.push({ index: i, type: "line", geometry: [reducedPoints[i], reducedPoints[i+1]] });
      }
      reducedPoints = [];
    }
    allPoints = [];

  }

  p.draw = function () {

    // Start Pressure.js if it hasn't started already
    if (isPressureInit == false) {
      initPressure();
    }

    if (isDrawing) {

      // Smooth out the position of the pointer 
      penX = xFilter.filter(p.mouseX, p.millis());
      penY = yFilter.filter(p.mouseY, p.millis());

      // What to do on the first frame of the stroke
      if (isDrawingJustStarted) {
        prevPenX = penX;
        prevPenY = penY;
      }

      if (newDrawing) {
        startTimer(0);
        newDrawing = false;
      }

      // Smooth out the pressure
      pressure = pFilter.filter(pressure, p.millis());

      // Define the current brush size based on the pressure
      brushSize = minBrushSize + (pressure * pressureMultiplier);

      // Calculate the distance between previous and current position
      d = p.dist(prevPenX, prevPenY, penX, penY);

      // The bigger the distance the more ellipses
      // will be drawn to fill in the empty space
      inBetween = (d / p.min(brushSize, prevBrushSize)) * brushDensity;

      // Add ellipses to fill in the space 
      // between samples of the pen position
      for (let i = 1; i <= inBetween; i++) {
        amt = i / inBetween;
        s = p.lerp(prevBrushSize, brushSize, amt);
        x = p.lerp(prevPenX, penX, amt);
        y = p.lerp(prevPenY, penY, amt);
        p.noStroke();
        p.fill(100);
        p.ellipse(x, y, s);
        allPoints.push(p.createVector(x, y));
      }
      // Draw an ellipse at the latest position
      reducedPoints = simplifyLine(allPoints);
      p.noStroke();
      p.fill(100);

      // Save the latest brush values for next frame
      prevBrushSize = brushSize;
      prevPenX = penX;
      prevPenY = penY;

      isDrawingJustStarted = false;
    }

   if (isErasing) {
    lines.forEach((line, i) =>{
      const testPoints = [
        { x1: p.mouseX, y1: p.mouseY, x2: p.mouseX, y2: p.mouseY + 30 },
        { x1: p.mouseX, y1: p.mouseY + 30, x2: p.mouseX + 30, y2: p.mouseY + 30 },
        { x1: p.mouseX + 30, y1: p.mouseY + 30, x2: p.mouseX + 30, y2: p.mouseY },
        { x1:p.mouseX + 30, y1: p.mouseY, x2: p.mouseX, y2: p.mouseY }
      ];
      const anyIntersection = testPoints.some(pts => intersects(pts.x1, pts.y1, pts.x2, pts.y2, line[0].x, line[0].y, line[1].x, line[1].y));
      if (anyIntersection) { 
          undoStack.push({index: i, type: "erase", geometry:lines[i]});
          lines.splice(i, 1);
      }
    });
  }

    if (!isDrawing) {
      p.clear();
      p.background(255);
      lines.forEach((line) => {
        p.stroke(0);
        p.strokeWeight(2);
        p.noFill();
        p.line(line[0].x, line[0].y, line[1].x, line[1].y);
      });
    }
    // clearing the canvas
    document.getElementById("ClearButton").onclick = function () { clearCanvas() };
    document.getElementById("undo").onclick = function () { undo() };
    document.getElementById("redo").onclick = function () { redo() };
    document.getElementById("eraser").onclick = function () { erase() };

    function clearCanvas() {
      redoStack = [];
      undoStack = [];
      lines = [];
      p.clear();
      p.background(255);
      clearTimer();
      newDrawing = true;
    }

    function intersects(a,b,c,d,p,q,r,s) {
      var det, gamma, lambda;
      det = (c - a) * (s - q) - (r - p) * (d - b);
      if (det === 0) {
        return false;
      } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
      }
    };

    function erase() { 
      if (drawCanvasElement.classList.toggle("eraser-cursor") == true) {
        eraserToolActive = true;
      } else {
        eraserToolActive = false;
      }
   }

    function undo() {
      if (undoStack.length > 0) {
        let item = undoStack.pop();
        if (item.type == "erase") {
          lines.splice(item.index, 0, item.geometry);
          redoStack.push({ index: item.index, type: item.type, geometry: item.geometry });
        } else {
          let removedLine = lines.pop();
          let removedIndex = lines.length; // Normally would be length - 1, but we just removed an item at the index
          redoStack.push({ index: removedIndex, type:"line", geometry: removedLine });
        }
      }
    }

    function redo() {
      if (redoStack.length > 0) {
        let item = redoStack.pop();
        if (item.type == "erase") {
          lines.splice(item.index, 1);
          undoStack.push(item);
        } else {
          lines.push(item.geometry);
          undoStack.push(item);
        }
      }
    }

  }
}, "p5_instance_01");

/***********************
*       UTILITIES      *
************************/

// Initializing Pressure.js
// https://pressurejs.com/documentation.html
function initPressure() {

  Pressure.set('#drawingCanvas', {

    start: function (event) {
      // this is called on force start
      if (eraserToolActive) {
        isErasing = true 
      } else {
        isDrawing = true;
        isDrawingJustStarted = true;
      }
      
    },
    end: function () {
      // this is called on force end
      isErasing = false
      isDrawing = false
      pressure = 0;
    },
    change: function (force, event) {
      if (isPressureInit == false) {
        console.log("Pressure.js initialized successfully");
        isPressureInit = true;
      }
      pressure = force;
    }
  });

  Pressure.config({
    polyfill: true, // use time-based fallback ?
    polyfillSpeedUp: 1000, // how long does the fallback take to reach full pressure
    polyfillSpeedDown: 0,
    preventSelect: true,
    only: null
  });

}

// Disabling scrolling and bouncing on iOS Safari
// https://stackoverflow.com/questions/7768269/ipad-safari-disable-scrolling-and-bounce-effect

function preventDefault(e) {
  e.preventDefault();
}

function disableScroll() {
  document.body.addEventListener('touchmove', preventDefault, { passive: false });
}
/*
function enableScroll(){
    document.body.removeEventListener('touchmove', preventDefault, { passive: false });
}*/

function canvasToModel() {
  let linesForBackend = [];
  lines.forEach(line => {
    let linePts = [];
    if (line.length > 0) {
      line.forEach(pt => {
        linePts.push([pt.x, pt.y]);
      });
    }
    linesForBackend.push(linePts);
  });
  console.log(linesForBackend);
  return linesForBackend;
}

async function postSketch(fromCanvas) {
  let dcanvas = document.getElementById('drawingCanvas');
  let dataurl = dcanvas.toDataURL();
  let image  = document.getElementById('referenceImage');
  let sketch, photo;
  let filename = null;
  if (fromCanvas) {
    sketch = dataurl
  } else {
    let uploadInput = document.getElementById('modalUpload');
    let file = uploadInput.files[0];
    filename = file.name;
    sketch = await fileToDataURL(file);
  }
  if (image.src.startsWith('data:')) {
    photo = image.src;
  } else {
    photo = await URLtoDataURL(image.src);
  }

  const inputs = { 
    photo,
    sketch,
    metadata: {
      points: canvasToModel(),
      imageMetadata: { name: filename},
      id: uuidv4()
    }
  };
  fetch('https://sketchgansketch.azurewebsites.net/api/postsketch', {
    method: 'POST',
    headers: {
      // Accept: 'application/json',
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(inputs),
  })
    .then(response => response.json())
}
