const startBtn = document.getElementById("startBtn");

startBtn.onclick = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function createWhiteNoise(audioCtx) {
    const bufferSize = 10 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    return noise;
  }

  const noise = createWhiteNoise(audioCtx);

  const highpass = audioCtx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 150;

  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 700;
  bandpass.Q.value = 1.2;

  const windGain = audioCtx.createGain();
  windGain.gain.value = 0.12;

  const lfo = audioCtx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.18;

  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 350;

  const ampLFO = audioCtx.createOscillator();
  ampLFO.type = "sine";
  ampLFO.frequency.value = 0.09;

  const ampDepth = audioCtx.createGain();
  ampDepth.gain.value = 0.05;

  const ampOffset = audioCtx.createConstantSource();
  ampOffset.offset.value = 0.10;

  lfo.connect(lfoGain);
  lfoGain.connect(bandpass.frequency);

  ampLFO.connect(ampDepth);
  ampDepth.connect(windGain.gain);
  ampOffset.connect(windGain.gain);

  noise.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(windGain);
  windGain.connect(audioCtx.destination);

  noise.start();
  lfo.start();
  ampLFO.start();
  ampOffset.start();
};