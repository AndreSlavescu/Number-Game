let googleUser; 
window.onload = (event) => { 
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('Logged in as: ' + user.displayName);
            googleUser = user;
        } else {
            window.location = 'index.html'; // If not logged in, navigate back to login page.
        }
    });
};

//------------------------
// DISPLAYING RANDOM IMAGE
//------------------------
const displayImg = (n) =>{
    const imgRef = firebase.database().ref(`images/${n}`);
    imgRef.on('value', (snapshot) =>{
        let link = snapshot.val();
        document.getElementById("img").src = link;
        document.getElementById("img").hidden = false;
        return link;
    });
}
let number = Math.floor(Math.random() * 10);
console.log(number);
displayImg(number);

//-------------------
// GLOBAL variables
//-------------------
let model;

var canvasWidth = 300;
var canvasHeight = 300;
var canvasStrokeStyle = "black";
var canvasLineJoin = "round";
var canvasLineWidth = 10;
var canvasBackgroundColor = "white";
var canvasId = "canvas";

var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

//---------------
// Create canvas
//---------------
var canvasBox = document.getElementById("canvas_box");
var canvas = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
// if (typeof G_vmlCanvasManager != "undefined") {
//   canvas = G_vmlCanvasManager.initElement(canvas);
// }

let ctx = canvas.getContext("2d");

//---------------------
// MOUSE DOWN function
//---------------------
$("#canvas").mousedown(function(e) {
  var rect = canvas.getBoundingClientRect();
  var mouseX = e.clientX - rect.left;
  var mouseY = e.clientY - rect.top;
  drawing = true;
  addUserGesture(mouseX, mouseY);
  drawOnCanvas();
});

//-----------------------
// TOUCH START function
//-----------------------
canvas.addEventListener(
  "touchstart",
  function(e) {
    if (e.target == canvas) {
      e.preventDefault();
    }

    var rect = canvas.getBoundingClientRect();
    var touch = e.touches[0];

    var mouseX = touch.clientX - rect.left;
    var mouseY = touch.clientY - rect.top;

    drawing = true;
    addUserGesture(mouseX, mouseY);
    drawOnCanvas();
  },
  false
);

//---------------------
// MOUSE MOVE function
//---------------------
$("#canvas").mousemove(function(e) {
  if (drawing) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    addUserGesture(mouseX, mouseY, true);
    drawOnCanvas();
  }
});

//---------------------
// TOUCH MOVE function
//---------------------
canvas.addEventListener(
  "touchmove",
  function(e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
    if (drawing) {
      var rect = canvas.getBoundingClientRect();
      var touch = e.touches[0];

      var mouseX = touch.clientX - rect.left;
      var mouseY = touch.clientY - rect.top;

      addUserGesture(mouseX, mouseY, true);
      drawOnCanvas();
    }
  },
  false
);

//-------------------
// MOUSE UP function
//-------------------
$("#canvas").mouseup(function(e) {
  drawing = false;
});

//---------------------
// TOUCH END function
//---------------------
canvas.addEventListener(
  "touchend",
  function(e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
    drawing = false;
  },
  false
);

//----------------------
// MOUSE LEAVE function
//----------------------
$("#canvas").mouseleave(function(e) {
  drawing = false;
});

//-----------------------
// TOUCH LEAVE function
//-----------------------
canvas.addEventListener(
  "touchleave",
  function(e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
    drawing = false;
  },
  false
);

//--------------------
// ADD CLICK function
//--------------------
function addUserGesture(x, y, dragging) {
  clickX.push(x);
  clickY.push(y);
  clickD.push(dragging);
}

//-------------------
// RE DRAW function
//-------------------
function drawOnCanvas() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.strokeStyle = canvasStrokeStyle;
  ctx.lineJoin = canvasLineJoin;
  ctx.lineWidth = canvasLineWidth;

  for (var i = 0; i < clickX.length; i++) {
    ctx.beginPath();
    if (clickD[i] && i) {
      ctx.moveTo(clickX[i - 1], clickY[i - 1]);
    } else {
      ctx.moveTo(clickX[i] - 1, clickY[i]);
    }
    ctx.lineTo(clickX[i], clickY[i]);
    ctx.closePath();
    ctx.stroke();
  }
}

//------------------------
// CLEAR CANVAS function
//------------------------
$("#clear-button").click(async function() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  clickX = new Array();
  clickY = new Array();
  clickD = new Array();
  $(".prediction-text").empty();
  $("#result_box").addClass("d-none");
});

//-------------------------------------
// loader for handwritten model
//-------------------------------------
async function loadModel() {
  console.log("loading the model");

  // clear the model variable
  model = undefined;
  // load the model using a HTTPS request (where you have stored your model files)
//   model = await tf.loadLayersModel("test-model/test-model.json");
  model = await tf.loadLayersModel("models/model.json");

  console.log("loaded model");
  console.log(model)

};

loadModel();

//-----------------------------------------------
// preprocess the canvas
//-----------------------------------------------
function preprocessCanvas(image) {
  // resize the image to 28 by 28 pixels
  let tensor = tf.browser
    .fromPixels(image)
    .resizeNearestNeighbor([28, 28])
    .mean(2)
    .expandDims()
    .toFloat();
  console.log(tensor.shape);
  return tensor.div(255.0);
};

//--------------------------------------------
// predict function
//--------------------------------------------
$("#predict-button").click(async function() {
  // get data from canvas
  var imgData = canvas.toDataURL();
  let tensor = preprocessCanvas(canvas);
  // make predictions on the image
  let predictions = await model.predict(tensor).data();
  // display prediction results
  let results = Array.from(predictions);
  console.log(results);
});