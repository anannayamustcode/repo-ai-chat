import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBrain, FaRobot, FaCode, FaLanguage, FaMicrochip, FaServer, FaLaptopCode, FaPaintBrush } from "react-icons/fa";

const labs = [
  { title: "Artificial Intelligence I Lab (New)", icon: <FaBrain size={50} /> },
  { title: "Cryptography Lab", icon: <FaRobot size={50} /> },
  { title: "Artificial Neural Networks Lab", icon: <FaBrain size={50} /> },
  { title: "Computational Linguistics Lab", icon: <FaLanguage size={50} /> },
  { title: "Data Structures Lab", icon: <FaMicrochip size={50} /> },
  { title: "Computer Organization Lab", icon: <FaServer size={50} /> },
  { title: "Python Programming Lab", icon: <FaLaptopCode size={50} /> },
  { title: "Creative Design & Experiential Lab", icon: <FaPaintBrush size={50} /> },
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLabs = labs.filter((lab) =>
    lab.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="min-h-screen px-6 py-10 flex flex-col items-center"
      style={{
        background: "linear-gradient(to bottom, var(--bg-gradient-start), var(--bg-gradient-end))",
        color: "var(--text-color)",
      }}
    >
      {/* Search Bar */}
      <div className="w-full max-w-2xl">
        <h2 
          className="text-4xl font-bold text-center mb-6"
          style={{ color: "var(--heading-color)" }}
        >
          Computer Science & Engineering
        </h2>
        <div 
          className="flex items-center backdrop-blur-lg rounded-full px-4 py-3 border shadow-md w-full max-w-full"
          style={{
            backgroundColor: "var(--text-color-button-1)",
            borderColor: "var(--transparent-card)",
          }}
        >
          <input
            type="text"
            placeholder="Search for a lab..."
            className="flex-1 bg-transparent focus:outline-none text-lg px-3 placeholder-gray-500 w-full"
            style={{ color: "black" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="w-6 h-6 flex items-center justify-center text-lg rounded-full hover:bg-gray-200 transition flex-shrink-0 px-2"
              style={{ color: "var(--icon-color)" }}
              onClick={() => setSearchQuery("")}
            >
              ✖
            </button>
          )}
        </div>
      </div>

      {/* Lab List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
        {filteredLabs.length > 0 ? (
          filteredLabs.map((lab, index) => (
            <Link to="/list" key={index} className="block">
              <div 
                className="transform transition duration-300 flex flex-col items-center p-6 rounded-lg text-center w-56 h-40"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--transparent-card)",
                  borderWidth: "2px",
                  backdropFilter: "blur(10px)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 4px 20px var(--hover-glow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ color: "var(--icon-color)" }}>{lab.icon}</div>
                <div className="mt-4">
                  <h3 
                    className="text-sm sm:text-base font-semibold whitespace-normal"
                    style={{ color: "var(--text-color)" }}
                  >
                    {lab.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p 
            className="text-center col-span-full text-lg mt-10"
            style={{ color: "var(--hover-text)" }}
          >
            No results found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
