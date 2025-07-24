import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [menuOpen, setMenuOpen] = useState(false); // ✅ Fix for undefined `menuOpen`

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className="flex justify-between items-center py-4 border-b border-gray-300 sticky top-0 z-50 px-8 transition-colors duration-300 bg-[var(--bg-gradient-start)] text-[var(--text-color)]">

      <Link to="/" className="flex items-center gap-3">
      {/* <img src="/logoo.png" alt="Virtual Labs Logo" className="h-12" /> */}
      <img src="/logoo.png" alt="Virtual Labs Logo" className="h-12" />
      <div className="leading-tight">
          <h1 className="text-2xl font-bold">Virtual</h1>
          <h1 className="text-2xl font-bold">Labs 2.0</h1>
        </div>
      </Link>

      <button className={`md:hidden ${darkMode ? "text-white" : "text-black"}`} onClick={toggleMenu}>
        {menuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
      </button>

      <div className="hidden md:flex items-center space-x-8 font-semibold">
      <Link to="/" className="hover:underline">Home</Link>
        <Link to="/explore" className="hover:underline">Labs</Link>
        <Link to="/aboutus" className="hover:underline">About Us</Link>
        <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 flex items-center justify-center rounded-full transition-all">
          <motion.div
            key={darkMode ? "moon" : "sun"}
            initial={{ rotate: darkMode ? 180 : 0, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: darkMode ? -180 : 0, scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {darkMode ? <Moon className="w-6 h-6 text-yellow-300" /> : <Sun className="w-6 h-6 text-yellow-500" />}
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
  {menuOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 10 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="absolute top-16 left-0 w-full h-screen bg-[var(--bg-gradient-start)] text-[var(--text-color)] shadow-lg flex flex-col items-center space-y-6 py-6 text-lg md:hidden"
    >
      <Link to="/" className="hover:underline" onClick={toggleMenu}>Home</Link>
      <Link to="/explore" className="hover:underline" onClick={toggleMenu}>Labs</Link>
      <Link to="/aboutus" className="hover:underline" onClick={toggleMenu}>About Us</Link>
      
      <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 flex items-center justify-center rounded-full transition-all">
        {darkMode ? <Moon className="w-6 h-6 text-yellow-300" /> : <Sun className="w-6 h-6 text-yellow-500" />}
      </button>
    </motion.div>
  )}
</AnimatePresence>
    </nav>
  );
};

export default Navbar;
