export function Vinyl({
  size = 180,
  spinning = false,
  label = "Now playing",
  color = "var(--balm-peach)",
}: {
  size?: number;
  spinning?: boolean;
  label?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          animation: spinning ? "vinyl-spin 4s linear infinite" : undefined,
          background:
            "radial-gradient(circle at 50% 50%, #241a16 0 28%, #16100e 28% 100%)",
          boxShadow: "0 18px 40px -18px rgba(0,0,0,0.6)",
        }}
        aria-hidden
      >
        {/* grooves */}
        {[0.92, 0.82, 0.72, 0.62, 0.52].map((r) => (
          <span
            key={r}
            className="absolute rounded-full border"
            style={{
              inset: `${((1 - r) / 2) * 100}%`,
              borderColor: "rgba(255,255,255,0.07)",
            }}
          />
        ))}
        {/* sheen */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.16) 0 12%, transparent 32% 68%, rgba(255,255,255,0.10) 88% 100%)",
          }}
        />
        {/* center label */}
        <span
          className="absolute rounded-full"
          style={{
            inset: "34%",
            background: `radial-gradient(circle at 40% 35%, color-mix(in oklab, ${color} 85%, white), ${color})`,
          }}
        />
        <span
          className="absolute rounded-full bg-background"
          style={{ inset: "47.5%" }}
        />
      </div>
      <p className="max-w-48 truncate text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
