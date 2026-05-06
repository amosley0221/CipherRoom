// pageflip.jsx
// Book-page flip transition between chapters.
// Two stacked pages: front shows the chapter just completed, back shows the next chapter.
// CSS 3D transform — perspective + rotateY around the left edge.

const { useEffect: useEffectP, useState: useStateP } = React;

function PageFlip({ from, to, palette }) {
  const fromLvl = window.LEVELS[from];
  const toLvl = to !== null && to !== undefined ? window.LEVELS[to] : null;
  const [phase, setPhase] = useStateP("entering");

  useEffectP(() => {
    const t1 = setTimeout(() => setPhase("flipping"), 50);
    return () => clearTimeout(t1);
  }, []);

  const PageFace = ({ lvl, side }) => {
    if (!lvl) {
      return (
        <div style={{
          position:"absolute", inset:0,
          background:`linear-gradient(135deg, ${palette.bgPaper}, ${palette.bgSoft})`,
          backfaceVisibility:"hidden",
          transform: side === "back" ? "rotateY(180deg)" : "none",
          display:"grid", placeItems:"center"
        }}>
          <div className="eyebrow" style={{color:palette.accent}}>▸ The end</div>
        </div>
      );
    }
    return (
      <div style={{
        position:"absolute", inset:0,
        background:`linear-gradient(135deg, ${palette.bgPaper}, ${palette.bgSoft})`,
        backfaceVisibility:"hidden",
        transform: side === "back" ? "rotateY(180deg)" : "none",
        padding:"48px 56px",
        display:"flex", flexDirection:"column", justifyContent:"center",
        boxShadow: side === "back" ? "inset 30px 0 50px rgba(0,0,0,.4)" : "inset -30px 0 50px rgba(0,0,0,.4)"
      }}>
        <div className="eyebrow" style={{color:palette.accent, marginBottom:18}}>
          ▸ Chapter {lvl.chapter}
        </div>
        <div style={{
          fontFamily:"var(--display)", fontStyle:"italic",
          fontSize:"clamp(48px, 7vw, 96px)", lineHeight:.95,
          color:"var(--fg)", letterSpacing:"-.01em",
          margin:"0 0 16px"
        }}>
          {lvl.title}
        </div>
        <div className="small" style={{color:"var(--fg-faint)", marginBottom:32}}>{lvl.location}</div>
        <div style={{height:1, background:palette.accent, width:80, marginBottom:24, opacity:.5}}/>
        <div style={{
          fontFamily:"var(--mono)", fontSize:11, letterSpacing:".3em",
          color:"var(--fg-mute)", textTransform:"uppercase"
        }}>
          {side === "front" ? "complete" : "now reading"}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,.6)",
      backdropFilter:"blur(4px)",
      display:"grid", placeItems:"center",
      perspective:"2400px",
      animation:"flipBgIn .3s ease both"
    }}>
      {/* book spine shadow underneath */}
      <div className="pageflip-spine" style={{
        position:"absolute",
        width:"min(92vw, 1100px)", height:"min(78vh, 700px)",
        background:`linear-gradient(135deg, ${palette.bgSoft}, ${palette.bg})`,
        boxShadow:"0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)",
      }}>
        {/* center spine line */}
        <div style={{
          position:"absolute", left:"50%", top:0, bottom:0, width:2,
          background:`linear-gradient(180deg, transparent, ${palette.accent}55, transparent)`,
          transform:"translateX(-1px)"
        }}/>

        {/* LEFT static page — shows "from" chapter as the back of the book */}
        <div style={{position:"absolute", left:0, top:0, width:"50%", height:"100%", overflow:"hidden"}}>
          <PageFace lvl={fromLvl} side="back-static"/>
        </div>

        {/* RIGHT static page — shows "to" chapter waiting underneath */}
        <div style={{position:"absolute", right:0, top:0, width:"50%", height:"100%", overflow:"hidden"}}>
          <div style={{
            position:"absolute", inset:0,
            background:`linear-gradient(135deg, ${palette.bgPaper}, ${palette.bgSoft})`,
            padding:"48px 56px",
            display:"flex", flexDirection:"column", justifyContent:"center",
            boxShadow:"inset 30px 0 50px rgba(0,0,0,.4)",
            opacity: phase === "flipping" ? 1 : 0,
            transition: "opacity .4s ease 1.1s"
          }}>
            {toLvl && <>
              <div className="eyebrow" style={{color:palette.accent, marginBottom:18}}>
                ▸ Chapter {toLvl.chapter}
              </div>
              <div style={{
                fontFamily:"var(--display)", fontStyle:"italic",
                fontSize:"clamp(48px, 7vw, 96px)", lineHeight:.95,
                color:"var(--fg)", letterSpacing:"-.01em",
                margin:"0 0 16px"
              }}>
                {toLvl.title}
              </div>
              <div className="small" style={{color:"var(--fg-faint)", marginBottom:32}}>{toLvl.location}</div>
              <div style={{height:1, background:palette.accent, width:80, marginBottom:24, opacity:.5}}/>
              <div style={{
                fontFamily:"var(--mono)", fontSize:11, letterSpacing:".3em",
                color:"var(--fg-mute)", textTransform:"uppercase"
              }}>
                now reading
              </div>
            </>}
          </div>
        </div>

        {/* THE FLIPPING PAGE — sits over the right half, hinges at left edge, rotates -180° */}
        <div style={{
          position:"absolute", right:0, top:0, width:"50%", height:"100%",
          transformStyle:"preserve-3d",
          transformOrigin:"left center",
          transform: phase === "flipping" ? "rotateY(-180deg)" : "rotateY(0deg)",
          transition: "transform 1.5s cubic-bezier(.6,.05,.3,1)",
          boxShadow: phase === "flipping" ? "0 30px 60px rgba(0,0,0,.5)" : "none",
        }}>
          {/* front face — "from" chapter (currently visible on right side before flip) */}
          <PageFace lvl={fromLvl} side="front"/>
          {/* back face — the next chapter, revealed as the page swings over */}
          <PageFace lvl={toLvl} side="back"/>
        </div>
      </div>

      <style>{`
        @keyframes flipBgIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  );
}

window.PageFlip = PageFlip;
