import { useCallback, useEffect, useState } from "react";
import { getSpotifyClientId } from "@/lib/spotify.functions";

const TOKEN_KEY = "balm.spotify.token";
const VERIFIER_KEY = "balm.spotify.verifier";
const PREVIEW_CALLBACK =
  "https://id-preview--fc635675-4e4c-49bb-800f-051ef3f49324.lovable.app/spotify-callback";
const PUBLISHED_CALLBACK = "https://focusbalm.lovable.app/spotify-callback";

export const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
].join(" ");

export type SpotifyToken = {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
};

export function redirectUri() {
  const { hostname, origin } = window.location;
  if (hostname === "focusbalm.lovable.app") return PUBLISHED_CALLBACK;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://127.0.0.1:8080/spotify-callback";
  }
  if (hostname.endsWith(".lovable.app")) return `${origin}/spotify-callback`;
  return PREVIEW_CALLBACK;
}

export function readToken(): SpotifyToken | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as SpotifyToken) : null;
  } catch {
    return null;
  }
}

export function writeToken(t: SpotifyToken | null) {
  if (typeof window === "undefined") return;
  if (t) window.localStorage.setItem(TOKEN_KEY, JSON.stringify(t));
  else window.localStorage.removeItem(TOKEN_KEY);
}

function randomString(len: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

async function challenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function beginSpotifyLogin() {
  // Open the popup during the click gesture: inside the editor preview iframe a
  // top-level redirect to accounts.spotify.com is blocked, and popup blockers
  // reject windows opened after an await.
  const popup = window.open("about:blank", "spotify-login", "width=480,height=720");
  try {
    const { clientId } = await getSpotifyClientId();
    if (!clientId) throw new Error("Spotify isn't configured yet.");
    const verifier = randomString(64);
    window.localStorage.setItem(VERIFIER_KEY, verifier);
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri(),
      code_challenge_method: "S256",
      code_challenge: await challenge(verifier),
      scope: SPOTIFY_SCOPES,
    });
    const url = `https://accounts.spotify.com/authorize?${params}`;
    if (popup && !popup.closed) popup.location.href = url;
    else window.open(url, "_blank", "noopener");
  } catch (e) {
    popup?.close();
    throw e;
  }
}

async function tokenRequest(body: Record<string, string>) {
  const { clientId } = await getSpotifyClientId();
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, ...body }),
  });
  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  const token: SpotifyToken = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + json.expires_in * 1000 - 60_000,
  };
  writeToken(token);
  return token;
}

export async function completeSpotifyLogin(code: string, callbackUri = redirectUri()) {
  const verifier = window.localStorage.getItem(VERIFIER_KEY) ?? "";
  window.localStorage.removeItem(VERIFIER_KEY);
  if (!verifier) throw new Error("Spotify login session expired. Please try again.");
  return tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: callbackUri,
    code_verifier: verifier,
  });
}

export async function getFreshToken(): Promise<string | null> {
  const token = readToken();
  if (!token) return null;
  if (Date.now() < token.expires_at) return token.access_token;
  if (!token.refresh_token) {
    writeToken(null);
    return null;
  }
  try {
    const next = await tokenRequest({
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
    });
    return next.access_token;
  } catch {
    writeToken(null);
    return null;
  }
}

export type NowPlaying = {
  title: string;
  artist: string;
  cover: string | null;
  isPlaying: boolean;
};

/** Polls the user's currently playing track. */
export function useSpotifyAccount() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ name: string; product: string } | null>(null);
  const [now, setNow] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sync = () => getFreshToken().then((t) => !cancelled && setToken(t));
    sync();
    const onMessage = (e: MessageEvent) => {
      const allowedOrigins = new Set([
        window.location.origin,
        new URL(PREVIEW_CALLBACK).origin,
        new URL(PUBLISHED_CALLBACK).origin,
        "http://127.0.0.1:8080",
      ]);
      if (!allowedOrigins.has(e.origin) || e.data?.type !== "spotify-auth") return;
      const code = typeof e.data.code === "string" ? e.data.code : "";
      const callbackUri = typeof e.data.redirectUri === "string" ? e.data.redirectUri : "";
      if (!code || !callbackUri) return;
      completeSpotifyLogin(code, callbackUri)
        .then(sync)
        .catch(() => setToken(null));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) sync();
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setProfile({ name: d.display_name ?? "Spotify user", product: d.product }))
      .catch(() => {});
  }, [token]);

  const poll = useCallback(async () => {
    const t = await getFreshToken();
    if (!t) return;
    const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (res.status === 204 || !res.ok) return;
    const data = await res.json();
    const item = data?.item;
    if (!item) return;
    setNow({
      title: item.name,
      artist: (item.artists ?? []).map((a: { name: string }) => a.name).join(", "),
      cover: item.album?.images?.[0]?.url ?? null,
      isPlaying: Boolean(data.is_playing),
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    poll();
    const id = window.setInterval(poll, 5000);
    return () => window.clearInterval(id);
  }, [token, poll]);

  const control = useCallback(
    async (action: "play" | "pause" | "next" | "previous") => {
      const t = await getFreshToken();
      if (!t) return;
      const method = action === "next" || action === "previous" ? "POST" : "PUT";
      await fetch(`https://api.spotify.com/v1/me/player/${action}`, {
        method,
        headers: { Authorization: `Bearer ${t}` },
      });
      window.setTimeout(poll, 600);
    },
    [poll],
  );

  const logout = useCallback(() => {
    writeToken(null);
    setToken(null);
    setProfile(null);
    setNow(null);
  }, []);

  return { token, profile, now, control, logout, refresh: poll };
}
