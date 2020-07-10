const video = document.getElementById("video");
const expression_threshold = 0.9; // threshold value over which we deduce emotion to be current emotion
const expression_interval = 1000; // take reading of expression ever n milliseconds

// timers for speech
var pause_length = 4000; // max pause between phrases
var next_utterance = Date.now() + pause_length;

setTimeout(pause, pause_length);

// timers for experiment
var experiment_length = 10000; // 600000 ms = 10 minutes
var expected = Date.now() + experiment_length;
var experiment_over = false;

checkTTS();

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models/"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models/"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models/"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models/"),
]).then(startVideo());

video.addEventListener("play", () => {
  processVideo();
});

setTimeout(step, experiment_length);
setTimeout(pause, pause_length);

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
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    var all_expressions = detections[0].expressions;
    for (const [key, value] of Object.entries(all_expressions)) {
      //console.log(`${key}: ${value}`);
      if (value > expression_threshold) {
        //console.log(`${key}: ${value}`);
        current_expression = key;
        //console.log(key);
        if (current_expression === "happy") {
          //playSound();
          playGreeting();
        }
      }
    }
  }, expression_interval);
}

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

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

function playGreeting() {
  var msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[0];
  //msg.volume = 1; // From 0 to 1
  //msg.rate = 1; // From 0.1 to 10
  //msg.pitch = 2; // From 0 to 2
  msg.text = "I am reading a story.";
  speechSynthesis.speak(msg);
}

// to do break this down into switch statement to play specific sound sample from bank for each expression
function playSound() {
  var audio = new Audio("/beep.mp3");
  audio.play();
}

/* Timing functions */

function step() {
  var dt = Date.now() - expected; // the drift (positive for overshooting)
  if (dt > experiment_length) {
    timer_elapsed = true; // end experiment if overdue - this should never happen
  }
  timer_elapsed = true;
  alert("time's up!");
  // TO DO: end experiment - go to survey
  expected += experiment_length;
  setTimeout(step, Math.max(0, experiment_length - dt)); // take into account drift
}

function pause() {
  var dt = Date.now() - next_utterance; // the drift (positive for overshooting)
  if (dt > pause_length) {
    // something really bad happened. Maybe the browser (tab) was inactive?
    // possibly special handling to avoid futile "catch up" run
  }
  alert("pause!");

  next_utterance += pause_length;
  setTimeout(pause, Math.max(0, pause_length - dt)); // take into account drift
}
