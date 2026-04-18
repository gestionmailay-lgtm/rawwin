import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listModels() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // The SDK doesn't have a simple listModels, we usually use the REST API or 
        // just try a few model names. 
        // But we can check the error message again.
        
        console.log("Checking gemini-2.5-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        // Try a tiny prompt
        const result = await model.generateContent("test");
        console.log("gemini-2.5-pro is AVAILABLE");
    } catch (e) {
        console.log("gemini-2.5-pro NOT available:", e.message);
    }

    try {
        console.log("Checking gemini-1.5-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent("test");
        console.log("gemini-1.5-pro is AVAILABLE");
    } catch (e) {
        console.log("gemini-1.5-pro NOT available:", e.message);
    }
}

listModels();
