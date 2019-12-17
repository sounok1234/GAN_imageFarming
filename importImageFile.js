let draggingImage = false;

document.querySelector("#myFileInput").onclick = () => {
  document.querySelector("#mypic").click();
};

var input = document.querySelector("input[type=file]");
input.onchange = function() {
  var file = input.files[0];
  drawOnCanvas(file);
};

const container = document.getElementById("container");
const previewImage = container.querySelector("#image_preview");
const img = document.getElementById("image_preview");
dragElement(previewImage);

function drawOnCanvas(file) {
  var reader = new FileReader();

  reader.addEventListener("load", async function() {
    await previewImage.setAttribute("src", this.result);
    container.style.display = "inherit";
    dragElement(previewImage);
  });

  reader.readAsDataURL(file);
}

function dragElement(elmnt) {
  var endX = 0,
    endY = 0,
    startX = 0,
    startY = 0;
  // otherwise, move the DIV from anywhere inside the DIV:
  elmnt.onmousedown = dragMouseDown;
  elmnt.addEventListener("touchstart", dragMouseDown, false);
  container.onmousedown = dragMouseDown;
  container.addEventListener("touchstart", dragMouseDown, false);

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    draggingImage = true;
    // get the mouse cursor position at startup:
    startX = e.clientX;
    startY = e.clientY;
    if (e.type === "touchstart") {
      document.addEventListener("touchend", closeDragElement, false);
    } else {
      document.onmouseup = closeDragElement;
    }
    // call a function whenever the cursor moves:
    if (e.target == elmnt) {
      if (e.type === "touchstart") {
        console.log('Adding touchmove to drag')
        document.addEventListener("touchmove", elementDrag, false);
      } else {
        document.onmousemove = elementDrag;
      }
    } else if (e.target == container) {
      if (e.type === "touchstart") {
        console.log('Adding touchmove to resize')
        document.addEventListener("touchmove", resize, false);
      } else {
        document.onmousemove = resize;
      }
    }
  }

  function resize(e) {
    e = e || window.event;
    e.preventDefault();
    console.log("elementResize function is being called", e);
    // calculate the new cursor position:
    let relativeX;
    let relativeY;
    if (e.type === "touchmove") {
      endX = (startX - e.touches[0].clientX) / 2;
      endY = (startY - e.touches[0].clientY) / 2;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else {
      endX = startX - e.clientX;
      endY = startY - e.clientY;
      startX = e.clientX;
      startY = e.clientY;
    }
    // set the element's new position:
    const midHeight = container.clientHeight / 2;
    const midWidth = container.clientWidth / 2;
    relativeX = startX - container.offsetLeft;
    relativeY = startY - container.offsetTop;
    console.log(relativeX, relativeY);
    const isTop = relativeY < midHeight;
    const isBottom = relativeY >= midHeight;
    const isLeft = relativeX < midWidth;
    const isRight = relativeX >= midWidth;
    if (isTop && isLeft) {
      // TOP LEFT
      container.style.top = container.offsetTop - endY + "px";
      container.style.left = container.offsetLeft - endX + "px";
      container.style.width = container.clientWidth + endX + "px";
    } else if (isBottom && isLeft) {
      //BOTTOM LEFT
      container.style.left = container.offsetLeft - endX + "px";
      container.style.width = container.clientWidth + endX + "px";
    } else if (isBottom && isRight) {
      // BOTTOM RIGHT
      container.style.width = container.clientWidth - endX + "px";
    } else if (isTop && isRight) {
      // TOP RIGHT
      container.style.top = container.offsetTop - endY + "px";
      container.style.width = container.clientWidth - endX + "px";
    } else {
      return;
    }
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    console.log("elementDrag function is being called");
    // calculate the new cursor position:
    if (e.type === "touchmove") {
      //let clientX = Array.from(e.touches).map(touch => touch.clientX);
      //let clientY = Array.from(e.touches).map(touch => touch.clientY);
      //console.log(clientX, clientY);
      endX = (startX - e.touches[0].clientX) / 2;
      endY = (startY - e.touches[0].clientY) / 2;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else {
      endX = startX - e.clientX;
      endY = startY - e.clientY;
      startX = e.clientX;
      startY = e.clientY;
    }
    // set the element's new position:
    var leftShift = container.offsetLeft - endX;
    container.style.top = container.offsetTop - endY + "px";
    container.style.left = container.offsetLeft - endX + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    document.removeEventListener("touchmove", elementDrag);
    document.removeEventListener("touchmove", resize);
    document.removeEventListener("touchend", closeDragElement);
    draggingImage = false;
  }


}
