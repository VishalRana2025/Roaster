import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
       <Routes>
  <Route path="/" element={<Register />} />
  <Route path="/login" element={<Login />} />
  <Route path="/employee" element={<EmployeeDashboard />} />
</Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;