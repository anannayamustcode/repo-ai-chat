import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Star,
  Key,
  Lock,
  ShieldCheck,
  FileSignature,
  Hash,
  Shield,
  Fingerprint,
  KeyRound,
  Users,
  Clock,
} from "lucide-react";

const courses = [
  {
    title: "Breaking the Shift Cipher",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "2 hours",
    category: "Cryptography",
    enrollments: "500 Students",
    icon: <KeyRound size={36} className="text-blue-500" />,
  },
  {
    title: "Breaking the Mono-alphabetic Substitution Cipher",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "2.5 hours",
    category: "Cryptography",
    enrollments: "450 Students",
    icon: <Key size={36} className="text-indigo-500" />,
  },
  {
    title: "One-Time Pad and Perfect Secrecy",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "3 hours",
    category: "Cryptography",
    enrollments: "600 Students",
    icon: <Lock size={36} className="text-purple-500" />,
  },
  {
    title: "Message Authentication Codes",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "3 hours",
    category: "Cryptography",
    enrollments: "550 Students",
    icon: <ShieldCheck size={36} className="text-green-500" />,
  },
  {
    title: "Cryptographic Hash Functions and Applications",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "3.5 hours",
    category: "Cryptography",
    enrollments: "700 Students",
    icon: <Hash size={36} className="text-amber-500" />,
  },
  {
    title: "Symmetric Key Encryption Standards (DES)",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "4 hours",
    category: "Cryptography",
    enrollments: "650 Students",
    icon: <Shield size={36} className="text-cyan-500" />,
  },
  {
    title: "Symmetric Key Encryption Standards (AES)",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "4 hours",
    category: "Cryptography",
    enrollments: "700 Students",
    icon: <Shield size={36} className="text-teal-500" />,
  },
  {
    title: "Diffie-Hellman Key Establishment",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "3 hours",
    category: "Cryptography",
    enrollments: "600 Students",
    icon: <Key size={36} className="text-orange-500" />,
  },
  {
    title: "Public-Key Cryptosystems (PKCSv1.5)",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "4 hours",
    category: "Cryptography",
    enrollments: "750 Students",
    icon: <Fingerprint size={36} className="text-red-500" />,
  },
  {
    title: "Digital Signatures",
    price: "Free",
    rating: 5,
    instructor: "CryptoLab",
    duration: "4.5 hours",
    category: "Cryptography",
    enrollments: "800 Students",
    icon: <FileSignature size={36} className="text-blue-600" />,
  },
];

const ListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "linear-gradient(to bottom, var(--bg-gradient-start), var(--bg-gradient-end))",
      }}
    >
      <div className="container mx-auto px-6 py-16 flex-grow flex flex-col items-center">
        
        {/* Title */}
        <h2
          className="text-5xl font-extrabold mb-10 text-center tracking-tight"
          style={{ color: "var(--heading-color)" }}
        >
          Cryptography <span style={{ color: "var(--scroll)" }}>Experiments</span>
        </h2>

        {/* Search Bar */}
        <div className="relative w-full max-w-xl mb-8">
          <input
            type="text"
            placeholder="Search experiments..."
            className="w-full px-5 py-4 pl-12 rounded-4xl border border-gray-200 shadow-lg 
                     bg-white text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={20}
          />
        </div>

        {/* Courses List */}
        <div className="grid grid-cols-1 gap-8 w-full max-w-4xl">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <Link
                to="/experiment"
                key={index}
                className="relative border-2 rounded-2xl p-6 flex flex-col items-start text-left transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden"
                style={{
                  backgroundColor: "var(--card-bg)",
                  backdropFilter: "blur(10px)",
                  borderColor: "var(--transparent-card)",
                }}
              >
                {/* Course Icon */}
                <div className="mb-4">{course.icon}</div>

                {/* Course Title */}
                <h3
                  className="font-semibold text-xl mb-2 group-hover:text-blue-700 transition-all"
                  style={{ color: "var(--text-color)" }}
                >
                  {course.title}
                </h3>

                {/* Course Meta Data */}
                <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-300 gap-4 mb-2">
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{course.enrollments}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{course.duration}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span>{course.rating}.0</span>
                  </span>
                </div>

                {/* Hover Effect Background Glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: "linear-gradient(to bottom right, transparent, var(--hover-glow), transparent)",
                  }}
                ></div>
              </Link>
            ))
          ) : (
            <div className="bg-[var(--card-bg)] rounded-xl p-10 text-center shadow-lg border border-gray-100 ">
              <Search size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-[var(--text-color)]">No experiments found</p>
              <p className="mt-2 text-[var(--text-color)]">Try different keywords or browse all courses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListPage;
