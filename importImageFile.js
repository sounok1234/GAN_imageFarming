// Connect upload button to hidden file input
/*
document.querySelector("#uploadButton").onclick = () => {
  document.querySelector("#imageInput").click();
};
*/
// Handle file upload
const input = document.querySelector("input[type=file]");
input.onchange = function() {
  const file = input.files[0];
  showImageFromFile(file);
};


function showImageFromFile(file) {
  const reader = new FileReader();

  reader.addEventListener("load", function() {
    showImage(this.result);
  });

  reader.readAsDataURL(file);
}

async function showImage(src) {
    const imageContainer = document.getElementById("imageContainer");
    const referenceImage = document.querySelector("#referenceImage");
    await referenceImage.setAttribute("src", src);
    imageContainer.style.display = "inherit";
    addTransformHandlers(referenceImage, imageContainer);
}

function addTransformHandlers(element, container) {
  let endX = 0;
  let endY = 0;
  let startX = 0;
  let startY = 0;
  element.onmousedown = dragMouseDown;
  element.addEventListener("touchstart", dragMouseDown, {passive:false});
  container.onmousedown = dragMouseDown;
  container.addEventListener("touchstart", dragMouseDown, {passive:false});

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    startX = e.clientX;
    startY = e.clientY;

    // call a function whenever the cursor moves:
    if (e.type === "touchstart") {
      document.addEventListener("touchend", closeDragElement, false);
    } else {
      document.onmouseup = closeDragElement;
    }
    if (e.target == element) {
      if (e.type === "touchstart") {
        document.addEventListener("touchmove", elementDrag, {passive:false});
      } else {
        document.onmousemove = elementDrag;
      }
    } else if (e.target == container) {
      if (e.type === "touchstart") {
        document.addEventListener("touchmove", resize, {passive:false});
      } else {
        document.onmousemove = resize;
      }
    }
  }

  function resize(e) {
    e = e || window.event;
    e.preventDefault();
    
    // calculate the new cursor position:
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
    const relativeX = startX - container.offsetLeft;
    const relativeY = startY - container.offsetTop;
    const isTop = relativeY < midHeight;
    const isBottom = relativeY >= midHeight;
    const isLeft = relativeX < midWidth;
    const isRight = relativeX >= midWidth;
    if (isTop && isLeft) {
      // TOP LEFT
      console.log(e.clientX);
      console.log(startX);
      //console.log(container.offsetTop)
      //console.log(container.style.top)
      container.style.top = container.offsetTop - endY + "px";
      container.style.left = container.offsetLeft - endX + "px";
      console.log(container.offsetLeft);
      container.style.width = container.clientWidth + endX + "px"; 
      console.log(container.clientWidth);
      console.log(container.style.width);
    } 
   
    else if (isBottom && isLeft) {
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
    
    // calculate the new cursor position:
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
  }

}
