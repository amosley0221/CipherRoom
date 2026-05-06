// scene3d.jsx
// A reusable Three.js scene that renders different "artifacts" per chapter.
// Each artifact is a small, dramatic 3D object that floats and rotates.

const { useEffect, useRef } = React;

function Scene3D({ kind, palette, opened, onReady }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth, h = mount.clientHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(palette.bg), 6, 22);

    const camera = new THREE.PerspectiveCamera(35, w/h, 0.1, 100);
    camera.position.set(0, 0.5, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Lights — moody, single key + warm rim
    const ambient = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(palette.accent, 1.6);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.4);
    rim.position.set(-4, 2, -2);
    scene.add(rim);
    const fill = new THREE.PointLight(palette.accent, 0.6, 12);
    fill.position.set(0, -2, 3);
    scene.add(fill);

    // Holder group so we can spin everything together
    const holder = new THREE.Group();
    scene.add(holder);

    // Build artifact based on `kind`
    const accent = new THREE.Color(palette.accent);
    const paper = new THREE.Color(palette.paper);
    const ink = new THREE.Color(palette.ink);

    function makeMat(c, opts={}) {
      return new THREE.MeshStandardMaterial({ color: c, roughness:.5, metalness:.2, ...opts });
    }

    let mainObject = null;

    if (kind === "letter") {
      // ENVELOPE — body, flap (animatable), wax seal on the back
      const envelope = new THREE.Group();

      const paperColor = 0xeae0c4;
      const paperMat = makeMat(paperColor, { roughness:.95, metalness:0 });
      const paperBackMat = makeMat(0xd9cfb3, { roughness:.95, metalness:0 });

      // FRONT face (smooth side, with address writing as decoration)
      const front = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 0.04), paperMat);
      front.position.z = 0.02;
      envelope.add(front);

      // BACK shell (where flap attaches)
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 0.04), paperBackMat);
      back.position.z = -0.02;
      envelope.add(back);

      // Two angled side flaps on the back, drawn as triangle planes (decorative)
      const triShape = new THREE.Shape();
      triShape.moveTo(-1.3, 0.9);
      triShape.lineTo(0, 0);
      triShape.lineTo(-1.3, -0.9);
      triShape.lineTo(-1.3, 0.9);
      const triGeo = new THREE.ShapeGeometry(triShape);
      const sideL = new THREE.Mesh(triGeo, paperBackMat);
      sideL.position.z = -0.018;
      envelope.add(sideL);
      const triShapeR = new THREE.Shape();
      triShapeR.moveTo(1.3, 0.9);
      triShapeR.lineTo(0, 0);
      triShapeR.lineTo(1.3, -0.9);
      triShapeR.lineTo(1.3, 0.9);
      const sideR = new THREE.Mesh(new THREE.ShapeGeometry(triShapeR), paperBackMat);
      sideR.position.z = -0.018;
      envelope.add(sideR);

      // Bottom flap on the back (closed permanently)
      const bottomShape = new THREE.Shape();
      bottomShape.moveTo(-1.3, -0.9);
      bottomShape.lineTo(0, 0);
      bottomShape.lineTo(1.3, -0.9);
      bottomShape.lineTo(-1.3, -0.9);
      const bottom = new THREE.Mesh(new THREE.ShapeGeometry(bottomShape), paperBackMat);
      bottom.position.z = -0.015;
      envelope.add(bottom);

      // TOP FLAP — pivots open. We translate the geometry so the hinge sits at y=0.9.
      const flapShape = new THREE.Shape();
      flapShape.moveTo(-1.3, 0);
      flapShape.lineTo(0, -0.9);
      flapShape.lineTo(1.3, 0);
      flapShape.lineTo(-1.3, 0);
      const flapGeo = new THREE.ShapeGeometry(flapShape);
      const flap = new THREE.Mesh(flapGeo, paperBackMat);
      flap.position.set(0, 0.9, -0.015); // hinge at top edge of envelope
      envelope.add(flap);
      stateRef.current.flap = flap;

      // Wax seal sits ON the flap (so it moves with it)
      const seal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.2, 0.06, 32),
        makeMat(0xa83232, { roughness:.4, metalness:.1 })
      );
      seal.position.set(0, -0.45, -0.04);
      seal.rotation.x = Math.PI/2;
      flap.add(seal);
      // Wax seal "S" — small torus to hint a monogram
      const monogram = new THREE.Mesh(
        new THREE.TorusGeometry(0.06, 0.015, 8, 16),
        makeMat(0x6a1a1a)
      );
      monogram.position.set(0, -0.45, -0.08);
      flap.add(monogram);

      // Address text (faint horizontal lines on front)
      for (let i=0;i<3;i++){
        const ink = new THREE.Mesh(
          new THREE.BoxGeometry(0.6 + Math.random()*0.5, 0.025, 0.005),
          makeMat(0x2a2418, { roughness:.9 })
        );
        ink.position.set(-0.4 + Math.random()*0.3, 0.2 - i*0.25, 0.041);
        envelope.add(ink);
      }

      // The LETTER — a paper sheet hidden inside, slides out on open
      const letterSheet = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.6, 0.012),
        makeMat(0xf5ecd0, { roughness:.95 })
      );
      letterSheet.position.set(0, 0, 0); // starts hidden behind front face
      letterSheet.visible = false;
      envelope.add(letterSheet);
      stateRef.current.letterSheet = letterSheet;

      // Faint lines of text on the letter (revealed when slid out)
      const textLines = new THREE.Group();
      for (let i=0;i<7;i++){
        const w = 1.6 - Math.abs(i-3) * 0.15 - Math.random()*0.3;
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(w, 0.04, 0.005),
          makeMat(0x1a1410, { roughness:.9 })
        );
        line.position.set(-0.2 + Math.random()*0.1, 0.55 - i*0.18, 0.013);
        textLines.add(line);
      }
      letterSheet.add(textLines);

      mainObject = envelope;
      holder.add(envelope);
      stateRef.current.envelope = envelope;
    }
    else if (kind === "matchbook") {
      const geo = new THREE.BoxGeometry(1.6, 2.2, 0.3);
      const mat = makeMat(0x1a1a1a, { roughness:.7 });
      const book = new THREE.Mesh(geo, mat);
      holder.add(book);
      // gold foil stripe
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(1.62, 0.3, 0.32),
        makeMat(accent, { metalness:.7, roughness:.3 })
      );
      stripe.position.y = 0.7;
      holder.add(stripe);
      // matches sticking out
      for (let i=0;i<5;i++){
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8),
          makeMat(0xddc89a)
        );
        m.position.set(-0.6 + i*0.3, 1.2, 0);
        holder.add(m);
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), makeMat(0xc04030));
        tip.position.set(-0.6 + i*0.3, 1.85, 0);
        holder.add(tip);
      }
      mainObject = book;
    }
    else if (kind === "key") {
      // Skeleton key — bow + shaft + bit
      const bow = new THREE.Mesh(
        new THREE.TorusGeometry(0.45, 0.10, 18, 48),
        makeMat(accent, { metalness:.85, roughness:.25 })
      );
      bow.position.x = -1.1;
      holder.add(bow);
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 2.2, 24),
        makeMat(accent, { metalness:.85, roughness:.25 })
      );
      shaft.rotation.z = Math.PI/2;
      holder.add(shaft);
      const bit1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.3, 0.15),
        makeMat(accent, { metalness:.85, roughness:.25 })
      );
      bit1.position.set(0.85, -0.15, 0); holder.add(bit1);
      const bit2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.45, 0.15),
        makeMat(accent, { metalness:.85, roughness:.25 })
      );
      bit2.position.set(0.6, -0.22, 0); holder.add(bit2);
      mainObject = shaft;
    }
    else if (kind === "clock") {
      // Pocket watch — disk + hands
      const face = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.4, 0.18, 64),
        makeMat(0xefe7d2, { roughness:.6 })
      );
      face.rotation.x = Math.PI/2;
      holder.add(face);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.08, 16, 64),
        makeMat(accent, { metalness:.9, roughness:.2 })
      );
      holder.add(ring);
      // hour hand → 4:20 position. hour at 4:20 → angle from 12 = (4 + 20/60)*30 = 130°
      const hourHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.8, 0.04),
        makeMat(0x222, { roughness:.7 })
      );
      hourHand.geometry.translate(0, 0.4, 0);
      hourHand.rotation.z = -130 * Math.PI/180;
      hourHand.position.z = 0.1;
      holder.add(hourHand);
      // minute hand → :20 → 120°
      const minHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 1.15, 0.04),
        makeMat(0x222, { roughness:.7 })
      );
      minHand.geometry.translate(0, 0.575, 0);
      minHand.rotation.z = -120 * Math.PI/180;
      minHand.position.z = 0.12;
      holder.add(minHand);
      // ticks
      for (let i=0;i<12;i++){
        const t = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.18, 0.02),
          makeMat(0x222)
        );
        const a = i * Math.PI/6;
        t.position.set(Math.sin(a)*1.2, Math.cos(a)*1.2, 0.1);
        t.rotation.z = -a;
        holder.add(t);
      }
      mainObject = face;
    }
    else if (kind === "diner") {
      // Coffee cup on saucer
      const saucer = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.5, 0.1, 48),
        makeMat(0xefe7d2)
      );
      saucer.position.y = -0.7;
      holder.add(saucer);
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.55, 1.0, 48, 1, true),
        makeMat(0xefe7d2, { side: THREE.DoubleSide })
      );
      cup.position.y = -0.15;
      holder.add(cup);
      const coffee = new THREE.Mesh(
        new THREE.CylinderGeometry(0.66, 0.66, 0.08, 48),
        makeMat(0x1a0e08, { roughness:.4 })
      );
      coffee.position.y = 0.3;
      holder.add(coffee);
      // handle
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.08, 12, 24, Math.PI),
        makeMat(0xefe7d2)
      );
      handle.position.set(0.75, -0.15, 0);
      handle.rotation.y = Math.PI/2;
      handle.rotation.z = -Math.PI/2;
      holder.add(handle);
      // steam (small spheres)
      for (let i=0;i<3;i++){
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.08+i*0.04, 16, 16),
          new THREE.MeshStandardMaterial({ color:0xffffff, transparent:true, opacity:.18, roughness:1 }));
        s.position.set((i-1)*0.15, 0.7+i*0.3, 0);
        holder.add(s);
      }
      mainObject = cup;
    }
    else if (kind === "book") {
      // Open book
      const baseMat = makeMat(0xefe7d2, { roughness:.95 });
      const left = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.05), baseMat);
      const right = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.05), baseMat);
      left.position.x = -0.82; right.position.x = 0.82;
      left.rotation.y = 0.12; right.rotation.y = -0.12;
      holder.add(left); holder.add(right);
      // spine
      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 2.3, 0.4),
        makeMat(accent, { metalness:.6, roughness:.4 })
      );
      spine.position.y = 0; spine.position.z = -0.1;
      holder.add(spine);
      // bookmark
      const bm = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.6, 0.02),
        makeMat(0xc02828)
      );
      bm.position.set(0.3, -0.5, 0.06);
      holder.add(bm);
      mainObject = left;
    }
    else if (kind === "door") {
      // Six rotating dials
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 0.2),
        makeMat(0x1a1a1a, { roughness:.8 })
      );
      frame.position.z = -0.2;
      holder.add(frame);
      const dialRow = new THREE.Group();
      for (let i=0;i<6;i++){
        const d = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.32, 0.4, 32),
          makeMat(accent, { metalness:.85, roughness:.25 })
        );
        d.rotation.z = Math.PI/2;
        d.position.x = -1.5 + i*0.6;
        dialRow.add(d);
      }
      holder.add(dialRow);
      stateRef.current.dialRow = dialRow;
      mainObject = frame;
    }

    // ============ NEW SCENES ============
    else if (kind === "witnesses") {
      // Three figures (geometric) — one tilted (the liar)
      for (let i=0;i<3;i++){
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32,0.4,1.6,8),
          makeMat(i===0 ? accent : 0xddd6c0, { roughness:.7 })
        );
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 24, 24),
          makeMat(i===0 ? accent : 0xddd6c0, { roughness:.7 })
        );
        body.position.set(-1.4 + i*1.4, 0, 0);
        head.position.set(-1.4 + i*1.4, 1.1, 0);
        if (i===0) { body.rotation.z = 0.18; head.rotation.z = 0.18; head.position.x -= 0.18; }
        holder.add(body); holder.add(head);
      }
      mainObject = holder;
    }
    else if (kind === "fivedoors") {
      for (let i=0;i<5;i++){
        const door = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 1.8, 0.08),
          makeMat(i===1 ? accent : 0x2a2418, { roughness:.6 })
        );
        door.position.x = -2.4 + i*1.2;
        holder.add(door);
        const num = new THREE.Mesh(
          new THREE.TorusGeometry(0.08, 0.02, 8, 16),
          makeMat(accent, { metalness:.8 })
        );
        num.position.set(-2.4 + i*1.2, 0.4, 0.06);
        holder.add(num);
      }
      mainObject = holder;
    }
    else if (kind === "lockbox") {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.8, 1.4),
        makeMat(0x3a2a18, { roughness:.65 })
      );
      holder.add(box);
      for (let i=0;i<3;i++){
        const dial = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.32, 0.18, 32),
          makeMat(accent, { metalness:.9, roughness:.2 })
        );
        dial.rotation.x = Math.PI/2;
        dial.position.set(-0.7 + i*0.7, 0, 0.75);
        holder.add(dial);
      }
      mainObject = box;
    }
    else if (kind === "bridge") {
      const span = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.12, 0.5),
        makeMat(0x6a4a2a, { roughness:.85 })
      );
      holder.add(span);
      for (let i=0;i<6;i++){
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04,0.04,0.5,8),
          makeMat(0x8a6a3a)
        );
        post.position.set(-1.8 + i*0.72, 0.3, 0.22);
        holder.add(post);
      }
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        makeMat(accent, { emissive: accent, emissiveIntensity:.8 })
      );
      lantern.position.set(0, 0.7, 0);
      holder.add(lantern);
      mainObject = span;
    }
    else if (kind === "sequence") {
      // Floating numbered tiles
      const seq = ["2","10","12","16","17","18","19","?"];
      for (let i=0;i<seq.length;i++){
        const tile = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, 0.08),
          makeMat(i===seq.length-1 ? accent : 0xeae0c4, { roughness:.7 })
        );
        const angle = (i / seq.length) * Math.PI * 2;
        tile.position.set(Math.cos(angle)*1.6, Math.sin(angle)*1.2, 0);
        holder.add(tile);
      }
      mainObject = holder;
    }
    else if (kind === "typewriter") {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.4, 1.6),
        makeMat(0x1a1a1a, { roughness:.7 })
      );
      base.position.y = -0.4;
      holder.add(base);
      const carriage = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.6, 0.4),
        makeMat(0x2a2a2a, { roughness:.5 })
      );
      carriage.position.y = 0.1;
      holder.add(carriage);
      // keys
      for (let r=0;r<3;r++){
        for (let c=0;c<8;c++){
          const k = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08,0.08,0.06,12),
            makeMat(r===0&&c===4 ? accent : 0xeee, { roughness:.4 })
          );
          k.position.set(-0.85 + c*0.24, -0.16 + r*0.12, 0.6 - r*0.15);
          holder.add(k);
        }
      }
      // page
      const page = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.02, 1.0),
        makeMat(0xf5ecd0)
      );
      page.position.y = 0.42;
      holder.add(page);
      mainObject = base;
    }
    else if (kind === "tiles") {
      // floating letter tiles A R S E N I C ?
      const letters = ["A","R","S","E","N","I","C","?"];
      for (let i=0;i<letters.length;i++){
        const t = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.6, 0.1),
          makeMat(i===letters.length-1 ? accent : 0xddd0a0, { roughness:.6 })
        );
        t.position.set(-1.75 + (i%4)*1.0, 0.5 - Math.floor(i/4)*0.9, 0);
        t.rotation.z = (Math.random()-.5)*0.1;
        holder.add(t);
      }
      mainObject = holder;
    }
    else if (kind === "crossword") {
      const grid = new THREE.Group();
      for (let r=0;r<5;r++){
        for (let c=0;c<8;c++){
          const filled = (r+c)%3 !== 0;
          const sq = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.32, 0.04),
            makeMat(filled ? 0xf5ecd0 : 0x111, { roughness:.7 })
          );
          sq.position.set(-1.25 + c*0.34, 0.85 - r*0.34, 0);
          grid.add(sq);
        }
      }
      holder.add(grid);
      mainObject = grid;
    }
    else if (kind === "mirrorword") {
      // a word block + its mirror
      const word = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.5, 0.1),
        makeMat(0xeae0c4)
      );
      word.position.y = 0.4;
      holder.add(word);
      const mirror = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.5, 0.1),
        makeMat(accent)
      );
      mirror.position.y = -0.4;
      mirror.scale.x = -1;
      holder.add(mirror);
      const surface = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.02, 1.0),
        makeMat(0x1a1a1a, { metalness:.8, roughness:.1 })
      );
      holder.add(surface);
      mainObject = word;
    }
    else if (kind === "diary") {
      const cover = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 2.6, 0.08),
        makeMat(0x6a2020, { roughness:.7 })
      );
      cover.rotation.x = -0.1;
      holder.add(cover);
      // gold acrostic letters S A D I E
      for (let i=0;i<5;i++){
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.06, 0.02),
          makeMat(accent, { metalness:.9 })
        );
        stripe.position.set(-0.6, 0.9 - i*0.4, 0.05);
        cover.add(stripe);
      }
      mainObject = cover;
    }
    else if (kind === "compass") {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.08, 16, 64),
        makeMat(accent, { metalness:.9 })
      );
      holder.add(ring);
      const needle = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 1.6, 4),
        makeMat(accent)
      );
      needle.rotation.x = Math.PI/2;
      holder.add(needle);
      const needleS = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 1.6, 4),
        makeMat(0xddd0a0)
      );
      needleS.rotation.x = -Math.PI/2;
      holder.add(needleS);
      const face = new THREE.Mesh(
        new THREE.CylinderGeometry(1.36, 1.36, 0.05, 64),
        makeMat(0xeae0c4)
      );
      face.rotation.x = Math.PI/2;
      face.position.z = -0.05;
      holder.add(face);
      mainObject = ring;
    }
    else if (kind === "stars") {
      // Constellation: 8 dots
      const positions = [
        [-1.2,1.0],[0,1.0],[1.2,1.0],
        [-1.2,0],[1.2,0],
        [-1.2,-1.0],[0,-1.0],[1.2,-1.0]
      ];
      positions.forEach(([x,y]) => {
        const star = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 16),
          makeMat(accent, { emissive: accent, emissiveIntensity:.6 })
        );
        star.position.set(x, y, 0);
        holder.add(star);
      });
      mainObject = holder;
    }
    else if (kind === "chessboard") {
      const board = new THREE.Group();
      for (let r=0;r<8;r++){
        for (let c=0;c<8;c++){
          const isCorner = (r===0&&c===0) || (r===7&&c===7);
          if (isCorner) continue;
          const sq = new THREE.Mesh(
            new THREE.BoxGeometry(0.32,0.04,0.32),
            makeMat((r+c)%2===0 ? 0xeae0c4 : 0x2a2018)
          );
          sq.position.set(-1.2 + c*0.32, 0, 1.2 - r*0.32);
          board.add(sq);
        }
      }
      board.rotation.x = -0.5;
      holder.add(board);
      mainObject = board;
    }
    else if (kind === "mirror") {
      const frame = new THREE.Mesh(
        new THREE.TorusGeometry(1.3, 0.12, 16, 64),
        makeMat(accent, { metalness:.95, roughness:.1 })
      );
      holder.add(frame);
      const glass = new THREE.Mesh(
        new THREE.CircleGeometry(1.25, 64),
        makeMat(0x9aa8b0, { metalness:.9, roughness:.1 })
      );
      glass.position.z = -0.05;
      holder.add(glass);
      // Clock hands reflected
      const hour = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.02), makeMat(0x111));
      hour.geometry.translate(0, 0.35, 0);
      hour.rotation.z = -120 * Math.PI/180;
      holder.add(hour);
      const min = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 0.02), makeMat(0x111));
      min.geometry.translate(0, 0.5, 0);
      min.rotation.z = -90 * Math.PI/180;
      holder.add(min);
      mainObject = frame;
    }
    else if (kind === "origami") {
      // folded paper square — multi-faceted
      const grp = new THREE.Group();
      for (let i=0;i<4;i++){
        const pane = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 0.02, 1.0),
          makeMat(i%2===0 ? 0xf5ecd0 : 0xddd0a0)
        );
        pane.position.set((i%2)*1.02 - 0.51, i*0.04, Math.floor(i/2)*1.02 - 0.51);
        grp.add(pane);
      }
      grp.rotation.x = -0.4;
      grp.rotation.y = 0.3;
      holder.add(grp);
      // crease lines
      for (let i=0;i<3;i++){
        const crease = new THREE.Mesh(
          new THREE.BoxGeometry(2.0, 0.012, 0.012),
          makeMat(accent)
        );
        crease.position.y = i*0.04 + 0.03;
        crease.rotation.y = i*Math.PI/3;
        holder.add(crease);
      }
      mainObject = grp;
    }

    stateRef.current.mainObject = mainObject;
    stateRef.current.holder = holder;

    // Pointer parallax + drag-to-inspect (mouse + touch)
    let pointer = { x: 0, y: 0 };
    let dragging = false;
    let dragStart = { x: 0, y: 0, px: 0, py: 0 };
    let manualOffset = { x: 0, y: 0 };

    const updateFromPoint = (cx, cy) => {
      const r = mount.getBoundingClientRect();
      pointer.x = ((cx - r.left) / r.width) * 2 - 1;
      pointer.y = ((cy - r.top) / r.height) * 2 - 1;
    };
    const onMove = (e) => {
      if (e.touches) {
        if (!e.touches[0]) return;
        if (dragging) {
          const dx = e.touches[0].clientX - dragStart.x;
          const dy = e.touches[0].clientY - dragStart.y;
          manualOffset.x = dragStart.px + dx / 100;
          manualOffset.y = dragStart.py + dy / 100;
          e.preventDefault();
        } else {
          updateFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        }
      } else {
        updateFromPoint(e.clientX, e.clientY);
      }
    };
    const onDown = (e) => {
      dragging = true;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      dragStart = { x: cx, y: cy, px: manualOffset.x, py: manualOffset.y };
    };
    const onUp = () => { dragging = false; };
    mount.addEventListener("pointermove", onMove);
    mount.addEventListener("touchmove", onMove, { passive: false });
    mount.addEventListener("touchstart", onDown, { passive: true });
    mount.addEventListener("touchend", onUp);
    mount.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    stateRef.current.manualOffset = manualOffset;

    // Track flap open/close + letter slide animation state
    stateRef.current.flapAngle = 0; // 0 = closed, -PI = fully open
    stateRef.current.letterSlide = 0; // 0..1
    stateRef.current.openedTrigger = false;

    // animation
    let raf = 0; const start = performance.now();
    function tick(){
      const t = (performance.now() - start) / 1000;
      const baseY = Math.sin(t*0.4) * 0.2;
      // If we've triggered open, lock to "back facing" rotation so seal stays visible
      if (stateRef.current.openedTrigger && kind === "letter") {
        // ease toward showing the back (rotation y = PI), no auto-rock
        const targetY = Math.PI + manualOffset.x;
        holder.rotation.y += (targetY - holder.rotation.y) * 0.06;
        holder.rotation.x += (manualOffset.y - holder.rotation.x) * 0.06;
      } else {
        holder.rotation.y = baseY + pointer.x * 0.4 + manualOffset.x;
        holder.rotation.x = Math.cos(t*0.3) * 0.06 + pointer.y * 0.2 + manualOffset.y;
      }
      holder.position.y = Math.sin(t*0.6) * 0.06;

      // ENVELOPE flap + letter animation
      if (kind === "letter" && stateRef.current.flap) {
        const flap = stateRef.current.flap;
        const sheet = stateRef.current.letterSheet;
        const targetFlap = stateRef.current.openedTrigger ? -Math.PI * 0.95 : 0;
        stateRef.current.flapAngle += (targetFlap - stateRef.current.flapAngle) * 0.05;
        flap.rotation.x = stateRef.current.flapAngle;

        // Letter slides out after flap is mostly open
        if (stateRef.current.openedTrigger && stateRef.current.flapAngle < -1.5) {
          stateRef.current.letterSlide += (1 - stateRef.current.letterSlide) * 0.04;
        } else if (!stateRef.current.openedTrigger) {
          stateRef.current.letterSlide += (0 - stateRef.current.letterSlide) * 0.1;
        }
        if (sheet) {
          const s = stateRef.current.letterSlide;
          sheet.visible = s > 0.01;
          sheet.position.y = s * 1.6; // slides up out of envelope
          sheet.position.z = -0.01 + s * 0.05;
          sheet.rotation.x = -s * 0.05;
          sheet.scale.setScalar(0.6 + s * 0.4);
        }
      }

      if (stateRef.current.dialRow) {
        stateRef.current.dialRow.children.forEach((d, i) => {
          d.rotation.x = t * (0.3 + i*0.07);
        });
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    // resize
    const onResize = () => {
      const W = mount.clientWidth, H = mount.clientHeight;
      camera.aspect = W/H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    onReady && onReady();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("pointermove", onMove);
      mount.removeEventListener("touchmove", onMove);
      mount.removeEventListener("touchstart", onDown);
      mount.removeEventListener("touchend", onUp);
      mount.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      scene.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material.dispose();
        }
      });
    };
  }, [kind, palette.accent, palette.bg, palette.paper, palette.ink]);

  // Sync `opened` prop into the live scene
  useEffect(() => {
    stateRef.current.openedTrigger = !!opened;
  }, [opened]);

  return <div ref={mountRef} style={{ width:"100%", height:"100%", cursor:"grab" }} />;
}

window.Scene3D = Scene3D;
