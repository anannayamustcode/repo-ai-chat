import { useState } from "react";
import { Menu, Home, X } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = ({ scrollToSection }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Controls mobile menu

  const sections = [
    { name: "Title", id: "title" },
    { name: "Aim", id: "aim" },
    { name: "Description", id: "description" },
    { name: "Theory", id: "theory" },
    { name: "Objective", id: "objective" },
    { name: "Procedure", id: "procedure" },
    { name: "Simulation", id: "simulation" },
    { name: "Assignment", id: "assignment" },
    { name: "References", id: "references" },
    { name: "Feedback", id: "feedback" },
];

  return (
    <>
      {/* Sidebar for Large Screens */}
      <div
        className={`hidden md:flex h-screen fixed top-0 left-0 bg-[var(--sidebar)] z-20 text-white transition-all duration-300 flex-col justify-between ${
          isHovered ? "w-40" : "w-16"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sidebar Heading */}
        <div className="h-16 flex items-center justify-center border-b border-gray-600">
          <h2
            className={`text-lg font-bold transition-all duration-300 text-white ${
              isHovered ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
            }`}
          >
            Menu
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="mb-10 flex flex-col">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center cursor-pointer"
            >
              <Menu className="mr-2" />
              <span
                className={`transition-all duration-300 overflow-hidden ${
                  isHovered ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                }`}
              >
                {section.name}
              </span>
            </button>
          ))}
        </nav>

        {/* Home Button at the Bottom */}
        <Link to="/">
          <button
            className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center border-t border-gray-600 cursor-pointer"
            onClick={() => scrollToSection("home")}
          >
            <Home className="mr-2" />
            <span
              className={`transition-all duration-300 overflow-hidden ${
                isHovered ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
              }`}
            >
              Home
            </span>
          </button>
        </Link>
      </div>

      {/* Mobile Menu Button (Visible on Small Screens) */}
      <button
        className="md:hidden fixed top-4 left-3 bg-[var(--button-bg-hover)] text-[var(--text-color-button)] p-2 rounded-full shadow-lg z-30"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Full-Screen Sidebar on Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-[var(--sidebar)] z-40 flex flex-col text-white p-6 space-y-4 items-center">
          {/* Close Button */}
          <button className="self-end text-white p-2" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Items */}
          <nav className="flex flex-col space-y-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  scrollToSection(section.id);
                  setIsOpen(false);
                }}
                className="text-xl font-semibold hover:underline"
              >
                {section.name}
              </button>
            ))}
          </nav>

          {/* Home Button */}
          <Link to="/" onClick={() => setIsOpen(false)} className="mt-auto">
            <button className="text-xl font-semibold hover:underline flex items-center ">
              <Home className="mr-2 " /> Home
            </button>
          </Link>
        </div>
      )}
    </>
  );
};

export default Sidebar;
