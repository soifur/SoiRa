import { createRoot } from 'react-dom/client';
import { ThemeProvider } from "next-themes";
import App from './App.tsx';
import './index.css';

// Create root first to ensure DOM is ready
const root = createRoot(document.getElementById("root")!);

// Render after a small delay to ensure styles are loaded
setTimeout(() => {
  root.render(
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      themes={["light", "dark"]}
      storageKey="ui-theme"
      enableColorScheme={false}
      forcedTheme="light"
    >
      <App />
    </ThemeProvider>
  );
}, 0);