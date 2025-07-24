import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Importing IIT logos
import amrita from "../../assets/IITs/Amrita.png";
import bombay from "../../assets/IITs/Bombay.png";
import coep from "../../assets/IITs/Coep.png";
import deendayal from "../../assets/IITs/Deendayal.png";
import guwahati from "../../assets/IITs/Gwahati.png";
import iiithyd from "../../assets/IITs/IIIThyd.png";
import iitdelhi from "../../assets/IITs/IITdelhi.png";
import iitkgp from "../../assets/IITs/iitkgp.png";
import kanpur from "../../assets/IITs/kanpur.png";
import nitk from "../../assets/IITs/NITK.png";
import roorkee from "../../assets/IITs/roorkee.png";

// Logo data
const logos = [
  { src: amrita, name: "Amrita", path: "/amrita" },
  { src: bombay, name: "IIT Bombay", path: "/iit-bombay" },
  { src: coep, name: "COEP", path: "/coep" },
  { src: guwahati, name: "IIT Guwahati", path: "/iit-guwahati" },
  { src: deendayal, name: "DAYALBAGH INSTITUTE", path: "/deendayal" },
  { src: iiithyd, name: "IIIT Hyderabad", path: "/iiit-hyderabad" },
  { src: iitdelhi, name: "IIT Delhi", path: "/iit-delhi" },
  { src: iitkgp, name: "IIT Kharagpur", path: "/iit-kgp" },
  { src: kanpur, name: "IIT Kanpur", path: "/iit-kanpur" },
  { src: nitk, name: "NITK", path: "/nitk" },
  { src: roorkee, name: "IIT Roorkee", path: "/iit-roorkee" }
];

const MovingIITs = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-hidden py-4 flex justify-center">
      {/* Prevents horizontal scrolling */}
      <div className="relative w-full max-w-screen overflow-x-hidden">
        <motion.div
          className="flex flex-nowrap items-center space-x-8 w-max"
          animate={{ x: ["0%", "-60%"] }} // Moves only 50% to prevent excess width
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        >
          {[...logos, ...logos].map((logo, index) => (
            <div key={index} className="flex flex-col items-center w-20">
<img
  src={logo.src}
  alt={logo.name}
  className="
    h-16 w-20 object-contain cursor-pointer hover:scale-105 transition-transform
   
  "
  style={{ filter: "var(--logo-filter-light)" }}
  onClick={() => navigate(logo.path)}
/>






              <span className="text-xs text-center mt-1 font-medium text-var[(--headline-color)]">
                {logo.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MovingIITs;
