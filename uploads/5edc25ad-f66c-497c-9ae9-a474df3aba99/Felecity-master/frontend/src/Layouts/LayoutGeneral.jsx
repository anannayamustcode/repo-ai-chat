import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Others/navbar"; // Import general navbar
import Footer from "../footer"; // Import footer

const LayoutGeneral = () => {
  const location = useLocation();
  const showFooter = location.pathname === "/" || location.pathname === "/aboutus"; // ✅ Footer only on Home & About

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      {showFooter && <Footer />} {/* ✅ Conditional Footer */}
    </div>
  );
};

export default LayoutGeneral;
