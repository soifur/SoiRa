import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "next-themes";
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem={false}
    storageKey="ui-theme"
    value={{
      light: "light",
      dark: "dark"
    }}
  >
    <App />
  </ThemeProvider>
);