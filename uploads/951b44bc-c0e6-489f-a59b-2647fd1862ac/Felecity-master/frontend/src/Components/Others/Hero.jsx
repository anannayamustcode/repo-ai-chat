import React from "react";
import Lottie from "react-lottie";
import Animation1 from "../../assets/HeroImage.json";

const Hero = () => {
  return (
    <div className="w-full flex justify-center items-center min-h-screen ">
      <div className="w-[72%] max-w-[500px] h-auto">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: Animation1,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid meet", // Ensures it stays responsive
            },
          }}
        />
      </div>
    </div>
  );
};

export default Hero;
