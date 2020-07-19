const video = document.getElementById("video");
const expression_threshold = 0.9; // threshold value over which we deduce emotion to be current emotion
const expression_interval = 200; // take reading of expression ever n milliseconds

var constraints = {
  audio: true,
  video: {
    width: { min: 720, ideal: 720, max: 720 },
    height: { min: 560, ideal: 560, max: 560 },
    framerate: 60,
  },
};

// Debug, Recording & Output Settings
let debug = true; // if set to true, prints alerts and logs
let draw = false; // if set to true, will draw landmarks - will not draw during pauses!
let recording = true; // if set to true, recordings will be uploaded

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

var recBtn = document.querySelector("button#rec");
var pauseResBtn = document.querySelector("button#pauseRes");
var stopBtn = document.querySelector("button#stop");

var dataElement = document.querySelector("#data");
var downloadLink = document.querySelector("a#downloadLink");

var mediaRecorder;
var chunks = [];
var count = 0;
var localStream = null;
var soundMeter = null;

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

function startVideo() {
  if (!navigator.mediaDevices.getUserMedia) {
    alert(
      "navigator.mediaDevices.getUserMedia not supported on your browser, use the latest version of Firefox or Chrome"
    );
  } else {
    if (window.MediaRecorder == undefined) {
      alert(
        "MediaRecorder not supported on your browser, use the latest version of Firefox or Chrome"
      );
    } else {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
          localStream = stream;

          localStream.getTracks().forEach(function (track) {
            if (track.kind == "audio") {
              track.onended = function (event) {
                log(
                  "audio track.onended Audio track.readyState=" +
                    track.readyState +
                    ", track.muted=" +
                    track.muted
                );
              };
            }
            if (track.kind == "video") {
              track.onended = function (event) {
                log(
                  "video track.onended Audio track.readyState=" +
                    track.readyState +
                    ", track.muted=" +
                    track.muted
                );
              };
            }
          });

          video.srcObject = localStream;
          video.play();

          try {
            window.AudioContext =
              window.AudioContext || window.webkitAudioContext;
            window.audioContext = new AudioContext();
          } catch (e) {
            log("Web Audio API not supported.");
          }

          soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
          soundMeter.connectToSource(localStream, function (e) {
            if (e) {
              log(e);
              return;
            } else {
              /*setInterval(function() {
								log(Math.round(soundMeter.instant.toFixed(2) * 100));
							}, 100);*/
            }
          });
        })
        .catch(function (err) {
          /* handle the error */
          log("navigator.getUserMedia error: " + err);
        });
    }
  }
}

function onBtnRecordClicked() {
  if (recording === true) {
    if (localStream == null) {
      alert("Could not get local stream from mic/camera");
    } else {
      recBtn.disabled = true;
      pauseResBtn.disabled = false;
      stopBtn.disabled = false;

      /* use the stream */
      log("Start recording...");

      // PROCESS THE VIDEO
      processVideo();

      if (typeof MediaRecorder.isTypeSupported == "function") {
        /*
				MediaRecorder.isTypeSupported is a function announced in https://developers.google.com/web/updates/2016/01/mediarecorder and later introduced in the MediaRecorder API spec http://www.w3.org/TR/mediastream-recording/
			*/
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
          var options = { mimeType: "video/webm;codecs=vp9" };
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=h264")) {
          var options = { mimeType: "video/webm;codecs=h264" };
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
          var options = { mimeType: "video/webm;codecs=vp8" };
        }
        log("Using " + options.mimeType);
        mediaRecorder = new MediaRecorder(localStream, options);
      } else {
        log(
          "isTypeSupported is not supported, using default codecs for browser"
        );
        mediaRecorder = new MediaRecorder(localStream);
      }

      mediaRecorder.ondataavailable = function (e) {
        //log('mediaRecorder.ondataavailable, e.data.size='+e.data.size);
        chunks.push(e.data);
      };

      mediaRecorder.onerror = function (e) {
        log("mediaRecorder.onerror: " + e);
      };

      mediaRecorder.onstart = function () {
        log(
          "mediaRecorder.onstart, mediaRecorder.state = " + mediaRecorder.state
        );

        localStream.getTracks().forEach(function (track) {
          if (track.kind == "audio") {
            log(
              "onstart - Audio track.readyState=" +
                track.readyState +
                ", track.muted=" +
                track.muted
            );
          }
          if (track.kind == "video") {
            log(
              "onstart - Video track.readyState=" +
                track.readyState +
                ", track.muted=" +
                track.muted
            );
          }
        });
      };

      mediaRecorder.onstop = function () {
        log(
          "mediaRecorder.onstop, mediaRecorder.state = " + mediaRecorder.state
        );

        var blob = new Blob(chunks, { type: "video/webm" });
        chunks = [];

        var videoURL = window.URL.createObjectURL(blob);

        downloadLink.href = videoURL;
        video.src = videoURL;
        downloadLink.innerHTML = "Download video file";

        var rand = Math.floor(Math.random() * 10000000);
        var name = "video_" + rand + ".webm";

        var fileType = "video"; // or "audio"
        var fileName = name; //'ABCDEF.webm';  // or "wav"

        var formData = new FormData();
        formData.append(fileType + "-filename", fileName);
        formData.append(fileType + "-blob", blob);

        //xhr('save.php', formData, function (fName) {
        //window.open(location.href + fName);
        //});

        // upload using jQuery
        $.ajax({
          url: "../save.php", // your server URL
          data: formData,
          cache: false,
          contentType: false,
          processData: false,
          type: "POST",
          success: function (response) {
            if (response === "success") {
              alert("Video Successfully Uploaded To Server!");
            } else {
              alert(response);
            }
          },
        });

        function xhr(url, data, callback) {
          var request = new XMLHttpRequest();
          request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
              callback(location.href + request.responseText);
            }
          };
          request.open("POST", url);
          request.send(data);
        }

        downloadLink.setAttribute("download", name);
        downloadLink.setAttribute("name", name);
      };

      mediaRecorder.onpause = function () {
        log(
          "mediaRecorder.onpause, mediaRecorder.state = " + mediaRecorder.state
        );
      };

      mediaRecorder.onresume = function () {
        log(
          "mediaRecorder.onresume, mediaRecorder.state = " + mediaRecorder.state
        );
      };

      mediaRecorder.onwarning = function (e) {
        log("mediaRecorder.onwarning: " + e);
      };

      pauseResBtn.textContent = "Pause";

      mediaRecorder.start(10);

      localStream.getTracks().forEach(function (track) {
        log(track.kind + ":" + JSON.stringify(track.getSettings()));
        console.log(track.getSettings());
      });
    }
  } else {
    processVideo();
  }
} // end if

navigator.mediaDevices.ondevicechange = function (event) {
  log("mediaDevices.ondevicechange");
  /*
	if (localStream != null){
		localStream.getTracks().forEach(function(track) {
			if(track.kind == "audio"){
				track.onended = function(event){
					log("audio track.onended");
				}
			}
		});
	}
	*/
};

function onBtnStopClicked() {
  mediaRecorder.stop();
  video.controls = true;
  recBtn.disabled = false;
  pauseResBtn.disabled = true;
  stopBtn.disabled = true;
}

function onPauseResumeClicked() {
  if (pauseResBtn.textContent === "Pause") {
    pauseResBtn.textContent = "Resume";
    mediaRecorder.pause();
    stopBtn.disabled = true;
  } else {
    pauseResBtn.textContent = "Pause";
    mediaRecorder.resume();
    stopBtn.disabled = false;
  }
  recBtn.disabled = true;
  pauseResBtn.disabled = false;
}

function onStateClicked() {
  if (mediaRecorder != null && localStream != null && soundMeter != null) {
    log("mediaRecorder.state=" + mediaRecorder.state);
    log("mediaRecorder.mimeType=" + mediaRecorder.mimeType);
    log("mediaRecorder.videoBitsPerSecond=" + mediaRecorder.videoBitsPerSecond);
    log("mediaRecorder.audioBitsPerSecond=" + mediaRecorder.audioBitsPerSecond);

    localStream.getTracks().forEach(function (track) {
      if (track.kind == "audio") {
        log(
          "Audio: track.readyState=" +
            track.readyState +
            ", track.muted=" +
            track.muted
        );
      }
      if (track.kind == "video") {
        log(
          "Video: track.readyState=" +
            track.readyState +
            ", track.muted=" +
            track.muted
        );
      }
    });

    log("Audio activity: " + Math.round(soundMeter.instant.toFixed(2) * 100));
  }
}

function log(message) {
  dataElement.innerHTML = dataElement.innerHTML + "<br>" + message;
  console.log(message);
}

// Meter class that generates a number correlated to audio volume.
// The meter class itself displays nothing, but it makes the
// instantaneous and time-decaying volumes available for inspection.
// It also reports on the fraction of samples that were at or near
// the top of the measurement range.
function SoundMeter(context) {
  this.context = context;
  this.instant = 0.0;
  this.slow = 0.0;
  this.clip = 0.0;
  this.script = context.createScriptProcessor(2048, 1, 1);
  var that = this;
  this.script.onaudioprocess = function (event) {
    var input = event.inputBuffer.getChannelData(0);
    var i;
    var sum = 0.0;
    var clipcount = 0;
    for (i = 0; i < input.length; ++i) {
      sum += input[i] * input[i];
      if (Math.abs(input[i]) > 0.99) {
        clipcount += 1;
      }
    }
    that.instant = Math.sqrt(sum / input.length);
    that.slow = 0.95 * that.slow + 0.05 * that.instant;
    that.clip = clipcount / input.length;
  };
}

SoundMeter.prototype.connectToSource = function (stream, callback) {
  console.log("SoundMeter connecting");
  try {
    this.mic = this.context.createMediaStreamSource(stream);
    this.mic.connect(this.script);
    // necessary to make sample run, but should not be.
    this.script.connect(this.context.destination);
    if (typeof callback !== "undefined") {
      callback(null);
    }
  } catch (e) {
    console.error(e);
    if (typeof callback !== "undefined") {
      callback(e);
    }
  }
};
SoundMeter.prototype.stop = function () {
  this.mic.disconnect();
  this.script.disconnect();
};

//browser ID
function getBrowser() {
  var nVer = navigator.appVersion;
  var nAgt = navigator.userAgent;
  var browserName = navigator.appName;
  var fullVersion = "" + parseFloat(navigator.appVersion);
  var majorVersion = parseInt(navigator.appVersion, 10);
  var nameOffset, verOffset, ix;

  // In Opera, the true version is after "Opera" or after "Version"
  if ((verOffset = nAgt.indexOf("Opera")) != -1) {
    browserName = "Opera";
    fullVersion = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      fullVersion = nAgt.substring(verOffset + 8);
  }
  // In MSIE, the true version is after "MSIE" in userAgent
  else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
    browserName = "Microsoft Internet Explorer";
    fullVersion = nAgt.substring(verOffset + 5);
  }
  // In Chrome, the true version is after "Chrome"
  else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
    browserName = "Chrome";
    fullVersion = nAgt.substring(verOffset + 7);
  }
  // In Safari, the true version is after "Safari" or after "Version"
  else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
    browserName = "Safari";
    fullVersion = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      fullVersion = nAgt.substring(verOffset + 8);
  }
  // In Firefox, the true version is after "Firefox"
  else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
    browserName = "Firefox";
    fullVersion = nAgt.substring(verOffset + 8);
  }
  // In most other browsers, "name/version" is at the end of userAgent
  else if (
    (nameOffset = nAgt.lastIndexOf(" ") + 1) <
    (verOffset = nAgt.lastIndexOf("/"))
  ) {
    browserName = nAgt.substring(nameOffset, verOffset);
    fullVersion = nAgt.substring(verOffset + 1);
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName;
    }
  }
  // trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(";")) != -1)
    fullVersion = fullVersion.substring(0, ix);
  if ((ix = fullVersion.indexOf(" ")) != -1)
    fullVersion = fullVersion.substring(0, ix);

  majorVersion = parseInt("" + fullVersion, 10);
  if (isNaN(majorVersion)) {
    fullVersion = "" + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }

  return browserName;
}
