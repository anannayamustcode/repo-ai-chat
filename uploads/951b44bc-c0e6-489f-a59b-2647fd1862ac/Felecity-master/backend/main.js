require('dotenv').config();  // ✅ Load .env first
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Ensure the API key is loaded
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("❌ API key is missing! Check your .env file.");
    process.exit(1);
}

// ✅ Initialize genAI with the correct API key
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Ensure correct model

const prompt = "Explain how AI works";

const generate = async () => {
    try {
        const result = await model.generateContent(prompt);
        
        // ✅ Correct way to access the response text
        const text = result.response.candidates[0].content.parts[0].text;

        console.log("Generated Response:", text);
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

generate();
