import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const submitButton = (e) => {
    e.preventDefault();
    const res = login(email, password);
    if (res) navigate("/");
  };

  return (
    <div className="h-[90vh] flex justify-center items-center bg-gradient-to-r from-[#f0f4ff] to-[#e6f0ff]">
      
      <div className="bg-white p-10 w-[90%] max-w-[380px] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-center">
        
        <h1 className="mb-2 text-gray-800 text-2xl font-semibold">
          Welcome Back
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Login to continue your learning journey
        </p>

        <form onSubmit={submitButton} className="flex flex-col gap-4">
          
          <div className="flex flex-col text-left">
            <label className="text-sm mb-1 text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 rounded-md border border-gray-300 focus:border-[#4a90e2] focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.4)] transition duration-300"
            />
          </div>

          <div className="flex flex-col text-left">
            <label className="text-sm mb-1 text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 rounded-md border border-gray-300 focus:border-[#4a90e2] focus:outline-none focus:shadow-[0_0_5px_rgba(74,144,226,0.4)] transition duration-300"
            />
          </div>

          <button
            type="submit"
            className="mt-2 p-2 rounded-md bg-gradient-to-r from-[#6a82fb] to-[#744ca5] text-white font-bold hover:bg-[#357abd] transition duration-300"
          >
            Login
          </button>

          <p className="text-sm mt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#4a90e2] hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;