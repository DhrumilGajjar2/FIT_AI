const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const NodeCache = require("node-cache");
require("dotenv").config();

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error(" Gemini API key is missing in .env file.");
  process.exit(1);
}

// ✅ In-Memory Cache to Store AI Responses (Optimized for Free API)
const chatCache = new NodeCache({ stdTTL: 600, checkperiod: 300 }); // Cache responses for 10 minutes

// ✅ Daily Rate Limit Per User to Prevent Exceeding Free Tier
const chatLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // ⏳ 24 hours
  max: 20, // 🚀 20 messages per user per day
  message: { error: " You've reached today's free limit. Try again tomorrow!" },
  keyGenerator: (req) => req.ip, // ✅ Limit by user IP
});

// ✅ Middleware: Validate & Restrict Input Length
const validateChatInput = (req, res, next) => {
  const { message } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "A valid message is required." });
  }
  if (message.length > 200) {
    return res.status(400).json({ error: " Message too long! Limit to 200 characters." });
  }
  next();
};

// ✅ Chatbot Route (Optimized for Diet, Fitness, Nutrition)
router.post("/chat", validateChatInput, chatLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    console.log(` User: ${message}`);

    // ✅ Check Cache First (Avoid Unnecessary API Calls)
    const cachedResponse = chatCache.get(message);
    if (cachedResponse) {
      console.log(" Cache hit! Returning cached response.");
      return res.json({ reply: cachedResponse });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `You are a fitness, diet, workout, and nutrition assistant. Keep answers short (max 50 words).
            
            Question: ${message}`
          }]
        }],
        generationConfig: { maxOutputTokens: 100 } // ✅ Limit response length to optimize free usage
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // ✅ Optimized for faster responses
      }
    );

    console.log(" Gemini API Call Successful!");

    const botReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
      "I'm not sure how to respond to that. Try asking about diet, fitness, or workouts.";
    console.log(` Bot: ${botReply}`);

    // ✅ Cache Response for 10 Minutes
    chatCache.set(message, botReply);

    res.json({ reply: botReply });
  } catch (error) {
    console.error(" Chatbot API Error:", error.response?.data || error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({ error: " Too many requests. Try again later." });
    }

    res.status(500).json({ error: "Chatbot service is unavailable. Please try again later." });
  }
});

module.exports = router;
