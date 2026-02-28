import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mentee");
  const [menteeEmail, setMenteeEmail] = useState("");
  const [expertise, setExpertise] = useState("");

  const navigate = useNavigate();

  const submitButton = (e) => {
    e.preventDefault();
    let expertiseArray = [];

    if (role === "mentor") {
      expertiseArray = expertise
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }

    const res = register(
      name,
      email,
      password,
      role,
      role === "mentor" ? menteeEmail : null,
      role === "mentor" ? expertiseArray : []
    );

    if (res) navigate("/login");
  };

  return (
    <div className="h-[90vh] flex justify-center items-center bg-gradient-to-r from-[#f0f4ff] to-[#e6f0ff]">
      
      <div className="bg-white p-10 w-[90%] max-w-[400px] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-center">
        
        <h1 className="mb-2 text-gray-800 text-2xl font-semibold">
          Create Account
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Start tracking your learning journey today
        </p>

        <form onSubmit={submitButton} className="flex flex-col gap-4">
          
          {/* Full Name */}
          <div className="flex flex-col text-left">
            <label className="text-sm mb-1 text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="p-2 rounded-md border border-gray-300 transition duration-300 focus:border-[#4a90e2] focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col text-left">
            <label className="text-sm font-medium mb-1 text-gray-800">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 text-sm bg-white cursor-pointer transition duration-300 hover:border-indigo-600 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="mentee">Mentee</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          {/* Mentor Extra Fields */}
          {role === "mentor" && (
            <>
              <div className="flex flex-col text-left">
                <label className="text-sm mb-1 text-gray-700">
                  Mentee Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your mentee email"
                  value={menteeEmail}
                  onChange={(e) => setMenteeEmail(e.target.value)}
                  required
                  className="p-2 rounded-md border border-gray-300 transition duration-300 focus:border-[#4a90e2] focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
                />
              </div>

              <div className="flex flex-col text-left">
                <label className="text-sm mb-1 text-gray-700">
                  Expertise (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g React, Node, MongoDB"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  required
                  className="p-2 rounded-md border border-gray-300 transition duration-300 focus:border-[#4a90e2] focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="flex flex-col text-left">
            <label className="text-sm mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 rounded-md border border-gray-300 transition duration-300 focus:border-[#4a90e2] focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col text-left">
            <label className="text-sm mb-1 text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 rounded-md border border-gray-300 transition duration-300 focus:border-[#4a90e2] focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.4)]"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="mt-2 p-2 rounded-md bg-gradient-to-r from-[#6a82fb] to-[#744ca5] text-white font-bold transition duration-300 hover:bg-[#357abd]"
          >
            Register
          </button>

          <p className="text-sm mt-2">
            Already have account?{" "}
            <Link to="/login" className="text-[#4a90e2] hover:underline">
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Register;