import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  "/src/assets/Carousel/img2.jpg",
  "/src/assets/Carousel/img1.png",
  "/src/assets/Carousel/img3.jpg",
  "/src/assets/Carousel/img4.png",
  "/src/assets/Carousel/img5.jpg",
  "/src/assets/Carousel/img6.jpg",
  "/src/assets/Carousel/img7.png",
  "/src/assets/Carousel/img8.png",
];

const StackCarousel = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 10000); // Auto change every 10s
    return () => clearInterval(interval);
  }, [index]);

  const nextSlide = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-[90%] max-w-lg h-[300px] mx-auto flex items-center justify-center overflow-hidden">
      {/* Image Slider */}
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={`Slide ${index + 1}`}
          initial={{ x: direction === 1 ? 200 : -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction === 1 ? -200 : 200, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute w-full h-[280px] object-cover rounded-lg shadow-lg"
        />
      </AnimatePresence>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute left-4 p-3 bg-gray-400/20 bg-opacity-20 backdrop-blur-lg text-gray-800  rounded-full shadow-md hover:bg-opacity-50 transition-transform duration-300 transform hover:scale-110 cursor-pointer"
      >
        ❮
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-4 p-3 bg-gray-400/20 bg-opacity-20 backdrop-blur-lg text-gray-800  rounded-full shadow-md hover:bg-opacity-50 transition-transform duration-300 transform hover:scale-110 cursor-pointer"
      >
        ❯
      </button>

      {/* Indicators (dots) */}
      <div className="absolute bottom-3 flex space-x-2">
        {images.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 m-1.5 rounded-full transition-all ${
              index === i ? "bg-white scale-125" : "bg-gray-400"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default StackCarousel;
