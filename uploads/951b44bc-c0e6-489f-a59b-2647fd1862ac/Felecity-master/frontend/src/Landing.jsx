import React from "react";
import { Link } from "react-router-dom";
import IITLogos from "./Components/Others/movingIITs";
import StackCarousel from "./Components/Others/StackCarousel";
import Hero from "./Components/Others/Hero";

const LandingPage = React.memo(() => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-gradient-start)] via-[var(--bg-gradient-middle)] to-[var(--bg-gradient-end)] text-[#E2939] p-6 relative">
      <div className="flex flex-col md:flex-row items-center mt-10 px-6 md:px-16 relative z-20">
        <div className="md:w-1/2 text-center md:text-left md:ml-10 text-[#E2939]">
          <h2 className="text-5xl font-bold">Welcome to</h2>
          <h2 className="text-5xl font-bold">Virtual Labs</h2>
          <p className="text-left m-2 text-lg">An MoE Govt of India initiative</p>
          <Link to="/explore" className="inline-block">
            <button className="mt-6 px-12 py-2 bg-[var(--button-bg)] text-[var(--text-color-button)] rounded-full hover:bg-[var(--button-bg-hover)] transition-all font-bold cursor-pointer relative z-50 pointer-events-auto">
              Explore
            </button>
          </Link>
        </div>

        <div className="md:w-3/4 h-[350px] flex justify-center items-center">
          <Hero />
        </div>
      </div>

      {/* Participating Institutes */}
      <div className="mt-15 relative z-20">
        <p>Participating Institutes :</p>
      </div>
      
      <div className="relative z-20">
        <IITLogos />
      </div>
    </div>
  );
});

export default LandingPage;
