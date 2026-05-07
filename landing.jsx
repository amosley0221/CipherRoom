// landing.jsx
// The opening page. Atmospheric, restrained. A single CTA into Chapter I.

const { useState: useStateL, useEffect: useEffectL } = React;

function Landing({ onEnter, palette, levelsCleared, paletteKey, onChoosePalette, palettes }) {
  const [glitch, setGlitch] = useStateL(false);
  const [hovered, setHovered] = useStateL(null);
  useEffectL(() => {
    const id = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 120); }, 4200 + Math.random()*2000);
    return () => clearInterval(id);
  }, []);

  const TRACKS = window.TRACKS || {};
  const activeKey = hovered || paletteKey;
  const activeTrack = TRACKS[activeKey] || TRACKS.navy;

  return (
    <div className="landing-pad" style={{
      position:"absolute", inset:0, display:"grid",
      gridTemplateRows:"auto 1fr auto", padding:"40px 56px",
      animation:"fadeUp .9s ease both"
    }}>
      {/* topbar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <div style={{
            width:10,height:10,borderRadius:"50%",background:palette.accent,
            animation:"drift 2.4s ease-in-out infinite",
            boxShadow:`0 0 18px ${palette.accent}`
          }}/>
          <span className="eyebrow">{activeTrack.levels.length} chapters</span>
        </div>
        <div className="eyebrow" style={{opacity:.6}}>est. 2026 · case 0419</div>
      </div>

      {/* center */}
      <div style={{
        display:"grid", placeItems:"center", textAlign:"center",
        position:"relative"
      }}>
        <div style={{position:"relative", maxWidth:760}}>
          <div className="eyebrow" style={{marginBottom:24, color:palette.accent}}>
            ▸ Property of the unnamed
          </div>
          <h1 className="landing-h1" style={{
            fontFamily:"var(--display)", fontWeight:400,
            fontSize:"clamp(40px, 7vw, 104px)",
            lineHeight:.95, letterSpacing:"-.02em",
            margin:"0 0 28px",
            fontStyle:"italic",
            whiteSpace:"nowrap",
            animation: glitch ? "shake .12s" : "none",
            transition:"color .6s ease"
          }}>
            {activeTrack.name.split(" ").map((w, i, arr) => {
              const isAccent = i === arr.length - 1;
              return (
                <React.Fragment key={i}>
                  {i > 0 && " "}
                  {isAccent ? (
                    <span style={{color:palette.accent, fontStyle:"normal", fontFamily:"var(--serif)"}}>{w}</span>
                  ) : w}
                </React.Fragment>
              );
            })}
          </h1>
          <p style={{
            fontFamily:"var(--mono)", fontSize:13.5, lineHeight:1.7,
            color:"var(--fg-mute)", maxWidth:540, margin:"0 auto",
            minHeight:72
          }}>
            {activeTrack.subtitle}<br/>
            {activeTrack.levels.length} chapters.<br/>
            Read carefully. Look closer. Nothing on this page is decoration.
          </p>

          {/* Six-color mode dots, wrapping to a 2-row grid */}
          <div className="landing-dots" style={{
            display:"flex", gap:24, justifyContent:"center", marginTop:36,
            alignItems:"center", flexWrap:"wrap", maxWidth:520, marginLeft:"auto", marginRight:"auto"
          }}>
            {Object.entries(palettes).map(([key, p]) => {
              const selected = key === paletteKey;
              const track = TRACKS[key];
              return (
                <button
                  key={key}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onChoosePalette(key)}
                  style={{
                    appearance:"none", border:0, background:"transparent",
                    cursor:"pointer", padding:8,
                    display:"flex", flexDirection:"column", alignItems:"center", gap:10,
                    opacity: selected ? 1 : .6,
                    transition:"opacity .25s"
                  }}
                  title={track ? track.name : key}
                >
                  <span style={{
                    width: selected ? 28 : 20, height: selected ? 28 : 20,
                    borderRadius:"50%",
                    background: selected ? p.accent : p.bg,
                    border: `1.5px solid ${selected ? p.accent : p.accent}`,
                    boxShadow: selected
                      ? `0 0 0 2px ${palette.bg}, 0 0 0 3px ${p.accent}, 0 0 24px ${p.accent}88`
                      : `0 0 10px ${p.bg}88, inset 0 0 0 1px ${p.accent}33`,
                    transition:"all .3s ease",
                    display:"block"
                  }}/>
                  <span className="landing-dot-label eyebrow" style={{
                    fontSize:9.5,
                    color: selected ? p.accent : "var(--fg-faint)"
                  }}>{track ? track.name.replace(/^The /,"") : key}</span>
                </button>
              );
            })}
          </div>

          <div className="landing-cta-row" style={{display:"flex",gap:14,justifyContent:"center",marginTop:44}}>
            <button onClick={() => onEnter(0)} className="cta-primary">
              <span>Begin Chapter I</span>
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <path d="M1 6h15m0 0L11 1m5 5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            {levelsCleared > 0 && (
              <button onClick={() => onEnter(levelsCleared)} className="cta-ghost">
                Resume · Chapter {["I","II","III","IV","V","VI","VII"][levelsCleared] || "VII"}
              </button>
            )}
          </div>

          <div className="landing-stats" style={{marginTop:64, display:"flex", gap:32, justifyContent:"center", flexWrap:"wrap"}}>
            {[
              [String(activeTrack.levels.length),"chapters"],
              ["∞","ways to fail"],
              ["1","way through"]
            ].map(([n, l], i) => (
              <div key={i} style={{display:"flex",alignItems:"baseline",gap:8}}>
                <span style={{fontFamily:"var(--display)",fontStyle:"italic",fontSize:34,color:palette.accent}}>{n}</span>
                <span className="eyebrow">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* corner ornaments */}
        <Corners palette={palette}/>
      </div>

      {/* footer */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div className="small">⌨︎ keyboard friendly · 🜁 sound on demand · ☾ dark by nature</div>
        <div className="eyebrow" style={{opacity:.5}}>scroll begins the descent</div>
      </div>

      <style>{`
        .cta-primary{
          appearance:none;border:0;cursor:pointer;
          background:${palette.accent};color:#0c1530;
          font-family:var(--mono);font-weight:600;font-size:13px;letter-spacing:.06em;
          padding:18px 28px;border-radius:2px;
          display:inline-flex;align-items:center;gap:14px;text-transform:uppercase;
          transition:transform .2s, box-shadow .25s;
          box-shadow:0 8px 32px rgba(0,0,0,.4);
        }
        .cta-primary:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(0,0,0,.5), 0 0 0 4px ${palette.accent}33}
        .cta-ghost{
          appearance:none;cursor:pointer;background:transparent;
          color:var(--fg);border:1px solid var(--rule);
          font-family:var(--mono);font-size:12px;letter-spacing:.04em;
          padding:18px 24px;border-radius:2px;
          transition:border-color .2s, background .2s;
        }
        .cta-ghost:hover{border-color:${palette.accent};background:${palette.accent}11}
      `}</style>
    </div>
  );
}

function Corners({ palette }) {
  const c = palette.accent;
  const Corner = ({s}) => (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{position:"absolute",...s, opacity:.5}}>
      <path d="M0 12 V0 H12" fill="none" stroke={c} strokeWidth="1"/>
    </svg>
  );
  return <>
    <Corner s={{top:0,left:0}}/>
    <Corner s={{top:0,right:0,transform:"scaleX(-1)"}}/>
    <Corner s={{bottom:0,left:0,transform:"scaleY(-1)"}}/>
    <Corner s={{bottom:0,right:0,transform:"scale(-1,-1)"}}/>
  </>;
}

window.Landing = Landing;
