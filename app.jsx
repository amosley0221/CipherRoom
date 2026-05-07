// app.jsx
// Top-level shell. Manages game state, palette, tweaks, transitions.

const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "navy",
  "soundEnabled": true,
  "hintsEnabled": true,
  "animationsEnabled": true
}/*EDITMODE-END*/;

const PALETTES = {
  navy: {
    name: "Navy / Yellow",
    bg: "#0c1530", bgSoft: "#0f1b3d", bgPaper: "#11214a",
    fg: "#e9e6d6", fgMute: "rgba(233,230,214,.55)", fgFaint: "rgba(233,230,214,.28)",
    accent: "#f7d44b", accentSoft: "rgba(247,212,75,.18)",
    rule: "rgba(233,230,214,.12)", paper:"#efe7d2", ink:"#0c1530"
  },
  black: {
    name: "Black / Yellow",
    bg: "#0a0a0a", bgSoft: "#121212", bgPaper: "#1a1a1a",
    fg: "#ece8d8", fgMute: "rgba(236,232,216,.55)", fgFaint: "rgba(236,232,216,.28)",
    accent: "#f5c91b", accentSoft: "rgba(245,201,27,.18)",
    rule: "rgba(236,232,216,.1)", paper:"#ece8d8", ink:"#0a0a0a"
  },
  bone: {
    name: "Bone / Ink",
    bg: "#e8e2d0", bgSoft: "#dfd8c2", bgPaper: "#cec5a8",
    fg: "#1a1a1a", fgMute: "rgba(26,26,26,.6)", fgFaint: "rgba(26,26,26,.32)",
    accent: "#c12d2d", accentSoft: "rgba(193,45,45,.14)",
    rule: "rgba(26,26,26,.14)", paper:"#f3ecd6", ink:"#1a1a1a"
  },
  forest: {
    name: "Forest / Bronze",
    bg: "#0d1812", bgSoft: "#11211a", bgPaper: "#16291f",
    fg: "#e6e0cb", fgMute: "rgba(230,224,203,.55)", fgFaint: "rgba(230,224,203,.28)",
    accent: "#d49a4a", accentSoft: "rgba(212,154,74,.16)",
    rule: "rgba(230,224,203,.1)", paper:"#e6dcc0", ink:"#0d1812"
  },
  charcoal: {
    name: "Charcoal / Amber",
    bg: "#1a1a1d", bgSoft: "#23232a", bgPaper: "#2c2d34",
    fg: "#ddd6c4", fgMute: "rgba(221,214,196,.55)", fgFaint: "rgba(221,214,196,.28)",
    accent: "#ffa033", accentSoft: "rgba(255,160,51,.18)",
    rule: "rgba(221,214,196,.12)", paper:"#ddd6c4", ink:"#1a1a1d"
  },
  oxblood: {
    name: "Oxblood / Ivory",
    bg: "#241012", bgSoft: "#2e1417", bgPaper: "#39181c",
    fg: "#f0e7d0", fgMute: "rgba(240,231,208,.55)", fgFaint: "rgba(240,231,208,.28)",
    accent: "#e8c987", accentSoft: "rgba(232,201,135,.18)",
    rule: "rgba(240,231,208,.12)", paper:"#f0e7d0", ink:"#241012"
  }
};

function applyPaletteVars(p) {
  const r = document.documentElement.style;
  r.setProperty("--bg", p.bg);
  r.setProperty("--bg-soft", p.bgSoft);
  r.setProperty("--bg-paper", p.bgPaper);
  r.setProperty("--fg", p.fg);
  r.setProperty("--fg-mute", p.fgMute);
  r.setProperty("--fg-faint", p.fgFaint);
  r.setProperty("--accent", p.accent);
  r.setProperty("--accent-soft", p.accentSoft);
  r.setProperty("--rule", p.rule);
  // Keep iOS Safari's chrome / PWA splash / Android task-switcher tint in sync
  // with the active palette. Without this they stay locked to whatever was in
  // the static <meta name="theme-color"> tag and leave a mismatched band.
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", p.bg);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const palette = PALETTES[t.palette] || PALETTES.navy;
  const TRACKS = window.TRACKS || {};
  const track = TRACKS[t.palette] || TRACKS.navy;
  const [view, setView] = useStateA("landing"); // landing | game | done
  const [levelIdx, setLevelIdx] = useStateA(0);
  const [flipping, setFlipping] = useStateA(null); // {from, to} during page flip
  const [levelsCleared, setLevelsCleared] = useStateA(() => {
    try { return parseInt(localStorage.getItem("cipherCleared_" + t.palette) || "0", 10); } catch(e){ return 0; }
  });
  useEffectA(() => {
    try { setLevelsCleared(parseInt(localStorage.getItem("cipherCleared_" + t.palette) || "0", 10)); } catch(e){}
  }, [t.palette]);

  useEffectA(() => { applyPaletteVars(palette); }, [t.palette]);
  useEffectA(() => { window.AudioFX.setEnabled(!!t.soundEnabled); }, [t.soundEnabled]);

  function startGame(fromLevel = 0) {
    window.AudioFX.ensure();
    if (t.soundEnabled) window.AudioFX.startDrone();
    setLevelIdx(fromLevel);
    setView("game");
  }

  function onSolve() {
    const next = levelIdx + 1;
    const paletteKey = t.palette;
    setLevelsCleared(c => {
      const newC = Math.max(c, next);
      try { localStorage.setItem("cipherCleared_" + paletteKey, String(newC)); } catch(e){}
      return newC;
    });
    if (next >= track.levels.length) {
      // brief flip into the final screen too
      setFlipping({ from: levelIdx, to: null });
      setTimeout(() => { setFlipping(null); setView("done"); }, 1700);
    } else {
      setFlipping({ from: levelIdx, to: next });
      window.AudioFX.click();
      setTimeout(() => { window.AudioFX.click(); }, 700);
      setTimeout(() => { setLevelIdx(next); setFlipping(null); }, 1700);
    }
  }

  function backToLanding() {
    window.AudioFX.stopDrone();
    setView("landing");
  }

  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
      {view === "landing" && (
        <Landing
          onEnter={startGame}
          palette={palette}
          levelsCleared={levelsCleared}
          paletteKey={t.palette}
          palettes={PALETTES}
          onChoosePalette={(k) => setTweak('palette', k)}
        />
      )}
      {view === "game" && (
        <Game
          levelIdx={levelIdx}
          levels={track.levels}
          onSolve={onSolve}
          onBack={backToLanding}
          palette={palette}
          hintsEnabled={t.hintsEnabled}
          soundEnabled={t.soundEnabled}
        />
      )}
      {flipping && <window.PageFlip from={flipping.from} to={flipping.to} palette={palette}/>}
      {view === "done" && (
        <FinalScreen palette={palette} onRestart={() => { setLevelIdx(0); setView("landing"); }}/>
      )}

      {/* shared chrome */}
      <button onClick={() => setTweak('soundEnabled', !t.soundEnabled)} style={{
        position:"fixed",
        top:14,
        right:"calc(env(safe-area-inset-right, 0px) + 14px)",
        zIndex:50,
        width:40, height:40, borderRadius:"50%",
        background:"rgba(0,0,0,.4)", border:"1px solid var(--rule)",
        color:"var(--fg)", cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",
        backdropFilter:"blur(8px)"
      }} title={t.soundEnabled ? "Sound on" : "Sound off"}>
        {t.soundEnabled ? "♪" : "✕"}
      </button>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette"/>
        <TweakRadio
          label=""
          value={t.palette}
          options={["navy","black","bone","forest","charcoal","oxblood"]}
          onChange={(v) => setTweak('palette', v)}
        />
        <TweakSection label="Experience"/>
        <TweakToggle label="Sound & drone" value={t.soundEnabled} onChange={v => setTweak('soundEnabled', v)}/>
        <TweakToggle label="Hint system" value={t.hintsEnabled} onChange={v => setTweak('hintsEnabled', v)}/>
        <TweakToggle label="Subtle animations" value={t.animationsEnabled} onChange={v => setTweak('animationsEnabled', v)}/>
        <TweakSection label="Progress"/>
        <TweakButton label="Reset this track" onClick={() => {
          try { localStorage.removeItem("cipherCleared_" + t.palette); } catch(e){}
          setLevelsCleared(0);
        }}/>
        <TweakButton label="Reset all tracks" onClick={() => {
          Object.keys(PALETTES).forEach(k => {
            try { localStorage.removeItem("cipherCleared_" + k); } catch(e){}
          });
          setLevelsCleared(0);
        }}/>
      </TweaksPanel>
    </div>
  );
}

function FinalScreen({ palette, onRestart }) {
  return (
    <div style={{
      position:"absolute",inset:0,display:"grid",placeItems:"center",
      animation:"fadeUp 1s ease both", textAlign:"center"
    }}>
      <div style={{maxWidth:640}}>
        <div className="eyebrow" style={{color:palette.accent,marginBottom:24}}>▸ The door opens</div>
        <h1 style={{
          fontFamily:"var(--display)",fontStyle:"italic",fontWeight:400,
          fontSize:"clamp(48px,8vw,112px)",lineHeight:.95,margin:"0 0 24px"
        }}>
          You found her.
        </h1>
        <p style={{fontFamily:"var(--serif)",fontSize:18,lineHeight:1.7,color:"var(--fg-mute)",margin:"0 0 36px"}}>
          Sadie was never lost. She was reading along with you.<br/>
          The room was the puzzle. The puzzle was a letter.
        </p>
        <button onClick={onRestart} className="cta-primary">Begin again</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
