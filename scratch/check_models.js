const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
  const apiKey = "AIzaSyBzgJ94U5Aiz9av70p6UFzzyDOVvbIJSiA";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
  
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("test");
      console.log(`✅ Model ${m} is WORKING`);
      break; 
    } catch (e) {
      console.error(`❌ Model ${m} FAILED: ${e.message}`);
    }
  }
}

list();
