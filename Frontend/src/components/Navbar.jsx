import { useState } from "react";
import { Link } from "react-router-dom";
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav
        className="relative flex justify-between items-center 
                    px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40
                    py-4 bg-gradient-to-r from-[#6a82fb] to-[#744ca5] 
                    text-white shadow-md min-h-[10vh]"
      >
        {/* Left Side */}
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold">NavGurukul</h1>
          <p className="hidden sm:block text-lg opacity-90">Progress Tracker</p>
        </div>

        {/* Hamburger Button */}
        <div
          className="flex md:hidden flex-col gap-[5px] cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="w-6 h-[3px] bg-white rounded"></span>
          <span className="w-6 h-[3px] bg-white rounded"></span>
          <span className="w-6 h-[3px] bg-white rounded"></span>
        </div>

        {/* Nav Links */}
        <ul
          className={`
        ${isOpen ? "flex" : "hidden"}
        md:flex flex-col md:flex-row
        absolute md:static
        top-[60px] right-5 md:top-auto md:right-auto
        bg-[#6a82fb] md:bg-transparent
        p-4 md:p-0
        rounded-lg md:rounded-none
        w-[150px] md:w-auto
        gap-4 md:gap-6
        `}
        >
          <li>
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-xl hover:text-[#ffe4ff] transition"
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              to="/addTask"
              onClick={() => setIsOpen(false)}
              className="text-xl hover:text-[#ffe4ff] transition"
            >
              Add Task
            </Link>
          </li>

          <li>
            <Link
              to="/progress"
              onClick={() => setIsOpen(false)}
              className="text-xl hover:text-[#ffe4ff] transition"
            >
              Progress
            </Link>
          </li>

          {/* Login Button */}
          <li>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="text-sl font-bold bg-white text-purple-700 
                       px-4 py-1 rounded-lg 
                       hover:bg-purple-100 hover:text-purple-800 transition"
            >
              Login
            </Link>
          </li>
        </ul>
      </nav>

      {/* <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes> */}
    </>
  );
}

export default Navbar;
