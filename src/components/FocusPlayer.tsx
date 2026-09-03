import { useMemo, useState } from "react";
import { useLocalState } from "@/lib/storage";
import { Turntable } from "@/components/Turntable";
import { beginSpotifyLogin, useSpotifyAccount } from "@/lib/spotifyAuth";

export const SPOTIFY_KEY = "balm.spotify";

export const PRESETS = [
  { label: "Lo-fi beats", url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn" },
  { label: "Deep focus", url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ" },
  { label: "Peaceful piano", url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO" },
  { label: "Instrumental study", url: "https://open.spotify.com/playlist/37i9dQZF1DX9sIqqvKsjG8" },
] as const;

export function playlistLabel(url: string): string {
  return PRESETS.find((p) => p.url === url)?.label ?? "Your playlist";
}

/** Turn a Spotify share link or URI into an embed URL. Returns null if unrecognised. */
export function toSpotifyEmbed(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  const uri = value.match(/^spotify:(playlist|album|track|show|episode|artist):([A-Za-z0-9]+)/);
  if (uri) return `https://open.spotify.com/embed/${uri[1]}/${uri[2]}`;
  const url = value.match(
    /open\.spotify\.com\/(?:embed\/)?(playlist|album|track|show|episode|artist)\/([A-Za-z0-9]+)/,
  );
  if (url) return `https://open.spotify.com/embed/${url[1]}/${url[2]}`;
  return null;
}

export function FocusPlayer({ running = false }: { running?: boolean }) {
  const [saved, setSaved] = useLocalState<string>(
    SPOTIFY_KEY,
    PRESETS[0].url,
  );
  const [draft, setDraft] = useState("");
  const embed = useMemo(() => toSpotifyEmbed(saved), [saved]);
  const draftInvalid = draft.trim().length > 0 && !toSpotifyEmbed(draft);
  const { token, profile, now, control, logout } = useSpotifyAccount();
  const [authError, setAuthError] = useState<string | null>(null);

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Focus soundtrack</h2>
          <p className="text-sm text-muted-foreground">
            Pick a playlist and let it run while your balm fills.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = saved === p.url;
          return (
            <button
              key={p.url}
              onClick={() => setSaved(p.url)}
              className={
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors " +
                (active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && toSpotifyEmbed(draft)) {
              setSaved(draft.trim());
              setDraft("");
            }
          }}
          placeholder="Paste any Spotify playlist, album or track link"
          className="min-w-56 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          aria-label="Spotify link"
        />
        <button
          onClick={() => {
            if (!toSpotifyEmbed(draft)) return;
            setSaved(draft.trim());
            setDraft("");
          }}
          disabled={!toSpotifyEmbed(draft)}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Load
        </button>
      </div>
      {draftInvalid && (
        <p className="mt-2 text-xs text-destructive">
          That doesn't look like a Spotify link.
        </p>
      )}

      <div className="mt-6 flex flex-col items-center gap-6 md:flex-row md:items-center">
        <Turntable
          size={220}
          spinning={running || Boolean(now?.isPlaying)}
          cover={now?.cover ?? null}
          title={now?.title ?? playlistLabel(saved)}
          subtitle={now?.artist ?? "record player"}
        />
        <div className="flex-1 self-stretch overflow-hidden rounded-2xl border border-border">
        {embed ? (
          <iframe
            key={embed}
            title="Spotify player"
            src={`${embed}?utm_source=generator&theme=0`}
            width="100%"
            height="352"
            style={{ border: 0 }}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Choose a playlist above to start the music.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-background p-4">
        {token ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                Connected as {profile?.name ?? "your Spotify account"}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.product === "premium"
                  ? "Premium — controls below drive your active Spotify device."
                  : "Free account — playback controls need Spotify Premium."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => control("previous")}
                className="rounded-full border border-border px-3 py-2 text-sm font-semibold hover:border-foreground/40"
              >
                ⏮
              </button>
              <button
                onClick={() => control(now?.isPlaying ? "pause" : "play")}
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
              >
                {now?.isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => control("next")}
                className="rounded-full border border-border px-3 py-2 text-sm font-semibold hover:border-foreground/40"
              >
                ⏭
              </button>
              <button
                onClick={logout}
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Log in with Spotify to show the real album cover on the record and control playback.
            </p>
            <button
              onClick={() =>
                beginSpotifyLogin().catch((e: Error) => setAuthError(e.message))
              }
              className="rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background hover:opacity-90"
            >
              Log in with Spotify
            </button>
          </div>
        )}
        {authError && <p className="mt-2 text-xs text-destructive">{authError}</p>}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Free Spotify accounts get 30-second previews; Premium is required for in-app playback control.
      </p>
    </section>
  );
}
