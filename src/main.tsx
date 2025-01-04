import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "next-themes";
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
    storageKey="soira-theme-v1"
    forcedTheme="light" // Force light theme initially to prevent flash
  >
    <App />
  </ThemeProvider>
);