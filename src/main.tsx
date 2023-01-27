import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components";
import { SpotifyProvider } from "./hooks/useSpotify";
import { QueryClient, QueryClientProvider } from "react-query";
import "./index.css";
import { getAccessTokens, refreshAccessTokens } from "./remote/spotify";

const queryClient = new QueryClient();

interface SavedTokens {
  refresh_token: string;
  access_token: string;
  access_token_eol: number;
}

interface APITokens {
  refresh_token?: string;
  access_token: string;
  expires_in: number;
}

const Index = () => {
  const [tokens, setTokens] = React.useState<SavedTokens | null>();

  const persistTokens = React.useCallback((value?: SavedTokens) => {
    localStorage.setItem("auth", JSON.stringify(value));
  }, []);

  const handleNewTokens = React.useCallback(
    (rawTokens: APITokens) => {
      const newTokens = {
        refresh_token: (rawTokens.refresh_token ?? tokens?.refresh_token) as string,
        access_token: rawTokens.access_token,
        access_token_eol: Number(new Date()) + rawTokens.expires_in * 1000,
      };

      setTokens(newTokens);
      persistTokens(newTokens);
    },
    [persistTokens, tokens?.refresh_token]
  );

  const refreshTokens = React.useCallback(() => {
    if (!tokens?.refresh_token) return;
    refreshAccessTokens(tokens.refresh_token).then(handleNewTokens);
  }, [handleNewTokens, tokens?.refresh_token]);

  React.useEffect(() => {
    const loadedTokens = window.localStorage.getItem("auth");
    const parsedTokens = loadedTokens ? JSON.parse(loadedTokens) : undefined;
    if (!parsedTokens) {
      getAccessTokens(import.meta.env.VITE_SPOTIFY_AUTH_TOKEN).then(handleNewTokens);
    } else {
      setTokens(parsedTokens);
    }
  }, [handleNewTokens]);

  React.useEffect(() => {
    if (!tokens?.access_token_eol) return;
    if (tokens.access_token_eol < Number(new Date())) refreshTokens();
  }, [refreshTokens, tokens?.access_token_eol]);

  React.useEffect(() => {
    if (!tokens?.access_token_eol) return;
    const intervalID = window.setInterval(() => {
      const accessTokenTTL = tokens.access_token_eol - Number(new Date());
      // If token expires in less than 5 mins then refresh it
      if (accessTokenTTL < 5 * 60 * 1000) {
        refreshTokens();
      }
    }, 60 * 1000);

    return () => window.clearInterval(intervalID);
  }, [refreshTokens, tokens?.access_token_eol]);

  return (
    <QueryClientProvider client={queryClient}>
      {tokens && (
        <SpotifyProvider accessToken={tokens.access_token}>
          <App />
        </SpotifyProvider>
      )}
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Index />);
