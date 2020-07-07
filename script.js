const video = document.getElementById("video");
const expression_threshold = 0.9; // threshold value over which we deduce emotion to be current emotion
const expression_interval = 1000; // take reading of expression ever n milliseconds

// to do break this down into switch statement to play specific sound sample from bank for each expression
function playSound() {
  var audio = new Audio("/beep.mp3");
  audio.play();
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models/"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models/"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models/"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models/"),
]).then(startVideo());

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

video.addEventListener("play", () => {
  processVideo();
});

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
          playSound();
        }
      }
    }
  }, expression_interval);
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
