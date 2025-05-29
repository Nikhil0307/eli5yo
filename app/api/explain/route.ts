// app/api/explain/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

const MODEL_NAME = "gemini-1.5-flash-latest";
const API_KEY = process.env.GEMINI_API_KEY;

let genAIInstance: GoogleGenerativeAI | null = null;
if (API_KEY) {
    genAIInstance = new GoogleGenerativeAI(API_KEY);
} else {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in environment variables!");
}

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const generationConfig = {
    temperature: 0.6, // Slightly less random for more factual ELI5
    topK: 1,
    topP: 1,
    maxOutputTokens: 1024, // ELI5 shouldn't need too many tokens
};

export async function POST(request: NextRequest) {
    if (!genAIInstance) { // Check if instance was created
        console.error("/api/explain: Gemini AI SDK not initialized due to missing API key.");
        return NextResponse.json({ error: "Server configuration error with the LLM provider. Key missing." }, { status: 500 });
    }

    try {
        const { topic } = await request.json();

        if (!topic || typeof topic !== 'string' || topic.trim() === '') {
            return NextResponse.json({ error: "Topic is required." }, { status: 400 });
        }

        if (topic.length > 2000) { // Increased limit slightly
            return NextResponse.json({ error: "Input topic is too long (max 2000 chars)." }, { status: 400 });
        }

        const model = genAIInstance.getGenerativeModel({
            model: MODEL_NAME,
            safetySettings,
            generationConfig,
        });

        const prompt = `Explain the following topic or text to a 5-year-old.
        Use very simple words, short sentences, and analogies a small child can easily understand.
        Make it friendly, engaging, and very concise. Avoid all jargon or complex vocabulary.
        Format the explanation clearly. If using multiple points or steps, keep them brief.
        Topic/Text: "${topic}"`;

        const result = await model.generateContent(prompt);
        const response = result.response;

        if (response.promptFeedback?.blockReason) {
            console.warn("Gemini API blocked prompt:", response.promptFeedback.blockReason, response.promptFeedback.safetyRatings);
            const blockMessage = `Your request was blocked due to: ${response.promptFeedback.blockReason}. Please rephrase your input.`;
            return NextResponse.json({ error: blockMessage }, { status: 400 });
        }

        if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
            console.error("No content in Gemini response", response);
            return NextResponse.json({ error: "The AI could not generate an explanation for this topic. Please try a different one." }, { status: 500 });
        }
        
        const explanation = response.text();
        return NextResponse.json({ explanation });

    } catch (error: any) {
        console.error("Error in /api/explain:", error);
        let errorMessage = "Oops! Something went wrong while trying to get an explanation.";
        let statusCode = 500;

        if (error.message) {
            if (error.message.includes("API key not valid") || error.message.includes("PERMISSION_DENIED")) {
                 errorMessage = "Server configuration error with the LLM provider. Please check API key and permissions.";
            } else if (error.message.toLowerCase().includes("quota") || (error as any).status === 429 || (error as any).code === 429) {
                errorMessage = "The service is currently experiencing high demand or quota limits reached. Please try again in a few moments.";
                statusCode = 429;
            } else if (error.message.includes("timed out") || error.message.includes("deadline exceeded")) {
                errorMessage = "The request to the LLM provider timed out. Please try again.";
                statusCode = 504; // Gateway Timeout
            }
        }
        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}
