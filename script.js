const video = document.getElementById("video");
const expression_threshold = 0.9; // threshold value over which we deduce emotion to be current emotion
const expression_interval = 1000; // take reading of expression ever n milliseconds

var pause_length = 2000; // max pause between phrases
var speaking = false;

var experiment_length = 600000; // 600000 ms = 10 minutes

var happy_bank = ["I'm happy", "Boy am I happy"];
var sad_bank = ["I'm sad", "Boy am I sad"];
var neutral_bank = ["I'm neutral", "Boy am I neutral"];
var disgusted_bank = ["I'm disgusted", "Boy am I disgusted"];
var surprised_bank = ["I'm surprised", "Boy am I surprised"];
var angry_bank = ["I'm angry", "Boy am I angry"];
var fearful_bank = ["I'm fearful", "Boy am I fearful"];

checkTTS();

// make sure all models are loaded prior to starting video
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models/"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models/"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models/"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models/"),
]).then(startVideo());

// if we're playing, process the video feed
video.addEventListener("play", () => {
  processVideo();
});

setTimeout(endExperiment, experiment_length); // end the experiment when it's time to

/* Computer Vision and Video Functions*/

function processVideo() {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (!detections.length || speaking === true) {
      console.log("waiting");
      return;
    }

    /* Uncomment to Draw Face Detections*/

    // const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    // faceapi.draw.drawDetections(canvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    /* Process Expressions and Read Lines*/
    var all_expressions = detections[0].expressions; // only respond to the first face we track
    //console.log(all_expressions);
    for (const [key, value] of Object.entries(all_expressions)) {
      //console.log(`${key}: ${value}`);
      if (value > expression_threshold) {
        current_expression = key;
        readLine(current_expression);
        //console.log(current_expression);
      }
    }
  }, expression_interval);
}

function startVideo() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      { audio: true, video: { width: 1280, height: 720 } },
      function (stream) {
        var video = document.querySelector("video");
        video.srcObject = stream;
        video.onloadedmetadata = function (e) {
          video.play();
        };
      },
      function (err) {
        console.log("The following error occurred: " + err.name);
      }
    );
  } else {
    console.log("getUserMedia not supported");
  }
}
/*
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}*/

function determineExpression() {
  var all_expressions = detections[0].expressions;
  for (const [key, value] of Object.entries(all_expressions)) {
    //console.log(`${key}: ${value}`);
    if (value > expression_threshold) {
      console.log(`${key}: ${value}`);
    }
  }
}

/* Text To Speech Functions */

function checkTTS() {
  if ("speechSynthesis" in window) {
    // Speech Synthesis supported
  } else {
    // Speech Synthesis Not Supported
    alert(
      "Sorry, your browser doesn't support text to speech. Please exit the experiment."
    );
  }
}

function readLine(current_expression) {
  speaking = true;
  //console.log(speaking);
  var msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[0];
  //msg.volume = 1; // From 0 to 1
  msg.rate = 0.8; // From 0.1 to 10
  //msg.pitch = 2; // From 0 to 2
  //msg.text = "I am reading a story.";
  bank = eval(current_expression + "_bank");
  msg.text = bank[0];
  speechSynthesis.speak(msg);

  // when the sentence is over add a pause, then go to standby
  msg.onend = function () {
    setTimeout(goToStandby, pause_length);
  };
}

// to do break this down into switch statement to play specific sound sample from bank for each expression
function playSound() {
  var audio = new Audio("/beep.mp3");
  audio.play();
}

// prepare to say more things
function goToStandby() {
  speaking = false;
}

function endExperiment() {
  alert("Experiment Over!");
}
