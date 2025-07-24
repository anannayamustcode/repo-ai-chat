// import React from "react";
// import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
// import QR from './assets/QR.png';

// const Footer = () => {
//   return (
//     <footer className="bg-[var(--bg-footer)] text-white py-6 text-center p-10">
//       <div className="container mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-10 text-left ml-[-20px]"> 
//         {/* Quick Links Section */}
//         <div>
//           <h3 className="text-lg font-bold mb-3 text-white">Quick Links</h3>
//           <ul className="space-y-2">
//             <li><a href="#" className="hover:underline">Lab Feedback Form</a></li>
//             <li><a href="#" className="hover:underline">Lab Assessment Form</a></li>
//             <li><a href="#" className="hover:underline">FAQ</a></li>
//             <li><a href="#" className="hover:underline">Shakshat Portal</a></li>
//           </ul>
//         </div>

//         {/* About VLAB Section */}
//         <div>
//           <h3 className="text-lg font-bold mb-3 text-white">About VLAB</h3>
//           <ul className="space-y-2">
//             <li><a href="/" className="hover:underline">Home</a></li>
//             <li><a href="/aboutus" className="hover:underline">About Us</a></li>
//             <li><a href="#" className="hover:underline">Contact Us</a></li>
//           </ul>
//         </div>

//         {/* Get In Touch (QR Code) Section */}
//         <div className="flex flex-col items-start">
//           <h3 className="text-lg font-bold mb-3 text-white">Get In Touch With Us</h3>
//           <div className="mb-3 bg-white p-1 rounded">
//             <img src={QR} alt="QR Code" className="w-24 h-24" />
//           </div>
//         </div>

//         {/* Contact Details Section */}
//         <div className="flex flex-col items-start w-full max-w-3xl">
//           <p className="flex items-center gap-2 whitespace-nowrap">
//             <FaEnvelope className="text-lg" /> support@vlab.co.in
//           </p>
//           <p className="flex items-center gap-2 whitespace-nowrap">
//             <FaPhoneAlt className="text-lg" /> Phone(L) - 011-26582050
//           </p>
//           <p className="flex items-center gap-2 whitespace-nowrap">
//             <FaMapMarkerAlt className="text-xl" />
//             Wireless Research Lab, Room No -<br/>  206/IIA, Bharti School of Telecom, <br/> IIT Delhi,  
//             Hauz Khas,New Delhi-110016
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
import React from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import QR from './assets/QR.png';

const Footer = () => {
  return (
    <footer className="bg-[var(--bg-footer)] text-white py-6 text-center p-10">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
        {/* Quick Links Section */}
        <div>
          <h3 className="text-lg font-bold mb-3 text-white">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Lab Feedback Form</a></li>
            <li><a href="#" className="hover:underline">Lab Assessment Form</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Shakshat Portal</a></li>
          </ul>
        </div>

        {/* About VLAB Section */}
        <div>
          <h3 className="text-lg font-bold mb-3 text-white">About VLAB</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/aboutus" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>

        {/* Get In Touch (QR Code) Section */}
        <div className="flex flex-col items-start">
          <h3 className="text-lg font-bold mb-3 text-white">Get In Touch With Us</h3>
          <div className="mb-3 bg-white p-1 rounded">
            <img src={QR} alt="QR Code" className="w-24 h-24" />
          </div>
        </div>

        {/* Contact Details Section */}
        <div className="flex flex-col items-start w-full max-w-3xl">
          <p className="flex items-center gap-2 break-words w-full">
            <FaEnvelope className="text-lg" /> support@vlab.co.in
          </p>
          <p className="flex items-center gap-2 break-words w-full">
            <FaPhoneAlt className="text-lg" /> Phone(L) - 011-26582050
          </p>
          <div className="flex items-start gap-2 w-full break-words">
            <FaMapMarkerAlt className="text-5xl" />
            <span>
              Wireless Research Lab, Room No - 206/IIA, Bharti School of Telecom, 
              IIT Delhi, Hauz Khas, New Delhi-110016
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
