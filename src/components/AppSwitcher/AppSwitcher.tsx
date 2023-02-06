import cn from "clsx";
import styles from "./AppSwitcher.module.scss";

interface App {
  icon: React.FC;
  component: React.FC;
}

interface AppSwitcherProps<T extends string> {
  apps: Record<T, App>;
  currentApp: string;
  onChangeApp: (name: T) => void;
}

const AppSwitcher = <T extends string>({ apps, currentApp, onChangeApp }: AppSwitcherProps<T>) => {
  return (
    <div className={styles["app-switcher"]}>
      {Object.keys(apps).map((appName) => {
        const key = appName as T;
        const app = apps[key];
        return (
          <button
            className={cn(currentApp === appName && styles["button--active"])}
            onClick={() => onChangeApp(key)}
            key={appName}>
            <app.icon />
          </button>
        );
      })}
    </div>
  );
};

export default AppSwitcher;
export type { App };
