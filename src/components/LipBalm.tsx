type Props = {
  /** 0 to 1 fill ratio */
  fill: number;
  color?: string;
  size?: number;
  /** when true, the cap lifts off and a beaker pours liquid into the tube */
  animated?: boolean;
  label?: string;
};

/**
 * A cute lip balm tube that fills up from the bottom as `fill` increases (0..1).
 * While `animated` (focus session running) the cap lifts off and a beaker
 * pours a stream of liquid into the open tube.
 */
export function LipBalm({ fill, color = "var(--balm-pink)", size = 220, animated = false, label }: Props) {
  const clamped = Math.max(0, Math.min(1, fill));
  const bodyTop = 90; // y where balm body begins (below cap)
  const bodyBottom = 340;
  const bodyHeight = bodyBottom - bodyTop;
  const fillY = bodyBottom - clamped * bodyHeight;
  const uid = color.replace(/[^a-z0-9]/gi, "");
  const capId = `capGrad-${uid}`;
  const balmId = `balmGrad-${uid}`;
  const open = animated;

  return (
    <div className="relative inline-flex flex-col items-center gap-3" style={{ width: size }}>
      <svg
        viewBox="0 0 200 400"
        width={size}
        height={size * 2}
        className="drop-shadow-xl"
        aria-label={label ?? "Lip balm tube"}
      >
        <defs>
          <linearGradient id={capId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--balm-cream)" />
            <stop offset="1" stopColor="var(--muted)" />
          </linearGradient>
          <linearGradient id={balmId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.95" />
            <stop offset="1" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <clipPath id={`tubeClip-${uid}`}>
            <rect x="46" y={bodyTop} width="108" height={bodyHeight} rx="10" />
          </clipPath>
        </defs>

        {/* Cap — lifts off and tilts aside while pouring */}
        <g
          style={{
            transform: open ? "translate(46px, -6px) rotate(-18deg)" : "translate(0px, 0px)",
            transformOrigin: "100px 50px",
            transition: "transform 600ms cubic-bezier(0.34, 1.4, 0.64, 1)",
          }}
        >
          <rect x="42" y="10" width="116" height="80" rx="14" fill={`url(#${capId})`} stroke="var(--border)" strokeWidth="2" />
          <rect x="52" y="22" width="96" height="10" rx="4" fill="var(--balm-cream)" opacity="0.7" />
        </g>

        {/* Beaker pouring in — only while a session runs */}
        {open && (
          <g style={{ animation: "beaker-tilt 3.2s ease-in-out infinite", transformOrigin: "40px 60px" }}>
            {/* beaker body (tilted) */}
            <g transform="rotate(38 40 60)">
              <path
                d="M18 20 L62 20 L58 78 Q58 86 50 86 L30 86 Q22 86 22 78 Z"
                fill="var(--card)"
                stroke="var(--border)"
                strokeWidth="3"
                opacity="0.95"
              />
              <path d="M22 52 L58 52 L58 78 Q58 86 50 86 L30 86 Q22 86 22 78 Z" fill={color} opacity="0.85" />
              <rect x="16" y="16" width="48" height="7" rx="3.5" fill="var(--muted)" stroke="var(--border)" strokeWidth="2" />
              <rect x="26" y="30" width="16" height="3" rx="1.5" fill="var(--border)" opacity="0.6" />
              <rect x="26" y="40" width="10" height="3" rx="1.5" fill="var(--border)" opacity="0.6" />
            </g>
          </g>
        )}

        {/* Pouring stream into the open tube */}
        {open && (
          <g>
            <path
              d="M62 78 C 78 96, 92 100, 100 120"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
              style={{ animation: "pour-stream 1.1s ease-in-out infinite" }}
            />
            <circle cx="100" cy={Math.max(fillY - 6, bodyTop + 6)} r="7" fill={color} opacity="0.5">
              <animate attributeName="r" values="5;10;5" dur="1.1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.55;0;0.55" dur="1.1s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* Tube body */}
        <rect
          x="46"
          y={bodyTop}
          width="108"
          height={bodyHeight}
          rx="10"
          fill="var(--balm-cream)"
          fillOpacity="0.9"
          stroke="var(--border)"
          strokeWidth="2"
        />
        {/* open rim when cap is off */}
        {open && <ellipse cx="100" cy={bodyTop} rx="54" ry="8" fill="var(--muted)" stroke="var(--border)" strokeWidth="2" />}

        {/* Liquid fill (clipped inside tube) */}
        <g clipPath={`url(#tubeClip-${uid})`}>
          <rect
            x="46"
            y={fillY}
            width="108"
            height={bodyBottom - fillY + 20}
            fill={`url(#${balmId})`}
            style={{ transition: "y 700ms cubic-bezier(0.4, 0, 0.2, 1), height 700ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          {/* meniscus wobble */}
          <ellipse
            cx="100"
            cy={fillY}
            rx="54"
            ry="6"
            fill={color}
            opacity="0.9"
            style={{ transition: "cy 700ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          <ellipse
            cx="82"
            cy={fillY + 2}
            rx="14"
            ry="3"
            fill="white"
            opacity="0.35"
            style={{ transition: "cy 700ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </g>

        {/* Highlight on tube */}
        <rect x="56" y={bodyTop + 6} width="10" height={bodyHeight - 12} rx="5" fill="white" opacity="0.25" />

        {/* Base */}
        <rect x="38" y="340" width="124" height="24" rx="6" fill={`url(#${capId})`} stroke="var(--border)" strokeWidth="2" />

        {/* Label */}
        <rect x="60" y="170" width="80" height="90" rx="6" fill="white" opacity="0.85" stroke="var(--border)" />
        <text
          x="100"
          y="220"
          textAnchor="middle"
          fontFamily="Fraunces, serif"
          fontSize="16"
          fontWeight="600"
          fill="var(--foreground)"
        >
          balm
        </text>
        <text
          x="100"
          y="240"
          textAnchor="middle"
          fontFamily="Nunito, sans-serif"
          fontSize="9"
          fill="var(--muted-foreground)"
          letterSpacing="2"
        >
          {label ? label.toUpperCase().slice(0, 10) : "FOCUS · CO."}
        </text>
      </svg>
    </div>
  );
}

/** Small version for shelf display */
export function LipBalmMini({ fill = 1, color = "var(--balm-pink)", label }: { fill?: number; color?: string; label?: string }) {
  return <LipBalm fill={fill} color={color} size={90} label={label} />;
}
