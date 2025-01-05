import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Bots from "./pages/Bots";
import Settings from "./pages/Settings";
import Folders from "./pages/Folders";
import FolderDetail from "./pages/FolderDetail";
import CustomFolder from "./pages/CustomFolder";
import Navigation from "./components/Navigation";

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bots" element={<Bots />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/folders" element={<Folders />} />
        <Route path="/folders/:id" element={<FolderDetail />} />
        <Route path="/:backHalf" element={<CustomFolder />} />
      </Routes>
    </Router>
  );
}

export default App;