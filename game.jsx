// game.jsx
// The puzzle engine — chapter screen with narrative, 3D scene, and answer field.

const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

function Game({ levelIdx, levels, onSolve, onBack, palette, hintsEnabled, soundEnabled }) {
  const LEVELS = levels || window.LEVELS;
  const level = LEVELS[levelIdx];
  const [answer, setAnswer] = useStateG("");
  const [status, setStatus] = useStateG("idle"); // idle | wrong | right
  const [hintsShown, setHintsShown] = useStateG(0);
  const [revealed, setRevealed] = useStateG(false);
  const [shake, setShake] = useStateG(false);
  const [bodyShown, setBodyShown] = useStateG(0);
  const [artifactOpened, setArtifactOpened] = useStateG(false);
  const inputRef = useRefG(null);

  // type-out narrative lines
  useEffectG(() => {
    setBodyShown(0); setAnswer(""); setStatus("idle"); setHintsShown(0); setRevealed(false); setArtifactOpened(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setBodyShown(i);
      if (i >= level.body.length) clearInterval(t);
    }, 600);
    return () => clearInterval(t);
  }, [levelIdx]);

  // keyboard: enter to submit, h for hint
  useEffectG(() => {
    const onKey = (e) => {
      if (e.key === "h" && hintsEnabled && document.activeElement !== inputRef.current) {
        if (hintsShown < level.hints.length) { setHintsShown(h => h+1); window.AudioFX.click(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hintsShown, level, hintsEnabled]);

  function check() {
    const norm = level.normalize ? level.normalize(answer) : answer.trim().toUpperCase();
    const accepts = level.answers.map(a => level.normalize ? level.normalize(a) : a.toUpperCase());
    if (accepts.includes(norm)) {
      setStatus("right"); window.AudioFX.chime();
      setTimeout(() => onSolve(), 1400);
    } else {
      setStatus("wrong"); setShake(true); window.AudioFX.fail();
      setTimeout(() => setShake(false), 400);
    }
  }

  return (
    <div className="game-grid" style={{
      position:"absolute", inset:0,
      display:"grid", gridTemplateColumns:"1.2fr 1fr",
      animation:"fadeUp .5s ease both"
    }}>
      {/* LEFT — narrative */}
      <div className="game-left" style={{
        padding:"40px 56px", display:"flex", flexDirection:"column",
        borderRight:"1px solid var(--rule)", overflow:"auto", minWidth:0
      }}>
        {/* header row */}
        <div className="game-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:36}}>
          <button onClick={onBack} className="ghost-btn">
            <svg width="14" height="10" viewBox="0 0 14 10" style={{marginRight:8}}>
              <path d="M13 5H1m0 0L5 1M1 5l4 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            </svg>
            Back
          </button>
          <div className="progress-dots" style={{display:"flex",gap:6}}>
            {LEVELS.map((_, i) => (
              <div key={i} style={{
                width: i === levelIdx ? 28 : 8, height:3, borderRadius:1,
                background: i < levelIdx ? palette.accent : i === levelIdx ? palette.accent : "var(--rule)",
                opacity: i <= levelIdx ? 1 : .5,
                transition:"all .4s"
              }}/>
            ))}
          </div>
        </div>

        {/* chapter heading */}
        <div style={{marginBottom:30}}>
          <div className="eyebrow" style={{color:palette.accent,marginBottom:10}}>
            ▸ Chapter {level.chapter}
          </div>
          <h1 className="game-h1" style={{
            fontFamily:"var(--display)", fontStyle:"italic",
            fontSize:"clamp(40px, 6vw, 72px)", lineHeight:.95,
            margin:"0 0 8px", letterSpacing:"-.01em", fontWeight:400
          }}>
            {level.title}
          </h1>
          <div className="small" style={{color:"var(--fg-faint)"}}>{level.location}</div>
        </div>

        {/* mobile-only inline evidence */}
        <div className="mobile-evidence" style={{marginBottom:24, display:"none"}}>
          {/* removed — evidence now shown on the 3D scene when opened */}
        </div>

        {/* narrative */}
        <div style={{flex:1, display:"flex", flexDirection:"column", gap:14, marginBottom:30}}>
          {level.body.slice(0, bodyShown).map((line, i) => (
            <p key={i} className={line.startsWith("  ") ? "narrative-line-mono" : "narrative-line-serif"} style={{
              fontFamily: line.startsWith("  ") || line.includes("·") ? "var(--mono)" : "var(--serif)",
              fontSize: line.startsWith("  ") ? 13 : 17.5,
              lineHeight:1.7, margin:0, color: line.startsWith("  ") ? palette.accent : "var(--fg)",
              animation:"fadeUp .5s ease both",
              whiteSpace:"pre-wrap"
            }}>{line}</p>
          ))}
          {bodyShown >= level.body.length && (
            <p style={{
              fontFamily:"var(--display)", fontStyle:"italic", fontSize:22, marginTop:14,
              color:palette.accent, animation:"fadeUp .5s ease .2s both"
            }}>
              {level.prompt}
            </p>
          )}
        </div>

        {/* hints */}
        {hintsEnabled && hintsShown > 0 && (
          <div style={{
            border:`1px solid ${palette.accent}33`, padding:"14px 16px",
            background:`${palette.accent}0c`, marginBottom:16, borderRadius:2
          }}>
            <div className="eyebrow" style={{color:palette.accent,marginBottom:8}}>Hint {hintsShown}/{level.hints.length}</div>
            {level.hints.slice(0, hintsShown).map((h, i) => (
              <p key={i} style={{margin:"4px 0",fontSize:13,fontFamily:"var(--mono)",lineHeight:1.6,color:"var(--fg-mute)"}}>{h}</p>
            ))}
          </div>
        )}

        {/* answer — interactive or text input */}
        {level.interactive === "constellation" ? (
          <div style={{
            display:"flex", flexDirection:"column", gap:10,
            animation: shake ? "shake .4s" : "none"
          }}>
            <label className="eyebrow">{level.inputLabel}</label>
            <window.ConstellationPuzzle
              palette={palette}
              targetSegments={4}
              onSolve={() => { setStatus("right"); window.AudioFX.chime(); setTimeout(() => onSolve(), 1400); }}
              onWrong={() => { setStatus("wrong"); setShake(true); window.AudioFX.fail(); setTimeout(() => setShake(false), 400); }}
            />
            <div className="small" style={{color: status==="wrong" ? "var(--danger)" : status==="right" ? palette.accent : "var(--fg-faint)", marginTop:6}}>
              {status === "wrong" && "✕ Not quite. Try again."}
              {status === "right" && "✓ The room exhales."}
              {status === "idle" && "draw a continuous path through every dot"}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              {hintsEnabled && hintsShown < level.hints.length && (
                <button onClick={() => { setHintsShown(h => h+1); window.AudioFX.click(); }} className="ghost-btn small-btn">
                  Hint ({level.hints.length - hintsShown} left)
                </button>
              )}
              {hintsShown >= level.hints.length && !revealed && hintsEnabled && (
                <button onClick={() => setRevealed(true)} className="ghost-btn small-btn">Reveal answer</button>
              )}
            </div>
            {revealed && (
              <div style={{marginTop:8,padding:"12px 14px",border:"1px dashed var(--rule)",fontSize:12,fontFamily:"var(--mono)",color:"var(--fg-mute)",lineHeight:1.6}}>
                {level.explain}
              </div>
            )}
          </div>
        ) : (
        <div style={{
          display:"flex", flexDirection:"column", gap:10,
          animation: shake ? "shake .4s" : "none"
        }}>
          <label className="eyebrow">{level.inputLabel}</label>
          <div className="answer-row" style={{display:"flex",gap:10}}>
            <input
              ref={inputRef}
              value={answer}
              onChange={e => { setAnswer(e.target.value); setStatus("idle"); }}
              onKeyDown={e => e.key === "Enter" && check()}
              placeholder={level.placeholder}
              autoFocus
              style={{
                flex:1, background:"transparent",
                border:"1px solid var(--rule)",
                borderColor: status === "right" ? palette.accent : status === "wrong" ? "var(--danger)" : "var(--rule)",
                padding:"16px 18px", fontFamily:"var(--mono)", fontSize:16,
                color:"var(--fg)", outline:"none", letterSpacing:".02em",
                transition:"border-color .25s",
                borderRadius:2
              }}
            />
            <button onClick={check} className="solve-btn">Submit</button>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,minHeight:18}}>
            <div className="small" style={{color: status==="wrong" ? "var(--danger)" : status==="right" ? palette.accent : "var(--fg-faint)"}}>
              {status === "wrong" && "✕ Not quite. Read again."}
              {status === "right" && "✓ The room exhales."}
              {status === "idle" && "press ↵ to submit · h for a hint"}
            </div>
            <div style={{display:"flex",gap:8}}>
              {hintsEnabled && hintsShown < level.hints.length && (
                <button onClick={() => { setHintsShown(h => h+1); window.AudioFX.click(); }} className="ghost-btn small-btn">
                  Hint ({level.hints.length - hintsShown} left)
                </button>
              )}
              {hintsShown >= level.hints.length && !revealed && hintsEnabled && (
                <button onClick={() => setRevealed(true)} className="ghost-btn small-btn">Reveal answer</button>
              )}
            </div>
          </div>
          {revealed && (
            <div style={{marginTop:8,padding:"12px 14px",border:"1px dashed var(--rule)",fontSize:12,fontFamily:"var(--mono)",color:"var(--fg-mute)",lineHeight:1.6}}>
              {level.explain}
            </div>
          )}
        </div>
        )}
      </div>

      {/* RIGHT — 3D + interactive artifact */}
      <div className="game-right" style={{
        position:"relative", display:"flex", flexDirection:"column",
        background:"var(--bg-soft)", overflow:"hidden", minWidth:0
      }}>
        <div className="game-right-scene" style={{flex:1, position:"relative", minHeight:0}}>
          <window.Scene3D kind={level.scene} palette={palette} opened={artifactOpened} />
          {/* scanline */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            background:`linear-gradient(transparent 50%, ${palette.accent}08 50%)`,
            backgroundSize:"100% 4px"
          }}/>
          {/* corner labels */}
          <div style={{position:"absolute",top:18,left:18,display:"flex",alignItems:"center",gap:8, zIndex:5}}>
            <span className="eyebrow" style={{color:palette.accent}}>● rec</span>
            <span className="eyebrow" style={{opacity:.5}}>artifact-{String(level.id).padStart(2,"0")}</span>
          </div>
          <div style={{position:"absolute",top:18,right:18, zIndex:5}}>
            <span className="eyebrow" style={{opacity:.5}}>{artifactOpened ? "drag to inspect" : ""}</span>
          </div>

          {/* Tap-anywhere-to-open invitation when closed (no visible hint) */}
          {!artifactOpened && level.scene !== "letter" && (
            <button onClick={() => { setArtifactOpened(true); window.AudioFX.click(); }}
              aria-label="open"
              style={{
                position:"absolute", inset:0, background:"transparent",
                border:0, cursor:"pointer", zIndex:4
              }}/>
          )}

          {/* Letter envelope: invisible drag target; tap-to-open after rotation */}
          {!artifactOpened && level.scene === "letter" && (
            <EnvelopeOverlay onOpen={() => { setArtifactOpened(true); window.AudioFX.click(); }} palette={palette}/>
          )}

          {/* Evidence overlay — appears when opened. Glass tint flips per
              palette so the dark text on the bone palette stays readable
              instead of being lost on a dark scrim. */}
          {artifactOpened && (() => {
            const c = (palette.bg || "#000").replace("#","");
            const luma = (parseInt(c.slice(0,2),16)*299 + parseInt(c.slice(2,4),16)*587 + parseInt(c.slice(4,6),16)*114) / 1000;
            const light = luma > 128;
            return (
            <div style={{
              position:"absolute", left:18, right:18, bottom:18,
              padding:"16px 20px",
              background: light ? "rgba(255,255,255,.88)" : "rgba(0,0,0,.62)",
              backdropFilter:"blur(12px)",
              WebkitBackdropFilter:"blur(12px)",
              border:`1px solid ${palette.accent}66`,
              boxShadow: light
                ? "0 10px 30px rgba(0,0,0,.18)"
                : "0 10px 30px rgba(0,0,0,.45)",
              color: palette.fg,
              animation:"fadeUp .6s ease both",
              zIndex:5, maxHeight:"60%", overflow:"auto"
            }}>
              <div className="eyebrow" style={{marginBottom:10,color:palette.accent}}>▸ Evidence</div>
              <ArtifactContent level={level} palette={palette}/>
            </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function openVerb(scene) {
  return ({
    letter:"open", matchbook:"open", key:"examine", clock:"examine",
    diner:"inspect", book:"open", door:"approach"
  })[scene] || "open";
}
function sceneNoun(scene) {
  return ({
    letter:"letter", matchbook:"matchbook", key:"key", clock:"clock",
    diner:"napkin", book:"book", door:"door"
  })[scene] || "artifact";
}

function EnvelopeOverlay({ onOpen, palette }) {
  const [phase, setPhase] = useStateG("rotate"); // rotate -> seal -> done
  const startRef = useRefG(performance.now());

  // Watch the holder's rotation by polling — once user rotates ~PI, switch to "seal" phase
  useEffectG(() => {
    let raf;
    const check = () => {
      // We can't read rotation easily across components; instead infer from time + drag detection
      // Listen for any pointermove/touchmove on the parent scene mount
      raf = requestAnimationFrame(check);
    };
    check();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Simpler approach: listen for touch/mouse drag distance on parent
  useEffectG(() => {
    const parent = document.querySelector(".game-right-scene");
    if (!parent) return;
    let totalDrag = 0;
    let lastX = null, dragging = false;
    const down = (e) => { dragging = true; lastX = (e.touches ? e.touches[0].clientX : e.clientX); };
    const move = (e) => {
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      totalDrag += Math.abs(x - lastX);
      lastX = x;
      if (totalDrag > 180 && phase === "rotate") {
        setPhase("seal");
        window.AudioFX.click();
      }
    };
    const up = () => { dragging = false; };
    parent.addEventListener("mousedown", down);
    parent.addEventListener("touchstart", down, { passive:true });
    parent.addEventListener("mousemove", move);
    parent.addEventListener("touchmove", move, { passive:true });
    parent.addEventListener("mouseup", up);
    parent.addEventListener("touchend", up);
    window.addEventListener("mouseup", up);
    return () => {
      parent.removeEventListener("mousedown", down);
      parent.removeEventListener("touchstart", down);
      parent.removeEventListener("mousemove", move);
      parent.removeEventListener("touchmove", move);
      parent.removeEventListener("mouseup", up);
      parent.removeEventListener("touchend", up);
      window.removeEventListener("mouseup", up);
    };
  }, [phase]);

  if (phase === "rotate") {
    return (
      <div style={{
        position:"absolute", inset:0, zIndex:4, pointerEvents:"none"
      }}/>
    );
  }
  return (
    <button onClick={onOpen} aria-label="open" style={{
      position:"absolute", inset:0, background:"transparent",
      border:0, cursor:"pointer", zIndex:4
    }}/>
  );
}

function ArtifactContent({ level, palette }) {
  const a = level.artifact;
  let content;
  if (a.kind === "letter") {
    content = (
      <pre style={{
        fontFamily:"var(--display)",fontStyle:"italic",fontSize:17,lineHeight:1.7,
        margin:0, color:"var(--fg)", whiteSpace:"pre-wrap"
      }}>
        {a.lines.map((l, i) => {
          const indent = ["Should","Anyone","Discover","I","Existed —"].includes(l);
          return (indent ? "        " : "") + l;
        }).join("\n")}
      </pre>
    );
  } else if (a.kind === "matchbook") {
    content = <>
      <div style={{fontFamily:"var(--mono)",fontSize:18,letterSpacing:".15em",color:palette.accent}}>{a.code}</div>
      <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--fg-mute)",marginTop:8}}>{a.sub}</div>
      <div style={{
        display:"inline-block",marginTop:14,
        width:34,height:34,borderRadius:"50%",
        border:`2px solid ${palette.accent}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontFamily:"var(--display)",fontStyle:"italic",fontSize:20,color:palette.accent
      }}>3</div>
    </>;
  } else if (a.kind === "key") {
    content = (
      <div style={{fontFamily:"var(--mono)",fontSize:20,letterSpacing:".4em",color:palette.accent}}>
        {a.numbers.join(" · ")}
      </div>
    );
  } else if (a.kind === "clock") {
    content = (
      <div style={{display:"flex",alignItems:"baseline",gap:12}}>
        <div style={{fontFamily:"var(--display)",fontStyle:"italic",fontSize:48,color:palette.accent,lineHeight:1}}>{a.time}</div>
        <div className="small">— stopped, deliberately</div>
      </div>
    );
  } else if (a.kind === "diner") {
    content = (
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        {a.letters.map((l, i) => (
          <div key={i} style={{
            width:42,height:54,
            border:`1px solid ${palette.accent}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"var(--display)",fontStyle:"italic",fontSize:24,color:palette.accent,
            background:`${palette.accent}0a`
          }}>{l}</div>
        ))}
      </div>
    );
  } else if (a.kind === "book") {
    content = (
      <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          {a.lines.map((l, i) => (
            <div key={i} style={{display:"flex",gap:14,fontFamily:"var(--serif)",fontSize:14,lineHeight:1.7,color:"var(--fg)"}}>
              <span style={{width:18,color:"var(--fg-faint)",textAlign:"right",fontFamily:"var(--mono)",fontSize:11}}>{i+1}</span>
              <span style={i+1 === a.code[0] ? {color:palette.accent} : null}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{
          padding:"10px 14px",border:`1px solid ${palette.accent}`,
          fontFamily:"var(--mono)",color:palette.accent,fontSize:14,letterSpacing:".2em"
        }}>{a.code.join(" · ")}</div>
      </div>
    );
  } else if (a.kind === "door") {
    content = (
      <div style={{display:"flex",gap:8}}>
        {Array.from({length:a.slots}).map((_,i) => (
          <div key={i} style={{
            width:42,height:60,border:`1px solid ${palette.accent}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"var(--display)",fontSize:20,color:palette.accent,
            background:"rgba(0,0,0,.2)"
          }}>?</div>
        ))}
      </div>
    );
  }

  return (
    <>
      {content}
    </>
  );
}

window.Game = Game;
