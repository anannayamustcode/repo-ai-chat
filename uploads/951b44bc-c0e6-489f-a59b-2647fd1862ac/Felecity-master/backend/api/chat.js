// const { GoogleGenerativeAI } = require("@google/generative-ai");
// require("dotenv").config();
// const cors = require("cors");

// // Initialize Google Gemini AI API
// const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// // CORS Configuration
// const corsOptions = {
//         origin: [
//           "https://felecity-git-master-anannayamustcodes-projects.vercel.app/",
//           "https://felecity-git-master-aditya-bajajs-projects-c8c5d081.vercel.app", 
//           "https://felecity.vercel.app/",         
//         ],
//         methods: ["GET", "POST"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//       };

// module.exports = async (req, res) => {
//   // Enable CORS for this serverless function
//   cors(corsOptions)(req, res, async () => {
//     if (req.method === "POST") {
//       try {
//         const { message } = req.body;
//         if (!message) {
//           return res.status(400).json({ error: "Message is required" });
//         }

//         const result = await model.generateContent(message);
//         const reply =
//           result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
//           "I couldn't generate a response.";

//         // Send the response back to the client
//         res.json({ reply });
//       } catch (error) {
//         console.error("❌ Chatbot Error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//       }
//     } else {
//       // If the method is not POST, return a 405 Method Not Allowed error
//       res.status(405).json({ error: "Method Not Allowed" });
//     }
//   });
// };

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const cors = require("cors");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const corsMiddleware = cors({
  origin: ["https://felecity.vercel.app", /\.vercel\.app$/], // Allows all Vercel frontend URLs
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: "Message is required" });

      const result = await model.generateContent(message);
      const reply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

      res.json({ reply });
    } catch (error) {
      console.error("❌ Chatbot Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};
