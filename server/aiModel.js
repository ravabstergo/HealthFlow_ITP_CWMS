require ("dotenv/config");
//chamika

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
  const generationConfig = {
    temperature: 0.3,
    topP: 0.90,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function run(prompt) {
    const chatSession = model.startChat({
      generationConfig,
      history: [{
        role: "user",
        parts:[
         {
              text: `You are a clinical AI assistant trained for hospital and medical management systems. Your role is to analyze prescribed medications based on patient history and provide reliable, professional responses.

                      When answering, always:
                      - Identify potential allergic reactions using known allergens.
                      - Cross-check current medications for contraindications.
                      - Check patient s past conditions for risk factors or drug interactions.
                      - Suggest monitoring needs and dosage adjustments if necessary.
                      - If the user asks anything non-medical, respond: "The texts you entered cannot be recognized as a medicine!".
                      - Keep your answers clear, concise, and relevant to medical context.

                      Only focus on pharmaceutical and clinical information. Do not provide general health advice or diagnose conditions.And when user enter or ask any unrelated question say,The texts you entered cannot be recognized as a medicine!`
        },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Okay,I'm ready to answer your medical and hospital questions.ask me anything related to that",
          },
        ],
      }],
      
    });
  
    const result = await chatSession.sendMessage(prompt);
    console.log(result.response.text());
    return result.response.text();
  }
  
  //run();
  module.exports = run;