/** Layered paper-cut foliage for the auth screens.
 *
 *  Drawn as inline SVG rather than shipped as an image: it stays crisp at every
 *  panel size, weighs almost nothing, and the palette is defined here rather
 *  than baked into a raster file. The artwork is decorative, so the root <svg>
 *  is hidden from assistive technology.
 *
 *  Construction: six paper layers whose right edges are wavy vertical cuts,
 *  painted back-to-front from deep forest to near-white, each casting a soft
 *  shadow onto the layer beneath. Palm fronds and monstera leaves are then laid
 *  over the dark side, as though cut from the same paper.
 */

const LAYERS = [
  // Painted back to front: the widest, darkest sheet first. The pale sheets are
  // deliberately narrow — the cut edges belong near the seam with the form, and
  // deep forest carries the rest of the panel.
  { fill: "#14261C", edge: "M0,0 H600 V1000 H0 Z" },
  {
    fill: "#1E3527",
    edge: "M0,0 H300 C316,150 250,250 280,390 C312,540 240,650 272,790 C296,896 250,952 262,1000 H0 Z",
  },
  {
    fill: "#2C4A38",
    edge: "M0,0 H238 C256,140 190,246 220,382 C252,520 180,640 212,780 C236,884 190,944 204,1000 H0 Z",
  },
  {
    fill: "#5E7A69",
    edge: "M0,0 H182 C202,132 132,242 162,376 C194,512 122,632 154,772 C178,876 132,940 148,1000 H0 Z",
  },
  {
    fill: "#AFBBB0",
    edge: "M0,0 H128 C150,124 80,238 110,370 C142,504 70,624 102,764 C126,868 80,936 98,1000 H0 Z",
  },
  {
    fill: "#DFE3DC",
    edge: "M0,0 H78 C100,118 30,234 60,364 C92,496 20,618 52,758 C76,862 30,932 50,1000 H0 Z",
  },
  {
    fill: "#F6F6F3",
    edge: "M0,0 H34 C58,112 -12,230 20,358 C52,488 -20,612 12,752 C36,856 -8,928 14,1000 H0 Z",
  },
] as const;

/** One palm frond: a curved rachis with tapered blades down both sides.
 *  Generated rather than hand-drawn so the blades stay evenly distributed. */
function Frond({
  blades = 15,
  length = 300,
  reach = 46,
  fill,
}: {
  blades?: number;
  length?: number;
  reach?: number;
  fill: string;
}) {
  const leaflets = Array.from({ length: blades }, (_, index) => {
    const t = (index + 1) / (blades + 1);
    // Along the rachis, which bows gently upward.
    const x = t * length;
    const y = -Math.sin(t * Math.PI) * 26;
    // Blades are longest in the middle third and sweep back toward the tip.
    const span = reach * Math.sin(t * Math.PI) ** 0.45;
    const sweep = 26 + t * 30;
    return { x, y, span, sweep, key: index };
  });

  return (
    <g fill={fill}>
      {leaflets.map(({ x, y, span, sweep, key }) => (
        <g key={key}>
          <path d={`M${x},${y} Q${x + sweep * 0.5},${y - span * 0.75} ${x + sweep},${y - span} Q${x + sweep * 0.32},${y - span * 0.34} ${x + 5},${y}Z`} />
          <path d={`M${x},${y} Q${x + sweep * 0.5},${y + span * 0.75} ${x + sweep},${y + span} Q${x + sweep * 0.32},${y + span * 0.34} ${x + 5},${y}Z`} />
        </g>
      ))}
      <path
        d={`M0,0 Q${length * 0.5},-26 ${length},0 Q${length * 0.5},-20 0,4Z`}
        opacity="0.92"
      />
    </g>
  );
}

/** Monstera leaf: an ovate blade pointing right, with the characteristic
 *  fenestration — wedges cut inward from the margin toward the midrib, plus a
 *  couple of holes beside it. Cut with a mask so the leaf reads correctly over
 *  whichever paper layer sits behind it. */
function Monstera({ id, size = 200, fill }: { id: string; size?: number; fill: string }) {
  const maskId = `monstera-${id}`;
  const s = size;
  // Wedge positions along the midrib, as a fraction of leaf length.
  const notches = [0.26, 0.45, 0.63, 0.79];

  const wedge = (t: number, side: 1 | -1) => {
    const x = s * t;
    const depth = s * 0.1; // stops short of the midrib, as on a real leaf
    const halfWidth = s * (0.055 - t * 0.022);
    const outer = side * s * 0.62;
    const lean = s * 0.09 * t; // wedges sweep toward the tip
    return `M${x + lean},${side * depth} L${x - halfWidth + lean * 1.6},${outer} L${x + halfWidth + lean * 1.9},${outer} Z`;
  };

  return (
    <g>
      <mask id={maskId} maskUnits="userSpaceOnUse" x={-s * 0.2} y={-s} width={s * 1.5} height={s * 2}>
        <rect x={-s * 0.2} y={-s} width={s * 1.5} height={s * 2} fill="#000" />
        {/* Blade */}
        <path
          d={`M0,0
              C${s * 0.06},${-s * 0.26} ${s * 0.3},${-s * 0.47} ${s * 0.58},${-s * 0.44}
              C${s * 0.84},${-s * 0.41} ${s * 1.02},${-s * 0.2} ${s * 1.04},${-s * 0.02}
              C${s * 1.02},${s * 0.2} ${s * 0.84},${s * 0.41} ${s * 0.58},${s * 0.44}
              C${s * 0.3},${s * 0.47} ${s * 0.06},${s * 0.26} 0,0Z`}
          fill="#fff"
        />
        {/* Fenestration */}
        {notches.map((t) => (
          <g key={t}>
            <path d={wedge(t, -1)} fill="#000" />
            <path d={wedge(t, 1)} fill="#000" />
          </g>
        ))}
        <ellipse cx={s * 0.34} cy={-s * 0.13} rx={s * 0.035} ry={s * 0.07} fill="#000" transform={`rotate(-18 ${s * 0.34} ${-s * 0.13})`} />
        <ellipse cx={s * 0.36} cy={s * 0.14} rx={s * 0.032} ry={s * 0.065} fill="#000" transform={`rotate(18 ${s * 0.36} ${s * 0.14})`} />
      </mask>
      <rect
        x={-s * 0.2}
        y={-s}
        width={s * 1.5}
        height={s * 2}
        fill={fill}
        mask={`url(#${maskId})`}
      />
    </g>
  );
}

export function PaperCutLeaves({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <filter id="paper-lift" x="-30%" y="-10%" width="160%" height="130%">
          <feDropShadow dx="-10" dy="0" stdDeviation="14" floodColor="#0d1b14" floodOpacity="0.28" />
        </filter>
        <filter id="leaf-lift" x="-40%" y="-40%" width="190%" height="190%">
          <feDropShadow dx="-6" dy="10" stdDeviation="12" floodColor="#08130d" floodOpacity="0.38" />
        </filter>
        <linearGradient id="depth" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#0b1710" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b1710" stopOpacity="0.38" />
        </linearGradient>
      </defs>

      {LAYERS.map((layer, index) => (
        <path
          key={layer.fill}
          d={layer.edge}
          fill={layer.fill}
          filter={index === 0 ? undefined : "url(#paper-lift)"}
        />
      ))}

      {/* Foliage on the dark side, angled in from the right so the blades spill
          across the wave edges the way cut paper overlaps. Each leaf is a shade
          lighter than the sheet behind it, which is what gives a paper stack
          its depth; the drop shadow does the rest. */}
      <g filter="url(#leaf-lift)">
        <g transform="translate(612 300) rotate(163)">
          <Monstera id="1" size={196} fill="#2B4736" />
        </g>
        <g transform="translate(648 560) rotate(199)">
          <Monstera id="2" size={232} fill="#223B2C" />
        </g>
        <g transform="translate(566 690) rotate(168)">
          <Monstera id="3" size={168} fill="#375A44" />
        </g>
        <g transform="translate(676 800) rotate(177)">
          <Frond fill="#2E4C39" length={392} reach={66} blades={17} />
        </g>
        <g transform="translate(690 946) rotate(205)">
          <Frond fill="#23402F" length={352} reach={58} blades={15} />
        </g>
        <g transform="translate(596 1046) rotate(231)">
          <Frond fill="#1A3123" length={286} reach={48} blades={13} />
        </g>
      </g>

      <rect x="0" y="0" width="600" height="1000" fill="url(#depth)" />
    </svg>
  );
}
