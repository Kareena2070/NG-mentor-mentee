import Home from "./pages/Home"
import Login from "./pages/Login"
import Navbar from "./components/Navbar"
import { Routes, Route } from 'react-router-dom'

function App() {
  

  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      {/* add other routes (addTask, progress, register) here when available */}
    </Routes>
    </>
  )
}

export default App
