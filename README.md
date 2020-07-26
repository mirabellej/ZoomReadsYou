# ZoomReadsYou
Browser-based Javascript application created for Nordic Summer University's Cybiosis Symposium. </br>http://nordic.university/study-circles/2-cybiosis-shaping-human-technology-futures/</br></br>
What would a story based on your Zoom presence sound like?</br></br>
To answer this question, I have created the following program. </br></br>
The program produces an audible narrative that is generated based on facial expression tracking over a web stream. </br></br>
The audible text (selected at runtime) was composed from the texts of living and dead authors (including yours truly) as well as an artificial intelligence - GPT2.</br></br>
This program uses FaceAPI.js to recognize 7 expressions including: happy, sad, neutral, disgusted, fearful, surprised angry and output corresponding text using Google's Speech Synthesis API.</br></br>
This program will only work with a secure server (https://) and local host only due to browser-imposed restrictions on the getUserMedia method. </br></br>
Note: As this program was developed as part of a larger research project, the top level project files are configured to upload a video file and text file of a five minute session over PHP. If you'd like a version without this functionality, see the SandBox folder for a version which excludes recording and continuously draws a face. 
</br></br>
This is an open source project built on open sourced projects. </br></br>
Special thanks to the creators of:</br>
OpenAI - https://github.com/openai/gpt-2</br>
FaceAPI.js - https://github.com/justadudewhohacks/face-api.js/</br>
Google Speech Synthesis API - https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API
</br></br>
And to Nordic Summer University's Cybiosis Circle: http://nordic.university/study-circles/2-cybiosis-shaping-human-technology-futures/
