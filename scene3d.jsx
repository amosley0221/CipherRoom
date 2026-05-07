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
    else if (kind === "guards") {
      // Two identical figures in front of two iron doors
      for (let i = 0; i < 2; i++) {
        const door = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 2.0, 0.08),
          makeMat(0x1a1a1a, { roughness:.6, metalness:.3 })
        );
        door.position.set(-1.1 + i * 2.2, 0, -0.6);
        holder.add(door);
        const handle = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 12, 12),
          makeMat(accent, { metalness:.9, roughness:.2 })
        );
        handle.position.set(-1.1 + i * 2.2 + 0.34, 0, -0.55);
        holder.add(handle);
        // Guard figure
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.26, 0.34, 1.4, 10),
          makeMat(0x2a2418, { roughness:.85 })
        );
        body.position.set(-1.1 + i * 2.2, -0.2, 0.2);
        holder.add(body);
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.26, 20, 20),
          makeMat(0x3a3024, { roughness:.7 })
        );
        head.position.set(-1.1 + i * 2.2, 0.78, 0.2);
        holder.add(head);
        // Featureless face — a single accent line for the brim
        const brim = new THREE.Mesh(
          new THREE.TorusGeometry(0.28, 0.025, 8, 24),
          makeMat(accent, { metalness:.6 })
        );
        brim.rotation.x = Math.PI / 2;
        brim.position.set(-1.1 + i * 2.2, 1.0, 0.2);
        holder.add(brim);
      }
      mainObject = holder;
    }
    else if (kind === "boxes") {
      // Three sealed envelopes propped on a desk edge — each with a wax seal
      const labels = ["SS", "WW", "SW"];
      for (let i = 0; i < 3; i++) {
        const env = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 0.85, 0.06),
          makeMat(0xeae0c4, { roughness:.92 })
        );
        env.position.set(-1.5 + i * 1.5, 0, 0);
        env.rotation.z = (i - 1) * 0.04;
        env.rotation.x = -0.25;
        holder.add(env);
        // wax seal
        const seal = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.04, 24),
          makeMat(accent, { roughness:.5, metalness:.2 })
        );
        seal.rotation.x = Math.PI / 2;
        seal.position.set(-1.5 + i * 1.5, 0, 0.05);
        holder.add(seal);
        // pencil-mark label as a tiny dark bar
        const labelBar = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 0.06, 0.005),
          makeMat(0x1a1a1a, { roughness:.9 })
        );
        labelBar.position.set(-1.5 + i * 1.5, 0.28, 0.04);
        holder.add(labelBar);
      }
      mainObject = holder;
    }
    else if (kind === "caesar") {
      // Roman scroll — tan cylinder with banded letter-blocks
      const scroll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 3.2, 32, 1, true),
        makeMat(0xd9c89a, { roughness:.95, side: THREE.DoubleSide })
      );
      scroll.rotation.z = Math.PI / 2;
      holder.add(scroll);
      // End caps as darker rolls
      for (let i = 0; i < 2; i++) {
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.78, 0.78, 0.18, 32),
          makeMat(0x3a2a18, { roughness:.85 })
        );
        cap.rotation.z = Math.PI / 2;
        cap.position.x = (i === 0 ? -1.6 : 1.6);
        holder.add(cap);
      }
      // Three glyph blocks across the scroll face — encoded letters
      for (let i = 0; i < 3; i++) {
        const glyph = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.04, 0.34),
          makeMat(accent, { metalness:.6, roughness:.4 })
        );
        glyph.position.set(-1.0 + i * 1.0, 0.72, 0);
        holder.add(glyph);
      }
      mainObject = scroll;
    }
    else if (kind === "lipogram") {
      // A page of text with one missing letterform conspicuously absent
      const page = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 3.0, 0.04),
        makeMat(0xf5ecd0, { roughness:.95 })
      );
      page.rotation.x = -0.15;
      holder.add(page);
      // Lines of text as small dark bars, with one full row missing in the middle
      for (let r = 0; r < 9; r++) {
        if (r === 4) continue; // the missing letter row
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(2.0, 0.06, 0.005),
          makeMat(0x1a1a1a, { roughness:.9 })
        );
        line.position.set(0, 1.2 - r * 0.3, 0.025);
        line.rotation.x = -0.15;
        holder.add(line);
      }
      // A single accent-colored "absence marker" — a circle where the missing letter would be
      const absence = new THREE.Mesh(
        new THREE.RingGeometry(0.14, 0.18, 24),
        makeMat(accent, { side: THREE.DoubleSide })
      );
      absence.position.set(0, 0, 0.035);
      absence.rotation.x = -0.15;
      holder.add(absence);
      mainObject = page;
    }
    else if (kind === "crossroads") {
      // 4×4 grid of city blocks with two corner markers
      const tileSize = 0.4;
      const gap = 0.08;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const tile = new THREE.Mesh(
            new THREE.BoxGeometry(tileSize, 0.06, tileSize),
            makeMat(0x2a2418, { roughness:.85 })
          );
          tile.position.set(
            -0.72 + c * (tileSize + gap),
            0,
            0.72 - r * (tileSize + gap)
          );
          holder.add(tile);
        }
      }
      // X marker (top-left) — accent cylinder
      const xMarker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16),
        makeMat(accent, { metalness:.7, emissive: accent, emissiveIntensity:.3 })
      );
      xMarker.position.set(-0.72, 0.12, 0.72);
      holder.add(xMarker);
      // Star marker (bottom-right) — small octahedron
      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16, 0),
        makeMat(accent, { metalness:.8, emissive: accent, emissiveIntensity:.4 })
      );
      star.position.set(0.72, 0.16, -0.72);
      holder.add(star);
      holder.rotation.x = -0.5;
      mainObject = holder;
    }
    else if (kind === "lobby") {
      // Hotel lobby — reception desk + scattered figures
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.5, 0.7),
        makeMat(0x3a2a18, { roughness:.7 })
      );
      desk.position.set(0, -0.4, -1.2);
      holder.add(desk);
      // Scattered figures (different colors to feel like a crowd)
      const colors = [0xb33027, 0x4a4a4a, 0xddd6c4, 0xb33027, 0x6a4a2a, 0xb33027, 0x4a4a4a];
      const positions = [
        [-1.8, -0.2, 0.5], [-0.7, -0.2, -0.7], [0.2, -0.2, -0.4],
        [1.2, -0.2, 0.6], [-1.4, -0.2, 1.3], [-0.4, -0.2, 1.1], [1.6, -0.2, -0.5]
      ];
      for (let i = 0; i < positions.length; i++) {
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.18, 0.7, 8),
          makeMat(colors[i], { roughness:.85 })
        );
        body.position.set(...positions[i]);
        holder.add(body);
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 14, 14),
          makeMat(0xddd0a0, { roughness:.7 })
        );
        head.position.set(positions[i][0], positions[i][1] + 0.5, positions[i][2]);
        holder.add(head);
      }
      // pendant lamp
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        makeMat(accent, { emissive: accent, emissiveIntensity:.8 })
      );
      lamp.position.set(0, 1.2, 0);
      holder.add(lamp);
      mainObject = holder;
    }
    else if (kind === "receipt") {
      // A long thin printed receipt curling slightly
      const paperColor = 0xefe7d2;
      for (let i = 0; i < 7; i++) {
        const slip = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 0.16, 0.02),
          makeMat(paperColor, { roughness:.95 })
        );
        slip.position.set(0, 1.0 - i * 0.22, 0);
        slip.rotation.x = (i - 3) * 0.04;
        holder.add(slip);
        // line item bar
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 0.04, 0.005),
          makeMat(0x1a1a1a, { roughness:.9 })
        );
        line.position.set(-0.1, 1.0 - i * 0.22, 0.011);
        line.rotation.x = (i - 3) * 0.04;
        holder.add(line);
        // price box
        const price = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.04, 0.005),
          makeMat(accent, { roughness:.5 })
        );
        price.position.set(0.55, 1.0 - i * 0.22, 0.012);
        price.rotation.x = (i - 3) * 0.04;
        holder.add(price);
      }
      mainObject = holder;
    }
    else if (kind === "lineup") {
      // Five suspects against a height chart
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 2.4, 0.06),
        makeMat(0x2a2418, { roughness:.95 })
      );
      wall.position.set(0, 0, -0.6);
      holder.add(wall);
      // height-chart bars
      for (let i = 0; i < 7; i++) {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(4.0, 0.012, 0.005),
          makeMat(accent, { roughness:.5 })
        );
        bar.position.set(0, -1.1 + i * 0.32, -0.55);
        holder.add(bar);
      }
      // five figures
      for (let i = 0; i < 5; i++) {
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.28, 1.4, 10),
          makeMat(i === 3 ? accent : 0x3a3024, { roughness:.85 })
        );
        body.position.set(-1.6 + i * 0.8, -0.2, 0.1);
        holder.add(body);
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 18, 18),
          makeMat(i === 3 ? accent : 0x4a4030, { roughness:.7 })
        );
        head.position.set(-1.6 + i * 0.8, 0.7, 0.1);
        holder.add(head);
      }
      mainObject = holder;
    }
    else if (kind === "plate") {
      // License plate — a flat rectangle with raised character blocks
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.9, 0.06),
        makeMat(0xddd6c4, { roughness:.7, metalness:.3 })
      );
      holder.add(plate);
      // border
      const border = new THREE.Mesh(
        new THREE.BoxGeometry(2.66, 0.94, 0.04),
        makeMat(accent, { metalness:.7, roughness:.3 })
      );
      border.position.z = -0.02;
      holder.add(border);
      // 6 character slots — known letters/digits as solid blocks, missing as outlined frames
      const slots = [true, false, true, true, true, false]; // false = missing (the two ?'s)
      for (let i = 0; i < 6; i++) {
        const x = -1.05 + i * 0.42;
        if (slots[i]) {
          const c = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.6, 0.04),
            makeMat(0x1a1a1a, { roughness:.6 })
          );
          c.position.set(x, 0, 0.05);
          holder.add(c);
        } else {
          // hollow accent ring
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.18, 0.22, 4),
            makeMat(accent, { side: THREE.DoubleSide })
          );
          ring.position.set(x, 0, 0.05);
          ring.rotation.z = Math.PI / 4;
          holder.add(ring);
        }
      }
      mainObject = plate;
    }
    else if (kind === "snapshot") {
      // Polaroid frame floating, with desk items rendered as small blocks inside
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.8, 0.06),
        makeMat(0xefe7d2, { roughness:.95 })
      );
      holder.add(frame);
      const photo = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 2.0, 0.04),
        makeMat(0x1a1a1d, { roughness:.5 })
      );
      photo.position.set(0, 0.2, 0.04);
      holder.add(photo);
      // Inside-photo: typewriter base
      const tw = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.2, 0.4),
        makeMat(0x4a4030, { roughness:.7 })
      );
      tw.position.set(-0.35, -0.3, 0.07);
      holder.add(tw);
      // Mug
      const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16),
        makeMat(0xddd0a0, { roughness:.6 })
      );
      mug.position.set(0.4, -0.2, 0.07);
      holder.add(mug);
      // Mantel clock — a small disc at top
      const clock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24),
        makeMat(accent, { metalness:.8, roughness:.2 })
      );
      clock.rotation.x = Math.PI / 2;
      clock.position.set(0.5, 0.7, 0.07);
      holder.add(clock);
      // hour hand (small)
      const hour = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.13, 0.01), makeMat(0x111));
      hour.geometry.translate(0, 0.065, 0);
      hour.position.set(0.5, 0.7, 0.1);
      hour.rotation.z = -0.1;
      holder.add(hour);
      // minute hand (longer, points to 9 = -90deg from 12)
      const minH = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.01), makeMat(0x111));
      minH.geometry.translate(0, 0.09, 0);
      minH.position.set(0.5, 0.7, 0.11);
      minH.rotation.z = -Math.PI / 2;
      holder.add(minH);
      mainObject = frame;
    }
    else if (kind === "composite") {
      // Layered face composite — overlapping translucent panels
      for (let i = 0; i < 5; i++) {
        const slice = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.5, 0.04),
          makeMat(i === 2 ? accent : 0xddd0a0, {
            roughness:.7,
            transparent: true,
            opacity: 0.55 + i * 0.08
          })
        );
        slice.position.set((i - 2) * 0.05, 0.8 - i * 0.45, i * 0.04);
        slice.rotation.z = (i - 2) * 0.04;
        holder.add(slice);
      }
      // outline frame
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 2.6, 0.02),
        makeMat(accent, { metalness:.5 })
      );
      frame.position.z = -0.04;
      holder.add(frame);
      mainObject = holder;
    }
    else if (kind === "atbash") {
      // Two concentric letter wheels — outer normal, inner reversed
      const outer = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.08, 16, 64),
        makeMat(0xddd0a0, { metalness:.3, roughness:.6 })
      );
      holder.add(outer);
      const inner = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.08, 16, 48),
        makeMat(accent, { metalness:.7, roughness:.3 })
      );
      holder.add(inner);
      // tick marks around outer ring
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2;
        const tick = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.18, 0.04),
          makeMat(0x1a1a1a)
        );
        tick.position.set(Math.cos(a) * 1.4, Math.sin(a) * 1.4, 0);
        tick.rotation.z = a + Math.PI / 2;
        holder.add(tick);
      }
      // tick marks around inner ring (reversed)
      for (let i = 0; i < 26; i++) {
        const a = -(i / 26) * Math.PI * 2 + Math.PI;
        const tick = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.14, 0.03),
          makeMat(accent)
        );
        tick.position.set(Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0);
        tick.rotation.z = a + Math.PI / 2;
        holder.add(tick);
      }
      mainObject = outer;
    }
    else if (kind === "polybius") {
      // 5x5 grid of slate squares with row/col markers
      const cell = 0.36;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const sq = new THREE.Mesh(
            new THREE.BoxGeometry(cell * 0.9, 0.08, cell * 0.9),
            makeMat((r + c) % 2 === 0 ? 0xddd0a0 : 0x3a2a18, { roughness:.7 })
          );
          sq.position.set(-0.8 + c * cell, 0, 0.8 - r * cell);
          holder.add(sq);
        }
      }
      // accent edge bars (row and column index strips)
      for (let i = 0; i < 5; i++) {
        const rowMark = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.1, cell * 0.6),
          makeMat(accent, { metalness:.6 })
        );
        rowMark.position.set(-1.1, 0.05, 0.8 - i * cell);
        holder.add(rowMark);
        const colMark = new THREE.Mesh(
          new THREE.BoxGeometry(cell * 0.6, 0.1, 0.1),
          makeMat(accent, { metalness:.6 })
        );
        colMark.position.set(-0.8 + i * cell, 0.05, 1.1);
        holder.add(colMark);
      }
      holder.rotation.x = -0.4;
      mainObject = holder;
    }
    else if (kind === "morse") {
      // Telegraph key on a wood base, with dot/dash bars floating above
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.18, 0.9),
        makeMat(0x3a2a18, { roughness:.85 })
      );
      base.position.y = -0.4;
      holder.add(base);
      const lever = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.06, 0.12),
        makeMat(accent, { metalness:.8, roughness:.2 })
      );
      lever.position.set(0.1, -0.18, 0);
      lever.rotation.z = -0.08;
      holder.add(lever);
      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 16),
        makeMat(0x1a1a1a, { roughness:.4 })
      );
      knob.position.set(0.6, -0.05, 0);
      holder.add(knob);
      // floating dot/dash sequence
      const seq = [1,1,1, 0,1,0,1, 1,0, 1,0,1, 1,0,1,1, 1, 0]; // 1=dot 0=dash (S C A R L E T-ish)
      for (let i = 0; i < seq.length; i++) {
        const sym = new THREE.Mesh(
          seq[i] === 1
            ? new THREE.SphereGeometry(0.06, 12, 12)
            : new THREE.BoxGeometry(0.22, 0.05, 0.05),
          makeMat(accent, { emissive: accent, emissiveIntensity:.4 })
        );
        sym.position.set(-1.3 + (i * 0.18), 0.7, 0);
        holder.add(sym);
      }
      mainObject = base;
    }
    else if (kind === "vigenere") {
      // Two stacked cipher disks — outer ring, inner ring offset
      const outerRing = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.4, 0.1, 64, 1, true),
        makeMat(0xddd0a0, { roughness:.6, side: THREE.DoubleSide })
      );
      outerRing.rotation.x = Math.PI / 2;
      holder.add(outerRing);
      const innerDisk = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.05, 0.16, 48),
        makeMat(accent, { metalness:.6, roughness:.3 })
      );
      innerDisk.rotation.x = Math.PI / 2;
      innerDisk.position.z = 0.04;
      holder.add(innerDisk);
      const center = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.22, 24),
        makeMat(0x3a2a18, { roughness:.6 })
      );
      center.rotation.x = Math.PI / 2;
      holder.add(center);
      // outer letter ticks
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2;
        const tick = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.05, 0.16),
          makeMat(0x1a1a1a)
        );
        tick.position.set(Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0);
        holder.add(tick);
      }
      // inner letter ticks (rotated)
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + 0.5;
        const tick = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.04, 0.18),
          makeMat(0x1a1a1a)
        );
        tick.position.set(Math.cos(a) * 0.92, Math.sin(a) * 0.92, 0.04);
        holder.add(tick);
      }
      mainObject = outerRing;
    }
    else if (kind === "railfence") {
      // Three rails — three horizontal bars with zig-zag connectors
      for (let r = 0; r < 3; r++) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(3.6, 0.05, 0.05),
          makeMat(accent, { metalness:.7, roughness:.3 })
        );
        rail.position.y = 0.7 - r * 0.7;
        holder.add(rail);
      }
      // zigzag connectors (13 segments)
      for (let i = 0; i < 13; i++) {
        const cycle = i % 4;
        const yFromRow = cycle === 0 ? 0 : cycle === 1 ? 1 : cycle === 2 ? 2 : 1;
        const yToRow   = ((i + 1) % 4 === 0) ? 0
          : ((i + 1) % 4 === 1) ? 1
          : ((i + 1) % 4 === 2) ? 2 : 1;
        const xFrom = -1.7 + i * 0.28;
        const xTo   = -1.7 + (i + 1) * 0.28;
        const yFrom = 0.7 - yFromRow * 0.7;
        const yTo   = 0.7 - yToRow * 0.7;
        const dx = xTo - xFrom, dy = yTo - yFrom;
        const len = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const seg = new THREE.Mesh(
          new THREE.BoxGeometry(len, 0.025, 0.025),
          makeMat(0xddd0a0, { roughness:.6 })
        );
        seg.position.set((xFrom + xTo) / 2, (yFrom + yTo) / 2, 0);
        seg.rotation.z = angle;
        holder.add(seg);
      }
      // little dots at vertices
      for (let i = 0; i < 13; i++) {
        const cycle = i % 4;
        const yRow = cycle === 0 ? 0 : cycle === 1 ? 1 : cycle === 2 ? 2 : 1;
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 12, 12),
          makeMat(accent, { emissive: accent, emissiveIntensity:.3 })
        );
        dot.position.set(-1.7 + i * 0.28, 0.7 - yRow * 0.7, 0.05);
        holder.add(dot);
      }
      mainObject = holder;
    }
    else if (kind === "bookcipher") {
      // Open book with ribbon marker and indexed lines
      const left = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.05, 1.8),
        makeMat(0xefe7d2, { roughness:.95 })
      );
      left.position.set(-0.71, 0, 0);
      left.rotation.z = -0.06;
      holder.add(left);
      const right = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.05, 1.8),
        makeMat(0xefe7d2, { roughness:.95 })
      );
      right.position.set(0.71, 0, 0);
      right.rotation.z = 0.06;
      holder.add(right);
      // spine
      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.15, 1.85),
        makeMat(0x3a2a18, { roughness:.7 })
      );
      holder.add(spine);
      // text lines on left page
      for (let i = 0; i < 5; i++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.03, 0.005),
          makeMat(0x1a1a1a, { roughness:.9 })
        );
        line.position.set(-0.71, 0.04, -0.6 + i * 0.3);
        line.rotation.z = -0.06;
        holder.add(line);
      }
      // ribbon marker
      const ribbon = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.02, 1.0),
        makeMat(accent, { roughness:.4 })
      );
      ribbon.position.set(0, 0.06, 0.5);
      holder.add(ribbon);
      holder.rotation.x = -0.45;
      mainObject = holder;
    }
    else if (kind === "onetimepad") {
      // Punched paper tape — long ribbon with holes
      const tape = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.04, 0.7),
        makeMat(0xddd0a0, { roughness:.85 })
      );
      holder.add(tape);
      // sprocket holes (top edge) and data holes (random)
      for (let i = 0; i < 14; i++) {
        const sprocket = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12),
          makeMat(0x000)
        );
        sprocket.position.set(-2.0 + i * 0.3, 0.05, 0.28);
        holder.add(sprocket);
        // a data hole pattern (varies per column)
        for (let row = 0; row < 4; row++) {
          if ((i * 7 + row * 3) % 5 < 2) {
            const dot = new THREE.Mesh(
              new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12),
              makeMat(0x000)
            );
            dot.position.set(-2.0 + i * 0.3, 0.05, 0.1 - row * 0.12);
            holder.add(dot);
          }
        }
      }
      // accent strip running across (where pad aligns to cipher)
      const align = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.01, 0.05),
        makeMat(accent, { emissive: accent, emissiveIntensity:.5 })
      );
      align.position.set(0, 0.025, -0.18);
      holder.add(align);
      mainObject = tape;
    }
    else if (kind === "bridges") {
      // Königsberg: 4 landmasses + 7 bridges between them
      // Layout (y=0 plane):
      //   north bank (N) — top
      //   south bank (S) — bottom
      //   island A    — center-left
      //   island B    — center-right (downstream)
      const masses = [
        { name: "N", x: 0,   z: -1.4, r: 0.55 },
        { name: "S", x: 0,   z:  1.4, r: 0.55 },
        { name: "A", x: -0.9, z: 0,    r: 0.45 },
        { name: "B", x:  0.9, z: 0,    r: 0.45 },
      ];
      masses.forEach((m) => {
        const land = new THREE.Mesh(
          new THREE.CylinderGeometry(m.r, m.r * 1.05, 0.18, 24),
          makeMat(0x2f3a24, { roughness:.95 })
        );
        land.position.set(m.x, 0, m.z);
        holder.add(land);
      });
      // The seven bridges (N-A x2, S-A x2, N-B, S-B, A-B)
      const bridges = [
        ["N", "A", -0.15], ["N", "A", 0.15],
        ["S", "A", -0.15], ["S", "A", 0.15],
        ["N", "B", 0],
        ["S", "B", 0],
        ["A", "B", 0],
      ];
      const get = (n) => masses.find((m) => m.name === n);
      bridges.forEach(([from, to, lateralOffset]) => {
        const a = get(from), b = get(to);
        const dx = b.x - a.x, dz = b.z - a.z;
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(dz, dx);
        const span = new THREE.Mesh(
          new THREE.BoxGeometry(len, 0.04, 0.10),
          makeMat(accent, { metalness:.5, roughness:.4 })
        );
        const ox = -Math.sin(angle) * lateralOffset;
        const oz =  Math.cos(angle) * lateralOffset;
        span.position.set((a.x + b.x) / 2 + ox, 0.08, (a.z + b.z) / 2 + oz);
        span.rotation.y = -angle;
        holder.add(span);
      });
      // The river — two thin dark bands behind the masses
      const river1 = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.01, 0.45),
        makeMat(0x101820, { roughness:.4 })
      );
      river1.position.set(0, -0.05, -0.55);
      holder.add(river1);
      const river2 = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.01, 0.45),
        makeMat(0x101820, { roughness:.4 })
      );
      river2.position.set(0, -0.05, 0.55);
      holder.add(river2);
      holder.rotation.x = -0.55;
      mainObject = holder;
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
