import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "next-themes";
import Index from "@/pages/Index";
import Bots from "@/pages/Bots";
import Chat from "@/pages/Chat";
import Archive from "@/pages/Archive";
import EmbeddedBotChat from "@/components/chat/EmbeddedBotChat";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bots" element={<Bots />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/embed/:botId" element={<EmbeddedBotChat />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;