import React, { useRef } from 'react';
import Timer from './Components/Others/Timer';
import Sidebar from './Components/Students/Sidebar'; // Ensure Sidebar is correctly imported
import { Link } from "react-router-dom";
import { motion, useScroll } from "framer-motion"

const Experiment = () => {
    const aimRef = useRef(null);
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const theoryRef = useRef(null);
    const simulationRef = useRef(null);

    const scrollToSection = (section) => {
        const sectionRefs = {
            aim: aimRef,
            title: titleRef,
            description: descriptionRef,
            theory: theoryRef,
            simulation: simulationRef,
        };

        sectionRefs[section]?.current?.scrollIntoView({ behavior: "smooth" });
    };
    const { scrollYProgress } = useScroll();


    return (
        <>
         <motion.div
                id="scroll-indicator"
                style={{
                    scaleX: scrollYProgress,
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 10,
                    originX: 0,
                    backgroundColor: "var(--scroll)",
                }}
            />
        <div className="flex bg-[var(--bg-gradient-start)]">
            
            <Sidebar scrollToSection={scrollToSection} />
            <Timer />
            <main className="ml-8 sm:ml-40 flex-1 p-6 space-y-12 ">

                <section ref={titleRef} id="title" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold">Title</h2>
                    <p>The main title or heading of the project.</p>
                </section>
                <section ref={aimRef} id="aim" className="mt-10 p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold">Aim</h2>
                    <p>Explain the purpose of this page.</p>
                </section>



                <section ref={descriptionRef} id="description" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold">Description</h2>
                    <p>A detailed explanation of the project.</p>
                </section>

                <section ref={theoryRef} id="theory" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold">Theory</h2>
                    <p>Background and theoretical aspects.</p>
                </section>

                <section ref={simulationRef} id="simulation" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold">Simulation</h2>
                    <p>A simulated example or visualization.</p>
                </section>

            </main>
        </div>
        </>
    );
};

export default Experiment;
