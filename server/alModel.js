require("dotenv/config");

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Updated to a valid model name
});

const generationConfig = {
  temperature: 0.4,
  topP: 0.90,
  topK: 50,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run(prompt) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: "You are an AI assistant for a clinical management system. Analyze patient feedback, prescriptions, and allergies to provide a summary of patient outcomes and treatment effectiveness. Focus on trends, common issues, and recommendations for improving patient care. Provide concise answers.",
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();
    console.log("[alModel] AI Analysis Result:", responseText);
    return responseText;
  } catch (error) {
    console.error("[alModel] Error during AI analysis:", error.message);
    throw new Error("Failed to generate AI analysis");
  }
}

module.exports = run;