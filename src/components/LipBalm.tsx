type Props = {
  /** 0 to 1 fill ratio */
  fill: number;
  color?: string;
  size?: number;
  animated?: boolean;
  label?: string;
};

/**
 * A cute lip balm tube that fills up from the bottom as `fill` increases (0..1).
 * The cream inside the tube visually rises like liquid.
 */
export function LipBalm({ fill, color = "var(--balm-pink)", size = 220, animated = false, label }: Props) {
  const clamped = Math.max(0, Math.min(1, fill));
  const bodyTop = 90; // y where balm body begins (below cap)
  const bodyBottom = 340;
  const bodyHeight = bodyBottom - bodyTop;
  const fillY = bodyBottom - clamped * bodyHeight;
  const capId = `capGrad-${color.replace(/[^a-z0-9]/gi, "")}`;
  const balmId = `balmGrad-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <div className="relative inline-flex flex-col items-center gap-3" style={{ width: size }}>
      <svg
        viewBox="0 0 200 400"
        width={size}
        height={size * 2}
        className={animated ? "drop-shadow-xl [animation:balm-shimmer_4s_ease-in-out_infinite]" : "drop-shadow-xl"}
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
          <clipPath id={`tubeClip-${capId}`}>
            <rect x="46" y={bodyTop} width="108" height={bodyHeight} rx="10" />
          </clipPath>
        </defs>

        {/* Cap */}
        <rect x="42" y="10" width="116" height="80" rx="14" fill={`url(#${capId})`} stroke="var(--border)" strokeWidth="2" />
        <rect x="52" y="22" width="96" height="10" rx="4" fill="var(--balm-cream)" opacity="0.7" />

        {/* Tube body */}
        <rect x="46" y={bodyTop} width="108" height={bodyHeight} rx="10" fill="var(--balm-cream)" stroke="var(--border)" strokeWidth="2" />

        {/* Liquid fill (clipped inside tube) */}
        <g clipPath={`url(#tubeClip-${capId})`}>
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