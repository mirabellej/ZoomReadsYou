const video = document.getElementById("video");
const expression_threshold = 0.9; // threshold value over which we deduce emotion to be current emotion
const expression_interval = 200; // take reading of expression ever n milliseconds

// Debug & Output Settings
let debug = true; // if set to true, prints alerts and logs
let draw = false; // if set to true, will draw landmarks - will not draw during pauses!

var pause_length = 2000; // max pause between phrases - set to 0 if you want constant processing
var speaking = false;

var experiment_length = 600000; // 600000 ms = 10 minutes

// recognized expressions: neutral, happy, sad, disgusted, surprised, angry, fearful
var happy_bank = ["I'm happy", "Boy am I happy"];
var sad_bank = ["I'm sad", "Boy am I sad"];
var neutral_bank = ["I'm neutral", "Boy am I neutral"];
var disgusted_bank = ["I'm disgusted", "Boy am I disgusted"];
var surprised_bank = ["I'm surprised", "Boy am I surprised"];
var angry_bank = ["I'm angry", "Boy am I angry"];
var fearful_bank = ["I'm fearful", "Boy am I fearful"];

var text_spoken = [];

if (!debug) {
  if (!window.console) window.console = {};
  var methods = ["log", "debug", "warn", "info"];
  for (var i = 0; i < methods.length; i++) {
    console[methods[i]] = function () {};
  }
}

checkTTS(); // check to make sure the browser supports TTS

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

    // do nothing if we can't detect a face or if we're speaking
    if (!detections.length || speaking === true) {
      console.log("waiting");
      return;
    }

    /* Draw Face Detections in Debug Mode */
    if (draw === true) {
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }

    /* Process Expressions and Read Lines */
    var all_expressions = detections[0].expressions; // only respond to the first face we track

    //console.log(all_expressions);

    for (const [key, value] of Object.entries(all_expressions)) {
      //console.log(`${key}: ${value}`); // uncomment to see key value pairs for expressions
      if (value > expression_threshold) {
        current_expression = key;
        readLine(current_expression);
        console.log(current_expression);
      }
    }
  }, expression_interval);
}

// getUserMedia() requires secure server setup https:// or local host
// if video feed not loading: in VS Code, right click on index.html and run w/ live server
function startVideo() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      { audio: false, video: { width: 1280, height: 720 } },
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
    alert(
      "This browser is not supported. Please use the newest version of Chrome or Firefox."
    );
    console.log("getUserMedia not supported");
  }
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

// Check to see if the browser supports TTS
function checkTTS() {
  if ("speechSynthesis" in window) {
    console.log("TTS supported");
  } else {
    alert(
      "Sorry, your browser doesn't support text to speech. Please exit the experiment."
    );
  }
}

function readLine(current_expression) {
  speaking = true;
  var msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[0];
  //msg.volume = 1; // From 0 to 1
  //msg.pitch = 2; // From 0 to 2
  msg.rate = 0.8; // From 0.1 to 10
  bank = eval(current_expression + "_bank");
  let rand = Math.floor(Math.random() * bank.length);
  console.log(bank[rand]);
  let selected_text = bank[rand];
  if (text_spoken.includes(selected_text)) {
    console.log("redundant"); // don't speak or include redundant text
    goToStandby();
  } else {
    msg.text = selected_text;
    speechSynthesis.speak(msg); // speak the message out loud
    text_spoken.push(msg.text); // record the message as spoken
    console.log(text_spoken);
    // when the sentence is over add a pause, then go to standby
    msg.onend = function () {
      setTimeout(goToStandby, pause_length);
    };
  }
}

// prepare to say more things
function goToStandby() {
  speaking = false;
}

function textToFile() {
  var data1 = new FormData();
  data1.append("data", "the_text_you_want_to_save");
  var xhr = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new activeXObject("Microsoft.XMLHTTP");
  xhr.open("post", "saved.txt", true);
  xhr.send(data1);
}

// End Experiment
function endExperiment() {
  if (debug === true) {
    alert("Experiment Over!");
  } else {
    // stop recording and upload file to server
    window.location.href = "survey.html";
  }
}

$.ajax({
  url: "test.php",
  success: function (data) {
    $(".result").html(data);
  },
});
