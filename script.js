let audioCtx;
let noise, lfo, ampLFO, ampOffset;
let stopTimer;

const startBtn = document.getElementById("startBtn");

startBtn.onclick = () => {
  if (!audioCtx) {
    startWind();
    startBtn.textContent = "Stop Sound";
  } else {
    stopWind();
  }
};

function startWind() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function createWhiteNoise(audioCtx) {
    const bufferSize = 10 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    return source;
  }

  noise = createWhiteNoise(audioCtx);

  const highpass = audioCtx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 150;

  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 700;
  bandpass.Q.value = 1.2;

  const gain = audioCtx.createGain();
  gain.gain.value = 0.12;

  lfo = audioCtx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.18;

  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 350;

  ampLFO = audioCtx.createOscillator();
  ampLFO.type = "sine";
  ampLFO.frequency.value = 0.09;

  const ampDepth = audioCtx.createGain();
  ampDepth.gain.value = 0.05;

  ampOffset = audioCtx.createConstantSource();
  ampOffset.offset.value = 0.10;

  lfo.connect(lfoGain);
  lfoGain.connect(bandpass.frequency);

  ampLFO.connect(ampDepth);
  ampDepth.connect(gain.gain);
  ampOffset.connect(gain.gain);

  noise.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start();
  lfo.start();
  ampLFO.start();
  ampOffset.start();

  stopTimer = setTimeout(() => {
    stopWind();
  }, 10000);
}

function stopWind() {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }

  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }

  startBtn.textContent = "Start Sound";
}