 let bodypix;
 let video;
 let segmentation;
 let img;
 let gazo;

 const options = {
   outputStride: 8, // 8, 16, or 32, default is 16
   segmentationThreshold: 0.3 // 0 - 1, defaults to 0.5 
 }

 function preload(){
   bodypix = ml5.bodyPix(options);
   gazo = loadImage('andon.png');
 }

 function setup() {
   createCanvas(1400, 1600);
   video = createCapture(VIDEO);
   video.size(400, 300);
   bodypix.segment(video, gotResults)
 }

 function gotResults(err, result) {
   if (err) {
     console.log(err);
     return;
   }
   segmentation = result;
   background(255,255,255);
   image(segmentation.backgroundMask, 650, 350, 266, 200);
   filter(THRESHOLD, 0.99);
   image(gazo, 10, 10,1600,750);
   bodypix.segment(video, gotResults)
 }

const Peer = window.Peer;
(async function main() {
  const localVideo = document.getElementById('js-local-stream');
  const localId = document.getElementById('js-local-id');
  const callTrigger = document.getElementById('js-call-trigger');
  const closeTrigger = document.getElementById('js-close-trigger');
  const remoteVideo = document.getElementById('js-remote-stream');
  const remoteId = document.getElementById('js-remote-id');
  const meta = document.getElementById('js-meta');
  const sdkSrc = document.querySelector('script[src*=skyway]');

  meta.innerText = `
    UA: ${navigator.userAgent}
    SDK: ${sdkSrc ? sdkSrc.src : 'unknown'}
  `.trim();

  const localStream = defaultCanvas0.captureStream(10);
 // const localStream = await navigator.mediaDevices
 //   .getUserMedia({
 //     audio: true,
 //     video: true,
 //   })
 //   .catch(console.error);

  // Render local stream
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  const peer = (window.peer = new Peer( "KndwmQJMykERe9qg", {
    key: "b506f34d-08c3-4fd3-95d8-c235a89619cf",
    debug: 3,
  }));

  // Register caller handler
  callTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
    if (!peer.open) {
      return;
    }

    const mediaConnection = peer.call(remoteId.value, localStream);

    mediaConnection.on('stream', async stream => {
      // Render remote stream for caller
      remoteVideo.srcObject = stream;
      remoteVideo.playsInline = true;
      await remoteVideo.play().catch(console.error);
    });

    mediaConnection.once('close', () => {
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
    });

    closeTrigger.addEventListener('click', () => mediaConnection.close(true));
  });

  peer.once('open', id => (localId.textContent = id));

  // Register callee handler
  peer.on('call', mediaConnection => {
    mediaConnection.answer(localStream);

    mediaConnection.on('stream', async stream => {
      // Render remote stream for callee
      remoteVideo.srcObject = stream;
      remoteVideo.playsInline = true;
      await remoteVideo.play().catch(console.error);
    });

    mediaConnection.once('close', () => {
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
    });

    closeTrigger.addEventListener('click', () => mediaConnection.close(true));
  });

  peer.on('error', console.error);
})();
