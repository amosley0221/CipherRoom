// audio.jsx
// Tiny WebAudio sound system. Subtle ambient drone + UI clicks.
// All synthesized — no external files.

const AudioFX = (() => {
  let ctx = null;
  let masterGain = null;
  let droneNodes = null;
  let enabled = true;
  let silentEl = null;
  let unlocked = false;

  // iOS standalone PWAs default the audio session to "ambient", which is
  // silenced by the hardware mute switch and ignores the AudioContext. Playing
  // any HTMLAudioElement on a user gesture promotes the session to "playback"
  // for the rest of the page — after that, the WebAudio drone is audible at
  // the phone's media volume. We use a tiny generated silent WAV so there's
  // no asset dependency. Looping keeps the playback session alive even after
  // the silent buffer ends.
  function silentWavDataURL() {
    const sr = 8000, ms = 250;
    const samples = Math.floor(sr * ms / 1000);
    const buf = new ArrayBuffer(44 + samples * 2);
    const v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + samples * 2, true); w(8, "WAVE");
    w(12, "fmt "); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, "data"); v.setUint32(40, samples * 2, true);
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return "data:audio/wav;base64," + btoa(bin);
  }

  function unlockSession() {
    if (unlocked) return;
    try {
      silentEl = document.createElement("audio");
      silentEl.setAttribute("playsinline", "");
      silentEl.setAttribute("webkit-playsinline", "");
      silentEl.loop = true;
      silentEl.preload = "auto";
      silentEl.src = silentWavDataURL();
      const p = silentEl.play();
      if (p && typeof p.catch === "function") p.catch(() => { /* will retry on next gesture */ });
      unlocked = true;
    } catch (e) { /* ignore */ }
  }

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    unlockSession();
  }

  function setEnabled(on) {
    enabled = on;
    if (masterGain) masterGain.gain.linearRampToValueAtTime(on ? 0.5 : 0, ctx.currentTime + 0.3);
  }

  function click() {
    if (!enabled) return; ensure();
    const t = ctx.currentTime;
    // Dramatic but short: a soft low thud + brief filtered noise tail
    // 1) Low thud
    const thud = ctx.createOscillator(); const thudG = ctx.createGain();
    thud.type = "sine"; thud.frequency.setValueAtTime(140, t);
    thud.frequency.exponentialRampToValueAtTime(60, t + 0.18);
    thudG.gain.setValueAtTime(0, t);
    thudG.gain.linearRampToValueAtTime(0.14, t + 0.01);
    thudG.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    thud.connect(thudG); thudG.connect(masterGain);
    thud.start(t); thud.stop(t + 0.3);

    // 2) Filtered noise tail — like fabric/paper rustle, quick and atmospheric
    const bufSize = 2 * ctx.sampleRate * 0.18;
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
    const noise = ctx.createBufferSource(); noise.buffer = noiseBuf;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass"; noiseFilter.frequency.value = 800; noiseFilter.Q.value = 1.4;
    const noiseG = ctx.createGain();
    noiseG.gain.setValueAtTime(0, t);
    noiseG.gain.linearRampToValueAtTime(0.05, t + 0.02);
    noiseG.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    noise.connect(noiseFilter); noiseFilter.connect(noiseG); noiseG.connect(masterGain);
    noise.start(t); noise.stop(t + 0.25);
  }

  function chime() {
    if (!enabled) return; ensure();
    const t = ctx.currentTime;
    // Dramatic reveal: low cinematic boom + soft sustained pad + slow rising swell
    // 1) Sub boom — deep impact
    const boom = ctx.createOscillator(); const boomG = ctx.createGain();
    boom.type = "sine"; boom.frequency.setValueAtTime(60, t);
    boom.frequency.exponentialRampToValueAtTime(38, t + 1.2);
    boomG.gain.setValueAtTime(0, t);
    boomG.gain.linearRampToValueAtTime(0.28, t + 0.04);
    boomG.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    boom.connect(boomG); boomG.connect(masterGain); boom.start(t); boom.stop(t + 1.7);

    // 2) Body of the boom (slight grit via sawtooth, low-passed)
    const body = ctx.createOscillator(); const bodyG = ctx.createGain();
    const bodyF = ctx.createBiquadFilter(); bodyF.type = "lowpass"; bodyF.frequency.value = 220; bodyF.Q.value = 1;
    body.type = "sawtooth"; body.frequency.setValueAtTime(82, t);
    body.frequency.exponentialRampToValueAtTime(50, t + 0.8);
    bodyG.gain.setValueAtTime(0, t);
    bodyG.gain.linearRampToValueAtTime(0.10, t + 0.05);
    bodyG.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    body.connect(bodyF); bodyF.connect(bodyG); bodyG.connect(masterGain);
    body.start(t); body.stop(t + 1.4);

    // 3) Minor-third pad chord (A2, C3, E3) — dark, suspenseful, sustained
    const padFreqs = [110.00, 130.81, 164.81];
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass"; padFilter.frequency.value = 800; padFilter.Q.value = 2;
    const padG = ctx.createGain();
    padG.gain.setValueAtTime(0, t);
    padG.gain.linearRampToValueAtTime(0.06, t + 0.6);
    padG.gain.linearRampToValueAtTime(0.04, t + 2.2);
    padG.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
    padFilter.connect(padG); padG.connect(masterGain);
    padFreqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? "triangle" : "sine";
      o.frequency.value = f;
      // gentle detune for warmth
      const o2 = ctx.createOscillator();
      o2.type = "sine"; o2.frequency.value = f * 1.005;
      o.connect(padFilter); o2.connect(padFilter);
      o.start(t + 0.1); o.stop(t + 3.5);
      o2.start(t + 0.1); o2.stop(t + 3.5);
    });

    // 4) Slow rising swell (filter sweep) — adds drama
    const swellOsc = ctx.createOscillator();
    const swellGain = ctx.createGain();
    const swellFilter = ctx.createBiquadFilter();
    swellFilter.type = "bandpass"; swellFilter.Q.value = 4;
    swellFilter.frequency.setValueAtTime(200, t + 0.2);
    swellFilter.frequency.exponentialRampToValueAtTime(1400, t + 1.8);
    swellOsc.type = "sawtooth"; swellOsc.frequency.value = 110;
    swellGain.gain.setValueAtTime(0, t + 0.2);
    swellGain.gain.linearRampToValueAtTime(0.05, t + 1.4);
    swellGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    swellOsc.connect(swellFilter); swellFilter.connect(swellGain); swellGain.connect(masterGain);
    swellOsc.start(t + 0.2); swellOsc.stop(t + 2.5);

    // 5) Distant shimmer — high sustained note, very quiet, for tension
    const shimmer = ctx.createOscillator(); const shimmerG = ctx.createGain();
    shimmer.type = "sine"; shimmer.frequency.value = 659.25; // E5
    shimmerG.gain.setValueAtTime(0, t + 0.5);
    shimmerG.gain.linearRampToValueAtTime(0.018, t + 1.6);
    shimmerG.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
    shimmer.connect(shimmerG); shimmerG.connect(masterGain);
    shimmer.start(t + 0.5); shimmer.stop(t + 3.3);
  }

  function fail() {
    if (!enabled) return; ensure();
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(80, t+0.2);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06, t+0.01); g.gain.exponentialRampToValueAtTime(0.0001, t+0.25);
    o.connect(g); g.connect(masterGain); o.start(t); o.stop(t+0.3);
  }

  function startDrone() {
    if (!enabled) return; ensure();
    if (droneNodes) return;
    const t = ctx.currentTime;
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, t);
    droneGain.gain.linearRampToValueAtTime(0.07, t+2);
    droneGain.connect(masterGain);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 600; filter.Q.value = 4;
    filter.connect(droneGain);

    const o1 = ctx.createOscillator(); o1.type = "sine"; o1.frequency.value = 55;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 82.4;
    const o3 = ctx.createOscillator(); o3.type = "sine"; o3.frequency.value = 110.0;
    const o4 = ctx.createOscillator(); o4.type = "triangle"; o4.frequency.value = 165;

    // gentle LFO on filter
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 200;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency);

    [o1,o2,o3,o4].forEach(o => o.connect(filter));
    o1.start(); o2.start(); o3.start(); o4.start(); lfo.start();

    droneNodes = { o1,o2,o3,o4,lfo,droneGain };
  }

  function stopDrone() {
    if (!droneNodes) return;
    const t = ctx.currentTime;
    droneNodes.droneGain.gain.linearRampToValueAtTime(0, t+1);
    setTimeout(() => {
      try {
        droneNodes.o1.stop(); droneNodes.o2.stop(); droneNodes.o3.stop(); droneNodes.o4.stop(); droneNodes.lfo.stop();
      } catch(e){}
      droneNodes = null;
    }, 1100);
  }

  return { click, chime, fail, startDrone, stopDrone, setEnabled, ensure, unlockSession };
})();

window.AudioFX = AudioFX;

// First-gesture unlock: hook every common interaction so the iOS audio
// session is in "playback" mode by the time the user enters a chapter and
// the drone starts. Each handler is one-shot.
(function attachFirstGestureUnlock() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const events = ["pointerdown", "touchstart", "mousedown", "keydown"];
  const fire = () => {
    try { AudioFX.unlockSession(); } catch (e) {}
    try { AudioFX.ensure(); } catch (e) {}
    events.forEach((ev) => document.removeEventListener(ev, fire, true));
  };
  events.forEach((ev) => document.addEventListener(ev, fire, { capture: true, once: false }));
})();
