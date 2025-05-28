// app/api/explain/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

const MODEL_NAME = "gemini-1.5-flash-latest"; // Using the latest flash model
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in environment variables!");
    // In a real app, you might want to prevent startup or have a clearer status
}

const genAI = new GoogleGenerativeAI(API_KEY!);

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const generationConfig = {
    temperature: 0.7, // Adjust for more creative/factual responses
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048, // Max tokens for ELI5 should be sufficient
};

export async function POST(request: NextRequest) {
    if (!API_KEY) {
        return NextResponse.json({ error: "Server configuration error: LLM API key not found." }, { status: 500 });
    }
    try {
        const { topic } = await request.json();

        if (!topic || typeof topic !== 'string' || topic.trim() === '') {
            return NextResponse.json({ error: "Topic is required and must be a non-empty string." }, { status: 400 });
        }

        if (topic.length > 1000) { // Basic input length validation
            return NextResponse.json({ error: "Input topic is too long. Please keep it under 1000 characters." }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            safetySettings,
            generationConfig,
        });

        const prompt = `Explain the following topic or text to a 5-year-old.
        Use very simple words, short sentences, and analogies a small child can easily understand.
        Make it friendly and engaging. Avoid jargon or complex vocabulary entirely.
        Keep the explanation concise.
        Topic/Text: "${topic}"`;

        const result = await model.generateContent(prompt);
        const response = result.response;

        if (response.promptFeedback?.blockReason) {
            console.warn("Gemini API blocked prompt:", response.promptFeedback.blockReason, response.promptFeedback.safetyRatings);
            const blockMessage = `Your request was blocked by the content safety filter (${response.promptFeedback.blockReason}). Please try rephrasing your input.`;
            return NextResponse.json({ error: blockMessage }, { status: 400 });
        }

        if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
            console.error("No content in Gemini response", response);
            return NextResponse.json({ error: "The AI could not generate an explanation for this topic. Please try a different one." }, { status: 500 });
        }
        
        const explanation = response.text(); // Simpler way to get text if candidates[0] is guaranteed
        return NextResponse.json({ explanation });

    } catch (error: any) {
        console.error("Error in /api/explain:", error);
        // More specific error handling can be added here based on error types from Gemini
        if (error.message && error.message.includes("API key not valid")) {
             return NextResponse.json({ error: "Server configuration error with the LLM provider. Please contact support if this persists." }, { status: 500 });
        }
        if (error.message && error.message.toLowerCase().includes("quota") || error.status === 429) {
            return NextResponse.json({ error: "The service is currently experiencing high demand. Please try again in a few moments." }, { status: 429 });
        }
        return NextResponse.json({ error: "Oops! Something went wrong while trying to get an explanation. Please try again." }, { status: 500 });
    }
}
