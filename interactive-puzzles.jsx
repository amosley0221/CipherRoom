// interactive-puzzles.jsx
// Interactive puzzle inputs — alternatives to text answers.
// Each component receives { onSolve, onWrong, palette } and calls them on validation.

const { useState: useStateIP, useRef: useRefIP, useEffect: useEffectIP } = React;

/* ---------- ConstellationPuzzle ----------
 * 3×3 grid minus center (8 dots). User draws lines from dot to dot.
 * Goal: cover all 8 dots in N or fewer continuous straight segments.
 * Lines must extend in straight paths; user clicks dots in order.
 * They can hit "Submit" to validate or "Reset" to start over.
 */
function ConstellationPuzzle({ onSolve, onWrong, palette, targetSegments = 3 }) {
  // 8 dot positions (3×3 grid, no center)
  const dots = [
    {x:0,y:0},{x:1,y:0},{x:2,y:0},
    {x:0,y:1},        {x:2,y:1},
    {x:0,y:2},{x:1,y:2},{x:2,y:2},
  ];
  const [path, setPath] = useStateIP([]); // array of dot indices clicked
  const [hover, setHover] = useStateIP(null);
  const [feedback, setFeedback] = useStateIP(null);

  const W = 320, H = 320, PAD = 50;
  const cellW = (W - 2*PAD) / 2;
  const cellH = (H - 2*PAD) / 2;
  const dotPos = (i) => ({
    x: PAD + dots[i].x * cellW,
    y: PAD + dots[i].y * cellH
  });

  function handleDotClick(i) {
    if (path[path.length-1] === i) return;
    setPath([...path, i]);
    window.AudioFX?.click();
  }

  function reset() {
    setPath([]); setFeedback(null);
  }

  function countSegments(p) {
    if (p.length < 2) return 0;
    let segs = 1;
    for (let i = 2; i < p.length; i++) {
      const a = dotPos(p[i-2]), b = dotPos(p[i-1]), c = dotPos(p[i]);
      // Check collinearity: cross product of (b-a) and (c-b)
      const cross = (b.x-a.x)*(c.y-b.y) - (b.y-a.y)*(c.x-b.x);
      if (Math.abs(cross) > 0.01) segs++;
    }
    return segs;
  }

  function check() {
    const visited = new Set(path);
    if (visited.size < 8) {
      setFeedback({type:"wrong", msg:`${visited.size}/8 dots visited`});
      onWrong?.();
      return;
    }
    const segs = countSegments(path);
    if (segs <= targetSegments) {
      setFeedback({type:"right", msg:`Solved in ${segs} segments`});
      setTimeout(() => onSolve(segs), 700);
    } else {
      setFeedback({type:"wrong", msg:`${segs} segments — try fewer`});
      onWrong?.();
    }
  }

  // Build path SVG
  const pathStr = path.map((i, idx) => {
    const p = dotPos(i);
    return `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`;
  }).join(" ");

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
      <svg width={W} height={H} style={{
        background:"rgba(0,0,0,.3)", border:`1px solid ${palette.accent}33`,
        cursor:"crosshair", touchAction:"none"
      }}>
        {/* faint grid hint */}
        <rect x={PAD-20} y={PAD-20} width={cellW*2+40} height={cellH*2+40}
          fill="none" stroke={palette.accent} strokeOpacity=".08" strokeDasharray="3 3"/>

        {/* drawn path */}
        {path.length >= 2 && (
          <path d={pathStr} stroke={palette.accent} strokeWidth="2" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
            style={{filter:`drop-shadow(0 0 6px ${palette.accent}99)`}}/>
        )}

        {/* preview line to hovered dot */}
        {hover != null && path.length > 0 && path[path.length-1] !== hover && (() => {
          const a = dotPos(path[path.length-1]);
          const b = dotPos(hover);
          return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={palette.accent} strokeWidth="1.5" strokeOpacity=".4"
            strokeDasharray="4 4"/>;
        })()}

        {/* dots */}
        {dots.map((_, i) => {
          const p = dotPos(i);
          const visited = path.includes(i);
          const order = path.indexOf(i);
          const isLast = path[path.length-1] === i;
          return (
            <g key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => handleDotClick(i)}
              style={{cursor:"pointer"}}>
              <circle cx={p.x} cy={p.y} r="22" fill="transparent"/>
              <circle cx={p.x} cy={p.y} r={isLast ? 12 : 9}
                fill={visited ? palette.accent : "rgba(0,0,0,.5)"}
                stroke={palette.accent}
                strokeWidth={visited ? 0 : 1.5}
                style={{transition:"all .2s",filter:visited?`drop-shadow(0 0 8px ${palette.accent})`:"none"}}/>
              {visited && (
                <text x={p.x} y={p.y+4} textAnchor="middle"
                  fill="#000" fontSize="11" fontFamily="var(--mono)" fontWeight="700">
                  {order+1}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={{display:"flex",gap:10,alignItems:"center",minHeight:24}}>
        <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--fg-mute)",letterSpacing:".15em"}}>
          {path.length === 0 ? "tap dots to draw a path" :
            feedback ? "" :
            `${new Set(path).size}/8 dots · ${countSegments(path)} segments`}
        </span>
        {feedback && (
          <span style={{
            fontFamily:"var(--mono)",fontSize:11,letterSpacing:".15em",
            color: feedback.type === "right" ? palette.accent : "var(--danger)"
          }}>
            {feedback.type === "right" ? "✓ " : "✕ "}{feedback.msg}
          </span>
        )}
      </div>

      <div style={{display:"flex",gap:10}}>
        <button onClick={reset} className="ghost-btn small-btn">Reset</button>
        <button onClick={check} className="primary-btn"
          style={{
            background:palette.accent,color:"#000",border:0,
            padding:"8px 22px",fontFamily:"var(--mono)",fontSize:11,
            letterSpacing:".25em",textTransform:"uppercase",cursor:"pointer"
          }}>
          Submit
        </button>
      </div>
    </div>
  );
}

window.ConstellationPuzzle = ConstellationPuzzle;
