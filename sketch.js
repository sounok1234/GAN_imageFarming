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
var newLineToDraw = false;
var allPoints = [];
var reducedPoints = [];
var lines = [];
var redoStack = [];
const IP = '184.105.174.119';
const PORT = '8000';
let sideBarStyle = getComputedStyle(document.getElementsByClassName('sidenav')[0]);
let sideBarOffset = parseFloat(sideBarStyle.width) + parseFloat(sideBarStyle.paddingLeft) + parseFloat(sideBarStyle.paddingRight);
let _draggingImage = false;

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

    drawCanvas = p.createCanvas((p.windowWidth - sideBarOffset) / 2, p.windowHeight);
    drawCanvas.id("drawingCanvas");
    p.background(255);
    drawCanvas.position(sideBarOffset, 0);
    drawCanvasElement = document.getElementById('drawingCanvas');
    drawCanvasElement.addEventListener('pre-img-upload', () => {
      lines = [];
      p.clear();
      p.background(255);
    });
    
    drawCanvasElement.addEventListener('img-upload', () => {
      sendToRunway((p.windowWidth - sideBarOffset) / 2, p.windowHeight, sideBarOffset);
    });
  }
  p.mouseReleased = function () {
    if (reducedPoints.length > 0) {
      lines.push(reducedPoints);
      redoStack = [];
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
        //console.log("started drawing");
        prevPenX = penX;
        prevPenY = penY;
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
      // p.ellipse(penX, penY, brushSize);

      // Save the latest brush values for next frame
      prevBrushSize = brushSize;
      prevPenX = penX;
      prevPenY = penY;

      isDrawingJustStarted = false;
    }

    if (!isDrawing) {
      p.clear();
      p.background(255);
      lines.forEach((line) => {
        p.stroke(0);
        p.strokeWeight(2);
        p.noFill();
        p.beginShape();
        line.forEach(v => {
          if (v) {
            p.vertex(v.x, v.y);
          }
        });
        p.endShape();
      });
    }
    // clearing the canvas
    document.getElementById("ClearButton").onclick = function () { clearCanvas() };
    document.getElementById("undo").onclick = function () { undo() };
    document.getElementById("redo").onclick = function () { redo() };

    function clearCanvas() {
      redoStack = lines;
      lines = [];
      p.clear();
      p.background(255);
    }


    function undo() {
      if (lines.length > 0) {
        let item = lines.pop();
        redoStack.push(item);
      }
    }

    function redo() {
      if (redoStack.length > 0) {
        let item = redoStack.pop();
        lines.push(item);
      }
    }

    // document.getElementById("to3DModel").onclick =  () => {
    //   sendToRunway((p.windowWidth - 180)/2, p.windowHeight);
    // };

  }
}, "p5_instance_01");

/***********************
*       UTILITIES      *
************************/

// Initializing Pressure.js
// https://pressurejs.com/documentation.html
function initPressure() {

  //console.log("Attempting to initialize Pressure.js ");

  Pressure.set('#drawingCanvas', {

    start: function (event) {
      // this is called on force start
      isDrawing = true;
      isDrawingJustStarted = true;
    },
    end: function () {
      // this is called on force end
      isDrawing = false
      pressure = 0;
    },
    change: function (force, event) {
      if (isPressureInit == false) {
        console.log("Pressure.js initialized successfully");
        isPressureInit = true;
      }
      //console.log(force);
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
}

function sendToRunway(w, h, sideBarOffset) {
  let dcanvas = document.getElementById('drawingCanvas');
  let dataurl = dcanvas.toDataURL();

  const inputs = { image: dataurl };
  fetch(`http://${IP}:${PORT}/query`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputs),
  })
    .then(response => response.json())
    .then(outputs => {
      const { image } = outputs;
      let imgCanvas = document.getElementById('imageCanvas');
      if (imgCanvas === null) {
        let body = document.getElementsByTagName('body')[0];
        imgCanvas = document.createElement('canvas');
        imgCanvas.id = "imageCanvas";
        imgCanvas.width = w;
        imgCanvas.height = h;
        imgCanvas.style.position = 'absolute';
        let offset = sideBarOffset + w;
        imgCanvas.style.left = `${offset}px`;
        imgCanvas.style.top = 0;
        body.append(imgCanvas);
      }
      let ctx = imgCanvas.getContext('2d');

      let img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = image;
    });
}
