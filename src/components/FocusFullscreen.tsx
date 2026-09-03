import { useEffect, useMemo } from "react";
import { LipBalm } from "@/components/LipBalm";
import { Turntable } from "@/components/Turntable";
import {
  PRESETS,
  SPOTIFY_KEY,
  playlistLabel,
  toSpotifyEmbed,
} from "@/components/FocusPlayer";
import { useLocalState } from "@/lib/storage";
import { useSpotifyAccount } from "@/lib/spotifyAuth";

export function FocusFullscreen({
  open,
  onClose,
  fill,
  color,
  label,
  time,
  running,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  fill: number;
  color: string;
  label: string;
  time: string;
  running: boolean;
  onToggle: () => void;
}) {
  const [playlist] = useLocalState<string>(SPOTIFY_KEY, PRESETS[0].url);
  const embed = useMemo(() => toSpotifyEmbed(playlist), [playlist]);
  const { now } = useSpotifyAccount();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/3 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: color, opacity: 0.25 }}
      />
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 py-8">
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            focus mode
          </span>
          <button
            onClick={onClose}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:border-foreground/40"
          >
            Exit full screen
          </button>
        </div>

        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-10 md:flex-row md:gap-16">
          <LipBalm fill={fill} color={color} size={300} animated={running} label={label} />
          <div className="flex flex-col items-center gap-8">
            <Turntable
              size={260}
              spinning={running || Boolean(now?.isPlaying)}
              color={color}
              cover={now?.cover ?? null}
              title={now?.title ?? playlistLabel(playlist)}
              subtitle={now?.artist ?? "record player"}
            />
            <div className="text-center">
              <div className="font-display text-7xl font-semibold tabular-nums tracking-tight">
                {time}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {Math.round(fill * 100)}% filled
              </div>
            </div>
            <button
              onClick={onToggle}
              className={
                "rounded-full px-10 py-3 font-bold transition active:scale-95 " +
                (running
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110")
              }
            >
              {running ? "Pause" : "Resume"}
            </button>
          </div>
        </div>

        {embed && (
          <div className="mt-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border">
            <iframe
              key={embed}
              title="Spotify player"
              src={`${embed}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              style={{ border: 0 }}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          </div>
        )}
      </div>
    </div>
  );
}
