import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEnvVariable } from "../utils/env.js";
import { AppError } from "../utils/appError.js";

const genAI = new GoogleGenerativeAI(
    getEnvVariable('GEMINI_API_KEY')
);

const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite"
});

export const getStructuredExpenseFromText = async (text: string) => {
    const prompt = `
        You are an expense extraction AI.

        Extract expense information from OCR text.

        Return ONLY valid JSON.

        Required fields:

        {
            "merchant": string | null,
            "amount": number | null,
            "type": "CREDITED" | "DEBITED" | null,
            "date": string | null,
            "paymentMethod": string | null,
            "transactionId": string | null,
            "category": string | null
        }

        Rules:
        - Do not add explanations.
        - If data is missing return null.
        - Amount should be only number.
        - Date should be YYYY-MM-DD format.
        - type must be "CREDITED" for income/money received or "DEBITED" for expenses/purchases/money paid out.

        OCR TEXT:

        ${text}
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Strip markdown backticks if returned (e.g. ```json ... ```)
        const cleanedResponse = responseText.replace(/```json|```/g, "").trim();

        return JSON.parse(cleanedResponse);
    } catch (error: any) {
        if (error?.status === 429 || error?.message?.includes("429")) {
            throw new AppError("Gemini API rate limit exceeded. Please wait 20 seconds and try again.", 429);
        }
        throw new AppError(`Failed to process expense data with Gemini: ${error?.message || "Unknown error"}`, 500);
    }
};