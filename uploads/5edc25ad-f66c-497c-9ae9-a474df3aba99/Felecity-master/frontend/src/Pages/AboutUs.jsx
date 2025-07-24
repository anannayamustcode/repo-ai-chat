import React from "react";
import StackCarousel from "../Components/Others/StackCarousel";

const AboutUs = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-6 transition-colors duration-300"
      style={{
        background: "var(--card-bg)",
        color: "var(--text-color)",
      }}
    >
     
      <div
        className="max-w-4xl mx-auto p-8 rounded-lg shadow-lg transition-transform duration-300"
        style={{
          backgroundColor: "var(--transparent-card)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
        }}
      >
        <h1 className="text-4xl font-bold text-center mb-6" style={{ color: "var(--heading-color)" }}>
          About Us
        </h1>
        <StackCarousel/>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--heading-color)" }}>
          Overview
        </h2>
        <p className="leading-relaxed" style={{ color: "var(--text-color)" }}>
        Virtual Labs project is an initiative of Ministry of Education (MoE), Government of India under the aegis of National Mission on Education through Information and Communication Technology (NMEICT). This project is a consortium activity of twelve participating institutes and IIT Delhi is coordinating institute. It is a paradigm shift in ICT-based education. For the first time, such an initiative has been taken-up in remote‐experimentation. Under Virtual Labs project, over 100 Virtual Labs consisting of approximately 700+ web-enabled experiments were designed for remote-operation and viewing.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4" style={{ color: "var(--heading-color)" }}>
          Intended Beneficiaries
        </h2>
        <ul className="list-disc list-inside space-y-2 pl-5">
          <li style={{ color: "var(--text-color)" }}>
          All students and Faculty Members of Science and Engineering Colleges who do not have access to good lab‐facilities and/or instruments.
          </li>
          <li style={{ color: "var(--text-color)" }}>
          High‐school students, whose inquisitiveness will be triggered, possibly motivating them to take up higher‐studies. Researchers in different institutes who can collaborate and share resources.
          </li>
          <li style={{ color: "var(--text-color)" }}>All students and Faculty Members of Science and Engineering Colleges who do not have access to good lab‐facilities and/or instruments.</li>
          <li style={{ color: "var(--text-color)" }}>Different engineering colleges who can benefit from the content and related teaching resources.</li>
        </ul>

        <p className="leading-relaxed mt-4" style={{ color: "var(--text-color)" }}>
        Virtual Labs do not require any additional infrastructural setup for conducting experiments at user premises. The simulations-based experiments can be accessed remotely via internet.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
