import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const subjects = [
  { 
    name: "Electronics & Communications", 
    icon: "📡",
    description: "Explore cutting-edge communication technologies",
  },
  { 
    name: "Computer Science & Engineering", 
    icon: "💻",
    description: "Dive into the world of algorithms and software",
  },
  { 
    name: "Electrical Engineering", 
    icon: "⚡", 
    description: "Discover the power of electrical systems",
  },
  { 
    name: "Mechanical Engineering", 
    icon: "⚙️",
    description: "Design and innovate mechanical solutions",
  },
  { 
    name: "Chemical Engineering", 
    icon: "⚗️",
    description: "Transform matter through scientific processes",
  },
  { 
    name: "Civil Engineering", 
    icon: "🏗️",
    description: "Build infrastructure that shapes our world",
  },
  { 
    name: "Physical Sciences", 
    icon: "🔬",
    description: "Unravel the mysteries of the physical universe",
  },
  { 
    name: "Biotechnology & Biomedical Engineering", 
    icon: "🧪",
    description: "Innovate at the intersection of biology and technology",
  },
];

const Explore = React.memo(() => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "linear-gradient(to bottom, var(--bg-gradient-start), var(--bg-gradient-end))",
      }}
    >
      <div className="container mx-auto px-6 py-16 flex-grow flex flex-col items-center justify-center">
        
        {/* Title */}
        <h2 
          className="text-5xl font-extrabold mb-12 text-center tracking-tight"
          style={{ color: "var(--heading-color)" }}
        >
          Explore <span style={{ color: "var(--scroll)" }}>LABS</span>
        </h2>
        
        {/* Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 w-full">
          {subjects.map((subject, index) => (
            <button  
              key={index}
              onClick={() => navigate("/search")}
              className="relative border-2 rounded-2xl p-6 flex flex-col items-center text-center transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden"
              style={{
                backgroundColor: "var(--card-bg)",
                backdropFilter: "blur(10px)",
                borderColor: "var(--transparent-card)",
              }}
            >
              {/* Icon */}
              <div 
                className="text-6xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--icon-color)" }}
              >
                {subject.icon}
              </div>
              
              {/* Title */}
              <h3 
                className="font-semibold text-xl mb-2 group-hover:text-blue-700 transition-all"
                style={{ color: "var(--text-color)" }}
              >
                {subject.name}
              </h3>
              
              {/* Description */}
              <p 
                className="text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ color: "var(--text-color)" }}
              >
                {subject.description}
              </p>
              
              {/* Hover Effect Background Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
                style={{ background: "linear-gradient(to bottom right, transparent, var(--hover-glow), transparent)" }}
              ></div>

              {/* Arrow Button */}
              <div 
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ color: "var(--hover-text)" }}
              >
                <ArrowRight className="w-6 h-6" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Explore;
