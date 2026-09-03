export function Turntable({
  size = 240,
  spinning = false,
  cover = null,
  title = "Now playing",
  subtitle,
  color = "var(--balm-peach)",
}: {
  size?: number;
  spinning?: boolean;
  cover?: string | null;
  title?: string;
  subtitle?: string;
  color?: string;
}) {
  const deck = size;
  const record = size * 0.82;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-2xl border border-border shadow-lg"
        style={{
          width: deck,
          height: deck * 0.92,
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--card) 88%, black), var(--card))",
        }}
      >
        {/* platter */}
        <div
          className="absolute rounded-full"
          style={{
            width: record,
            height: record,
            left: deck * 0.04,
            top: (deck * 0.92 - record) / 2,
            background: "radial-gradient(circle at 50% 50%, #241a16 0 30%, #14100e 30% 100%)",
            boxShadow: "0 14px 30px -14px rgba(0,0,0,0.7)",
            animation: spinning ? "vinyl-spin 4s linear infinite" : undefined,
          }}
          aria-hidden
        >
          {[0.94, 0.86, 0.78, 0.7, 0.62].map((r) => (
            <span
              key={r}
              className="absolute rounded-full border"
              style={{
                inset: `${((1 - r) / 2) * 100}%`,
                borderColor: "rgba(255,255,255,0.07)",
              }}
            />
          ))}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(115deg, rgba(255,255,255,0.15) 0 12%, transparent 32% 68%, rgba(255,255,255,0.09) 88% 100%)",
            }}
          />
          {/* album cover as the record label */}
          <span
            className="absolute overflow-hidden rounded-full"
            style={{
              inset: "32%",
              background: cover
                ? undefined
                : `radial-gradient(circle at 40% 35%, color-mix(in oklab, ${color} 85%, white), ${color})`,
            }}
          >
            {cover && (
              <img
                src={cover}
                alt={`${title} album cover`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            )}
          </span>
          <span className="absolute rounded-full bg-background" style={{ inset: "47.5%" }} />
        </div>

        {/* tonearm */}
        <div
          aria-hidden
          className="absolute origin-top-right transition-transform duration-700"
          style={{
            right: deck * 0.11,
            top: deck * 0.13,
            width: deck * 0.06,
            height: deck * 0.06,
            transform: `rotate(${spinning ? 22 : 0}deg)`,
          }}
        >
          <span
            className="absolute rounded-full border border-border"
            style={{
              width: deck * 0.1,
              height: deck * 0.1,
              right: 0,
              top: 0,
              background: "linear-gradient(140deg, #d9d5d1, #8f8b87)",
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: deck * 0.4,
              height: Math.max(3, deck * 0.017),
              right: deck * 0.03,
              top: deck * 0.05,
              transformOrigin: "right center",
              transform: "rotate(35deg)",
              background: "linear-gradient(90deg, #f0eeec, #a5a09b)",
            }}
          />
        </div>

        {/* control blocks */}
        <div
          aria-hidden
          className="absolute flex flex-col gap-1"
          style={{ right: deck * 0.05, bottom: deck * 0.08, width: deck * 0.14 }}
        >
          <span className="h-2 rounded-sm bg-foreground/15" />
          <span className="h-2 rounded-sm bg-foreground/15" />
          <span className="h-1.5 w-2/3 rounded-sm" style={{ background: color, opacity: 0.7 }} />
        </div>
      </div>

      <div className="max-w-56 text-center">
        <p className="truncate text-sm font-semibold">{title}</p>
        {subtitle && (
          <p className="truncate text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
