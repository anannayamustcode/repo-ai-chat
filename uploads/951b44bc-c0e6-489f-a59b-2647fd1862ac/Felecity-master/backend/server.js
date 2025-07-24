require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors({ origin: "https://felecity.vercel.app" }));

app.get("/", (req, res) => {
  res.send("🚀 Chatbot Backend is Running on Vercel!");
});

// ✅ Vercel-specific: Export the app (DO NOT use app.listen)
module.exports = app;




// require("dotenv").config();
// const express = require("express");
// const cors = require("cors"); 
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const app = express();
// app.use(express.json());

// // ✅ Fixing CORS issue
// app.use(
//   cors({
//     origin: "https://felecity.vercel.app",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // ✅ Initialize Google Gemini AI API
// const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// // ✅ Root route for health check
// app.get("/", (req, res) => {
//   res.send("🚀 Chatbot Backend is Running on Vercel!");
// });

// app.get("/chat", (req, res) => {
//   res.json({ message: "Chatbot backend is running!" });
// });

// // ✅ Chatbot API Route
// app.post("/chat", async (req, res) => {
//   try {
//     const { message } = req.body;
//     if (!message) {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     const result = await model.generateContent(message);

//     // ✅ Ensure the response structure is valid
//     const reply =
//       result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
//       "I couldn't generate a response.";

//     res.json({ reply });
//   } catch (error) {
//     console.error("❌ Chatbot Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // ✅ Vercel-specific: Export the app (DO NOT use app.listen)
// module.exports = app;




// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const app = express();
// app.use(express.json());

// // ✅ Fixing CORS issue
// app.use(
//   cors({
//     origin: [
//       "https://felecity-git-master-anannayamustcodes-projects.vercel.app/",
//       "https://felecity-git-master-aditya-bajajs-projects-c8c5d081.vercel.app",
//       "https://felecity.vercel.app/",
//     ],
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );



// // ✅ Initialize Google Gemini AI API
// const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// app.get("/", (req, res) => {
//   res.send("🚀 Chatbot Backend is Running!");
// });

// // ✅ Chatbot API Route
// app.post("/chat", async (req, res) => {
//   try {
//     const { message } = req.body;
//     if (!message) {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     const result = await model.generateContent(message);

//     // ✅ Ensure the response structure is valid
//     const reply =
//       result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
//       "I couldn't generate a response.";

//     res.json({ reply });
//   } catch (error) {
//     console.error("❌ Chatbot Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // ✅ Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
