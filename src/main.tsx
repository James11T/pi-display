import React from "react";
import ReactDOM from "react-dom/client";
import SpotifyWrapper from "./components/SpotifyWrapper/SpotifyWrapper";
import HueApp from "./components/HueApp/HueApp";
import "./index.css";
import { DiscordIcon, LightbulbOnIcon, SpotifyIcon } from "./icons";
import AppSwitcher, { App } from "./components/AppSwitcher/AppSwitcher";

const APP_NAMES = ["spotify", "hue", "placeholder"] as const;
type AppName = typeof APP_NAMES[number];

const APPS: Record<AppName, App> = {
  spotify: {
    icon: SpotifyIcon,
    component: SpotifyWrapper,
  },
  hue: {
    icon: LightbulbOnIcon,
    component: HueApp,
  },
  placeholder: {
    icon: DiscordIcon,
    component: () => <div></div>,
  },
};

const Index = () => {
  const [currentApp, setCurrentApp] = React.useState<AppName>("spotify");

  const AppComponent = APPS[currentApp].component;

  return (
    <div className="index">
      <AppSwitcher apps={APPS} currentApp={currentApp} onChangeApp={setCurrentApp} />
      <AppComponent />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Index />);
