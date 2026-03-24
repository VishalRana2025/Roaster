import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../Image/Untitled-design-7-1 (1).webp"; // Adjust the path based on your folder structure

const Register = () => {
  const navigate = useNavigate();

  // Company location coordinates (Nxone Tech Tower, Sector 62, Noida)
  const COMPANY_LOCATION = {
    lat: 28.6129,
    lng: 77.2295,
    name: "Nxone Tech Tower, Sector 62, Noida",
    address: "Sector 62, Noida, Uttar Pradesh 201309",
    radius: 100, // meters - allowed radius for attendance
    fullAddress: "Nxone Tech Tower, A-44, Sector 62, Noida, Uttar Pradesh 201309"
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    phoneNumber: "",
  });

  const [showLocationDetails, setShowLocationDetails] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.employeeId ||
      !formData.department ||
      !formData.phoneNumber 
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
    
    // Check if email already exists
    const emailExists = existingUsers.find(
      (user) => user.email === formData.email
    );

    if (emailExists) {
      alert("Email already registered ❌");
      return;
    }

    // Check if employee ID already exists
    const employeeIdExists = existingUsers.find(
      (user) => user.employeeId === formData.employeeId
    );

    if (employeeIdExists) {
      alert("Employee ID already registered ❌");
      return;
    }

    // Create new user with unique ID and company location
    const newUser = {
      ...formData,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
      role: "employee",
      isActive: true,
      profileImage: null,
      attendance: [],
      locationHistory: [],
      // Store company location for this employee
      companyLocation: COMPANY_LOCATION,
      // Store office location preferences
      officeLocation: {
        ...COMPANY_LOCATION,
        assignedAt: new Date().toISOString()
      }
    };

    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));

    alert("Registration Successful ✅\nCompany: Nxone Tech Tower, Sector 62, Noida");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#7b3fe4] to-[#23c4c4]">
      <div className="bg-[#2c2966] w-[500px] rounded-lg shadow-2xl p-8">
        
        <div className="flex justify-center mb-4">
          <img 
            src={logo} 
            alt="Company Logo" 
            className="h-20 w-auto object-contain bg-white p-2 rounded-lg shadow-lg"
          />
        </div>

        <h2 className="text-white text-center text-2xl font-medium mb-2">
          Employee Registration
        </h2>
        
        {showLocationDetails && (
          <div className="bg-blue-800 text-white p-3 rounded-lg mb-4 text-xs border border-blue-400">
            <div className="flex items-start gap-2">
              <span>📍</span>
              <div>
                <p className="font-semibold mb-1">Nxone Tech Tower</p>
                <p className="opacity-90">{COMPANY_LOCATION.fullAddress}</p>
                <p className="mt-2">📍 Coordinates: {COMPANY_LOCATION.lat}, {COMPANY_LOCATION.lng}</p>
                <p>📏 Attendance Radius: {COMPANY_LOCATION.radius} meters</p>
                <p className="mt-1 text-yellow-300">⚠️ You must be within {COMPANY_LOCATION.radius}m to mark attendance</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="firstName"
              placeholder="First name *"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last name *"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Official Email *"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="employeeId"
              placeholder="Employee ID *"
              value={formData.employeeId}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Department *</option>
              <option value="Accounting">Accounting</option>
              <option value="Business Development">Business Development</option>
              <option value="C-Suite">C-Suite</option>
              <option value="Finance">Finance</option>
              <option value="Founder's Office">Founder's Office</option>
              <option value="Growth Operations">Growth Operations</option>
              <option value="Polycheme">Polycheme</option>
              <option value="Marketing">Marketing</option>
              <option value="RPO">RPO</option>
              <option value="Talent & People">Talent & People</option>
              <option value="Technology & Infrastructure">Technology & Infrastructure</option>
              <option value="Virtual Operations">Virtual Operations</option>
              <option value="Workplace Operations">Workplace Operations</option>
              <option value="Blanks">(Blanks)</option>
            </select>
          </div>
          
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number *"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
         
          <div className="flex justify-between items-center mt-6">
           <img src={logo} alt="" className="h-8 w-auto opacity-50" />
            <button
              type="submit"
              className="bg-[#4caf50] hover:bg-green-600 transition text-white px-8 py-3 rounded-md font-semibold shadow-lg"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
      
      <div className="flex items-center gap-2 text-white text-sm mt-8">
        <img src={logo} alt="" className="h-6 w-auto" />
        <p>
          Already have an account?
          <span
            onClick={() => navigate("/login")}
            className="ml-2 underline font-semibold cursor-pointer hover:text-yellow-300"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;