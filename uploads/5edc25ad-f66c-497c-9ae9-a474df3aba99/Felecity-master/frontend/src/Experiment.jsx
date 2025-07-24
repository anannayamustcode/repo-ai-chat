import React, { useRef } from 'react';
import Timer from './Components/Others/Timer';
import Sidebar from './Components/Students/Sidebar'; // Ensure Sidebar is correctly imported
import { Link } from "react-router-dom";
import { motion, useScroll } from "framer-motion"
import Chatbot from './Components/Students/Chatbot';
import { useState } from "react";

const Experiment = () => {
    const aimRef = useRef(null);
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);
    const objectiveRef = useRef(null);
    const procedureRef = useRef(null);
    const theoryRef = useRef(null);
    const simulationRef = useRef(null);
    const assignmentRef = useRef(null);
    const referencesRef = useRef(null);
    const feedbackRef = useRef(null);
    const [isChatOpen, setChatOpen] = useState(false);
    const scrollToSection = (section) => {
        const sectionRefs = {
            title: titleRef,
            aim: aimRef,
            description: descriptionRef,
            theory: theoryRef,
            objective: objectiveRef,
            procedure : procedureRef,
            simulation: simulationRef,
            assignment: assignmentRef,
            references: referencesRef,
            feedback: feedbackRef,
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
                    <h2 className="text-2xl font-bold pb-2 opacity-50 z--1">Title</h2>
                    <h2 className="text-2xl font-bold pb-2 ">Breaking the Mono-alphabetic Substitution Cipher</h2>
                   
                </section>
                <section ref={aimRef} id="aim" className="mt-10 p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold pb-2 ">Aim</h2>
                    <p>We are able to break the shift cipher because of it's small key space. In general, we learnt that the large key space is necesary for secrecy. However, we will now see that large key space is not always sufficient either.<br/><br/>

                        <strong>About the experiment : </strong>

                        In this experiment, we work with another well-known historical encryption scheme, namely the mono-alphabetic substitution cipher, that has a very large key space. However, it is quite easily broken using "Frequency analysis" methods. Your task is to break this cipher. Specifically, given (only) the ciphertext in some instance of a mono alphabetic substitution cipher, you need to find the plaintext and the secret key.</p>
                </section>



                <section ref={descriptionRef} id="description" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold pb-2">Description</h2>
                    <p>A detailed explanation of the project.</p>
                </section>

                <section ref={theoryRef} id="theory" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold pb-2">Theory</h2>
                    <p>Breaking the Mono-alphabetic Substitution Cipher
                        Consider we have the plain text "cryptography". By using the substitution table below, we can encrypt our plain text as follows: abc def gh i j k l mno pqr s t u vwx yz<br/>

                        JI BRKTCNOFQYG AUZHSVWMXL DEP<br/>

                        plain text: c r y p t o g r a p h y<br/>

                        cipher text: B S E Z W U C S J Z N E<br/>

                        Hence we obtain the cipher text as "BSEZWUCSJZNE".<br/><br/>

                        <strong>Cryptanalysis</strong><br/>

                        Note that the frequency of occurrence of characters in the plaintext is "preserved" in the ciphertext. For instance, the most frequent character in the ciphertext is likely to be the encryption of the plaintext character "e" which is the most frequently occurring charecter in English. For a very brief theory of the mono-alphabetic substitution cipher and its cryptanalysis.

                        </p>
                </section>

                <section ref={descriptionRef} id="description" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <img src='/src/assets/Experiments/Img1.png' className=' rounded-lg'></img>
                </section>


                <section ref={objectiveRef} id="objective" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold pb-2">Objective</h2>
                    <p>To understand that just having a large keyspace is not enough to achieve secure encryption.</p>
                </section>

                <section ref={procedureRef} id="procedure" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold pb-2 ">Procedure</h2>
                    <h2 className="text-xl font-bold mb-2">Steps to Break the Cipher:</h2>
                    <ol className="list-decimal list-inside space-y-2 text-white-800">
                        <li>Generate ciphertext by clicking on the <strong>"Next CipherText"</strong> button.</li>
                        <li>Calculate frequencies of the generated ciphertext by clicking on the <strong>"Calculate Frequencies in Ciphertext"</strong> button.</li>
                        <li>Copy the generated ciphertext from <strong>PART I</strong> and paste it in the <strong>"Scratchpad"</strong> area of <strong>PART II</strong>.</li>
                        <li>Analyze similarities between the <strong>"Calculated Frequencies Table"</strong> and the <strong>"English Alphabet Frequencies Table"</strong>.</li>
                        <li>Based on similarities, try to make a frequency-based estimation for each character of the ciphertext.</li>
                        <li>Replace characters of the CipherText in the Scratchpad with the estimated characters using the <strong>Modify</strong> function of <strong>PART II</strong>.</li>
                        <li>Based on hints from the ciphertext in the <strong>"Scratchpad"</strong> area, make further replacements of ciphertext characters.</li>
                        <li>Repeat Step 7 until you obtain meaningful English text.</li>
                        <li>Once the deciphered plaintext is formed, copy and paste it into the text field named <strong>"Solution Plaintext"</strong> in <strong>PART III</strong>. Also, enter the final character mapping in the <strong>"Solution Key"</strong> and click on the <strong>"Check Answer"</strong> button.</li>
                        <li >
                        (Optional) Verify that your answer is correct by encrypting the solution plaintext with your key in <strong>PART IV</strong>.
                        </li>
                    </ol>
                </section>
                <section ref={simulationRef} id="simulation" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold pb-2">Simulation</h2>
                    <p>A simulated example or visualization.</p>
                </section>
                <section ref={assignmentRef} id="assignment" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold pb-2">Assignment</h2>
                    <ol className='list-decimal list-inside  space-y-2 text-white-800'>
                    <li><strong>Encrypt the following plain text using the key given:</strong>
                    <p><strong>Plain Text:</strong> Lord Rama was a great king.</p>
                    <p><strong>Key:</strong></p>
                    <p>abcdef ghi jk l mnopqr st uv wxyz</p>
                    <p>YNLKXBSHMIWDP JROQVFEAUGTZC</p></li>
                    <br/>
                    <li>
                    <strong>What is the key space if we use alphabet = {'{a,b,c,d,e,f}'}</strong></li>
                    <br/>
                    <li>
                    <strong>Decrypt the following cipher text with the key given:</strong>
                    <p><strong>Cipher Text:</strong> libimi wio i rlkif dxmr</p>
                    <p><strong>Key:</strong></p>
                    <p>abcdefghi j kl mn opqrstuvwxyz</p>
                    <p>i s ybkjr uxedzq mct plofnbwgah</p></li>
                    <br/>
                    <li>
                    <strong>Decipher the following cipher text:</strong>
                    <p>LOJUM YLJME PDYVJ QXTDV SVJNL DMTJZ WMJGG YSNDL UYLEO SKDVC</p>
                    <p>GEPJS MDIPD NEJSK DNJTJ LSKDL OSVDV DNGYN VSGLL OSCIO LGOYG</p>
                    <p>ESNEP CGYSN GUJMJ DGYNK DPPYX PJDGG SVDNT WMSWS GYLYS NGSKJ</p>
                    <p>CEPYQ GSGLD MLPYN IUSCP QOYGM JGCPL GDWWJ DMLSL OJCNY NYLYD</p>
                    <p>LJQLO DLCNL YPLOJ TPJDM NJQLO JWMSE JGGJG XTUOY EOOJO DQDMM</p>
                    <p>YBJQD LLOJV LOJTV YIOLU JPPES NGYQJ MOYVD GDNJE MSVDN EJM</p>
                    </li>
                    </ol>
                </section>


                <section ref={referencesRef} id="referneces" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold pb-2">References</h2>
                    <ul>
                        <li><a href='https://en.wikipedia.org/wiki/Substitution_cipher' target="_blank" className='underline'>Wikipedia</a>
                       </li>
                       <li>
                        <a href='https://cse29-iiith.vlabs.ac.in/exp/substitution-cipher/docs/monoalphacipher.pdf' target="_blank" className='underline'>Notes on MonoAlphabetic Substitution Cipher</a>
                       
                       </li>
                    </ul>
                </section>


                <section ref={feedbackRef} id="feedback" className="p-6 bg-[var(--transparent-card)] rounded-lg shadow max-w-[60rem]">
                    <h2 className="text-2xl font-bold pb-2">Feedback</h2>
                    <p>Dear User,

                    Thanks for using Virtual Labs. Your opinion is valuable to us. To help us improve, we'd like to ask you a few questions about your experience. It will only take 3 minutes and your answers will help us make Virtual Labs better for you and other users.</p>
                    <button
                     className="px-6 py-2 my-4 text-white font-semibold rounded-lg transition-all"
                     style={{
                       backgroundColor: "var(--button-bg)",
                       color: "var(--highlight-color)"}}
                    >
                    Share your Experience
                    </button>
                    <p>
                    Thanks for your time !
                    <br/>
                    <strong>
                    The Virtual Labs Team
                    </strong>
                    </p>
                </section>

               
            

            <Chatbot isChatOpen={isChatOpen} setChatOpen={setChatOpen} />
            </main>
            
        </div>

        </>
    );
};

export default Experiment;
