const startBtn = document.getElementById("startBtn");

startBtn.onclick = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function createBrownNoise(audioCtx) {
    const bufferSize = 10 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const brown = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * brown) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    return source;
  }

  const mainNoise = createBrownNoise(audioCtx);
  const modNoise = createBrownNoise(audioCtx);

  const mainLPF = audioCtx.createBiquadFilter();
  mainLPF.type = "lowpass";
  mainLPF.frequency.value = 400;

  const rhpf = audioCtx.createBiquadFilter();
  rhpf.type = "highpass";
  rhpf.frequency.value = 500;
  rhpf.Q.value = 28;

  const outputGain = audioCtx.createGain();
  outputGain.gain.value = 0.08;

  const modLPF = audioCtx.createBiquadFilter();
  modLPF.type = "lowpass";
  modLPF.frequency.value = 14;

  const modGain = audioCtx.createGain();
  modGain.gain.value = 320;

  const offset = audioCtx.createConstantSource();
  offset.offset.value = 650;

  mainNoise.connect(mainLPF);
  mainLPF.connect(rhpf);
  rhpf.connect(outputGain);
  outputGain.connect(audioCtx.destination);

  modNoise.connect(modLPF);
  modLPF.connect(modGain);
  modGain.connect(rhpf.frequency);
  offset.connect(rhpf.frequency);

  mainNoise.start();
  modNoise.start();
  offset.start();
};