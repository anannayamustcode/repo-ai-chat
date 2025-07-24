import './index.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './Landing';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Explore from './Pages/Students/Explore';
import AboutUs from './Pages/AboutUs'; // ✅ Added About Us page
import LayoutGeneral from "./Layouts/LayoutGeneral";  // Layout for students (with footer)
import Experiment from './Experiment';
import SearchPage from './search';
import ListPage from './list';
import DarkModeToggle from "./Components/Others/Toggle";


const App = () => {
  return (
    <>
      
      <Routes>
        <Route path="/" element={<LayoutGeneral />}>
          <Route index element={<LandingPage />} />
          <Route path="explore" element={<Explore />} />
          <Route path="aboutus" element={<AboutUs />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/list" element={<ListPage />} />


          </Route>

      {/* ✅ Routes Without Layout (Login & Signup) */}
      <Route path="/experiment" element={<Experiment />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      </Routes>
    </>
  );
};


export default App;
