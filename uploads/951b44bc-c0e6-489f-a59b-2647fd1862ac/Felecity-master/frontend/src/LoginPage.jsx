import React from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <>
      {/* Navbar */}
      <nav className="w-full fixed top-0 left-0 flex justify-between items-center py-1 z-50 bg-white px-8 ">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src="/src/assets/logoo.png" alt="Virtual Labs Logo" className="h-14" />
          </Link>

        </div>
      </nav>

      {/* Content Container */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50 to-cyan-100 pt-24">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-96">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Welcome Back</h2>
          <form className="space-y-5">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <Link to={'/educator'}>
              <button 
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded-lg font-medium hover:bg-blue-600 transition-all shadow-md"
              >
                Log In
              </button>
            </Link>
          </form>
          <p className="text-center text-gray-600 mt-4">
            Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
