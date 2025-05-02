
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('waveform-canvas');
  const audio = document.getElementById('analyser-source');
  if (!canvas || !audio) return;

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 2048;
  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(90,135,133,0.7)';
    const sliceWidth = canvas.clientWidth / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.clientHeight) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(canvas.clientWidth, canvas.clientHeight / 2);
    ctx.stroke();
  }

  function tryStart() {
    audio.play().then(() => {
      audioCtx.resume().then(() => {
        draw();
      });
    }).catch((err) => {
      console.warn("Autoplay blocked, waiting for user interaction...", err);
    });
  }

  // Trigger manually on user interaction
  window.addEventListener('click', tryStart, { once: true });

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
});
