import Home from "./pages/Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import ProgressDashboard from "./pages/ProgressDashboard";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/progress" element={<ProgressDashboard />} />
      </Routes>
    </>
  );
}

export default App;
