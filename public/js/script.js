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
let number;
const displayImg = () =>{
    let n = Math.floor(Math.random() * 10);
    console.log(n);
    number = n;
    let obj = Math.floor(Math.random()*2); 

    const imgRef = firebase.database().ref(`images/${n}/${obj}`);
    imgRef.on('value', (snapshot) =>{
        let link = snapshot.val();
        if (obj == 0){
            document.getElementById("instructions").innerHTML = "How many apples are on the tree?";
        } else{
            document.getElementById("instructions").innerHTML = "How many cookies do you see?"
        }
        document.getElementById("img").src = link;
        document.getElementById("img").hidden = false;
        return link;
    });
}

displayImg();

//-------------------
// GLOBAL variables
//-------------------
let model;

var canvasWidth = 300;
var canvasHeight = 300;
var canvasStrokeStyle = "black";
var canvasLineJoin = "round";
var canvasLineWidth = 25;
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

let ctx = canvas.getContext("2d");

ctx.beginPath();
ctx.rect(0, 0, 300, 300);
ctx.fillStyle = "white";
ctx.fill();

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
  ctx.beginPath();
  ctx.rect(0, 0, 300, 300);
  ctx.fillStyle = "white";
  ctx.fill();
});

//-------------------------------------
// loader for handwritten model
//-------------------------------------
async function loadModel() {
  console.log("loading the model");

  // clear the model variable
  model = undefined;
  // load the model using a HTTPS request (where you have stored your model files)
  model = await tf.loadLayersModel("models/model (1).json");

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
// equivalent of 1-tensor.div(255.0)
  tensor = tensor.div(255.0).mul(-1.0).add(1.0)
  return tensor
};

var totalScore = 0;

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
//   console.log(Array.from(tf.argMax(predictions, 1)))
  let results = Array.from(predictions);
  res = results.indexOf(Math.max.apply(null, results))
  console.log(res);
  const yourScore = document.querySelector("#style_Score")
  const yourGuess = document.querySelector("#style_Guess")
  if (res == number){
      console.log("Yes")
      totalScore += 1
  } else {
      console.log("No")
      totalScore = 0
  }
  yourScore.innerHTML = "Your score: " + totalScore;
  yourGuess.innerHTML = "Your guess: " + res;
  
  //Only styling:

  yourScore.style.backgroundColor ="rgba(20, 250, 250, 0.562)";
  yourScore.style.weight="bold";
  yourGuess.style.backgroundColor="rgba(20, 250, 250, 0.562)";
  yourGuess.style.weight="bold";

  displayImg();
});

