import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../Image/Untitled-design-7-1 (1).webp"; // Adjust the path based on your folder structure

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const ADMIN_EMAIL = "admin@company.com";
  const ADMIN_PASSWORD = "admin123";

  // Company location (same as in Register)
  const COMPANY_LOCATION = {
    name: "Nxone Tech Tower, Sector 62, Noida",
    address: "Sector 62, Noida, Uttar Pradesh 201309"
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Check if it's admin
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("currentUser", JSON.stringify({
        email: ADMIN_EMAIL,
        role: "admin",
        name: "Admin"
      }));
      localStorage.setItem("role", "admin");
      navigate("/admin");
      return;
    }

    // Check if it's employee
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Store current user data
      localStorage.setItem("currentUser", JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        department: user.department,
        role: "employee",
        companyLocation: user.companyLocation || COMPANY_LOCATION
      }));
      localStorage.setItem("role", "employee");
      
      // Show success message with company info
      alert(`Welcome back ${user.firstName} ${user.lastName}!`);
      navigate("/employee");
    } else {
      alert("Invalid email or password ❌");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#7b3fe4] to-[#23c4c4]">
      
      {/* Just Logo - No Company Location
      <div className="mb-6">
        <img 
          src={logo} 
          alt="Company Logo" 
          className="h-20 w-auto object-contain bg-white p-3 rounded-full shadow-lg"
        />
      </div> */}

      <div className="bg-[#2c2966] w-[420px] rounded-lg shadow-2xl p-8 relative overflow-hidden">
     {/* Decorative Logo Background */}
<div className="absolute top-0 right-0 opacity-5">
  <img src={logo} alt="" className="h-32 w-auto" />
</div>
        {/* Logo inside form */}
        <div className="flex justify-center mb-4">
          <img 
            src={logo} 
            alt="Company Logo" 
            className="h-16 w-auto object-contain bg-white p-2 rounded-full shadow-lg"
          />
        </div>

        <h2 className="text-white text-center text-2xl font-medium mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-300 text-center text-sm mb-6">
          Sign in to your account
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-300 text-sm block mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-gray-300 text-sm">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <button 
              type="button"
              onClick={() => alert("Please contact admin for password reset")}
              className="text-blue-300 text-sm hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4caf50] hover:bg-green-600 transition text-white py-3 rounded-md font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <img src={logo} alt="" className="h-5 w-auto opacity-80" />
            Sign In
          </button>
        </form>

        {/* Admin Login Note */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs">
            Admin login: admin@company.com
          </p>
        </div>

        {/* Office Location Info - Removed from here as well */}
      </div>

      <div className="flex items-center gap-2 text-white text-sm mt-8">
        <img src={logo} alt="" className="h-5 w-auto" />
        <p>
          Don't have an account?
          <span
            onClick={() => navigate("/")}
            className="ml-2 underline font-semibold cursor-pointer hover:text-yellow-300 transition"
          >
            Register here
          </span>
        </p>
      </div>
{/* 
      Footer with company name only
      <div className="flex items-center gap-2 text-white text-xs mt-4 opacity-70">
        <img src={logo} alt="" className="h-4 w-auto" />
        <span>© 2024 Nxone Tech Tower • All rights reserved</span>
      </div> */}
    </div>
  );
};

export default Login;