import { createServerFn } from "@tanstack/react-start";

/** Client ID is public by design (PKCE flow) — served from the secret store. */
export const getSpotifyClientId = createServerFn({ method: "GET" }).handler(async () => {
  return { clientId: process.env["SPOTIFY_CLIENT_ID"] ?? "" };
});
