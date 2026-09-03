import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { completeSpotifyLogin } from "@/lib/spotifyAuth";

export const Route = createFileRoute("/spotify-callback")({
  component: SpotifyCallback,
  head: () => ({
    meta: [
      { title: "Connecting Spotify | Balm Focus" },
      { name: "description", content: "Finishing your Spotify connection for focus sessions." },
      { property: "og:title", content: "Connecting Spotify | Balm Focus" },
      { property: "og:description", content: "Finishing your Spotify connection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SpotifyCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Connecting your Spotify account…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    if (error) {
      setMessage(`Spotify login cancelled (${error}).`);
      return;
    }
    if (!code) {
      setMessage("Missing authorization code.");
      return;
    }
    completeSpotifyLogin(code)
      .then(() => navigate({ to: "/" }))
      .catch(() => setMessage("Could not finish the Spotify login. Please try again."));
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
    </main>
  );
}
